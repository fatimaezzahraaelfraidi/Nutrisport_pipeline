import { Request, Response, NextFunction } from 'express';
import { mock, MockProxy } from 'jest-mock-extended';
import { Controller } from '../src/controller/Controller';  
import { SprotifSession } from '../src/entity/SportifSession';
import { Demand } from '../src/entity/Demand';
import { AppDataSource } from '../src/data-source';
import { PreparatorSession } from '../src/entity/PreparatorSession';
import { EnumMealType } from '../src/enum/EnumMealType';
import { Geometry } from 'typeorm';




let sportifSessionRepository = AppDataSource.getRepository(SprotifSession);
let demandRepository = AppDataSource.getRepository(Demand);
let preparatorSessionRepository = AppDataSource.getRepository(PreparatorSession);
let controller = new Controller();

// Mock requests/responses/nextFunction
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

describe('save demand', () => {
    const sportifIdSession = 2;
 

        
     

        it('should retrieve the current position of the demand', async () => {
            // Arrange
            const demandData:Demand = {
                "title": "lunch",
                "desired_delivery_date": null,
                "mealType": EnumMealType.LUNCH,
                "caloricValue": 6000,
                "fatsValue": 190,
                "proteinValue": 40,
                "carbohydratesValue": 30,
                "description": "Delicious lunch option",
                "isAvailable": true,
                idDemand: 0,
                createdAt: null,
                updatedAt: null,
                sportifSession: new SprotifSession,
                devis: []
            };
    
            const currentPosition :Geometry= {
                type: "Point",
                coordinates: [
                    12.965598,
                    77.590862
                ]
            };
    
            const sportifSession :SprotifSession = {
                idSession: 2,
                idSportif: 2,
                currentPosition: currentPosition,
                isActive: true,
                name: "name",
                phone: "phone",
                fcmToken: 'tocken',
                demands: []
            };
    
            const savedDemand :Demand= {
                ...demandData,
                idDemand: 2,
                createdAt: null,
                updatedAt: null,
                sportifSession: sportifSession
            };
        mockRequest.params = { sportifIdSession: String(sportifIdSession) };
        mockRequest.body = demandData;

        sportifSessionRepository.findOne = jest.fn().mockResolvedValue(sportifSession);
        demandRepository.create = jest.fn().mockReturnValue(savedDemand);
        demandRepository.save = jest.fn().mockResolvedValue(savedDemand);
        const nearbyPreparatorSessions = [{ fcmToken: 'fake_token_1' }, { fcmToken: 'fake_token_2' }];
        preparatorSessionRepository.createQueryBuilder = jest.fn().mockReturnValue({
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            setParameter: jest.fn().mockReturnThis(),
            getRawMany: jest.fn().mockResolvedValue(nearbyPreparatorSessions),
        });
       

        // Act
        await controller.saveDemand(mockRequest, mockResponse, mockNext);

        // Assert
        expect(preparatorSessionRepository.createQueryBuilder).toHaveBeenCalled();
        expect(preparatorSessionRepository.createQueryBuilder().select).toHaveBeenCalledWith('DISTINCT preparatorSession.fcmToken');
        expect(preparatorSessionRepository.createQueryBuilder().where).toHaveBeenCalledWith(`ST_DWithin(preparatorSession.currentPosition, ST_GeomFromText(:pointGeometry, 4326)::geography, :diameter)`);
        expect(preparatorSessionRepository.createQueryBuilder().andWhere).toHaveBeenCalledWith('preparatorSession.isActive = :isActive', { isActive: true });
        expect(preparatorSessionRepository.createQueryBuilder().setParameter).toHaveBeenCalledWith('pointGeometry', 'POINT(12.965598 77.590862)');
        expect(preparatorSessionRepository.createQueryBuilder().setParameter).toHaveBeenCalledWith('diameter', 1000000);

        
    });

    it('should throw an error if sportif session is not found', async () => {
        // Arrange
        const sportifIdSession = 1;

        mockRequest.params = { sportifIdSession: String(sportifIdSession) };

        sportifSessionRepository.findOne = jest.fn().mockResolvedValue(null);

        // Act
        const act = async () => await controller.saveDemand(mockRequest, mockResponse, mockNext);

        // Assert
        await expect(act()).rejects.toThrow('Sportif not found');
    });
});
describe('get Demands By Sportif Id ', () => {
    const sportifIdSession = 2;
    const sportifId = 2;

    it('should get demands by sportif ID', async () => {
        // Arrange
        const sportifSession =   {
            "idSession": 1,
            "idSportif": 2,
            "currentPosition": {
                "type": "Point",
                "coordinates": [
                    -7.630817,
                    33.606393
                ]
            },
            "isActive": true
        };
        const demands = [
            {
                "idDemand": 1,
                "mealType": "breakfast",
                "caloricValue": 600,
                "fatsValue": 19,
                "proteinValue": 40,
                "carbohydratesValue": 30,
                "description": "Delicious breakfast option",
                "title":"lunch",
                "desired_delivery_date": "2024-01-03T15:41:34.166Z",
                "isAvailable": true,
                "createdAt": "2023-12-18T13:32:43.646Z",
                "updatedAt": "2023-12-18T13:32:43.646Z"
            },
            {
                "idDemand": 2,
                "mealType": "lunch",
                "caloricValue": 6000,
                "fatsValue": 190,
                "proteinValue": 40,
                "carbohydratesValue": 30,
                "description": "Delicious lunch option",
                "title":"lunch",
                "desired_delivery_date": "2024-01-03T15:41:34.166Z",
                "isAvailable": true,
                "createdAt": "2023-12-19T09:53:12.954Z",
                "updatedAt": "2023-12-19T09:53:12.954Z"
            }
        ];

        mockRequest.params = { sportifIdSession: String(sportifIdSession) };

        let sSessionRep=sportifSessionRepository.findOne=jest.fn().mockResolvedValue(sportifSession);
        let demandRepBuilder=demandRepository.createQueryBuilder=jest.fn().mockReturnValue({
           leftJoin:jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue(demands),
        });

        // Act
        const result = await controller.getDemandsBySportifId(mockRequest, mockResponse, mockNext);

        // Assert
        expect(sSessionRep).toHaveBeenCalled();
        expect(demandRepBuilder).toHaveBeenCalledWith('demand');
        expect(result).toEqual(demands);
    });
    it('should throw an error if sportif session is not found', async () => {
        // Arrange
        const sportifId = 1;

        mockRequest.params = { sportifIdSession: String(sportifIdSession) };

        sportifSessionRepository.findOne=jest.fn().mockResolvedValue(null);

        // Act
        const act = async () => await controller.getDemandsBySportifId(mockRequest, mockResponse, mockNext);

        // Assert
        await expect(act()).rejects.toThrow('Sportif not found');
    });

});
describe('getNearbyDemands', () => {
    it('should  throw error Preparator not found', async () => {
        // Arrange
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
        const sportifSession = {
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
            }
        const savedDemand = {
            "title":"lunch",
            "desired_delivery_date": "2024-01-03T15:41:34.166Z",
            "mealType": "lunch",
            "caloricValue": 6000,
            "fatsValue": 190,
            "proteinValue": 40,
            "carbohydratesValue": 30,
            "description": "Delicious lunch option",
            "isAvailable": true,
            "sportifSession": {
                "idSession": 1,
                "idSportif": 2,
                "currentPosition": {
                    "type": "Point",
                    "coordinates": [
                        -7.630817,
                        33.606393
                    ]
                },
                "isActive": true
            },
            "idDemand": 2,
            "createdAt": "2023-12-19T09:53:12.954Z",
            "updatedAt": "2023-12-19T09:53:12.954Z"
        };
       const  preparatorIdSession=1;
       const preparatorSession={
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
    const request = {
        params: {
            preparatorIdSession: '1',
        },
    };
    
      

        let pSessionRep=preparatorSessionRepository.findOne=jest.fn().mockResolvedValue(null);
   // Act
   const act = async () => await controller.getNearbyDemands(mockRequest, mockResponse, mockNext);

   // Assert
   await expect(act()).rejects.toThrow('Preparator not found');
});

it('should return nearby demands', async () => {
    // Mock request and response objects
 const  preparatorIdSession=1;
   const preparatorSession1={
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
    


    const response = {};
    const next = jest.fn();

    // Mock preparator session
  
    let sSessionRep=preparatorSessionRepository.findOne=jest.fn().mockResolvedValue(preparatorSession1);

    const demandRepBuilder = demandRepository.createQueryBuilder = jest.fn().mockReturnValue({
        innerJoinAndSelect: jest.fn().mockReturnThis(), // Ensure `where` can be chained
        where: jest.fn().mockReturnThis(),
        andWhere:jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      });
       // Create a mock Request object
    mockRequest = {
        params: {
            preparatorIdSession: '1',
            diameter: '3000',
        },
    } as unknown as MockProxy<Request>; 
    
    const result = await controller.getNearbyDemands(mockRequest, mockResponse, next);

    // Assertions
    expect(sSessionRep).toHaveBeenCalled();
   
    expect(result).toEqual([]);
    expect(next).not.toHaveBeenCalled();
  });
  it('should throw an error when currentPosition format is invalid', async () => {
    // Mock request and response objects
    const mockRequest = {
        params: {
            preparatorIdSession: '1',
            diameter: '3000',
        }
    } as unknown as Request;
 
    const mockNext = jest.fn();

    // Mock invalid currentPosition
    const invalidCurrentPosition:Geometry = {
        type: "MultiLineString", // This format is invalid for a currentPosition
        coordinates: []
    };

    const preparatorSession :PreparatorSession= {
        idSession: 0,
        idPreparator: 0,
        nom: '',
        prenom: '',
        currentPosition: invalidCurrentPosition, // Assign invalid currentPosition
        isActive: false,
        preparatorRank: 0,
        fcmToken: '',
        offers: [],
        devis: []
    };
    preparatorSession.currentPosition=invalidCurrentPosition;
    // Mock preparator session repository
     preparatorSessionRepository.findOne=jest.fn().mockResolvedValue(preparatorSession);
    
   // Act and assert
   let error: Error;
    try {
        await controller.getNearbyDemands(mockRequest, mockResponse, mockNext);
    } catch (e) {
        error = e;
    }

    expect(error.message).toBe('Invalid currentPosition format');
    // Act and assert
   
});


  });
