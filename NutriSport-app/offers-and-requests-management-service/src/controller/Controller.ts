import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { PreparatorSession } from "../entity/PreparatorSession"
import { SprotifSession } from "../entity/SportifSession"
import { Offer } from "../entity/Offer"
import { Demand } from "../entity/Demand"
import { Devis } from "../entity/Devis"
import { DevisStatus } from "../enum/EnumDevisStatus"
import axios from "axios"
import { DevisDto } from "../dto/DevisDto"
import { Kafka, logLevel } from "kafkajs"
import { OfferDto } from "../dto/OfferDto"
import * as admin from "firebase-admin"; 
import { FindOperator, Point } from 'typeorm';

export class Controller{
    // Data repositories
    private preparatorSessionRepository = AppDataSource.getRepository(PreparatorSession)
    private sportifSessionRepository = AppDataSource.getRepository(SprotifSession)
    private offerRepository = AppDataSource.getRepository(Offer)
    private demandRepository = AppDataSource.getRepository(Demand)
    private devisRepository = AppDataSource.getRepository(Devis)

    private devisTopic = 'devis-topic';
    private offerTopic = 'offer-topic';
    private kafka_broker_adress = process.env.KAFKA_BROKER!

    private kafka = new Kafka({brokers: [this.kafka_broker_adress], logLevel: logLevel.ERROR})
    public producer = this.kafka.producer();
    

    //** Preparator Session */

    /**
     * Retrieve all Preparator Sessions
     * @param request - Express request object
     * @param response - Express response object
     * @param next - Express next function
     * @returns Array of Preparator Sessions
     */
    async psAll(request: Request, response: Response, next: NextFunction) {
         return this.preparatorSessionRepository.find()
    }
    
    //** Sportif Session */

    /**
     * Retrieve all Sportif Sessions
     * @param request - Express request object
     * @param response - Express response object
     * @param next - Express next function
     * @returns Array of Sportif Sessions
     */
    async ssAll(request: Request, response: Response, next: NextFunction) {
        return this.sportifSessionRepository.find()
    }

    //** Offer */
    /**
     * Save a new Offer associated with a Preparator Session
     * @param req - Express request object with preparatorId parameter and offer data in the body
     * @param res - Express response object
     * @param next - Express next function
     * @returns Saved Offer
     */
    async saveOffer(req: Request, res: Response, next: NextFunction) {
        // Extract preparatorSessionId from params
        const preparatorSessionId: number = parseInt(req.params.preparatorSessionId);

        // Extract the request body 
        const offerData: Partial<Offer> = req.body;

        // Find the PreparatorSession by ID
        const preparatorSession = await this.preparatorSessionRepository.findOne({
            where: { idSession : preparatorSessionId  },
        });
        
        // Check the existance of the preparatorSession
        if (!preparatorSession) {
            throw Error('Preparator not found');
        }

        // Create a new Offer
        const offer = this.offerRepository.create({
        ...offerData,
        preparatorSession, // Associate the Offer with the PreparatorSession
        });

        // Save the Offer to the database
        const savedOffer = await this.offerRepository.save(offer);

        //Send Offer by kafka to service 2
        const offerDto = OfferDto.toDto(savedOffer);
        await this.producer.connect();
        const message = {
            value: JSON.stringify(offerDto),
        }
        await this.producer.send({
            topic: this.offerTopic,
            messages: [message],
        })
        await this.producer.disconnect();
        
        // Push notification to all nearby sportif session
        //Get all active session that are in the offer polygone
        const geographicalArea = savedOffer.geographicalArea;
        const sportifSessionsWithinArea = await this.sportifSessionRepository.createQueryBuilder('sportifSession')
            .select('DISTINCT sportifSession.fcmToken')
            .where('ST_Within(ST_SetSRID(sportifSession.currentPosition, 4326), ST_SetSRID(ST_GeomFromGeoJSON(:geographicalArea), 4326))', { geographicalArea })
            .andWhere('sportifSession.isActive = :isActive', { isActive: true })
            .getRawMany();

        console.log(sportifSessionsWithinArea);
        // Extract FCM tokens from SportifSessions
        const tokens = sportifSessionsWithinArea.map(sportifSession => sportifSession.fcmToken).filter(Boolean);
        try {
            for(const tokenI of tokens){
                let fcmMessage = {
                    token : tokenI,
                    notification: {
                        title: "New Offer Available",
                        body: "Check out the latest offer! A delicious "+savedOffer.title,
                    },        
                }
                const response = await admin.messaging().send(fcmMessage);

                //Log success or handle errors as needed
                console.log("Push notification response : "+response);
            }
        } catch (error) {
            console.error('Error sending multicast notification:', error);
        }

         // Emit a socket.io event to notify clients about the devis proposed
         const io = req.app.get("socketio");
         io.emit("newOfferSaved", { newOffer: savedOffer });


      return savedOffer;
    }

    /**
     * Get all offers shared by a Preparator Session
     * @param req - Express request object with preparatorId parameter
     * @param res - Express response object
     * @param next - Express next function
     * @returns Array of offers
     */
    async getOffersByPreparatorId(req: Request, res: Response, next: NextFunction) {
        // Extract preparator Session Id from params
        const preparatorSessionId = parseInt(req.params.preparatorSessionId);

        // Find the PreparatorSession by ID
        const preparatorSession = await this.preparatorSessionRepository.findOne({
            where: { idSession: preparatorSessionId },
            relations: ['offers'], 
        });
        // Check the existance of the Preparator Session
        if (!preparatorSession) {
            throw Error('Preparator not found');
        }
        const preparatorId = preparatorSession.idPreparator;
        // Fetch offers shared by this preparator
        const offers = await this.offerRepository
            .createQueryBuilder('offer')
            .leftJoin('offer.preparatorSession', 'preparatorSession')
            .where('preparatorSession.idPreparator = :preparatorId', { preparatorId })
            .getMany();

        //const offers = preparatorSession.offers;
        return offers;
    }
    
    /**
     * Get nearby offers based on the sportif's current position.
     * @param request - Express request object with sportifIdSession parameter
     * @param response - Express response object
     * @param next - Express next function
     * @returns Array of nearby offers
    */
    async getNearbyOffers(request: Request, response: Response, next: NextFunction) {
        // Extract sportif IdSession from params
        const sportifIdSession = parseInt(request.params.sportifIdSession);
    
        // Fetch sportif session by idSession
        const sportifSession = await this.sportifSessionRepository.findOne({
        where: { idSession : sportifIdSession  },
        });

        // Check the existance of the SportifSession
        if (!sportifSession) {
            throw Error('Sportif not found');
        }

        //extract the current position of the sportif
        const currentPosition = sportifSession.currentPosition;

        // Ensure the type is 'Point' and extract coordinates
        if (currentPosition.type === 'Point' && currentPosition.coordinates) {
            // Extract coordinates from currentPosition
            const [latitude, longitude] = currentPosition.coordinates;

            // Convert currentPosition to a well-formatted string with SRID 4326
            const pointGeometry = `POINT(${latitude} ${longitude})`;

            // Fetch the offers witch the curent position if the sportif is included in it's geographicalArea
            const nearbyOffers = await this.offerRepository
            .createQueryBuilder('offer')
            .leftJoinAndSelect('offer.preparatorSession', 'preparatorSession')
            .where(`ST_Contains(offer.geographicalArea, ST_GeomFromText(:pointGeometry, 4326))`, { pointGeometry })
            .andWhere('offer.isAvailable = :isAvailable', { isAvailable: true })
            .getMany();        
            return  nearbyOffers;
        } else {
            throw new Error('Invalid currentPosition format');
        }  
    }

    //** Demand */
    /**
     * Save a new Demand associated with a Sportif Session
     * @param req - Express request object with sportifId parameter and demand data in the body
     * @param res - Express response object
     * @param next - Express next function
     * @returns Saved Demand
     */
    async saveDemand(req: Request, res: Response, next: NextFunction) {
        // Extract sportifSessionId from params
        const sportifIdSession: number = parseInt(req.params.sportifIdSession);

        // Extract the request body
        const demandData: Partial<Demand> = req.body;
        
        // Find the SprotifSession by ID
        const sportifSession = await this.sportifSessionRepository.findOne({
            where: { idSession : sportifIdSession  },
        });
        
        // Check the existance of the sportif Session
        if (!sportifSession) {
            throw Error('Sportif not found');
        }
    
        // Create a new Demand
        const demand = this.demandRepository.create({
        ...demandData,
        sportifSession, // Associate the Demadnd with the PreparatorSession
        });

        // Save the Demand to the database
        const savedDemand = await this.demandRepository.save(demand);
        //Emit a socket.io event to notify clients about the new demand
        const io = req.app.get("socketio");
        io.emit("newDemandSaved", { newDemand: savedDemand });
            
        // Retrieve the current position of the demand
        const demandPosition = sportifSession.currentPosition;
        // Ensure the type is 'Point' and extract coordinates
        if (demandPosition.type === 'Point' && demandPosition.coordinates) {
            // Extract coordinates from currentPosition
            const [latitude, longitude] = demandPosition.coordinates;

            // Convert currentPosition to a well-formatted string with SRID 4326
            const pointGeometry = `POINT(${latitude} ${longitude})`;
             // Define the nearby distance
            const nearbyDistance = 1000000; // 1000 kilometers   
            // Fetch preparator sessions within the nearby distance
            // const nearbyPreparatorSessions = await this.preparatorSessionRepository
            //     .createQueryBuilder('preparatorSession')
            //     .where(`ST_DWithin(preparatorSession.currentPosition, ST_GeomFromText(:pointGeometry, 4326)::geography, :diameter)`)
            //     .andWhere('preparatorSession.isActive = :isActive', { isActive: true })
            //     .setParameter('pointGeometry', pointGeometry)
            //     .setParameter('diameter', nearbyDistance)
            //     .getMany();  
            const nearbyPreparatorSessions = await this.preparatorSessionRepository
                    .createQueryBuilder('preparatorSession')
                    .select('DISTINCT preparatorSession.fcmToken') // Select distinct fcmToken
                    .where(`ST_DWithin(preparatorSession.currentPosition, ST_GeomFromText(:pointGeometry, 4326)::geography, :diameter)`)
                    .andWhere('preparatorSession.isActive = :isActive', { isActive: true })
                    .setParameter('pointGeometry', pointGeometry)
                    .setParameter('diameter', nearbyDistance)
                    .getRawMany(); 
            console.log(nearbyPreparatorSessions);
            // Send notifications to preparators in the zone
            for (const preparatorSession of nearbyPreparatorSessions) {
                const fcmMessage = {
                    token: preparatorSession.fcmToken,
                    notification: {
                        title: "Check this new demand",
                        body: "There's a demand posted in your zone",
                    },
                };
                // Push notification
                const fcmResponse = await admin.messaging().send(fcmMessage);
                // Log success or handle errors as needed
                console.log("Push notification response : " + fcmResponse);
            }
       
        }

    

        return savedDemand;
    }


    /**
     * Get all demands associated with a Sportif Session
     * @param req - Express request object with sportifId parameter
     * @param res - Express response object
     * @param next - Express next function
     * @returns Array of demands
    */
    async getDemandsBySportifId(req: Request, res: Response, next: NextFunction) {
        // Extract preparatorSessionId from params
        const sportifIdSession = parseInt(req.params.sportifIdSession);

        // Find the PreparatorSession by ID
        const sportifSession = await this.sportifSessionRepository.findOne({
            where: { idSession : sportifIdSession  },
        });

        // Check the existance of the sportif Session
        if (!sportifSession) {
            throw Error('Sportif not found');
        }

        const sportifId = sportifSession.idSportif;

        // Fetch demands shared by this sportif
        const demands = await this.demandRepository
            .createQueryBuilder('demand')
            .leftJoin('demand.sportifSession','sportifSession')
            .where('sportifSession.idSportif= :sportifId', { sportifId })
            .getMany();

        return demands;
    }

    /**
     * Get nearby demands based on the preparator's current position.
     * @param request - Express request object with preparatorIdSession parameter
     * @param response - Express response object
     * @param next - Express next function
     * @returns Array of nearby demands
     */
    async getNearbyDemands(request: Request, response: Response, next: NextFunction){
        // Extract preparator IdSession from params
        const preparatorIdSession = parseInt(request.params.preparatorIdSession);

        // Fetch preparator session by idSession
        const preparatorSession = await this.preparatorSessionRepository.findOne({
        where: { idSession : preparatorIdSession  },
        });
        
        // Check the existance of the PreparatorSession
        if (!preparatorSession) {
            throw Error('Preparator not found');
        }
        
        //extract the current position of the preparator
        const currentPosition = preparatorSession.currentPosition;

        // Ensure the type is 'Point' and extract coordinates
        if (currentPosition.type === 'Point' && currentPosition.coordinates) {
            // Extract coordinates from currentPosition
            const [latitude, longitude] = currentPosition.coordinates;

            // Convert currentPosition to a well-formatted string with SRID 4326
            const pointGeometry = `POINT(${latitude} ${longitude})`;
            
            // Extract the diameter (in meters) from params or affect a default value
            const diameter = request.params.diameter ? parseInt(request.params.diameter) : 3000;
            
            // Fetch the demands witch the curent position of there sportif session is nearby to the 
            //current position of the sportif session with a diametre 
            const nearbyDemands = await this.demandRepository
                .createQueryBuilder('demand')
                .innerJoinAndSelect('demand.sportifSession', 'sportifSession')
                .where(`ST_DWithin(sportifSession.currentPosition, ST_GeomFromText(:pointGeometry, 4326)::geography, :diameter)`)
                .andWhere('demand.isAvailable = :isAvailable', { isAvailable: true })
                .setParameter('pointGeometry', pointGeometry)
                .setParameter('diameter', diameter)
                .getMany();

        
            return  nearbyDemands;
        } else {
            throw new Error('Invalid currentPosition format');
        }  
    }



    /** Devis */
    async getDevisPfDemandM(demandId : number){
        console.log('methode');
        return  await this.devisRepository
        .createQueryBuilder('devis')
        .leftJoinAndSelect('devis.demand', 'demand')
        .leftJoinAndSelect('devis.preparatorSession', 'preparatorSession')
        .where('devis.demand.idDemand = :demandId', { demandId })
        .getMany();
    }
    async proposeDevis(request: Request){
        // Extract preparator IdSession from params
        
        const demandId = parseInt(request.params.demandId);
        const preparatorIdSession = parseInt(request.params.preparatorIdSession);

        // Extract demand id from params
       

        // Extract the request body
        const devisData: Partial<Devis> = request.body;

        // Find the PreparatorSession by ID
        const preparatorSession = await this.preparatorSessionRepository.findOne({
            where: { idSession : preparatorIdSession  },
        });
           // Check the existance of the preparator Session
        if (!preparatorSession ) {
            throw Error('Preparator not found');
        }
        
        // Find the Demand by ID
        const demand = await this.demandRepository.findOne({
            where: { idDemand : demandId  },
            relations:['sportifSession']
        });
        
     

        // Check the existance of the demand
        if (!demand ) {
            throw Error('Demand not found');
        }

        // Create a new devis
        const devis = this.devisRepository.create({
            ...devisData,
            preparatorSession,
            demand
        });
        
        // Emit a socket.io event to notify clients about the devis proposed
        const io = request.app.get("socketio");
        io.emit("newDevisForDemand", { demandId: demandId, newDevis: devis });

        // Save the devis to the database
        const savedDevis = await this.devisRepository.save(devis);
        // console.log('sportif '+sportifSession.idSportif)
        // Find the SportifSession by ID
        const sportifSession = await this.sportifSessionRepository.findOne({
            where: { idSession : demand.sportifSession.idSession  },
        });
        console.log('sportif '+sportifSession.idSportif)
        // Push notification to sportif
        let fcmMessage = {
            token : sportifSession.fcmToken,
            notification: {
                title: "A new devis porposed",
                body: "Check out the proposed devis for "+demand.title+".",
            }, 
            data: {
                screen: 'DemandDevis',
                demandId: demand.idDemand.toString(), // Include the demand identifier
              },       
        }
        // Push notif
        const fcmResponse = await admin.messaging().send(fcmMessage);

        //Log success or handle errors as needed
        console.log("Push notification response : "+fcmResponse);

        return savedDevis;
    }

    async acceptDevis(request:Request, response: Response){
        // Extract devis id from params
        const devisId = parseInt(request.params.devisId);
        
        // Extract method from params
        const method = request.params.method;

        // Find the devis by ID
        const devis = await this.devisRepository.findOne({
            where: { idDevis : devisId  },
            relations: ['demand','preparatorSession'],
        });
        
        // Check the existance of the devis
        if (!devis ) {
            throw Error('Devis not found');
        }
        // Extract demand id from devis


        const demandId = devis.demand.idDemand;

        // Find the Demand by ID
        const demand = await this.demandRepository.findOne({
            where: { idDemand : demandId  },
            relations: ['sportifSession'],
        });

        // Check the existance of the demand
        if (!demand ) {
            throw Error('Demand not found');
        }
        try {
            devis.status=DevisStatus.ACCEPTED;
            //NOW IT SHOULD BE SEND TO S2 BY KAFKA(THE ACCEPTED DEVIS)
            this.devisRepository.save(devis);
            const devisS  = await this.getDevisPfDemandM(demand.idDemand);
            devisS.forEach((currentDevis) => {
                if(currentDevis.idDevis != devis.idDevis){
                    currentDevis.status=DevisStatus.REJECTED;
                    this.devisRepository.save(currentDevis);
                }
            });

            demand.isAvailable=false;
            this.demandRepository.save(demand); 


            //send to create new order SEND REQUEST TO S2
            const devisDto = DevisDto.toDto(devis);
            await this.producer.connect();
            const message = {
                value: JSON.stringify(devisDto),
            }
            await this.producer.send({
                topic: this.devisTopic,
                messages: [message],
            })
            await this.producer.disconnect();

            // Configure the options for the HTTP request
            const axiosResponse = axios.post(`http://${process.env.IP_ADDRESS}:8888/api/orders-management/orderDevis/${demand.sportifSession.idSportif}/${devisId}/${method}`, {});
            // Log the axios response
            console.log("rep\n"+axiosResponse);

            // Return a simplified response to the client
            response.json({ success: true });

            // Push notification to preparator
            // Find the PreparatorSession by ID preparator
            const preparatorSession = await this.preparatorSessionRepository.findOne({
                where: { idPreparator : devis.preparatorSession.idPreparator  },
            });
            let fcmMessage = {
                token : preparatorSession.fcmToken,
                notification: {
                    title: "Your devis has been accepted",
                    body: "Check out the accepted devis and start preparation .",
                },        
            }
            // Push notif
            const fcmResponse = await admin.messaging().send(fcmMessage);

            //Log success or handle errors as needed
            console.log("Push notification response : "+fcmResponse);

            

        } catch (error) {
            console.error(error);
            // Return an error response to the client
            response.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getDevisOfPreparator(request: Request) {
        // Extract preparator IdSession from params
        const preparatorIdSession = parseInt(request.params.preparatorIdSession);

        // Find the PreparatorSession by ID session just to make sure that this preparator exists
        const preparatorSession = await this.preparatorSessionRepository.findOne({
            where: { idSession : preparatorIdSession  },
        });
        
        // Check the existance of the preparator Session
        if (!preparatorSession ) {
            throw Error('Preparator not found');
        }

        return this.devisRepository.find({
            where: { preparatorSession: { idPreparator: preparatorSession.idPreparator }},
            relations: ['preparatorSession', 'demand'],
        });
    }

    
    async getDevisOfDemand(request: Request) {
        // Extract demandId from params
        const demandId = parseInt(request.params.demandId);
        
        // Find the Demand by ID
        const demand = await this.demandRepository.findOne({
            where: { idDemand : demandId  },
        });

        // Check the existance of the demand
        if (!demand ) {
            throw Error('Demand not found');
        }
        const devis = await this.devisRepository
        .createQueryBuilder('devis')
        .leftJoinAndSelect('devis.demand', 'demand')
        .leftJoinAndSelect('devis.preparatorSession', 'preparatorSession')
        .where('devis.demand.idDemand = :demandId', { demandId })
        .getMany();

        return devis;
    }

    async setOfferAvailability(request : Request){
        // Extract offer id from params
        const offerId = parseInt(request.params.offerId);

        // Extract availability from params
        const availability = parseInt(request.params.availability);

        // Fetch the offer
        const offer = await this.offerRepository.findOne({
            where : { idOffer : offerId},
            relations : ['preparatorSession']
        });

        // Check the existance of the offer
        if (!offer ) {
            throw Error('Offer not found');
        }
 
        if(availability == 0)
            offer.isAvailable = false;
        else
            offer.isAvailable = true;

        const savedOffer = await this.offerRepository.save(offer);

        //Send Offer by kafka to service 2
        const offerDto = OfferDto.toDto(savedOffer);
        await this.producer.connect();
        const message = {
            value: JSON.stringify(offerDto),
        }
        await this.producer.send({
            topic: this.offerTopic,
            messages: [message],
        })
        await this.producer.disconnect();

        return savedOffer;
    }
    async getDevis(request: Request) {
        // Extract demandId from params
        const devisId = parseInt(request.params.devisId);
        
        // Find the Demand by ID
        const devis = await this.devisRepository.findOne({
            where: { idDevis : devisId  },
            relations: ['demand','preparatorSession',], 
         
        });

        // Check the existance of the demand
        if (!devis ) {
            throw Error('devis not found');
        }
       

        return devis;
    }
    async getOfferById(request: Request) {
        // Extract demandId from params
        const offerId = parseInt(request.params.offerId);
        
        // Find the Demand by ID
        const offer = await this.offerRepository.findOne({
            where: { idOffer : offerId  },
            relations: ['preparatorSession',], 
        });

        // Check the existance of the demand
        if (!offer ) {
            throw Error('offer not found');
        }
       

        return offer;
    }
    async getAllDevisForDemand(request: Request) {
        // Extract demandId from params
        const demandId = parseInt(request.params.demandId);

        // Extract preparator IdSession from params
        const preparatorSessionId = parseInt(request.params.preparatorId);
        
        // Find the Demand by ID
        const demand = await this.demandRepository.findOne({
            where: { idDemand : demandId  },
        });

        // Find the PreparatorSession by ID preparator just to make sure that this preparator exists
        const preparatorSession = await this.preparatorSessionRepository.findOne({
            where: { idSession : preparatorSessionId  },
        });

        const preparatorId = preparatorSession.idPreparator;
        // Check the existance of the demand
        if (!demand ) {
            throw Error('Demand not found');
        }
        // Check the existance of the preparator Session
        if (!preparatorSession ) {
            throw Error('Preparator not found');
        }

        const devis = await this.devisRepository
        .createQueryBuilder("devis")
        .innerJoin("devis.preparatorSession", "preparatorSession")
        .innerJoin("devis.demand", "demand")
        .where("preparatorSession.idPreparator = :preparatorId", { preparatorId })
        .andWhere("demand.idDemand = :demandId", { demandId })
        .andWhere("devis.status = :status", { status: DevisStatus.PENDING })
        .getMany();

        return devis;
    }
    async getDemandOfDevis(request: Request) {
        // Extract demandId from params
        const devisId = parseInt(request.params.devisId);
        console.log(devisId);
        // Find the Devis by ID
        const devis = await this.devisRepository.findOne({
            where: { idDevis: devisId },
            relations: ['demand'], // Ensure demand is fetched with devis
        });
    
        // Check the existence of the devis
        if (!devis) {
            throw new Error('Devis not found');
        }
    
        // Check if the status of the devis is 'accepted'
        if (devis.status !== DevisStatus.ACCEPTED) {
            throw new Error('Devis status is not accepted');
        }
        console.log(devis.demand);
        // Return the corresponding demand
        return devis.demand;
    }

}


function relation(arg0: string) {
    throw new Error("Function not implemented.")
}

