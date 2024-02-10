import { Request, Response, NextFunction } from 'express';
import { mock, MockProxy } from 'jest-mock-extended';
import { Controller } from '../src/controller/Controller';  
import { Offer } from '../src/entity/Offer'; 
import { SprotifSession } from '../src/entity/SportifSession';
import { AppDataSource } from '../src/data-source';

//let  preparatorSessionRepository = AppDataSource.getRepository(PreparatorSession)
let  offerRepository = AppDataSource.getRepository(Offer)
let  sportifSessionRepository = AppDataSource.getRepository(SprotifSession)
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

describe('get nearby offers ', () => {
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
  
  

   
    it('should get nearby offers based on sportif session', async () => {
        const sportifSession =     {
            "idSession": 2,
            "idSportif": 2,
            "currentPosition": {
                "type": "Point",
                "coordinates": [
                    12.965598,
                    77.590862
                ]
            },
            "isActive": true
        };  
        mockRequest.params = { sportifIdSession: String(sportifIdSession) };

    

         //mock repositories
        let sSessionRep=sportifSessionRepository.findOne=jest.fn().mockResolvedValue(sportifSession);
        let oRepCreateQuery=offerRepository.createQueryBuilder=jest.fn().mockReturnValue({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),    
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(nearbyOffers), });
        // Act
        const result = await controller.getNearbyOffers(mockRequest, mockResponse, mockNext);

        // Assert
        expect(sSessionRep).toHaveBeenCalledWith({
            where: { idSession : 2  },
        });
        expect(oRepCreateQuery).toHaveBeenCalledWith('offer');
        expect(result).toEqual(nearbyOffers);
    });

    it('should throw an error if sportif session is not found', async () => {
        // Arrange
        mockRequest.params = { sportifIdSession: String(sportifIdSession) };


        sportifSessionRepository.findOne=jest.fn().mockResolvedValue(null);

        // Act
        const act = async () => await controller.getNearbyOffers(mockRequest, mockResponse, mockNext);

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
 

        sportifSessionRepository.findOne=jest.fn().mockResolvedValue(sportifSession);

        // Act
        const act = async () => await controller.getNearbyOffers(mockRequest, mockResponse, mockNext);

        // Assert
        await expect(act()).rejects.toThrow('Invalid currentPosition format');
    });

});

describe('ssAll ', () => {
   
  
  

   
    // it('should Retrieve all Sportif Sessions', async () => {
    //     const sportifSessionList =   [  {
    //         "idSession": 2,
    //         "idSportif": 2,
    //         "currentPosition": {
    //             "type": "Point",
    //             "coordinates": [
    //                 12.965598,
    //                 77.590862
    //             ]
    //         },
    //         "isActive": true
    //     };

    //     mockRequest.params = { sportifIdSession };

    //     sportifSessionRepository.findOne=jest.fn().mockResolvedValue(sportifSession);

    //     // Act
    //     const act = async () => await controller.getNearbyOffers(mockRequest, mockResponse, mockNext);

    //     // Assert
        
    //     expect(sSessionRep).toHaveBeenCalled();
    //     expect(result).toEqual(sportifSessionList);
    // });

    

});

describe('ssAll ', () => {
   
  
  

   
    it('should Retrieve all Sportif Sessions', async () => {
        const sportifSessionList =   [  {
            "idSession": 2,
            "idSportif": 2,
            "currentPosition": {
                "type": "Point",
                "coordinates": [
                    12.965598,
                    77.590862
                ]
            },
            "isActive": true
        }];
        

         //mock repositories
        let sSessionRep=sportifSessionRepository.find=jest.fn().mockResolvedValue(sportifSessionList);
       // Act
        const result = await controller.ssAll(mockRequest, mockResponse, mockNext);

        // Assert
        
        expect(sSessionRep).toHaveBeenCalled();
        expect(result).toEqual(sportifSessionList);
    });

    

});

