import { Request, Response, NextFunction } from 'express';
import { any, mock, MockProxy } from 'jest-mock-extended';
import { Controller } from '../src/controller/Controller';  
import { Offer } from '../src/entity/Offer'; //  
import { PreparatorSession } from '../src/entity/PreparatorSession';
import { AppDataSource } from '../src/data-source';
import { Kafka } from 'kafkajs';
const KafkaJS = require('kafkajs');

import { OfferDto } from '../src/dto/OfferDto';
 
let  preparatorSessionRepository = AppDataSource.getRepository(PreparatorSession)
let offerRepository = AppDataSource.getRepository(Offer)
let offerDto = new OfferDto();
let controller=new Controller();
 //mock requests/responses/nextFunction
let mockRequest: MockProxy<Request>;
let mockResponse: MockProxy<Response>;
let mockNext: MockProxy<NextFunction>;


beforeEach(() => {
    mockRequest = mock<Request>();
    mockResponse = mock<Response>();
    mockNext = mock<NextFunction>();
    
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
   
    it('should save an offer and return the saved offer ', async() => {
        // Mock Kafka to avoid external calls
        jest.mock('kafkajs'); 
        // Mock the Kafka producer connect method
        controller.producer.connect=jest.fn();
        controller.producer.send=jest.fn();
        controller.producer.disconnect=jest.fn();
        // Mock params
        mockRequest.params = { preparatorId };
        mockRequest.body = offerData;
        offerRepository.createQueryBuilder=jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(oldOfferData),
        });
        // Act
        const result = await controller.saveOffer(mockRequest, mockResponse, mockNext);
        // Assert
        
        expect(pSessionRep).toHaveBeenCalledWith({
            where: { idPreparator: preparatorId },
        });
        expect(oRepCreate).toHaveBeenCalledWith({
            ...offerData,
            preparatorSession,
        });
 
        expect(controller.producer.connect).toHaveBeenCalled();
        expect(controller.producer.send).toHaveBeenCalled();
        expect(controller.producer.disconnect).toHaveBeenCalled();
    

        expect(oRepSave).toHaveBeenCalledWith(expect.objectContaining({ preparatorSession }));
        expect(result).toEqual(savedOffer);

    })
    it('should throw error when preparator Session not found ', async() => {
        
        mockRequest.params = { preparatorId };
        mockRequest.body = offerData;
        let pSessionRep=preparatorSessionRepository.findOne=jest.fn().mockResolvedValue(null);
 

   
        // Act
        const act = async () => await controller.saveOffer(mockRequest, mockResponse, mockNext);

        // Assert
        await expect(act()).rejects.toThrow('Preparator not found');
    });



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

        mockRequest.params = { preparatorId };
        //mock repositories
        let pSessionRep=preparatorSessionRepository.findOne=jest.fn().mockResolvedValue(preparatorSession);
        let oRepCreateQuery=offerRepository.createQueryBuilder=jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue(offerData),
        });

        // Act
        const result = await controller.getOffersByPreparatorId(mockRequest, mockResponse, mockNext);

        // Assert
        expect(pSessionRep).toHaveBeenCalledWith({
            where: { idPreparator: preparatorId },
        });

        expect(oRepCreateQuery).toHaveBeenCalledWith('offer');
        // Assert
        expect(result).toEqual(offerData);
    });

    it('should throw an error if preparator session is not found', async () => {
        // Arrange
        const preparatorId = 1;

        mockRequest.params = { preparatorId };
        preparatorSessionRepository.findOne=jest.fn().mockResolvedValue(null);

        // Act
        const act = async () => await controller.getOffersByPreparatorId(mockRequest, mockResponse, mockNext);

        // Assert
        await expect(act()).rejects.toThrow('Preparator not found');
    });

});

