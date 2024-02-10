import "reflect-metadata"
import { DataSource } from "typeorm"
import { SportifSession } from "./entity/SportifSession"
import { Offer } from "./entity/Offer"
import { Order } from "./entity/Order"
import { Devis } from "./entity/Devis"
import { PreparatorSession } from "./entity/PreparatorSession"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "postgisOs",
    port: 5432,
    username: "nutriSport",
    password: process.env.SPRING_DATASOURCE_PASSWORD,
    database: "nutriSportDb_ordersService",
    synchronize: true,
    logging: false,
    entities: [SportifSession, Offer,Order,Devis, PreparatorSession],
    migrations: [],
    subscribers: [],
})
