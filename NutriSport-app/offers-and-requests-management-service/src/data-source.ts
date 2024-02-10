import "reflect-metadata"
import { DataSource } from "typeorm"
import { SprotifSession } from "./entity/SportifSession"
import { PreparatorSession } from "./entity/PreparatorSession"
import { Offer } from "./entity/Offer"
import { Demand } from "./entity/Demand"
import { Devis } from "./entity/Devis"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.hostIp,
    port: 5432,
    username: "nutriSport",
    password: process.env.SPRING_DATASOURCE_PASSWORD,
    database: "nutriSportDb",
    synchronize: true,
    logging: false,
    entities: [SprotifSession, PreparatorSession, Offer, Demand, Devis],
    migrations: [],
    subscribers: [],
})
