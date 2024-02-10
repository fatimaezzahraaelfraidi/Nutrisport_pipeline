import { Kafka, logLevel } from 'kafkajs';
import { AppDataSource } from '../data-source';
import { Devis } from '../entity/Devis';
import { Offer } from '../entity/Offer';
import { PreparatorSession } from '../entity/PreparatorSession';
import { SportifSession } from '../entity/SportifSession';

export class KafkaConsumer {
private kafka_broker_adress = process.env.KAFKA_BROKER!

    private kafka = new Kafka({brokers: [this.kafka_broker_adress], logLevel: logLevel.ERROR})
    private devisConsumer = this.kafka.consumer({groupId: 'devis-consumer' });
    private offerConsumer = this.kafka.consumer({groupId: 'offer-consumer' });
    //private preparatorConsumer = this.kafka.consumer({groupId: 'preparator-consumer' });
    private devisRepository = AppDataSource.getRepository(Devis);
    private offerRepository = AppDataSource.getRepository(Offer);
    // private prepR = AppDataSource.getRepository(Offer);
    private prepRepo = AppDataSource.getRepository(PreparatorSession);
    private sportifRepository = AppDataSource.getRepository(SportifSession);

    async consumeDevis(): Promise<void> {

        await this.devisConsumer.connect();
        await this.devisConsumer.subscribe({ topic: 'devis-topic', fromBeginning: true });
    
        await this.devisConsumer.run({
          eachMessage: async ({ topic, partition, message }) => {
            const payload = JSON.parse(message.value.toString());
            const prep = await this.prepRepo.findOne({
              where : {idPreparator: payload.idPreparator}
            });
            // const sportif = await this.sportifRepository.findOne({
            //   where : {idSportif: payload.idSportif}
            // });
            console.log(`Received message: ${payload} from topic: ${topic}`);
            
            // Create a new Devis entity
            const newDevis = new Devis();
            newDevis.idDevis=payload.idDevis;
            newDevis.proposed_price = payload.proposed_price;
            newDevis.idPreparator = payload.idPreparator;
            newDevis.title = payload.title;
            newDevis.preparatorSession = prep;
            // newDevis.sportifSession = sportif;

            this.devisRepository.save(newDevis)
            console.log('SAVINNA '+newDevis.idDevis);
          },
        })
    }

    async consumeOffer(): Promise<void> {
      await this.offerConsumer.connect();
      await this.offerConsumer.subscribe({ topic: 'offer-topic', fromBeginning: true });
      await this.offerConsumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const payload = JSON.parse(message.value.toString());
          console.log(`Received message: ${payload} from topic: ${topic}`);
          //Test if the received offer exists or not 
          const offer = await this.offerRepository.findOne({
            where : { idOffer : payload.idOffer}
          })
          //Offer n'exist pas  imples save new offer
          if(!offer){
            // Create a new Offer entity
            const newOffer = new Offer();
            newOffer.idOffer=payload.idOffer;
            newOffer.title=payload.title;
            newOffer.price=payload.price;
            newOffer.preparation_time=payload.preparation_time;
            newOffer.isAvailable=payload.isDeliverable;
            newOffer.isAvailable=payload.isAvailable;
            newOffer.createdAt=payload.createdAt;
            newOffer.updatedAt=payload.updatedAt;
            newOffer.geographicalArea=payload.geographicalArea;
            newOffer.preparatorSession = await this.prepRepo.findOne({
              where: { idSession : payload.idPreparatorSession  },
            });
            this.offerRepository.save(newOffer)
            console.log('SAVINNA '+newOffer.idOffer);
          }
          else{
            offer.idOffer=payload.idOffer;
            offer.title=payload.title;
            offer.price=payload.price;
            offer.preparation_time=payload.preparation_time;
            offer.isAvailable=payload.isDeliverable;
            offer.isAvailable=payload.isAvailable;
            offer.createdAt=payload.createdAt;
            offer.updatedAt=payload.updatedAt;
            offer.geographicalArea=payload.geographicalArea;
            offer.preparatorSession = await this.prepRepo.findOne({
              where: { idSession : payload.idPreparatorSession  },
            });
            this.offerRepository.save(offer);
            console.log('Update  '+offer.idOffer);
          }
        },
      })
    }
}