import { Kafka, Consumer, logLevel } from 'kafkajs';
import { AppDataSource } from '../data-source';
import { PreparatorSession } from '../entity/PreparatorSession';
import { SprotifSession } from '../entity/SportifSession';
export class SessionLocationConsumer {
  private kafka_broker_adress = process.env.KAFKA_BROKER!;

  private kafka = new Kafka({ brokers: [this.kafka_broker_adress], logLevel: logLevel.ERROR });

  private consumerLocation = this.kafka.consumer({ groupId: 'sessionLocation-consumer' });
  private preparatorSessionRepository = AppDataSource.getRepository(PreparatorSession);
  private sportifSessionRepository = AppDataSource.getRepository(SprotifSession);
  async consumeLocationSessionAdd(): Promise<void> {
    await this.consumerLocation.connect();
    await this.consumerLocation.subscribe({ topic: 'sessionLocation-topic1', fromBeginning: true });

    await this.consumerLocation.run({
        
        eachMessage: async ({ topic, partition, message }) => {
            console.log("before");
          const jsonString = JSON.parse(message.value.toString());
          const payload = JSON.parse(jsonString);
          const authorities = payload.authorities || [];
          const authority = authorities.length > 0 ? authorities[0].authority : null;
          console.log(payload);
          console.log(`Received message: ${payload.id} from topic: ${topic}`);
          if (authority == 'ROLE_SPORTIF') {
            const sportifSessionX = await this.sportifSessionRepository.findOne({
              where: { idSession: payload.id },
            })
            console.log('Updating location for user sportif');
            if (sportifSessionX) {
                // Update the currentPosition with the new location data
                sportifSessionX.currentPosition = {
                    type: 'Point',
                    coordinates: [payload.latitude, payload.longitude] // Assuming longitude and latitude are available in payload
                };
                await this.sportifSessionRepository.save(sportifSessionX);
                console.log('Sportif session updated.');
            }else{
                console.log('Sportif session not found.');
            }     
        }
        else {
            const preparatorSessionX = await this.preparatorSessionRepository.findOne({
                where: { idSession: payload.id },
            })
            console.log('Updating location for user preparator');
            if (preparatorSessionX) {
                // Update the currentPosition with the new location data
                preparatorSessionX.currentPosition = {
                    type: 'Point',
                    coordinates: [payload.latitude, payload.longitude] // Assuming longitude and latitude are available in payload
                };
                await this.preparatorSessionRepository.save(preparatorSessionX);
                console.log('Preparator session updated.');
            } else {
              console.log('Preparator session not found.');
            }
        }
    }
    });
}}