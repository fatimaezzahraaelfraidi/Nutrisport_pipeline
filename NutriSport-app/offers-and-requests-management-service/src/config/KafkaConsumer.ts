import { Kafka, logLevel } from 'kafkajs';
import { AppDataSource } from '../data-source';
import { PreparatorSession } from '../entity/PreparatorSession';

export class KafkaConsumer {
private kafka_broker_adress = process.env.KAFKA_BROKER!

  private kafka = new Kafka({brokers: [this.kafka_broker_adress], logLevel: logLevel.ERROR})

  private preparatorConsumer = this.kafka.consumer({groupId: 'preparator-rank-consumer' });

  private preparatorSessionRepository = AppDataSource.getRepository(PreparatorSession);

  async consumeRankPreparator(): Promise<void> {
    await this.preparatorConsumer.connect();
    await this.preparatorConsumer.subscribe({ topic: 'preparator-rank-topic', fromBeginning: true });
  
    await this.preparatorConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const payload = JSON.parse(message.value.toString());
        console.log(`Received message: ${payload} from topic: ${topic}`);
        
        // Find the existing preparator session by ID
        const existingPreparatorSession = await this.preparatorSessionRepository.findOne({
          where: { idSession: payload.idSession },
        });
  
        if (existingPreparatorSession) {
          // Update the properties of the existing session preparator
          existingPreparatorSession.preparatorRank = payload.preparatorRank;
          await this.preparatorSessionRepository.save(existingPreparatorSession);
          console.log('Updating ' + existingPreparatorSession.idPreparator);
        } else {
          console.log('Preparator Session with ID ' + payload.idSession + ' not found.');
        }
      },
    });
  }
    

  
}