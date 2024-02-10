import * as express from "express"
import * as bodyParser from "body-parser"
import { Request, Response } from "express"
import { AppDataSource } from "./data-source"
import { Routes } from "./routes"
import { port } from "./config"
import *  as morgan from "morgan"
import { Server } from "socket.io";
import { startKafkaConsumer } from "../src/config/KafkaMiddleware";
import eurekaHelper = require('./eureka-helper')
import { createServer } from "http"

function handleError(err, req, res, next){
    res.status(err.statusCode || 500).send({error_message : err.message});
}

var admin = require("firebase-admin");

var serviceAccount = require("../nutrisport-firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
 

AppDataSource.initialize().then(async () => { 

    // create express app
    const app = express()
    //loogger
    //chnage tiny with combined
    app.use(morgan('tiny'))
    app.use(bodyParser.json())

    // register express routes from defined application routes
    Routes.forEach(route => {
        (app as any)[route.method](route.route, async (req: Request, res: Response, next: Function) => {
            try {
                const result = await (new (route.controller as any))[route.action](req, res, next)
                res.json(result)
            } catch (error) {
                //in express next is a middleware that gonna handle errors
                next(error);
            }
        })
    })

    const httpServer = createServer(app);  // Create an HTTP server
    const io = new Server(httpServer);     // Attach Socket.IO to the HTTP server
    const cors = require('cors');
    
    app.set("socketio", io);
    app.use(cors());
    app.use(handleError);
    startKafkaConsumer().catch(console.error);

    

    // start express server
    httpServer.listen(port, () => {
        console.log(`Express server has started on port ${port}.`);
    });
 
    io.on('connection', (socket) => {
        console.log('A client connected');
        // ... other socket event listeners
     });   
   
    
     eurekaHelper.registerWithEureka('offers-and-requests-management-service', port);
}).catch(error => console.log(error))
