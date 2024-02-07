import { Request, Response, NextFunction } from 'express';
import { mock, MockProxy } from 'jest-mock-extended';
import { Controller } from '../src/controller/Controller';  
import { AppDataSource } from '../src/data-source';
import { Devis } from '../src/entity/Devis'; 
import { SportifSession } from '../src/entity/SportifSession';
import { PreparatorSessionDto } from '../src/dto/PreparatorSessionDto';
import { Offer } from '../src/entity/Offer';
import { OrderStatus } from '../src/enum/EnumOrderStatus';
import { Order } from '../src/entity/Order';
import { Server } from 'socket.io';  
import {PreparatorSession} from '../src/entity/PreparatorSession'
import { Repository,createQueryBuilder} from 'typeorm';

let mockRequest: MockProxy<Request>;
let mockResponse: MockProxy<Response>;
let mockNext: MockProxy<NextFunction>;
let mockApp: MockProxy<{ get: jest.Mock }>;
let mockIo: MockProxy<Server>;
let mockedIo;
let controller=new Controller();
let offerRepository=AppDataSource.getRepository(Offer);
let orderRepository=AppDataSource.getRepository(Order);
let devisRepository=AppDataSource.getRepository(Devis);
let SportifSessionRepository = AppDataSource.getRepository(SportifSession);
let PreparatorSessionRepository = AppDataSource.getRepository(PreparatorSession);
let PreparatorSessionDtoRepository = AppDataSource.getRepository(PreparatorSessionDto);


    beforeEach(() => {
        mockRequest = mock<Request>();
        mockResponse = mock<Response>();
        mockNext = mock<NextFunction>();
        mockIo = mock<Server>();
        
 
    });
    // Clean up
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('placeOrderBasedOnOffers', () => {


        it('should place an order based on offers successfully', async () => {
        // Mock data
    
        const sportifSessionId = 1;
        const offerId = 1;

        const sportifSession  = {
            "idSession": 1,
            "idSportif": 1,
            "currentPosition": {
                "type": "Point",
                "coordinates": [
                    33.599154,
                    -7.615456
                ]
            },
            "isActive": true
        }

        const offer ={
            "title": "Delicious dinner",
            "mealType": "lunch",
            "caloricValue": 600,
            "fatsValue": 25,
            "proteinValue": 20,
            "carbohydratesValue": 70,
            "price": 15,
            "preparation_time": 22,
            "description": "Delicious dinner with polygon",
            "isAvailable": true,
            "geographicalArea": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            -7.660732,
                            33.593459
                        ],
                        [
                            -7.660732,
                            33.61705
                        ],
                        [
                            -7.588978,
                            33.61705
                        ],
                        [
                            -7.588978,
                            33.593459
                        ],
                        [
                            -7.660732,
                            33.593459
                        ]
                    ]
                ]
            },
            "preparatorSession": {
                "idSession": 1,
                "idPreparator": 1,
                "preparatorRank": 10,
                "currentPosition": {
                    "type": "Point",
                    "coordinates": [
                        33.604262,
                        -7.623428
                    ]
                },
                "isActive": true
            },
            "imageUrl": null,
            "idOffer": 1,
            "isDeliverable": true,
            "createdAt": "2024-01-02T23:53:24.614Z",
            "updatedAt": "2024-01-02T23:53:24.614Z"
        }

        const orderMock = {
            "idOrder": 1,
            "orderStatus": "pending",
            "createdAt": "2024-01-02T23:53:24.614Z",
        
            "sportifSession":{
            "idSession": 1,
            "idSportif": 1,
            "currentPosition": {
                "type": "Point",
                "coordinates": [
                    33.599154,
                    -7.615456
                ]
            },
            "isActive": true
        },
        "offer":{
            "title": "Delicious dinner",
            "mealType": "lunch",
            "caloricValue": 600,
            "fatsValue": 25,
            "proteinValue": 20,
            "carbohydratesValue": 70,
            "price": 15,
            "preparation_time": 22,
            "description": "Delicious dinner with polygon",
            "isAvailable": true,
            "geographicalArea": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            -7.660732,
                            33.593459
                        ],
                        [
                            -7.660732,
                            33.61705
                        ],
                        [
                            -7.588978,
                            33.61705
                        ],
                        [
                            -7.588978,
                            33.593459
                        ],
                        [
                            -7.660732,
                            33.593459
                        ]
                    ]
                ]
            }


        }
        }
    // Mock repository methods
        let  offerRep=offerRepository.findOne=jest.fn().mockResolvedValue(offer);
        let  sSessionRep=SportifSessionRepository.findOne=jest.fn().mockResolvedValue(sportifSession);
        let oRepCreate=orderRepository.create=jest.fn().mockReturnValue(orderMock);
        let oRepSave=orderRepository.save=jest.fn().mockReturnValue(orderMock);
        mockRequest.params = { sportifSessionId,offerId };
    
    

        // Call the placeOrderBasedOnOffers method
        const result = await controller.placeOrderBasedOnOffers(mockRequest);

        // Assertions
        
        expect(sSessionRep).toHaveBeenCalledWith({
        where: { idSession: sportifSessionId },
        });
        expect(offerRep).toHaveBeenCalledWith({
        where: { idOffer: offerId },
        });
        expect(oRepCreate).toHaveBeenCalledWith({
        sportifSession,
        offer
        });

        expect(result).toEqual(orderMock);
        });

        it('should throw an error when sportif session is not found', async () => {
        // Mock data
        const request = {
            params: {
            sportifSessionId: '1',
            offerId: '1',
            },
        } as Request;

        // Mock repository method to return null (sportif session not found)
        SportifSessionRepository.findOne=jest.fn()
            .mockResolvedValue(null);

        // Call the placeOrderBasedOnOffers method and expect an error
        await expect(controller.placeOrderBasedOnOffers(request)).rejects.toThrow('sportif not found');
        });

        it('should throw an error when offer is not found', async () => {
        // Mock data
        const request = {
            params: {
            sportifSessionId: '1',
            offerId: '1',
            },
        } as Request;

        // Mock repository method to return null (offer not found)
        SportifSessionRepository.findOne=jest.fn()
            .mockResolvedValue({ idSession: 1 }); // Assume sportif session is found
        offerRepository.findOne=jest.fn()
            .mockResolvedValue(null);

        // Call the placeOrderBasedOnOffers method and expect an error
        await expect(controller.placeOrderBasedOnOffers(request)).rejects.toThrowError('offer not found');
        });

        // Add more test cases for error scenarios, missing data, etc.
    });

    describe('placeOrderBasedOnDevis', () => {


        it('should place an order based on devis successfully', async () => {
        // Mock data
    
        const sportifSessionId = 1;
        const devisId = 1;

        const sportifSession  = {
            "idSession": 1,
            "idSportif": 1,
            "currentPosition": {
                "type": "Point",
                "coordinates": [
                    33.599154,
                    -7.615456
                ]
            },
            "isActive": true
        }
        const devis ={
        "idDevis": 3,
        "proposed_price": 70,
        "status": "pending",
        "createdAt": "2024-01-02T20:50:22.652Z",
        "updatedAt": "2024-01-02T20:50:22.652Z",
        "demand": {
            "idDemand": 1,
            "title": "pizza ",
            "mealType": "breakfast",
            "caloricValue": 6000,
            "fatsValue": 190,
            "proteinValue": 40,
            "carbohydratesValue": 30,
            "description": "Delicious pizza ",
            "desired_delivery_date": "2024-01-03T09:53:12.954Z",
            "isAvailable": true,
            "createdAt": "2024-01-02T20:47:01.905Z",
            "updatedAt": "2024-01-02T20:47:01.905Z"
        },}


        const orderMock = {
            "idOrder": 1,
            "orderStatus": "pending",
            "createdAt": "2024-01-02T23:53:24.614Z",
            "devis":{
                "idDevis": 3,
                "proposed_price": 70,
                "status": "pending",
                "createdAt": "2024-01-02T20:50:22.652Z",
                "updatedAt": "2024-01-02T20:50:22.652Z",
                "demand": {
                    "idDemand": 1,
                    "title": "pizza ",
                    "mealType": "breakfast",
                    "caloricValue": 6000,
                    "fatsValue": 190,
                    "proteinValue": 40,
                    "carbohydratesValue": 30,
                    "description": "Delicious pizza ",
                    "desired_delivery_date": "2024-01-03T09:53:12.954Z",
                    "isAvailable": true,
                    "createdAt": "2024-01-02T20:47:01.905Z",
                    "updatedAt": "2024-01-02T20:47:01.905Z"
                },},
            "sportifSession":{
            "idSession": 1,
            "idSportif": 1,
            "currentPosition": {
                "type": "Point",
                "coordinates": [
                    33.599154,
                    -7.615456
                ]
            },
            "isActive": true
        }
        

        
        }

    // Mock repository methods
        let  devisRep=devisRepository.findOne=jest.fn().mockResolvedValue(devis);
        let  sSessionRep=SportifSessionRepository.findOne=jest.fn().mockResolvedValue(sportifSession);
        let oRepCreate=orderRepository.create=jest.fn().mockReturnValue(orderMock);
        let oRepSave=orderRepository.save=jest.fn().mockReturnValue(orderMock);
        mockRequest.params = { sportifSessionId,devisId };
    
    

        // Call the placeOrderBasedOnOffers method
        const result = await controller.placeOrderBasedOnDevis(mockRequest, mockResponse);

        // Assertions
        
        expect(sSessionRep).toHaveBeenCalledWith({
        where: { idSession: sportifSessionId },
        });
        expect(devisRep).toHaveBeenCalledWith({
        where: { idDevis: devisId },
        });
        expect(oRepCreate).toHaveBeenCalledWith({
        sportifSession,
        devis
        });

        expect(result).toEqual(orderMock);
        });

        it('should throw an error when sportif session is not found', async () => {
        // Mock data
        const request = {
            params: {
            sportifSessionId: '1',
            devisId: '1',
            },
        } as Request;

        // Mock repository method to return null (sportif session not found)
        SportifSessionRepository.findOne=jest.fn()
            .mockResolvedValue(null);

        // Call the placeOrderBasedOnOffers method and expect an error
        await expect(controller.placeOrderBasedOnDevis(request, mockResponse)).rejects.toThrow('Sportif not found');
        });

        it('should throw an error when devis is not found', async () => {
        // Mock data
        const request = {
            params: {
            sportifSessionId: '1',
            devisId: '1',
            },
        } as Request;

        // Mock repository method to return null (offer not found)
        SportifSessionRepository.findOne=jest.fn()
            .mockResolvedValue({ idSession: 1 }); // Assume sportif session is found
        devisRepository.findOne=jest.fn()
            .mockResolvedValue(null);

        // Call the placeOrderBasedOnOffers method and expect an error
        await expect(controller.placeOrderBasedOnDevis(request,mockResponse)).rejects.toThrowError('Devis not found');
        });

        // Add more test cases for error scenarios, missing data, etc.
    });

    describe('getOrdersBySportifId', () => {


        it('should get  orders based on Sportif Id', async () => {
        // Mock data
    
        const sportifSessionId = 1;
        //  const devisId = 1;

        const sportifSession  = {
            "idSession": 1,
            "idSportif": 1,
            "currentPosition": {
                "type": "Point",
                "coordinates": [
                    33.599154,
                    -7.615456
                ]
            },
            "isActive": true
        }
        const devis ={
        "idDevis": 3,
        "proposed_price": 70,
        "status": "pending",
        "createdAt": "2024-01-02T20:50:22.652Z",
        "updatedAt": "2024-01-02T20:50:22.652Z",
        "demand": {
            "idDemand": 1,
            "title": "pizza ",
            "mealType": "breakfast",
            "caloricValue": 6000,
            "fatsValue": 190,
            "proteinValue": 40,
            "carbohydratesValue": 30,
            "description": "Delicious pizza ",
            "desired_delivery_date": "2024-01-03T09:53:12.954Z",
            "isAvailable": true,
            "createdAt": "2024-01-02T20:47:01.905Z",
            "updatedAt": "2024-01-02T20:47:01.905Z"
        },}


        const orderMock = [{
            "idOrder": 1,
            "orderStatus": "pending",
            "createdAt": "2024-01-02T23:53:24.614Z",
            "devis":{
                "idDevis": 3,
                "proposed_price": 70,
                "status": "pending",
                "createdAt": "2024-01-02T20:50:22.652Z",
                "updatedAt": "2024-01-02T20:50:22.652Z",
                "demand": {
                    "idDemand": 1,
                    "title": "pizza ",
                    "mealType": "breakfast",
                    "caloricValue": 6000,
                    "fatsValue": 190,
                    "proteinValue": 40,
                    "carbohydratesValue": 30,
                    "description": "Delicious pizza ",
                    "desired_delivery_date": "2024-01-03T09:53:12.954Z",
                    "isAvailable": true,
                    "createdAt": "2024-01-02T20:47:01.905Z",
                    "updatedAt": "2024-01-02T20:47:01.905Z"
                },},
            "sportifSession":{
            "idSession": 1,
            "idSportif": 1,
            "currentPosition": {
                "type": "Point",
                "coordinates": [
                    33.599154,
                    -7.615456
                ]
            },
            "isActive": true
        }}];
        ;

        
        

    // Mock repository methods
        let  devisRep=devisRepository.findOne=jest.fn().mockResolvedValue(devis);
        let  sSessionRep=SportifSessionRepository.findOne=jest.fn().mockResolvedValue(sportifSession);
        let orderRep=orderRepository.createQueryBuilder=jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue(orderMock),
        });
        mockRequest.params = { sportifSessionId };
        
    
    

        // Call the placeOrderBasedOnOffers method
        const result = await controller.getOrdersBySportifId(mockRequest);

        // Assertions
        
        expect(sSessionRep).toHaveBeenCalledWith({
        where: { idSession: sportifSessionId },
        });
    

        expect(result).toEqual(orderMock);
        });

        it('should throw an error when sportif session is not found', async () => {
        // Mock data
        const request = {
            params: {
            sportifSessionId: '1',
            devisId: '1',
            },
        } as Request;

        // Mock repository method to return null (sportif session not found)
        SportifSessionRepository.findOne=jest.fn()
            .mockResolvedValue(null);

        // Call the placeOrderBasedOnOffers method and expect an error
        await expect(controller.getOrdersBySportifId(request)).rejects.toThrow('Sportif not found');
        });

    
    });

    describe('setOrderStatus', () => {

        // Mock data
    
        const orderId=1;

        const orderMock = [{
            "idOrder": 1,
            "orderStatus": "pending",
            "createdAt": "2024-01-02T23:53:24.614Z",
            "devis":{
                "idDevis": 3,
                "proposed_price": 70,
                "status": "pending",
                "createdAt": "2024-01-02T20:50:22.652Z",
                "updatedAt": "2024-01-02T20:50:22.652Z",
                "demand": {
                    "idDemand": 1,
                    "title": "pizza ",
                    "mealType": "breakfast",
                    "caloricValue": 6000,
                    "fatsValue": 190,
                    "proteinValue": 40,
                    "carbohydratesValue": 30,
                    "description": "Delicious pizza ",
                    "desired_delivery_date": "2024-01-03T09:53:12.954Z",
                    "isAvailable": true,
                    "createdAt": "2024-01-02T20:47:01.905Z",
                    "updatedAt": "2024-01-02T20:47:01.905Z"
                },},
            "sportifSession":{
            "idSession": 1,
            "idSportif": 1,
            "currentPosition": {
                "type": "Point",
                "coordinates": [
                    33.599154,
                    -7.615456
                ]
            },
            "isActive": true
        }}];
        ;
    
        

    // Mock repository methods
        let  orederfindOne=orderRepository.findOne=jest.fn().mockResolvedValue(orderMock);

        it('should change the order status to preparation', async () => {
    
            mockRequest.params = { orderId,status:"preparation" };
    
        // Call the placeOrderBasedOnOffers method
        const result = await controller.setOrderStatus(mockRequest);

        // Assertions
        const updatedOrder = await orderRepository.findOne({
            where: { idOrder: 1 },
        });
        expect(mockedIo).toHaveBeenCalled();

        expect(updatedOrder.orderStatus).toEqual(OrderStatus.PREPARATION);
        });
        it('should change the order status to delivery', async () => {
    
        mockRequest.params = { orderId,status:"delivery" };

        // Call the placeOrderBasedOnOffers method
        const result = await controller.setOrderStatus(mockRequest);

        // Assertions
        const updatedOrder = await orderRepository.findOne({
        where: { idOrder: 1 },
        });
     
    expect(mockedIo).toHaveBeenCalled();

    expect(updatedOrder.orderStatus).toEqual(OrderStatus.DELIVERY);
        });
        it('should change the order status to delivered', async () => {
        
            mockRequest.params = { orderId,status:"delivered" };

        // Call the placeOrderBasedOnOffers method
        const result = await controller.setOrderStatus(mockRequest);

        // Assertions
        const updatedOrder = await orderRepository.findOne({
            where: { idOrder: 1 },
        });
      
        expect(mockedIo).toHaveBeenCalled();
        expect(updatedOrder.orderStatus).toEqual(OrderStatus.DELIVERED);
        });
        it('should change the order status to closed', async () => {
        
        mockRequest.params = { orderId,status:"closed" };

        // Call the placeOrderBasedOnOffers method
        const result = await controller.setOrderStatus(mockRequest);

        // Assertions
        const updatedOrder = await orderRepository.findOne({
        where: { idOrder: 1 },
        });
       
        expect(mockedIo).toHaveBeenCalled();
        expect(updatedOrder.orderStatus).toEqual(OrderStatus.CLOSED);
        });
        it('should throw an error for an invalid status', async () => {
        mockRequest.params = { orderId,status:"error" };
        // Call the setOrderStatus method and expect an error
        await expect(controller.setOrderStatus(mockRequest)).rejects.toThrow('Invalid Status');
         
        });
        it('should throw an errorOrder not found', async () => {
        mockRequest.params = { orderId,status:"preparation" };
        // Mock repository methods
        let  orederRep=orderRepository.findOne=jest.fn().mockResolvedValue(null);
        
    
        // Call the setOrderStatus method and expect an error
        await expect(controller.setOrderStatus(mockRequest)).rejects.toThrow('Order not found');
        expect(orederRep).toHaveBeenCalledWith({
            where: { idOrder: orderId },
        });
    
        });
    });

    describe('getOrderStatus', () => {
    // Mock data
    const orderId=1;
       

    const orderMock: Order = {
        "idOrder": 1,
        "orderStatus": OrderStatus.PREPARATION,
        "devis":null,
        "offer":null,
        "createdAt":null,
        "sportifSession":null};
   

        it('should get the status of the order', async () => {

            
         // Mock repository methods

        let orderFindOne=orderRepository.findOne=jest.fn().mockReturnValue(orderMock);
        mockRequest.params = { orderId };
        // Call the placeOrderBasedOnOffers method
        const result = await controller.getOrderStatus(mockRequest);

        // Assertions
        
        expect(orderFindOne).toHaveBeenCalledWith({
        where: { idOrder: orderId },
        });
    

        expect(result).toEqual(orderMock.orderStatus);
        });

        it('should throw an error when order is not found', async () => {
        mockRequest.params = { orderId };
        // Mock repository method to return null (sportif session not found)
        orderRepository.findOne=jest.fn()
            .mockResolvedValue(null);

        // Call the placeOrderBasedOnOffers method and expect an error
        await expect(controller.getOrderStatus(mockRequest)).rejects.toThrow('Order not found');
        });

    
    });

    describe('getOrderById', () => {
        // Mock data
        const orderId=1;

        const orderMock: Order = {
            "idOrder": 1,
            "orderStatus": OrderStatus.PREPARATION,
            "devis":null,
            "offer":null,
            "createdAt":null,
            "sportifSession":null};
       
            it('should throw an error when order is not found', async () => {
                mockRequest.params = { orderId };
                // Mock repository method to return null (sportif session not found)
                orderRepository.findOne=jest.fn().mockResolvedValue(null);
        
                // Call the placeOrderBasedOnOffers method and expect an error
                await expect(controller.getOrderById(mockRequest)).rejects.toThrow('Order not found');
                });
        
            it('should get the order', async () => {
    
                
             // Mock repository methods
    
            let orderFindOne=orderRepository.findOne=jest.fn().mockReturnValue(orderMock);
            mockRequest.params = { orderId };
            // Call the placeOrderBasedOnOffers method
            const result = await controller.getOrderById(mockRequest);
    
            // Assertions
            
            expect(orderFindOne).toHaveBeenCalledWith({
            where: { idOrder: orderId },
            });
        
    
            expect(result).toEqual(orderMock);
            });
            it('should correctly set the rank of a preparator and send a Kafka message', async () => {
                   // Mock Kafka to avoid external calls
            jest.mock('kafkajs'); 
            // Mock the Kafka producer connect method
            controller.producer.connect=jest.fn();
            controller.producer.send=jest.fn();
             controller.producer.disconnect=jest.fn();
        
                // Mock data
                const preparatorId = 1;
                const rank = 4.5;
                const mockPreparatorSession = new PreparatorSession()
                mockPreparatorSession.idSession = 1;
                mockPreparatorSession.preparatorRank = 3.8;
                mockPreparatorSession.idPreparator=1;
            
                PreparatorSessionRepository.findOne =jest.fn().mockResolvedValue(mockPreparatorSession);
                orderRepository.createQueryBuilder =jest.fn().mockReturnValue({
                   leftJoinAndSelect: jest.fn().mockReturnThis(),
                    where: jest.fn().mockReturnThis(), 
                    andWhere: jest.fn().mockReturnThis(),
                  getCount: jest.fn().mockResolvedValue(2), // Mock n1 and n2 counts
                });
                const allPreparatorSessions = PreparatorSessionRepository.find =jest.fn().mockResolvedValue(mockPreparatorSession);
             

                mockPreparatorSession                // Call the function
                const updatedPreparatorSession = await controller.setRankPreparator({
                  params: { preparatorId, rank },
                });
            
                // Assertions
                expect(updatedPreparatorSession.preparatorRank).toBeCloseTo(3.8, 2); // Assert updated rank
         
            
    
            });
    
           
        
        });
    

    describe('Devis Entity', () => {


    // it('should create Devis and establish a OneToOne relationship with Order', async () => {
    //   // Create a new Order
    //   const   idOrder= 8;
    //   const   idDevis= 7;
    //   const orderMock = {
    //     "idOrder": idOrder,
    //     "orderStatus": "pending",
    //     "createdAt": "2024-01-02T23:53:24.614Z",
    //     "devis":{
    //         "idDevis": idDevis,
    //         "proposed_price": 70,
    //         "status": "pending",
    //         "createdAt": "2024-01-02T20:50:22.652Z",
    //         "updatedAt": "2024-01-02T20:50:22.652Z",
    //         "demand": {
    //             "idDemand": 1,
    //             "title": "pizza ",
    //             "mealType": "breakfast",
    //             "caloricValue": 6000,
    //             "fatsValue": 190,
    //             "proteinValue": 40,
    //             "carbohydratesValue": 30,
    //             "description": "Delicious pizza ",
    //             "desired_delivery_date": "2024-01-03T09:53:12.954Z",
    //             "isAvailable": true,
    //             "createdAt": "2024-01-02T20:47:01.905Z",
    //             "updatedAt": "2024-01-02T20:47:01.905Z"
    //         },},
    //     "sportifSession":{
    //       "idSession": 1,
    //       "idSportif": 1,
    //       "currentPosition": {
    //           "type": "Point",
    //           "coordinates": [
    //               33.599154,
    //               -7.615456
    //           ]
    //       },
    //       "isActive": true
    //   }
    

        
    //   }
    //   const devisMock ={
    //     "idDevis":idDevis,
    //     "proposed_price": 70,
    //     "idPreparator":1,
    //   "offer":orderMock }

    
    //   afterEach(async () => {
    //     // Clear the database after each test
    //     await devisRepository.clear();
    //     await orderRepository.clear();
    //   });
    
    //   afterAll(async () => {
    //     // Close the database connection after all tests
    //     await devisRepository.query('DELETE FROM devis;');
    //     await orderRepository.query('DELETE FROM "order";');
    //   });

    
    //   expect(devisRepository.create=jest.fn().mockReturnValue(devisMock)).toHaveBeenCalled();

    //   // Fetch the saved Devis with the Order relationship
    //   const savedDevis = await devisRepository.findOne({
    //     where: { idDevis: idDevis },
    //     relations: ['order'], // Include the 'order' relationship in the query
    //   });


    //   let oRepCreate=orderRepository.create=jest.fn().mockReturnValue(orderMock);
    //   let oRepSave=orderRepository.save=jest.fn().mockReturnValue(orderMock);
    //   let dRepCreate=devisRepository.create=jest.fn().mockReturnValue(devisMock);
    //   let dRepSave=devisRepository.save=jest.fn().mockReturnValue(devisMock);
    

        
    
    //   const savedOrder = await orderRepository.findOne({
    //     where: { idOrder: idOrder },

        
    //   });
    //   expect(savedDevis).toBeDefined();
    //   expect(savedDevis?.order).toBeDefined();

    //   // Assert that the Devis and Order are correctly associated
    

    //   expect(savedDevis.order.idOrder).toEqual(idOrder);
    // });
    });