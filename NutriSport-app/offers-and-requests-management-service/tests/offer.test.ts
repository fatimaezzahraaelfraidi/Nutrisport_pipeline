import { Request, Response, NextFunction } from 'express';
import { any, mock, MockProxy } from 'jest-mock-extended';
import { Controller } from '../src/controller/Controller';  
import { Offer } from '../src/entity/Offer'; //  
import { PreparatorSession } from '../src/entity/PreparatorSession';
import { AppDataSource } from '../src/data-source';
import {SprotifSession} from  '../src/entity/SportifSession';
import { Kafka } from 'kafkajs';
const KafkaJS = require('kafkajs');

import { OfferDto } from '../src/dto/OfferDto';
import { EnumMealType } from '../src/enum/EnumMealType';
 
let  preparatorSessionRepository = AppDataSource.getRepository(PreparatorSession)
let offerRepository = AppDataSource.getRepository(Offer)
let saveSessionRepository = AppDataSource.getRepository(SprotifSession)
let offerDto = new OfferDto();
let controller=new Controller();
 //mock requests/responses/nextFunction
let mockRequest: MockProxy<Request>;
let mockResponse: MockProxy<Response>;
let mockNext: MockProxy<NextFunction>;
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
});

});
// Clean up
afterEach(() => {
    jest.clearAllMocks();
});

describe('save offer ', () => {
    const preparatorId = 1;
    const offerData ={
        "title": "lunch",
        "preparation_time":30,
        "mealType": "lunch",
        "caloricValue": 600,
        "fatsValue": 25.0,
        "proteinValue": 20.0,
        "carbohydratesValue": 70.0,
        "price": 15.0,
        "description": "Delicious dinner with polygon",
        "isAvailable": true,
        "geographicalArea": {
            "type": "Polygon",
            "coordinates": [
            [
                [-7.660732, 33.593459],
                [-7.660732, 33.61705],
                [-7.588978, 33.61705],
                [-7.588978, 33.593459],
                [-7.660732, 33.593459]
            ]
            ]
        }
    };
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
    
    const savedOffer = {
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
            "currentPosition": {
                "type": "Point",
                "coordinates": [
                    12.965598,
                    77.590862
                ]
            },
            "isActive": true
        },
        "idOffer": 2,
        "createdAt": "2023-12-18T22:34:32.978Z",
        "updatedAt": "2023-12-18T22:34:32.978Z"
    };
    const oldOfferData ={
        "title": "lunch",
        "preparation_time":30,
        "mealType": "lunch",
        "caloricValue": 600,
        "fatsValue": 25.0,
        "proteinValue": 20.0,
        "carbohydratesValue": 70.0,
        "price": 15.0,
        "description": "Delicious dinner with polygon",
        "isAvailable": true,
        "geographicalArea": {
            "type": "Polygon",
            "coordinates": [
            [
                [-7.660732, 33.593459],
                [-7.660732, 33.61705],
                [-7.588978, 33.61705],
                [-7.588978, 33.593459],
                [-7.660732, 33.593459]
            ]
            ]
        }
    };


 
   //mock repositories
    let pSessionRep=preparatorSessionRepository.findOne=jest.fn().mockResolvedValue(preparatorSession);
    let oRepCreate=offerRepository.create=jest.fn().mockReturnValue(savedOffer);
    let oRepSave=offerRepository.save=jest.fn().mockResolvedValue(savedOffer);
   
    it('should save an offer and return the saved offer', async() => {
        // Mock Kafka to avoid external calls
        jest.mock('kafkajs'); 
        // Mock the Kafka producer connect method
        controller.producer.connect = jest.fn();
        controller.producer.send = jest.fn();
        controller.producer.disconnect = jest.fn();
        
        // Mock params
        // const mockRequest = {
        //     params: {
        //         preparatorSessionId: '1', // Adjust this according to your route
        //     },
        //     body: offerData,
        // } as unknown as Request;
        mockRequest.params = { preparatorSessionId: String(preparatorId) };
        mockRequest.body = offerData;
        // Mock repositories and their behavior
        preparatorSessionRepository.findOne = jest.fn().mockResolvedValue(preparatorSession);
        offerRepository.create = jest.fn().mockReturnValue(savedOffer);
        offerRepository.save = jest.fn().mockResolvedValue(savedOffer);
         // Mock geographical area
    const geographicalArea = {
        "type": "Polygon",
        "coordinates": [
            [
                [-7.660732, 33.593459],
                [-7.660732, 33.61705],
                [-7.588978, 33.61705],
                [-7.588978, 33.593459],
                [-7.660732, 33.593459]
            ]
        ]
    };

    // Mock expected result
    const expectedSportifSessions = [
        { fcmToken: 'token1' },
        { fcmToken: 'token2' },
        // Add more mock sportif sessions as needed
    ];

    // Mock sportif session repository behavior
    saveSessionRepository.createQueryBuilder = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(expectedSportifSessions),
    });
        // Act
        const result = await controller.saveOffer(mockRequest, mockResponse, mockNext);
        
        // Assert
        expect(preparatorSessionRepository.findOne).toHaveBeenCalledWith({
            where: { idSession: 1 }, // Adjust the condition according to your query
        });
        expect(offerRepository.create).toHaveBeenCalledWith({
            ...offerData,
            preparatorSession,
        });
        expect(controller.producer.connect).toHaveBeenCalled();
        expect(controller.producer.send).toHaveBeenCalled();
        expect(controller.producer.disconnect).toHaveBeenCalled();
        expect(offerRepository.save).toHaveBeenCalledWith(expect.objectContaining({ preparatorSession }));
        expect(result).toEqual(savedOffer);
    });

    it('should throw error when preparator Session not found', async() => {
        // Mock params
        const mockRequest = {
            params: {
                preparatorSessionId: '1', // Adjust this according to your route
            },
            body: offerData,
        } as unknown as Request;
        
        // Mock preparator session repository to return null
        preparatorSessionRepository.findOne = jest.fn().mockResolvedValue(null);

        // Act and Assert
        await expect(controller.saveOffer(mockRequest, mockResponse, mockNext)).rejects.toThrow('Preparator not found');
    });
    // it('should throw error multicast notification', async() => {
    //         // Mock Kafka to avoid external calls
    //         jest.mock('kafkajs'); 
    //         // Mock the Kafka producer connect method
    //         controller.producer.connect = jest.fn();
    //         controller.producer.send = jest.fn();
    //         controller.producer.disconnect = jest.fn();
            
    //         // Mock params
    //         // const mockRequest = {
    //         //     params: {
    //         //         preparatorSessionId: '1', // Adjust this according to your route
    //         //     },
    //         //     body: offerData,
    //         // } as unknown as Request;
    //         mockRequest.params = { preparatorSessionId: String(preparatorId) };
    //         mockRequest.body = offerData;
    //         // Mock repositories and their behavior
    //         preparatorSessionRepository.findOne = jest.fn().mockResolvedValue(preparatorSession);
    //         offerRepository.create = jest.fn().mockReturnValue(savedOffer);
    //         offerRepository.save = jest.fn().mockResolvedValue(savedOffer);
    //          // Mock geographical area
    //     const geographicalArea = {
    //         "type": "Polygon",
    //         "coordinates": [
    //             [
    //                 [-7.660732, 33.593459],
    //                 [-7.660732, 33.61705],
    //                 [-7.588978, 33.61705],
    //                 [-7.588978, 33.593459],
    //                 [-7.660732, 33.593459]
    //             ]
    //         ]
    //     };
    
    //     // Mock expected result
    //     const expectedSportifSessions = [
    //         { fcmToken: 'token1' },
    //         { fcmToken: 'token2' },
    //         // Add more mock sportif sessions as needed
    //     ];
    
    //     // Mock sportif session repository behavior
    //     saveSessionRepository.createQueryBuilder = jest.fn().mockReturnValue({
    //         select: jest.fn().mockReturnThis(),
    //         where: jest.fn().mockReturnThis(),
    //         andWhere: jest.fn().mockReturnThis(),
    //         getRawMany: jest.fn().mockResolvedValue(expectedSportifSessions),
    //     });
    //     jest.mock('firebase-admin', () => {
    //         const messagingSendMock = jest.fn();
    //         return {
    //             messaging: () => ({
    //                 send: messagingSendMock.mockRejectedValue('Error sending multicast notification')
    //             })
    //         };});
    //         mockResponse._write.mockImplementation(() => Promise.reject('Error sending multicast notification'));; 
    //         // Act and Assert
    //     await expect(controller.saveOffer(mockRequest, mockResponse, mockNext)).rejects.toThrow('Error sending multicast notification:');
    // });
});


 


describe('get Offers By Preparator Id', () => {
    // Arrange
    const preparatorId = 1;
    const offerData =[
        {
            "mealType": "lunch",
            "caloricValue": 600,
            "fatsValue": 25,
            "proteinValue": 20,
            "carbohydratesValue": 70,
            "price": 15,
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
                "currentPosition": {
                    "type": "Point",
                    "coordinates": [
                        12.965598,
                        77.590862
                    ]
                },
                "isActive": true
            },
            "idOffer": 1,
            "createdAt": "2023-12-18T22:34:32.978Z",
            "updatedAt": "2023-12-18T22:34:32.978Z"
        },
        {
            "mealType": "breakfast",
            "caloricValue": 600,
            "fatsValue": 25,
            "proteinValue": 20,
            "carbohydratesValue": 70,
            "price": 15,
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
                "currentPosition": {
                    "type": "Point",
                    "coordinates": [
                        12.965598,
                        77.590862
                    ]
                },
                "isActive": true
            },
            "idOffer": 2,
            "createdAt": "2023-12-18T22:34:32.978Z",
            "updatedAt": "2023-12-18T22:34:32.978Z"
        }
    ];
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

    it('should get offers by preparator ID', async () => {

         // Mock params
         const mockRequest = {
            params: {
                preparatorId: '1',
                
            }
        } as unknown as Request;
        //mock repositories
        let pSessionRep=preparatorSessionRepository.findOne=jest.fn().mockResolvedValue(preparatorSession);
        let oRepCreateQuery=offerRepository.createQueryBuilder=jest.fn().mockReturnValue({
            leftJoin:jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue(offerData),
        });

        // Act
        const result = await controller.getOffersByPreparatorId(mockRequest, mockResponse, mockNext);

        // Assert
        expect(pSessionRep).toHaveBeenCalled();

        expect(oRepCreateQuery).toHaveBeenCalledWith('offer');
        // Assert
        expect(result).toEqual(offerData);
    });

    it('should throw an error if preparator session is not found', async () => {
        // Arrange
        const preparatorId = 1;

         // Mock params
         const mockRequest = {
            params: {
                preparatorId: '1',
                
            }
        } as unknown as Request;
        preparatorSessionRepository.findOne=jest.fn().mockResolvedValue(null);

        // Act
        const act = async () => await controller.getOffersByPreparatorId(mockRequest, mockResponse, mockNext);

        // Assert
        await expect(act()).rejects.toThrow('Preparator not found');
    });

});
describe('setOfferAvailability', () => {
    it('should set offer availability to false', async () => {
        // Mock request object with offer ID and availability 0
        const mockRequest = {
            params: {
                offerId: '1',
                availability: '0',
            }
        } as unknown as Request;

        // Mock offer
        const mockOffer:Offer = {
            idOffer: 1,
            isAvailable: true,
            title: '',
            mealType: EnumMealType.BREAKFAST,
            caloricValue: 0,
            fatsValue: 0,
            proteinValue: 0,
            carbohydratesValue: 0,
            price: 0,
            preparation_time: 0,
            isDeliverable: false,
            description: '',
            imageUrl: '',
            createdAt: undefined,
            updatedAt: undefined,
            geographicalArea: {
                type: 'Point',
                coordinates: []
            },
            preparatorSession: new PreparatorSession
        };

        // Mock offer repository behavior
        offerRepository.findOne = jest.fn().mockResolvedValue(mockOffer);
        offerRepository.save = jest.fn().mockResolvedValue(mockOffer);

        // Mock Kafka producer methods
        controller.producer.connect = jest.fn();
        controller.producer.send = jest.fn();
        controller.producer.disconnect = jest.fn();

        // Act
        const result = await controller.setOfferAvailability(mockRequest);

        // Assert
        expect(offerRepository.findOne).toHaveBeenCalledWith({ where: { idOffer: 1 }, relations: ['preparatorSession'] });
        expect(result.isAvailable).toBe(false);
        expect(offerRepository.save).toHaveBeenCalledWith(mockOffer);
        expect(controller.producer.connect).toHaveBeenCalled();
        expect(controller.producer.send).toHaveBeenCalled();
        expect(controller.producer.disconnect).toHaveBeenCalled();
    });

    it('should set offer availability to true', async () => {
         // Mock request object with offer ID and availability 0
         const mockRequest = {
            params: {
                offerId: '1',
                availability: '1',
            }
        } as unknown as Request;

        // Mock offer
        const mockOffer:Offer = {
            idOffer: 1,
            isAvailable: true,
            title: '',
            mealType: EnumMealType.BREAKFAST,
            caloricValue: 0,
            fatsValue: 0,
            proteinValue: 0,
            carbohydratesValue: 0,
            price: 0,
            preparation_time: 0,
            isDeliverable: false,
            description: '',
            imageUrl: '',
            createdAt: undefined,
            updatedAt: undefined,
            geographicalArea: {
                type: 'Point',
                coordinates: []
            },
            preparatorSession: new PreparatorSession
        };

        // Mock offer repository behavior
        offerRepository.findOne = jest.fn().mockResolvedValue(mockOffer);
        offerRepository.save = jest.fn().mockResolvedValue(mockOffer);

        // Mock Kafka producer methods
        controller.producer.connect = jest.fn();
        controller.producer.send = jest.fn();
        controller.producer.disconnect = jest.fn();

        // Act
        const result = await controller.setOfferAvailability(mockRequest);

        // Assert
        expect(offerRepository.findOne).toHaveBeenCalledWith({ where: { idOffer: 1 }, relations: ['preparatorSession'] });
        expect(result.isAvailable).toBe(true);
        expect(offerRepository.save).toHaveBeenCalledWith(mockOffer);
        expect(controller.producer.connect).toHaveBeenCalled();
        expect(controller.producer.send).toHaveBeenCalled();
        expect(controller.producer.disconnect).toHaveBeenCalled();
    });

    it('should throw error when offer not found', async () => {
        // Mock request object with offer ID
        const mockRequest = {
            params: {
                offerId: '1',
                availability: '0',
            }
        } as unknown as Request;

        // Mock offer repository to return null
        offerRepository.findOne = jest.fn().mockResolvedValue(null);

        // Act and Assert
        await expect(controller.setOfferAvailability(mockRequest)).rejects.toThrow('Offer not found');
    });
});
describe('getOfferById', () => {
    it('should return the offer when it exists', async () => {
        // Mock request object with a valid offer ID
        const mockRequest = {
            params: {
                offerId: '1',
            }
        } as unknown as Request;

        // Mock offer
        const mockOffer = {
            idOffer: 1,
            // other properties
        };

        // Mock offer repository behavior
        offerRepository.findOne = jest.fn().mockResolvedValue(mockOffer);

        // Act
        const result = await controller.getOfferById(mockRequest);

        // Assert
        expect(offerRepository.findOne).toHaveBeenCalledWith({ where: { idOffer: 1 }, relations: ['preparatorSession'] });
        expect(result).toEqual(mockOffer);
    });

    it('should throw error when offer not found', async () => {
        // Mock request object with a valid offer ID
        const mockRequest = {
            params: {
                offerId: '1',
            }
        } as unknown as Request;

        // Mock offer repository to return null
        offerRepository.findOne = jest.fn().mockResolvedValue(null);

        // Act and Assert
        await expect(controller.getOfferById(mockRequest)).rejects.toThrow('offer not found');
    });
});
 


