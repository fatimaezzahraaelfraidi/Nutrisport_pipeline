import { Request, Response, NextFunction } from 'express';
import { mock, MockProxy } from 'jest-mock-extended';
import { Controller } from '../src/controller/Controller';  
import { AppDataSource } from '../src/data-source';
import { Devis } from '../src/entity/Devis'; 
import { PreparatorSession } from '../src/entity/PreparatorSession';
import { Demand } from '../src/entity/Demand';
import axios from 'axios';
import { SprotifSession } from '../src/entity/SportifSession';
import { DevisStatus } from '../src/enum/EnumDevisStatus';
import { EnumMealType } from '../src/enum/EnumMealType';
 
// Mocking external dependencies
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;
 
let mockRequest: MockProxy<Request>;
let mockResponse: MockProxy<Response>;
let mockNext: MockProxy<NextFunction>;
let controller=new Controller();
let devisRepository=AppDataSource.getRepository(Devis);
let  demandRepository = AppDataSource.getRepository(Demand);
let  preparatorSessionRepository = AppDataSource.getRepository(PreparatorSession);
let  sportifSessionRepository = AppDataSource.getRepository(SprotifSession)
beforeEach(() => {
    mockRequest = mock<Request>();
    mockResponse = mock<Response>();
    mockNext = mock<NextFunction>();
    
});
// Clean up
afterEach(() => {
    jest.clearAllMocks();
});
// Arrange
const preparatorIdSession = 1;
const demandId = 1;
const requestMock = {
  params: {
    preparatorIdSession,
    demandId,
  },
  body: {"proposed_price":70}
};
const preparatorSessionMock = {
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
};
const demand = { 
        "idDemand": demandId,
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
};
const devisDataMock =  {
  "idDevis": 1,
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
 
  }
};
describe('getDevisPfDemandM', () => {
    it('should return an array of devis for a given demandId', async () => {
      // Arrange
        const demandId = 1;
        const expectedDevis = [
        {
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
            }
        },
        {
            "idDevis": 2,
            "proposed_price": 60,
            "status": "pending",
            "createdAt": "2024-01-02T20:48:37.531Z",
            "updatedAt": "2024-01-02T20:48:37.531Z",
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
            }
        }
    ];

    devisRepository.createQueryBuilder=jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce(expectedDevis),
    } as any);

const result = await controller.getDevisPfDemandM( demandId );

      // Assert
    expect(result).toEqual(expectedDevis);
    expect(devisRepository.createQueryBuilder).toHaveBeenCalledWith('devis');
    expect(devisRepository.createQueryBuilder().leftJoinAndSelect).toHaveBeenCalledWith('devis.demand', 'demand');
    expect(devisRepository.createQueryBuilder().leftJoinAndSelect).toHaveBeenCalledWith('devis.preparatorSession', 'preparatorSession');
    expect(devisRepository.createQueryBuilder().where).toHaveBeenCalledWith('devis.demand.idDemand = :demandId', { demandId });
    expect(devisRepository.createQueryBuilder().getMany).toHaveBeenCalled();
    });
  });
 

    describe('proposeDevis', () => {
    it('should create and save a new devis', async () => {
        const demandId=1;
        const preparatorIdSession=1;
        const devis={
            "proposed_price": 70,
            
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
        const demandData = {
            "title":"lunch",
            "desired_delivery_date": "2024-01-03T15:41:34.166Z",
            "mealType": "lunch",
            "caloricValue": 6000,
            "fatsValue": 190,
            "proteinValue": 40,
            "carbohydratesValue": 30,
            "description": "Delicious lunch option",
            "isAvailable": true
            
        };
        const savedDevis={
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
            }
        }
    
        mockRequest.params = { demandId };
        mockRequest.params = { preparatorIdSession };
        mockRequest.body = {devis};

        let prepSessRep=preparatorSessionRepository.findOne=jest.fn().mockResolvedValue(preparatorSession);
       let demandResp=demandRepository.findOne=jest.fn().mockResolvedValue(demandData);
       let dRepCreate=devisRepository.create=jest.fn().mockReturnValue(savedDevis);
       let dRepSave=devisRepository.save=jest.fn().mockResolvedValue(savedDevis);
   
        // Act
       const result = await controller.proposeDevis(requestMock);
       
//        preparatorSessionRepository.findOne=jest.fn().mockResolvedValue(preparatorSessionMock);
//      // Assert
     expect(prepSessRep).toHaveBeenCalledWith({ where: { idSession: preparatorIdSession } });
      expect(demandResp).toHaveBeenCalledWith({ where: { idDemand: demandId } });
     expect(dRepCreate).toHaveBeenCalled();
     expect(dRepSave).toHaveBeenCalled();
    // expect(dRepSave).toHaveBeenCalledWith(devisDataMock as any);
     expect(result).toEqual(savedDevis);
   });
   it('should throw an error if preparator session not found', async () => {
   
    preparatorSessionRepository.findOne=jest.fn().mockResolvedValue(null);
    // Act and Assert
    await expect(controller.proposeDevis(requestMock)).rejects.toThrow('Preparator not found');

  });
  
  it('should throw an error if demand not found', async () => {
    preparatorSessionRepository.findOne=jest.fn().mockResolvedValueOnce(preparatorSessionMock as any);
    demandRepository.findOne=jest.fn().mockResolvedValue(null);
    
    // Act and Assert
    await expect(controller.proposeDevis(requestMock)).rejects.toThrow('Demand not found');
  });
        });

    describe('acceptDevis', () => {
   
        // Mock the necessary dependencies and objects
        const devisId = 1;
       
        const mockResponse = {
          status: jest.fn().mockReturnThis(), 
          json: jest.fn(),
        } as Response; // Cast to Response
        controller.producer.send=jest.fn();
        controller.producer.connect=jest.fn();
        controller.producer.disconnect=jest.fn();
        //mock repo
        const devisRepo=devisRepository.findOne=jest.fn().mockResolvedValue(devisDataMock);
        const demandRepo=demandRepository.findOne=jest.fn().mockResolvedValue(demand);
       
        it('should accept a devis and perform necessary updates', async () => {
            const devisRepo=devisRepository.findOne=jest.fn().mockResolvedValue(devisDataMock);
            const demandRepo=demandRepository.findOne=jest.fn().mockResolvedValue(demand);
           
            mockRequest.params = { devisId };
            // Act
        await controller.acceptDevis(mockRequest, mockResponse);
  
        // Assert
         
        expect(devisRepo).toHaveBeenCalled();
        expect(demandRepo).toHaveBeenCalledWith({
            where: { idDemand: 1 },
            relations: ['sportifSession'],
        });
     //  expect(mockResponse.status).toHaveBeenCalledWith(200);
       // expect(mockResponse.json).toHaveBeenCalledWith(/* Your expected JSON response */);
      });
      it('should throw an error if demand don t exist', async () => {
        // Mock the necessary dependencies and objects
        const devisId = 1;
        mockRequest.params = { devisId };
        const mockResponse = {
          status: jest.fn().mockReturnThis(), // Ensure that status() is mockable
          json: jest.fn(),
        } as Response; // Cast to Response
  
        demandRepository.findOne=jest.fn().mockResolvedValue(null);

        // Act
        const act = async () => await controller.acceptDevis(mockRequest, mockResponse);

        // Assert
        await expect(act()).rejects.toThrow('Demand not found')}); 
      it('should handle errors and return a 500 status', async () => {
        // Mock the necessary dependencies and objects
        const devisId = 1;
        const devisRepo=devisRepository.findOne=jest.fn().mockResolvedValue(devisDataMock);
        const demandRepo=demandRepository.findOne=jest.fn().mockResolvedValue(demand);
       
        mockRequest.params = { devisId };
         mockResponse.status = jest.fn().mockReturnThis();
         mockResponse.json = jest.fn(),
      
        // Act
        await controller.acceptDevis(mockRequest, mockResponse);
  
        // Assert
       
     expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: expect.any(String) });
        });
        it('should throw an error if devis not found', async () => {
            // Mock the necessary dependencies and objects
            const devisId = 1;
            mockRequest.params = { devisId };
            const mockResponse = {
              status: jest.fn().mockReturnThis(), // Ensure that status() is mockable
              json: jest.fn(),
            } as Response; // Cast to Response
      
            devisRepository.findOne=jest.fn().mockResolvedValue(null);
    
            // Act
            const act = async () => await controller.acceptDevis(mockRequest, mockResponse);
    
            // Assert
            await expect(act()).rejects.toThrow('Devis not found')});
            // it('should set status to ACCEPTED and reject other devis', async () => {
            //     // Mock Devis entity
            //     const devis = { idDevis: 1, status: DevisStatus.PENDING };
                
            //     // Mock Devis repository
            //     const saveDevisMock = jest.fn();
            //     const devisRepositoryMock = {
            //       save: saveDevisMock,
            //       findOne: jest.fn().mockResolvedValue(devis),
            //     };
            //     const devisRepo=devisRepository.findOne=jest.fn().mockResolvedValue(devisDataMock);
            //     // Mock getDevisPfDemandM method
            //     const getDevisPfDemandMResult = [{ idDevis: 2, status: DevisStatus.PENDING }];
            //     const getDevisPfDemandMMock = jest.fn().mockResolvedValue(getDevisPfDemandMResult);
            
                
            
            //     await controller.acceptDevis(mockRequest, mockResponse);
            //     // Assertions
            //     expect(devisRepositoryMock.findOne).toHaveBeenCalled();
            //     expect(saveDevisMock).toHaveBeenCalledWith({ idDevis: 1, status: DevisStatus.ACCEPTED });
            
            //     // Verify that the getDevisPfDemandM method was called
            //     expect(getDevisPfDemandMMock).toHaveBeenCalledWith(/* add expected parameters for getDevisPfDemandM */);
            
            //     // Verify that the save method was called for each rejected devis
            //     expect(saveDevisMock).toHaveBeenCalledWith({ idDevis: 2, status: DevisStatus.REJECTED });
            //   });
        });

    
    describe('getDevisOfPreparator', () => {
            it('should get devis of a preparator successfully', async () => {
            // Mock data
            const request = {
                params: {
                preparatorId: '1',
                },
            } as Request;
        
            const preparatorId = 1;
        
            const preparatorSessionMock = {
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
                };
        
            const devisListMock= [
                {
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
                    }
                },
                {
                    "idDevis": 2,
                    "proposed_price": 60,
                    "status": "pending",
                    "createdAt": "2024-01-02T20:48:37.531Z",
                    "updatedAt": "2024-01-02T20:48:37.531Z",
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
                    }
                }
            ];
            // Mock repository methods
            preparatorSessionRepository.findOne=jest.fn()
                .mockResolvedValue(preparatorSessionMock);
        
            devisRepository.find=jest.fn()
                .mockResolvedValue(devisListMock);
        
            // Call the getDevisOfPreparator method
            const result = await controller.getDevisOfPreparator(request);
        
            // Assertions
            expect(result).toEqual(devisListMock);
            });
        
            it('should throw an error when preparator is not found', async () => {
            // Mock data
            const request = {
                params: {
                preparatorId: '1',
                },
            } as Request;
        
            // Mock repository method to return null (preparator not found)
            preparatorSessionRepository.findOne=jest.fn()
                .mockResolvedValue(null);
        
            // Call the getDevisOfPreparator method and expect an error
            await expect(controller.getDevisOfPreparator(request)).rejects.toThrowError('Preparator not found');
            });
        
        });
    describe('getDevisOfDemand', () => {
            it('should get devis of a demand successfully', async () => {
            // Mock data
            const request = {
                params: {
                demandId: '1',
                },
            } as Request;
        
            const demandId = 1;
        
            const demandMock  = 
                { 
                    "idDemand": demandId,
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
                };
        
            const devisListMock=[
                {
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
                    }
                },
                {
                    "idDevis": 2,
                    "proposed_price": 60,
                    "status": "pending",
                    "createdAt": "2024-01-02T20:48:37.531Z",
                    "updatedAt": "2024-01-02T20:48:37.531Z",
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
                    }
                }
            ];
        
            // Mock repository methods
            demandRepository.findOne=jest.fn()
                .mockResolvedValue(demandMock);
        
            devisRepository.createQueryBuilder=jest.fn()
                .mockReturnValue({
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue(devisListMock),
                });
        
            // Call the getDevisOfDemand method
            const result = await controller.getDevisOfDemand(request);
        
            // Assertions
            expect(result).toEqual(devisListMock);
            });
        
            it('should throw an error when demand is not found', async () => {
            // Mock data
            const request = {
                params: {
                demandId: '1',
                },
            } as Request;
        
            // Mock repository method to return null (demand not found)
            demandRepository.findOne=jest.fn()
                .mockResolvedValue(null);
        
            // Call the getDevisOfDemand method and expect an error
            await expect(controller.getDevisOfDemand(request)).rejects.toThrowError('Demand not found');
            });
        
            // Add more test cases for error scenarios, missing data, etc.
        });
