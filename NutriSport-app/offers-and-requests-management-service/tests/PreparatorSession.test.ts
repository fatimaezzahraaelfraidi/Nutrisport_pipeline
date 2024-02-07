import { Request, Response, NextFunction } from 'express';
import { mock, MockProxy } from 'jest-mock-extended';
import { Controller } from '../src/controller/Controller';  
import { Offer } from '../src/entity/Offer'; 
import { SprotifSession } from '../src/entity/SportifSession';
import { PreparatorSession } from '../src/entity/PreparatorSession';
import { AppDataSource } from '../src/data-source';


let  PreparatorSessionRepository = AppDataSource.getRepository(PreparatorSession)
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



describe('psAll ', () => {
   
  
  

   
    it('should Retrieve all Preparator Sessions', async () => {
        const PreparatorSessionList =   [  {
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
        }];
        

         //mock repositories
        let pSessionRep=PreparatorSessionRepository.find=jest.fn().mockResolvedValue(PreparatorSessionList);
       // Act
        const result = await controller.psAll(mockRequest, mockResponse, mockNext);

        // Assert
        
        expect(pSessionRep).toHaveBeenCalled();
        expect(result).toEqual(PreparatorSessionList);
    });

    

});

 
