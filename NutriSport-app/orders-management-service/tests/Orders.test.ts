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
import { Double, Repository,createQueryBuilder} from 'typeorm';

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


    // beforeEach(() => {
    //     mockRequest = mock<Request>();
    //     mockResponse = mock<Response>();
    //     mockNext = mock<NextFunction>();
    //     mockIo = mock<Server>();
        
 
    // });
    // Mock Firebase Admin SDK
const adminMessagingSendMock = jest.fn();
jest.mock('firebase-admin', () => ({
    messaging: () => ({
        send: adminMessagingSendMock
    })
}));

beforeEach(() => {
    mockRequest = mock<Request>();
    mockResponse = mock<Response>();
    mockNext = mock<NextFunction>();
    
    // Mock the req.app.get function to return a mock io object
    mockRequest.app.get =jest.fn().mockReturnValue({
       emit: jest.fn(), // Mock the emit function of socket.io
   });
// Mock Firebase admin module
jest.mock('firebase-admin', () => {
const messagingSendMock = jest.fn();
return {
    messaging: () => ({
        send: messagingSendMock
    })
};
});});

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
        const preparatorSession: PreparatorSession =     {
            "idSession": 1,
            "idPreparator": 1,
            "currentPosition": {
                "type": "Point",
                "coordinates": [
                    12.965598,
                    77.590862
                ]
            },
            "isActive": true,
            preparatorRank: 0,
            fcmToken: '',
            offers: [],
            devis: []
        };
        const method= "online";
    // Mock repository methods
        let  offerRep=offerRepository.findOne=jest.fn().mockResolvedValue(offer);
        let  sSessionRep=SportifSessionRepository.findOne=jest.fn().mockResolvedValue(sportifSession);
        let oRepCreate=orderRepository.create=jest.fn().mockReturnValue(orderMock);
        let preparatorRep=PreparatorSessionRepository.findOne=jest.fn().mockResolvedValue(preparatorSession);
        let oRepSave=orderRepository.save=jest.fn().mockReturnValue(orderMock);
        let orderRepFind=orderRepository.findOne=jest.fn().mockResolvedValue(orderMock);
        
        mockRequest.params = { sportifSessionId: String(sportifSessionId) };
        mockRequest.params = { offerId: String(offerId) };
        mockRequest.params = { method: String(method) };

        // Call the placeOrderBasedOnOffers method
        const result = await controller.placeOrderBasedOnOffers(mockRequest);

        // Assertions
        
        expect(sSessionRep).toHaveBeenCalled();
        expect(offerRep).toHaveBeenCalled();
        expect(oRepCreate).toHaveBeenCalledWith({
        sportifSession,
        offer
        });

        expect(result).toEqual(orderMock);
        });

    it('should throw an error when sportif session is not found', async () => {
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
        const preparatorSession =     {
            "idSession": 1,
            "idPreparator": 1,
            "currentPosition": {
                "type": "Point",
                "coordinates": [
                    12.965598,
                    77.590862
                ]
            },
            "isActive": true
        };
        const method= "online";
        mockRequest.params = { sportifSessionId: String(sportifSessionId) };
        mockRequest.params = { offerId: String(offerId) };
        mockRequest.params = { method: String(method) };
        // Mock repository method to return null (sportif session not found)
        SportifSessionRepository.findOne=jest.fn()
            .mockResolvedValue(null);

        // Call the placeOrderBasedOnOffers method and expect an error
        await expect(controller.placeOrderBasedOnOffers(mockRequest)).rejects.toThrow('sportif not found');
        });

    it('should throw an error when offer is not found', async () => {
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
        const preparatorSession =     {
            "idSession": 1,
            "idPreparator": 1,
            "currentPosition": {
                "type": "Point",
                "coordinates": [
                    12.965598,
                    77.590862
                ]
            },
            "isActive": true
        };
        const method= "online";
        mockRequest.params = { sportifSessionId: String(sportifSessionId) };
        mockRequest.params = { offerId: String(offerId) };
        mockRequest.params = { method: String(method) };

    // Mock repository method to return null (offer not found)
    SportifSessionRepository.findOne=jest.fn()
        .mockResolvedValue({ idSession: 1 }); // Assume sportif session is found
    offerRepository.findOne=jest.fn()
        .mockResolvedValue(null);

    // Call the placeOrderBasedOnOffers method and expect an error
    await expect(controller.placeOrderBasedOnOffers(mockRequest)).rejects.toThrowError('offer not found');
    });

       
    });

    describe('placeOrderBasedOnDevis', () => {


        it('should place an order based on devis successfully', async () => {
        // Mock data
    
        const preparatorSession: PreparatorSession =     {
            "idSession": 1,
            "idPreparator": 1,
            "currentPosition": {
                "type": "Point",
                "coordinates": [
                    12.965598,
                    77.590862
                ]
            },
            "isActive": true,
            preparatorRank: 0,
            fcmToken: '',
            offers: [],
            devis: []
        };
        const method= "online";
        ////
    
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
        mockRequest.params = { sportifSessionId: String(sportifSessionId) };
        mockRequest.params = { devisId: String(devisId) };
        mockRequest.params = { method: String(method) };

    // Mock repository methods
        let  devisRep=devisRepository.findOne=jest.fn().mockResolvedValue(devis);
        let  sSessionRep=SportifSessionRepository.findOne=jest.fn().mockResolvedValue(sportifSession);
        let oRepCreate=orderRepository.create=jest.fn().mockReturnValue(orderMock);
        let oRepSave=orderRepository.save=jest.fn().mockReturnValue(orderMock);
        let orderRepFind=orderRepository.findOne=jest.fn().mockResolvedValue(orderMock);
        
    
    

        // Call the placeOrderBasedOnOffers method
        const result = await controller.placeOrderBasedOnDevis(mockRequest, mockResponse);

        // Assertions
        
        expect(sSessionRep).toHaveBeenCalled();
        expect(devisRep).toHaveBeenCalled();
        expect(oRepCreate).toHaveBeenCalledWith({
        sportifSession,
        devis
        });

        expect(result).toEqual(orderMock);
        });

        it('should throw an error when sportif session is not found', async () => {
        // Mock data
        const preparatorSession: PreparatorSession =     {
            "idSession": 1,
            "idPreparator": 1,
            "currentPosition": {
                "type": "Point",
                "coordinates": [
                    12.965598,
                    77.590862
                ]
            },
            "isActive": true,
            preparatorRank: 0,
            fcmToken: '',
            offers: [],
            devis: []
        };
        const method= "online";
        ////
    
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
        mockRequest.params = { sportifSessionId: String(sportifSessionId) };
        mockRequest.params = { devisId: String(devisId) };
        mockRequest.params = { method: String(method) };

        // Mock repository method to return null (sportif session not found)
        SportifSessionRepository.findOne=jest.fn()
            .mockResolvedValue(null);

        // Call the placeOrderBasedOnOffers method and expect an error
        await expect(controller.placeOrderBasedOnDevis(mockRequest, mockResponse)).rejects.toThrow('Sportif not found');
        });

        it('should throw an error when devis is not found', async () => {
        // Mock data
        const preparatorSession: PreparatorSession =     {
            "idSession": 1,
            "idPreparator": 1,
            "currentPosition": {
                "type": "Point",
                "coordinates": [
                    12.965598,
                    77.590862
                ]
            },
            "isActive": true,
            preparatorRank: 0,
            fcmToken: '',
            offers: [],
            devis: []
        };
        const method= "online";
        ////
    
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
        mockRequest.params = { sportifSessionId: String(sportifSessionId) };
        mockRequest.params = { devisId: String(devisId) };
        mockRequest.params = { method: String(method) };
        // Mock repository method to return null (offer not found)
        SportifSessionRepository.findOne=jest.fn()
            .mockResolvedValue({ idSession: 1 }); // Assume sportif session is found
        devisRepository.findOne=jest.fn()
            .mockResolvedValue(null);

        // Call the placeOrderBasedOnOffers method and expect an error
        await expect(controller.placeOrderBasedOnDevis(mockRequest,mockResponse)).rejects.toThrowError('Devis not found');
        });

        // Add more test cases for error scenarios, missing data, etc.
    });

    describe('getOrdersBySportifId', () => {


        it('should get  orders based on Sportif Id', async () => {
        // Mock data
    
        const sportifSessionId = 1;
        //  const devisId = 1;

        const sportifSession :SportifSession = {
            "idSession": 1,
            "idSportif": 1,
            "currentPosition": {
                "type": "Point",
                "coordinates": [
                    33.599154,
                    -7.615456
                ]
            },
            "isActive": true,
            name: "name",
            phone: "phone",
            fcmToken: '',
            orders: []
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
        mockRequest.params = { sportifSessionId: String(sportifSessionId) };
     
        
        

    // Mock repository methods
        let  devisRep=devisRepository.findOne=jest.fn().mockResolvedValue(devis);
        let  sSessionRep=SportifSessionRepository.findOne=jest.fn().mockResolvedValue(sportifSession);
        let orderRep=orderRepository.createQueryBuilder=jest.fn().mockReturnValue({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            leftJoin: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue(orderMock),
        });
        
    
    

        // Call the placeOrderBasedOnOffers method
        const result = await controller.getOrdersBySportifId(mockRequest);

        // Assertions
        
        expect(sSessionRep).toHaveBeenCalled();
    

        expect(result).toEqual(orderMock);
        });

        it('should throw an error when sportif session is not found', async () => {
        // Mock data
        const sportifSessionId=1;
        mockRequest.params = { sportifSessionId: String(sportifSessionId) };
     
        // Mock repository method to return null (sportif session not found)
        SportifSessionRepository.findOne=jest.fn()
            .mockResolvedValue(null);

        // Call the placeOrderBasedOnOffers method and expect an error
        await expect(controller.getOrdersBySportifId(mockRequest)).rejects.toThrow('Sportif not found');
        });

    
    });

    describe('setOrderStatus', () => {

        // Mock data
    
        const orderId=1;
        const sportifSession:SportifSession  = {
            "idSession": 1,
            "idSportif": 1,
            "currentPosition": {
                "type": "Point",
                "coordinates": [
                    33.599154,
                    -7.615456
                ]
            },
            "isActive": true,
            name: "name",
            phone: "phone",
            fcmToken: "fcmToken",
            orders: []
        }

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
        let sportifFindOne=SportifSessionRepository.findOne = jest.fn().mockReturnValue(sportifSession);
        it('should change the order status to preparation', async () => {
            const status="preparation";
    
            mockRequest.params = { orderId: String(orderId) };
            mockRequest.params = { status: String(status) };
            let sportifFindOne=SportifSessionRepository.findOne = jest.fn().mockReturnValue(sportifSession);
 
        // Call the placeOrderBasedOnOffers method
        const result = await controller.setOrderStatus(mockRequest);

        // Assertions
        const updatedOrder = await orderRepository.findOne({
            where: { idOrder: 1 },
        });
      

        expect(updatedOrder.orderStatus).toEqual(OrderStatus.PREPARATION);
        });
        it('should change the order status to delivery', async () => {
            let sportifFindOne=SportifSessionRepository.findOne = jest.fn().mockReturnValue(sportifSession);
        const status="delivery";
    
        mockRequest.params = { orderId: String(orderId) };
        mockRequest.params = { status: String(status) };
        // Call the placeOrderBasedOnOffers method
        const result = await controller.setOrderStatus(mockRequest);

        // Assertions
        const updatedOrder = await orderRepository.findOne({
        where: { idOrder: 1 },
        });
     

    expect(updatedOrder.orderStatus).toEqual(OrderStatus.DELIVERY);
        });
        it('should change the order status to delivered', async () => {
            let sportifFindOne=SportifSessionRepository.findOne = jest.fn().mockReturnValue(sportifSession);
         
        const status="delivered";
    
        mockRequest.params = { orderId: String(orderId) };
        mockRequest.params = { status: String(status) };

        // Call the placeOrderBasedOnOffers method
        const result = await controller.setOrderStatus(mockRequest);

        // Assertions
        const updatedOrder = await orderRepository.findOne({
            where: { idOrder: 1 },
        });
    
        expect(updatedOrder.orderStatus).toEqual(OrderStatus.DELIVERED);
        });
        it('should change the order status to closed', async () => {
            let sportifFindOne=SportifSessionRepository.findOne = jest.fn().mockReturnValue(sportifSession);
         const status="closed";
    
        mockRequest.params = { orderId: String(orderId) };
        mockRequest.params = { status: String(status) };

        // Call the placeOrderBasedOnOffers method
        const result = await controller.setOrderStatus(mockRequest);

        // Assertions
        const updatedOrder = await orderRepository.findOne({
        where: { idOrder: 1 },
        });
       
        expect(updatedOrder.orderStatus).toEqual(OrderStatus.CLOSED);
        });
        it('should throw an error for an invalid status', async () => {
        const status="error";
    
        mockRequest.params = { orderId: String(orderId) };
        mockRequest.params = { status: String(status) };
        // Call the setOrderStatus method and expect an error
        await expect(controller.setOrderStatus(mockRequest)).rejects.toThrow('Invalid Status');
         
        });
        it('should throw an errorOrder not found', async () => {
            const status="preparation";
    
        mockRequest.params = { orderId: String(orderId) };
        mockRequest.params = { status: String(status) };
        // Mock repository methods
        let  orederRep=orderRepository.findOne=jest.fn().mockResolvedValue(null);
        
    
        // Call the setOrderStatus method and expect an error
        await expect(controller.setOrderStatus(mockRequest)).rejects.toThrow('Order not found');
        expect(orederRep).toHaveBeenCalled();
    
        });
    });

    describe('getOrderStatus', () => {
    // Mock data
    const orderId=1;
       

    const orderMock: Order = {
        "idOrder": 1,
        "orderStatus": OrderStatus.PREPARATION,
        "devis": null,
        "offer": null,
        "createdAt": null,
        "sportifSession": null,
        isPaid: false
    };
   

        it('should get the status of the order', async () => {

            
         // Mock repository methods

        let orderFindOne=orderRepository.findOne=jest.fn().mockReturnValue(orderMock);
        

        mockRequest.params = { orderId: String(orderId) };
        // Call the placeOrderBasedOnOffers method
        const result = await controller.getOrderStatus(mockRequest);

        // Assertions
        
        expect(orderFindOne).toHaveBeenCalledWith({
        where: { idOrder: orderId },
        });
    

        expect(result).toEqual(orderMock.orderStatus);
        });

        it('should throw an error when order is not found', async () => {
       
        mockRequest.params = { orderId: String(orderId) };
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
            "devis": null,
            "offer": null,
            "createdAt": null,
            "sportifSession": null,
            isPaid: false
        };
       
            it('should throw an error when order is not found', async () => {
                
                mockRequest.params = { orderId: String(orderId) };
                // Mock repository method to return null (sportif session not found)
                orderRepository.findOne=jest.fn().mockResolvedValue(null);
        
                // Call the placeOrderBasedOnOffers method and expect an error
                await expect(controller.getOrderById(mockRequest)).rejects.toThrow('Order not found');
                });
        
            it('should get the order', async () => {
    
                
             // Mock repository methods
    
            let orderFindOne=orderRepository.findOne=jest.fn().mockReturnValue(orderMock);
            mockRequest.params = { orderId: String(orderId) };
            // Call the placeOrderBasedOnOffers method
            const result = await controller.getOrderById(mockRequest);
    
            // Assertions
            
            expect(orderFindOne).toHaveBeenCalled();
        
    
            expect(result).toEqual(orderMock);
            });
           
        
        });
    describe('setRankPreparator', () => {
    it('should correctly set the rank based on devis of a preparator and send a Kafka message', async () => {
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
         const devisMock:Devis=new Devis();
         devisMock.idDevis=1;
         devisMock.preparatorSession=mockPreparatorSession;
         devisMock.preparatorSession.idPreparator=1;
         devisMock.idPreparator=1;
         devisMock.title="title"
       
 
        const orderMock: Order = {
            "idOrder": 1,
            "orderStatus": OrderStatus.PREPARATION,
            "devis": devisMock,
            "offer": null,
            "createdAt": null,
            "sportifSession": null,
            isPaid: false
        };
         PreparatorSessionRepository.findOne =jest.fn().mockResolvedValue(mockPreparatorSession);
         orderRepository.createQueryBuilder =jest.fn().mockReturnValue({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
             where: jest.fn().mockReturnThis(), 
             andWhere: jest.fn().mockReturnThis(),
           getCount: jest.fn().mockResolvedValue(2), // Mock n1 and n2 counts
         });
         orderRepository.findOne =jest.fn().mockResolvedValue(orderMock)
         devisRepository.findOne = jest.fn().mockResolvedValue(devisMock);
         const allPreparatorSessions = PreparatorSessionRepository.find =jest.fn().mockResolvedValue(mockPreparatorSession);
      
         mockRequest.params = { preparatorId: String(preparatorId) };
         mockRequest.params = { rank: String(rank) };
         mockPreparatorSession                // Call the function
         const updatedPreparatorSession = await controller.setRankPreparator(mockRequest);
     
         // Assertions
         expect(updatedPreparatorSession.preparatorRank).toBeCloseTo(3.8, 2); // Assert updated rank
  
     

     });
     it('should correctly set the rank based on offer of a preparator and send a Kafka message', async () => {
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
     const offer:Offer={
         idOffer: 1,
         title: '',
         price: 0,
         preparation_time: 0,
         isDeliverable: false,
         isAvailable: false,
         createdAt: null,
         updatedAt: null,
         geographicalArea: {
             type: 'Point',
             coordinates: []
         },
         orders: new Order,
         preparatorSession: mockPreparatorSession
     }

    const orderMock: Order = {
        "idOrder": 1,
        "orderStatus": OrderStatus.PREPARATION,
        "devis": null,
        "offer": offer,
        "createdAt": null,
        "sportifSession": null,
        isPaid: false
    };
     PreparatorSessionRepository.findOne =jest.fn().mockResolvedValue(mockPreparatorSession);
     orderRepository.createQueryBuilder =jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
         where: jest.fn().mockReturnThis(), 
         andWhere: jest.fn().mockReturnThis(),
       getCount: jest.fn().mockResolvedValue(2), // Mock n1 and n2 counts
     });
     orderRepository.findOne =jest.fn().mockResolvedValue(orderMock)
     offerRepository.findOne = jest.fn().mockResolvedValue(offer);
     const allPreparatorSessions = PreparatorSessionRepository.find =jest.fn().mockResolvedValue(mockPreparatorSession);
  
     mockRequest.params = { preparatorId: String(preparatorId) };
     mockRequest.params = { rank: String(rank) };
     mockPreparatorSession                // Call the function
     const updatedPreparatorSession = await controller.setRankPreparator(mockRequest);
 
     // Assertions
     expect(updatedPreparatorSession.preparatorRank).toBeCloseTo(3.8, 2); // Assert updated rank

 

 });

    });
    
    describe('get Count Orders Of Nearby Offers', () => {
        const sportifIdSession = 2;
        const nearbyOffers = [
            {
                "idOffer": 1,
                "title": "lunch",
                "preparation_time":30,
                "mealType": "snack",
                "caloricValue": 600,
                "fatsValue": 25,
                "proteinValue": 20,
                "carbohydratesValue": 70,
                "price": 15,
                "description": "Delicious dinner with polygon",
                "isAvailable": true,
                "createdAt": "2023-12-18T12:13:16.816Z",
                "updatedAt": "2023-12-18T12:13:16.816Z",
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
            },
            {
                "idOffer": 2,
                "title": "lunch",
                "preparation_time":30,
                "mealType": "lunch",
                "caloricValue": 600,
                "fatsValue": 25,
                "proteinValue": 20,
                "carbohydratesValue": 70,
                "price": 15,
                "description": "Delicious dinner with polygon",
                "isAvailable": true,
                "createdAt": "2023-12-18T22:34:32.978Z",
                "updatedAt": "2023-12-18T22:34:32.978Z",
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
        ];
      
      
    
       
        it('should get count order of nearby offers based on sportif session', async () => {
            const sportifSession :SportifSession=     {
                "idSession": 2,
                "idSportif": 2,
                "currentPosition": {
                    "type": "Point",
                    "coordinates": [
                        12.965598,
                        77.590862
                    ]
                },
                "isActive": true,
                name: undefined,
                phone: undefined,
                fcmToken: '',
                orders: []
            };  
            mockRequest.params = { sportifIdSession: String(sportifIdSession) };
    
        
    
             //mock repositories
            let sSessionRep=SportifSessionRepository.findOne=jest.fn().mockResolvedValue(sportifSession);
            let oRepCreateQuery=orderRepository.createQueryBuilder=jest.fn().mockReturnValue({
                leftJoin:jest.fn().mockReturnThis(),
                select:jest.fn().mockReturnThis(),
                addSelect:jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),    
                where: jest.fn().mockReturnThis(),
                groupBy:jest.fn().mockReturnThis(),
                getRawMany: jest.fn().mockResolvedValue(3), });
            // Act
            const result = await controller.getCountOrdersOfNearbyOffers(mockRequest, mockResponse);
    
            // Assert
            expect(sSessionRep).toHaveBeenCalledWith({
                where: { idSession : 2  },
            });
            expect(oRepCreateQuery).toHaveBeenCalled();
            expect(result).toEqual(3);
        });
    
        it('should throw an error if sportif session is not found', async () => {
            // Arrange
            mockRequest.params = { sportifIdSession: String(sportifIdSession) };
    
    
            SportifSessionRepository.findOne=jest.fn().mockResolvedValue(null);
    
            // Act
            const act = async () => await controller.getCountOrdersOfNearbyOffers(mockRequest, mockResponse);
    
            // Assert
            await expect(act()).rejects.toThrow('Sportif not found');
        });
    
        it('should throw an error if currentPosition format is invalid', async () => {
            // Arrange
            const sportifSession =     {
                "idSession": 2,
                "idSportif": 2,
                "currentPosition": {
                    "type": "InvalidType",
                    "coordinates": [
                        12.965598,
                        77.590862
                    ]
                },
                "isActive": true
            };
            mockRequest.params = { sportifIdSession: String(sportifIdSession) };
     
    
            SportifSessionRepository.findOne=jest.fn().mockResolvedValue(sportifSession);
    
            // Act
            const act = async () => await controller.getCountOrdersOfNearbyOffers(mockRequest, mockResponse);
    
            // Assert
            await expect(act()).rejects.toThrow('Invalid currentPosition format');
        });
    
    });
    
    describe('get Preparator Orders', () => {
        const preparatorIdSession = 2;
             
    
       
        it('should get  Preparator Orders', async () => {
            const orderMock: Order = {
                "idOrder": 1,
                "orderStatus": OrderStatus.PREPARATION,
                "devis": null,
                "offer": null,
                "createdAt": null,
                "sportifSession": null,
                isPaid: false
            };
            const preparatorSession :PreparatorSession=     {
                idSession: 2,
                idPreparator: 1,
                currentPosition: {
                    type: 'Point',
                    coordinates: []
                },
                isActive: false,
                preparatorRank: 0,
                fcmToken: '',
                offers: [],
                devis: []
            };  
            mockRequest.params = { preparatorSessionId: String(preparatorIdSession) };
    
        
    
             //mock repositories
            let pSessionRep=PreparatorSessionRepository.findOne=jest.fn().mockResolvedValue(preparatorSession);
            let oRepCreateQuery=orderRepository.createQueryBuilder=jest.fn().mockReturnValue({
                leftJoinAndSelect:jest.fn().mockReturnThis(),
                where:jest.fn().mockReturnThis(),
                groupBy:jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue(orderMock), });
            // Act
            const result = await controller.getPreparatorOrders(mockRequest);
    
            // Assert
            expect(pSessionRep).toHaveBeenCalled();
            expect(oRepCreateQuery).toHaveBeenCalled();
            expect(result).toEqual(orderMock);
        });
    
        it('should throw an error if preparator session is not found', async () => {
            // Arrange
            mockRequest.params = { preparatorSessionId: String(preparatorIdSession) };
        
            PreparatorSessionRepository.findOne=jest.fn().mockResolvedValue(null);
    
            // Act
            const act = async () => await controller.getPreparatorOrders(mockRequest);
    
            // Assert
            await expect(act()).rejects.toThrow('Preparator not found');
        });
    
    
    });

    describe('set Is Paid', () => {
        const orderId = 1;
        const idSession= 1;  
    
       
        it('should set an order isPaid', async () => {
            const orderMock: Order = {
                "idOrder": 1,
                "orderStatus": OrderStatus.PREPARATION,
                "devis": null,
                "offer": null,
                "createdAt": null,
                "sportifSession": null,
                isPaid: false
            };
            const preparatorSession :PreparatorSession=     {
                idSession: 2,
                idPreparator: 1,
                currentPosition: {
                    type: 'Point',
                    coordinates: []
                },
                isActive: false,
                preparatorRank: 0,
                fcmToken: '',
                offers: [],
                devis: []
            };  
            mockRequest.params = { orderId: String(orderId) };
    
        
    
             //mock repositories
            let oSessionRep=orderRepository.findOne=jest.fn().mockResolvedValue(orderMock);
            let oRepCreateQuery=orderRepository.save=jest.fn().mockReturnValue(orderMock);
            // Act
            const result = await controller.setIsPaid(mockRequest,mockResponse);
    
            // Assert
            expect(oSessionRep).toHaveBeenCalled();
            expect(oRepCreateQuery).toHaveBeenCalled();
            expect(result).toEqual(orderMock);
        });
    
        it('should throw an error if preparator session is not found', async () => {
            // Arrange
            const orderMock: Order = {
                "idOrder": 1,
                "orderStatus": OrderStatus.PREPARATION,
                "devis": null,
                "offer": null,
                "createdAt": null,
                "sportifSession": null,
                isPaid: false
            };
            const preparatorSession :PreparatorSession=     {
                idSession: 2,
                idPreparator: 1,
                currentPosition: {
                    type: 'Point',
                    coordinates: []
                },
                isActive: false,
                preparatorRank: 0,
                fcmToken: '',
                offers: [],
                devis: []
            };  
            mockRequest.params = { orderId: String(orderId) };
    
        
    
             //mock repositories
            let oSessionRep=orderRepository.findOne=jest.fn().mockResolvedValue(null);
            let oRepCreateQuery=orderRepository.save=jest.fn().mockReturnValue(orderMock);
 
             // Act
             const act = async () => await controller.setIsPaid(mockRequest,mockResponse);
            // Assert
            await expect(act()).rejects.toThrow('Order not found');
        });
    
    
    });
    
    describe('get Order Based On Devis Id', () => {
        const sportifSessionId = 1;
        const sportifSession :SportifSession=     {
            "idSession": 2,
            "idSportif": 2,
            "currentPosition": {
                "type": "Point",
                "coordinates": [
                    12.965598,
                    77.590862
                ]
            },
            "isActive": true,
            name: undefined,
            phone: undefined,
            fcmToken: '',
            orders: []
        };  
    
       
        it('should get Order Based On Devis Id', async () => {
            const orderMock: Order = {
                "idOrder": 1,
                "orderStatus": OrderStatus.PREPARATION,
                "devis": null,
                "offer": null,
                "createdAt": null,
                "sportifSession": null,
                isPaid: false
            }; 
            mockRequest.params = { orderId: String(sportifSessionId) };
    
        
    
             //mock repositories
            let sSessionRep=SportifSessionRepository.findOne=jest.fn().mockResolvedValue(sportifSession);
            let oRepCreateQuery=orderRepository.createQueryBuilder=jest.fn().mockReturnValue({
                leftJoinAndSelect:jest.fn().mockReturnThis(),
                leftJoin:jest.fn().mockReturnThis(),
                where:jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue(orderMock), });
            // Act
            const result = await controller.getOrderBasedOnDevisId(mockRequest,mockResponse);
    
            // Assert
            expect(sSessionRep).toHaveBeenCalled();
            expect(oRepCreateQuery).toHaveBeenCalled();
            expect(result).toEqual(orderMock);
        });
    
        it('should throw an error if Sportif session is not found', async () => {
            // Arrange
            const orderMock: Order = {
                "idOrder": 1,
                "orderStatus": OrderStatus.PREPARATION,
                "devis": null,
                "offer": null,
                "createdAt": null,
                "sportifSession": null,
                isPaid: false
            };
             
            mockRequest.params = { orderId: String(sportifSessionId) };
    
        
    
             //mock repositories
             let sSessionRep=SportifSessionRepository.findOne=jest.fn().mockResolvedValue(null);
            let oRepCreateQuery=orderRepository.save=jest.fn().mockReturnValue(orderMock);
 
             // Act
             const act = async () => await controller.getOrderBasedOnDevisId(mockRequest,mockResponse);
            // Assert
            await expect(act()).rejects.toThrow('Sportif not found');
        });
    
    
    });
    

    // describe('Devis Entity', () => {


    // // it('should create Devis and establish a OneToOne relationship with Order', async () => {
    // //   // Create a new Order
    // //   const   idOrder= 8;
    // //   const   idDevis= 7;
    // //   const orderMock = {
    // //     "idOrder": idOrder,
    // //     "orderStatus": "pending",
    // //     "createdAt": "2024-01-02T23:53:24.614Z",
    // //     "devis":{
    // //         "idDevis": idDevis,
    // //         "proposed_price": 70,
    // //         "status": "pending",
    // //         "createdAt": "2024-01-02T20:50:22.652Z",
    // //         "updatedAt": "2024-01-02T20:50:22.652Z",
    // //         "demand": {
    // //             "idDemand": 1,
    // //             "title": "pizza ",
    // //             "mealType": "breakfast",
    // //             "caloricValue": 6000,
    // //             "fatsValue": 190,
    // //             "proteinValue": 40,
    // //             "carbohydratesValue": 30,
    // //             "description": "Delicious pizza ",
    // //             "desired_delivery_date": "2024-01-03T09:53:12.954Z",
    // //             "isAvailable": true,
    // //             "createdAt": "2024-01-02T20:47:01.905Z",
    // //             "updatedAt": "2024-01-02T20:47:01.905Z"
    // //         },},
    // //     "sportifSession":{
    // //       "idSession": 1,
    // //       "idSportif": 1,
    // //       "currentPosition": {
    // //           "type": "Point",
    // //           "coordinates": [
    // //               33.599154,
    // //               -7.615456
    // //           ]
    // //       },
    // //       "isActive": true
    // //   }
    

        
    // //   }
    // //   const devisMock ={
    // //     "idDevis":idDevis,
    // //     "proposed_price": 70,
    // //     "idPreparator":1,
    // //   "offer":orderMock }

    
    // //   afterEach(async () => {
    // //     // Clear the database after each test
    // //     await devisRepository.clear();
    // //     await orderRepository.clear();
    // //   });
    
    // //   afterAll(async () => {
    // //     // Close the database connection after all tests
    // //     await devisRepository.query('DELETE FROM devis;');
    // //     await orderRepository.query('DELETE FROM "order";');
    // //   });

    
    // //   expect(devisRepository.create=jest.fn().mockReturnValue(devisMock)).toHaveBeenCalled();

    // //   // Fetch the saved Devis with the Order relationship
    // //   const savedDevis = await devisRepository.findOne({
    // //     where: { idDevis: idDevis },
    // //     relations: ['order'], // Include the 'order' relationship in the query
    // //   });


    // //   let oRepCreate=orderRepository.create=jest.fn().mockReturnValue(orderMock);
    // //   let oRepSave=orderRepository.save=jest.fn().mockReturnValue(orderMock);
    // //   let dRepCreate=devisRepository.create=jest.fn().mockReturnValue(devisMock);
    // //   let dRepSave=devisRepository.save=jest.fn().mockReturnValue(devisMock);
    

        
    
    // //   const savedOrder = await orderRepository.findOne({
    // //     where: { idOrder: idOrder },

        
    // //   });
    // //   expect(savedDevis).toBeDefined();
    // //   expect(savedDevis?.order).toBeDefined();

    // //   // Assert that the Devis and Order are correctly associated
    

    // //   expect(savedDevis.order.idOrder).toEqual(idOrder);
    // // });
    // 
 