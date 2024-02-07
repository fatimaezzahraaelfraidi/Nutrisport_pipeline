import { KafkaConsumer } from "./KafkaConsumer";
import { SessionConsumer } from "./SessionConsumer ";
import { SessionLocationConsumer } from "./SessionLocationConsumer";

const kafkaConsumer = new KafkaConsumer();
const sessionConsumer = new SessionConsumer();
const sessionLocationConsumer = new SessionLocationConsumer();
export async function startKafkaConsumer() {
  await kafkaConsumer.consumeDevis();
  await kafkaConsumer.consumeOffer();
  await sessionConsumer.consumeSessionAdd();
  await sessionConsumer.consumeSessionLogOut();
  await sessionLocationConsumer.consumeLocationSessionAdd();

}

module.exports = { startKafkaConsumer };
