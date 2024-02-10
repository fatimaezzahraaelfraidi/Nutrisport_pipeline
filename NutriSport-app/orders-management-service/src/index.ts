import * as express from "express"
import * as bodyParser from "body-parser"
import { Request, Response } from "express"
import { AppDataSource } from "./data-source"
import { port } from "./config"
import { Routes } from "./routes"

import morgan = require("morgan")
import { createServer } from "http";
import { Server } from "socket.io";
import { startKafkaConsumer } from "../src/config/KafkaMiddleware";
import eurekaHelper = require('./eureka-helper')

 

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
        (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
            const result = (new (route.controller as any))[route.action](req, res, next)
            if (result instanceof Promise) {
                result.then(result => result !== null && result !== undefined ? res.send(result) : undefined)

            } else if (result !== null && result !== undefined) {
                res.json(result)
            }
        })
    })
    const cors = require('cors');
    app.use(cors());
    const httpServer = createServer(app);  // Create an HTTP server
    const io = new Server(httpServer);     // Attach Socket.IO to the HTTP server
   
   
      
    app.set("socketio", io);
   
    app.use(handleError);
    // start express server
    //app.use(startKafkaConsumer);
    startKafkaConsumer().catch(console.error);
    
    // app.listen(port)
    httpServer.listen(port, () => {
        console.log(`Express server has started on port ${port}.`);
    });
 
    io.on('connection', (socket) => {
        console.log('A client connected');
        // ... other socket event listeners
     });   
    
    eurekaHelper.registerWithEureka('orders-management-service', port);

}).catch(error => console.log(error))

