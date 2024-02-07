import * as express from "express"
import * as bodyParser from "body-parser"
import { Request, Response } from "express"
import { Routes } from "./routes"
import eurekaHelper = require('./eureka-helper')
import { port } from "./config"

// create express app
const app = express()
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

app.listen(port)
eurekaHelper.registerWithEureka('payment-service', port);

console.log("Express server has started on port 3400.")

