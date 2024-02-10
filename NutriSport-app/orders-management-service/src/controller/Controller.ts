import { AppDataSource } from "../data-source"
import { Request, Response } from "express"
import { Order } from "../entity/Order"
import { SportifSession } from "../entity/SportifSession"
import { Offer } from "../entity/Offer"
import { Devis } from "../entity/Devis"
import { OrderStatus } from "../enum/EnumOrderStatus"
import { Kafka, logLevel } from "kafkajs"
import { PreparatorSession } from "../entity/PreparatorSession"
import { PreparatorSessionDto } from "../dto/PreparatorSessionDto"

import * as admin from "firebase-admin"; 


export class Controller{
    // Data repositories
    private sportifSessionRepository = AppDataSource.getRepository(SportifSession)
    private preparatorSessionRepository = AppDataSource.getRepository(PreparatorSession)
    private offerRepository = AppDataSource.getRepository(Offer)
    private orderRepository = AppDataSource.getRepository(Order)
    private devisRepository = AppDataSource.getRepository(Devis)

    private preparatorTopic = 'preparator-rank-topic';
    private kafka_broker_adress = process.env.KAFKA_BROKER!
    private kafka = new Kafka({brokers: [this.kafka_broker_adress], logLevel: logLevel.ERROR})
    public producer = this.kafka.producer()

    //** Orders */
 
    /**
     * A sportif user place an order of a meal based on an offer
     * @param request - Express request object with sportifId parameter and offerId parameter
     * @returns Saved Order
     */
    async placeOrderBasedOnOffers(request: Request) {
        // Extract sportifSessionId from params
        const sportifSessionId: number = parseInt(request.params.sportifSessionId);

        // Extract offerId from params
        const offerId: number = parseInt(request.params.offerId);
        
        // Extract method from params
        const method = request.params.method;

        // Find the sportifSession by ID session
        const sportifSession = await this.sportifSessionRepository.findOne({
            where: { idSession : sportifSessionId  },
        });
        
        // Check the existance of the sportifSession
        if (!sportifSession) {
            throw Error('sportif not found');
        }

        // Find the offer by ID 
        const offer = await this.offerRepository.findOne({
            where: { idOffer : offerId  },
            relations:['preparatorSession']
        });
        
        // Check the existance of the offer
        if (!offer) {
            throw Error('offer not found');
        }

        // Create a new Offer
        const order = this.orderRepository.create({
            sportifSession,
            offer,   
        });

        if(method==="online"){
            order.isPaid=true;
        }
        
        // Save the order
        const savedOrder = this.orderRepository.save(order);
        // Push notification to preparator
        const preparatorSession = await this.preparatorSessionRepository.findOne({
            where: { idPreparator : offer.preparatorSession.idPreparator},
        });

        let fcmMessage = {
            token : preparatorSession.fcmToken,
            notification: {
                title: "You have a new order",
                body: "Check out the new order and start preparation please.",
            },        
        }
        // Push notif
        const fcmResponse = await admin.messaging().send(fcmMessage);
        //Log success or handle errors as needed
        console.log("Push notification response : "+fcmResponse);
         //Emit a socket.io event to notify clients about the order status change
        const io = request.app.get("socketio");
        const x = await this.orderRepository.findOne({
            where : {idOrder : (await savedOrder).idOrder}, 
            relations : ['offer','devis']
        })
        io.emit("newOrderSavedOnOffer", { newOrder: x });
        return savedOrder;
   }

   /**
     * A sportif user place an order of after he accepts a devis of it's demand
     * @param request - Express request object with sportifId parameter and devisId parameter
     * @returns Saved Order
     */
    async placeOrderBasedOnDevis(request: Request, response: Response) { 
        // Extract sportifSessionId from params
        const sportifSessionId: number = parseInt(request.params.sportifSessionId);

        // Extract devisId from params
        const devisId: number = parseInt(request.params.devisId);

        // Extract method from params
        const method = request.params.method;

        // Find the sportifSession by ID session
        const sportifSession = await this.sportifSessionRepository.findOne({
            where: { idSportif : sportifSessionId  },
        });
        
        // Check the existance of the sportifSession
        if (!sportifSession) {
            throw Error('Sportif not found');
        }
        
        // Find the devis by ID 
        const devis = await this.devisRepository.findOne({
            where: { idDevis : devisId  },
        });

        
        
        // Check the existance of the order
        if (!devis) {
            throw Error('Devis not found');
        }
        
        // Create a new Order
        const order = this.orderRepository.create({
            sportifSession,
            devis,   
        });

        if(method==="online"){
            order.isPaid=true;
        }
        // Save the order
        const savedOrder = this.orderRepository.save(order);
        
        //Emit a socket.io event to notify clients about the order status change
        const io = request.app.get("socketio");
        const x = await this.orderRepository.findOne({
            where : {idOrder : (await savedOrder).idOrder}, 
            relations : ['offer','devis', 'sportifSession']
        })
        io.emit("newOrderSavedOnOffer", { newOrder: x });
        return savedOrder;
    }

 
    /**
     * Get all orders of a sprotif
     * @param request - Express request object with sportifId parameter
     * @returns Array of orders
     */
    async getOrdersBySportifId(request: Request) {
        // Extract sportifId from params
        const sportifSessionId: number = parseInt(request.params.sportifSessionId);
 
        // Find the sportifSession by ID session
        const sportifSession = await this.sportifSessionRepository.findOne({
            where: { idSession : sportifSessionId  },
        });
 
        // Check the existance of the sportif Session
        if (!sportifSession) {
            throw Error('Sportif not found');
        }
        const idSportif = sportifSession.idSportif;
        // Fetch orders
        const orders = await this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.devis', 'devis')
            .leftJoinAndSelect('order.offer', 'offer')
            .leftJoin('order.sportifSession', 'sportifSession')
            .where('sportifSession.idSportif = :idSportif', { idSportif })
            .getMany();
        
        return orders;
     }
    /**
     * Set ranking of a preparator
     * @param request - Express request object with rank and preparatorsessionId parameter
     * @returns preparator
     */
    async setRankPreparator(request: Request) {
        // Extract order id
        const orderId: number = parseInt(request.params.orderId);
        // Extract Rank
        const rank: number = parseFloat(request.params.rank);
        //extract order
        const order = await this.orderRepository.findOne({
            where: { idOrder: orderId },
            relations: ['offer', 'devis','offer.preparatorSession','devis.preparatorSession'], 
        });
        let idPreparator: number;
        if(!order.offer)
        {
            const devisG = await this.devisRepository.findOne({
                where: { idDevis: order.devis.idDevis },
                relations: ['preparatorSession'], 
            });
            idPreparator  = devisG.preparatorSession.idPreparator;
            
        }
        else{
            const offerG = await this.offerRepository.findOne({
                where: { idOffer: order.offer.idOffer },
                relations: ['preparatorSession'], 
            });
             idPreparator  = offerG.preparatorSession.idPreparator
        }
        // Retrieve PreparatorSession using preparatorSessionId
        const preparatorSession = await this.preparatorSessionRepository.findOne({
            where: { idPreparator: idPreparator },
        });
        // Count the number of orders with closed status and associated offers for the given preparatorSessionId (n1)
        const n1 = await this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.offer', 'offer')
            .where('order.orderStatus = :status', { status: OrderStatus.CLOSED })
            .andWhere('order.offer IS NOT NULL')
            .andWhere('offer.preparatorSession = :preparatorSessionId', { preparatorSessionId: preparatorSession.idSession })
            .getCount();

        // Count the number of orders with closed status and associated devis for the given preparatorSessionId (n2)
        const n2 = await this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.devis', 'devis')
            .where('order.orderStatus = :status', { status: OrderStatus.CLOSED })
            .andWhere('order.devis IS NOT NULL')
            .andWhere('devis.preparatorSession = :preparatorSessionId', { preparatorSessionId: preparatorSession.idSession })
            .getCount();

        // Retrieve the old rank of the preparator
        const oldRank = preparatorSession.preparatorRank;

        // Retrieve all preparatorSessions for the given preparatorId
        const allPreparatorSessions = await this.preparatorSessionRepository.find({
            where: { idPreparator: idPreparator },
        });
        
        const newRank = ((oldRank * (n1 + n2)) + rank) / (n1 + n2 + 1);
        // Iterate over each preparatorSession and update the rank
         for (const preparatorSession of allPreparatorSessions) {
            // Calculate and update the new preparator rank based on the formula
            preparatorSession.preparatorRank = newRank;
            const savedSessionPreparator = await this.preparatorSessionRepository.save(preparatorSession);
            // Send Preparator by kafka to service 1 
            const preparatorDto = PreparatorSessionDto.toDto(savedSessionPreparator);
            await this.producer.connect();
            const message = {
                value: JSON.stringify(preparatorDto),
            }
            await this.producer.send({
                topic: this.preparatorTopic,
                messages: [message],
            })
            await this.producer.disconnect();
            // Save the updated preparator with the new rank
        }
        return preparatorSession; 
    }
    /**
     * Set status of an order
     * @param request - Express request object with new status and orderId parameter
     * @returns preparator
     */
    async setOrderStatus(request: Request){
        // Parse the orderId from request parameters
        const orderId: number = parseInt(request.params.orderId);

        // Parse the status from request parameters
        const status: string = request.params.status;

        // Find the order in the database based on the orderId
        const order = await this.orderRepository.findOne({
            where: { idOrder: orderId },
            relations:['sportifSession']
        });

        // Check if the order exists
        if (!order) {
            throw new Error('Order not found');
        }

        // Find the sportif to push him a notification
        const sportif = await this.sportifSessionRepository.findOne({
            where: { idSession : order.sportifSession.idSession  },
        }); 

        //initialise the message to push on notification
        let msg = "Your order ";

        // Update the order status based on the provided status parameter
        switch (status.toLowerCase()) {
            case 'preparation':
                order.orderStatus = OrderStatus.PREPARATION;
                msg+="is on preparation."
                break;
            case 'delivery':
                order.orderStatus = OrderStatus.DELIVERY;
                msg+="is on its way."
                break;
            case 'delivered':
                order.orderStatus = OrderStatus.DELIVERED;
                msg+="has been delivred."
                break;
            case 'closed':
                order.orderStatus = OrderStatus.CLOSED;
                break;
            default:
                throw new Error('Invalid Status');
        }
     
        //Emit a socket.io event to notify clients about the order status change
        const io = request.app.get("socketio");
        io.emit("orderStatusChanged", { orderId: orderId, newStatus: order.orderStatus });
        console.log(order.orderStatus,' io');
      

        let fcmMessage = {
            token : sportif.fcmToken,
            notification: {
                title: "Order updates",
                body: msg,
            },        
        }
        // Push notif
        const fcmResponse = await admin.messaging().send(fcmMessage);
        
        //Log success or handle errors as needed
        console.log("Push notification response : "+fcmResponse);

        // Save the updated order in the database
        return this.orderRepository.save(order);
    }
    /**
     * Get the order status
     * @param request - Express request object with orderId parameter
     * @returns the status of the order
     */
    async getOrderStatus(request: Request) {
        // Parse the orderId from request parameters
        const orderId: number = parseInt(request.params.orderId);

        // Find the order in the database based on the orderId
        const order = await this.orderRepository.findOne({
            where: { idOrder: orderId },
        });

        // Check if the order exists
        if (!order) {
            throw Error('Order not found');
        }

        // Return the order status
        return order.orderStatus;
    }
        /**
     * Get the order 
     * @param request - Express request object with orderId parameter
     * @returns the order
     */
        async getOrderById(request: Request) {
            // Parse the orderId from request parameters
            const orderId: number = parseInt(request.params.orderId);
    
            // Find the order in the database based on the orderId
            const order = await this.orderRepository.findOne({
                where: { idOrder: orderId },
                // Include  relations
                relations: ['devis', 'offer','offer.preparatorSession','devis.preparatorSession','sportifSession'], 
                
            });
            // Check if the order exists
            if (!order) {
                throw Error('Order not found');
            }
    
            // Return the order status
            return order;
        }
    

    async getCountOrdersOfNearbyOffers(request: Request, response: Response) {
        // Extract sportif IdSession from params
        const sportifIdSession = parseInt(request.params.sportifIdSession);
        console.log(sportifIdSession);
        // Fetch sportif session by idSession
        const sportifSession = await this.sportifSessionRepository.findOne({
            where: { idSession: sportifIdSession },
        });
        console.log(sportifSession);
        // Check the existence of the SportifSession
        if (!sportifSession) {
            //console.log("WHY M BEING CALLED");
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
    
            // Fetch the offers which the current position of the sportif is included in its geographicalArea
            const countNearbyOffers = await this.orderRepository
                .createQueryBuilder('order')
                .leftJoin('order.offer', 'offer')
                .select('offer.idOffer', 'idOffer')
                .addSelect('COUNT(*)', 'orderCount')
                .where('order.offerIdOffer IS NOT NULL')
                .andWhere(`ST_Contains(offer.geographicalArea, ST_GeomFromText(:pointGeometry, 4326))`, { pointGeometry })
                .groupBy('offer.idOffer')
                .getRawMany();

    
            // return idOffer and its count
            return countNearbyOffers;
        } else {
            throw new Error('Invalid currentPosition format');
        }
    }
    async getPreparatorOrders(request: Request) {
        // Extract preparatorSessionId from params
        const preparatorSessionId: number = parseInt(request.params.preparatorIdSession);
 
        // Find the preparatorSession by ID session
        const preparatorSession = await this.preparatorSessionRepository.findOne({
            where: { idSession : preparatorSessionId  },
        });
 
        // Check the existance of the preparator Session
        if (!preparatorSession) {
            throw Error('Preparator not found');
        }
        const preparatorId = preparatorSession.idPreparator
        const orders = await this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.devis', 'devis')
        .leftJoinAndSelect('order.offer', 'offer')
        .leftJoinAndSelect('order.sportifSession', 'sportifSession')
        .leftJoinAndSelect('offer.preparatorSession', 'offerPreparatorSession')
        .leftJoinAndSelect('devis.preparatorSession', 'devisPreparatorSession')
        .where('offerPreparatorSession.idPreparator = :preparatorId OR devisPreparatorSession.idPreparator = :preparatorId', { preparatorId })
        .getMany();

        // Return orders with demands attached
        return orders;
    }
    async setIsPaid(request: Request, response: Response){
        // Parse the orderId from request parameters
        console.log(request.params.orderId); // Check the value of orderId passed in the request parameters
        const orderId: number = parseInt(request.params.orderId);
        console.log(orderId); // Check the parsed value of orderId

        // Find the order in the database based on the orderId
        const order = await this.orderRepository.findOne({
            where: { idOrder: orderId }
        });
        console.log(order)
        // Check if the order exists
        if (!order) {
            throw new Error('Order not found');
        }

        // Update the order payment status
        order.isPaid = true;

        // Save the updated order in the database
        const updatedOrder = await this.orderRepository.save(order);

        //Emit a socket.io event to notify clients about the order payment change
        const io = request.app.get("socketio");
        io.emit("orderPaymentChanged", { orderId: orderId });

        // Return the updated order
        return updatedOrder;
    }
    
   /**
     * A sportif user place an order of after he accepts a devis of it's demand
     * @param request - Express request object with sportifId parameter and devisId parameter
     * @returns Saved Order
     */
   async getOrderBasedOnDevisId(request: Request, response: Response) { 

    // Extract sportifId from params
    const sportifSessionId: number = parseInt(request.params.sportifSessionId);

    // Find the sportifSession by ID session
    const sportifSession = await this.sportifSessionRepository.findOne({
        where: { idSession : sportifSessionId  },
    });

    // Check the existance of the sportif Session
    if (!sportifSession) {
        throw Error('Sportif not found');
    }
    const idSportif = sportifSession.idSportif;
    // Fetch orders
    const orders = await this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.devis', 'devis')
        .leftJoin('order.sportifSession', 'sportifSession')
        .where('sportifSession.idSportif = :idSportif  ', { idSportif })
        .getMany();
    
    return orders;
    }
  
   
   }
 
 
  
 