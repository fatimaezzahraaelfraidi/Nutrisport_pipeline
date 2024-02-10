import { Kafka, logLevel } from 'kafkajs';
import { AppDataSource } from '../data-source';
import { PreparatorSession } from '../entity/PreparatorSession';
import { SportifSession } from '../entity/SportifSession';
export class SessionConsumer {
  private kafka_broker_adress = process.env.KAFKA_BROKER!;

  private kafka = new Kafka({ brokers: [this.kafka_broker_adress], logLevel: logLevel.ERROR });

  private consumerSession = this.kafka.consumer({ groupId: 'session-consumer2' });
  private consumerSession2 = this.kafka.consumer({groupId: 'session-consumer4' });
  private preparatorSessionRepository = AppDataSource.getRepository(PreparatorSession);
  private sportifSessionRepository = AppDataSource.getRepository(SportifSession);
  async consumeSessionAdd(): Promise<void> {
    await this.consumerSession.connect();
    await this.consumerSession.subscribe({ topic: 'session-topic2', fromBeginning: true });

    await this.consumerSession.run({
        eachMessage: async ({ topic, partition, message }) => {
          const payload = JSON.parse(message.value.toString());
          console.log(`Received message: ${payload} from topic: ${topic}`);
  
          // Check if the user is a sportif
          const isSportif = payload.account.authorities.some(
            (authority: { authority: string }) => authority.authority === 'ROLE_SPORTIF'
          );
  
          if (isSportif) {
            
            
              console.log('new sportif connected');
              // Extract relevant information from payload
              
              const { id, firstName, lastName, email, phone, weight, allergies } = payload.account.user;
              const { location } = payload; // Assuming you have location in your payload

              // Extract locationGeometry from location
              const currentPosition = location ? location.locationGeometry : null;
              if(payload.id != null){
              await AppDataSource.manager.save(
                AppDataSource.manager.create(SportifSession, {
                  idSession:payload.id,
                  isActive: true,
                  idSportif: id,
                  name : payload.account.user.firstName+" "+payload.account.user.lastName,
                  phone : payload.account.user.phone,
                  currentPosition : currentPosition,//hay mohammadi
                  fcmToken:payload.fcmToken
                })
              ); 
                // const sportifSession = new SportifSession();
                // sportifSession.idSession = payload.id;
                // sportifSession.idSportif = id;
                // //  sportifSession.currentPosition = new Point(currentPosition.x, currentPosition.y); // Assuming x and y are coordinates in your payload
                // sportifSession.isActive = true; 
  
                // // Save the new SportifSession entity
                // await this.sportifSessionRepository.save(sportifSession);
  
              } 
              else {console.log('new sportif not saved.'); }  
            
            
        }
           else {
             
            
              console.log('new chef connected.');
              // Extract relevant information from payload
             
              const { id, firstName, lastName, email, phone, rank,cinNumber } = payload.account.user;
              const { location } = payload; // Assuming you have location in your payload

              // Extract locationGeometry from location
              const currentPosition = location ? location.locationGeometry : null;
              if(payload.id != null){
                // Create a new PreparatorSession entity
              await AppDataSource.manager.save(
                AppDataSource.manager.create(PreparatorSession, {
                    idSession: payload.id,
                    currentPosition : currentPosition,
                    isActive : true,
                    preparatorRank: rank,
                    idPreparator: id,
                    fcmToken:payload.fcmToken
                })
            );
                // const preparatorSession = new PreparatorSession();
                // preparatorSession.idSession=payload.id;
                // preparatorSession.idPreparator = id;
                // // preparatorSession.currentPosition = new Point(currentPosition.x, currentPosition.y); // Assuming x and y are coordinates in your payload
                // preparatorSession.isActive = true; 
                // preparatorSession.preparatorRank=rank;

                // // Save the new PreparatorSession entity
                // await this.preparatorSessionRepository.save(preparatorSession);
    
                console.log('Preparator session saved.');
              }
              else {console.log('new chef not saved.');}
            
            }
               },
             });
    }
    async consumeSessionLogOut(): Promise<void> {
      await this.consumerSession2.connect();
      await this.consumerSession2.subscribe({ topic: 'sessionLogOut-topic2', fromBeginning: true });
  
      await this.consumerSession2.run({
          eachMessage: async ({ topic, partition, message }) => {
            const jsonString = JSON.parse(message.value.toString());
            const payload = JSON.parse(jsonString);
      
            console.log(`Received message log out : ${payload} from topic: ${topic}`);
         
      

            // Check if the user is a sportif
            const authorities = payload.authorities || [];
            const id = payload.id;
            const firstAuthority = authorities.length > 0 ? authorities[0].authority : null;

            console.log("ID:", id);
            console.log("Authority:", firstAuthority);
  
              if (firstAuthority == 'ROLE_SPORTIF') {
                  console.log('  sportif log out');
  
                  if (payload.id != null) {
                      const sportifSession = await this.sportifSessionRepository.findOne({
                          where: { idSession: payload.id },
                      });
                      if (sportifSession) {
                          sportifSession.isActive = false;
                          await this.sportifSessionRepository.save(sportifSession);
                      } else {
                          console.log('sportif log out session not found.');
                      }
                  } else {
                      console.log('sportif log out ID is null.');
                  }
              } else {
                  console.log('  chef log out');
                  if (payload.id != null) {
                      const chefSession = await this.preparatorSessionRepository.findOne({
                          where: { idSession: payload.id },
                      });
                      if (chefSession) {
                          chefSession.isActive = false;
                          await this.preparatorSessionRepository.save(chefSession);
                      } else {
                          console.log('chef log out session not found.');
                      }
                  } else {
                      console.log('chef log out ID is null.');
                  }
              }
          },
      });
  }
}