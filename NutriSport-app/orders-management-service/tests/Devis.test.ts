import { createConnection, Connection, Repository,createQueryBuilder} from 'typeorm';

import { mock, MockProxy } from 'jest-mock-extended';
import { Devis } from './../src/entity/Devis';
import { Order } from './../src/entity/Order';
import { PreparatorSession } from './../src/entity/PreparatorSession';

jest.mock('typeorm', () => ({
  ...(jest.requireActual('typeorm') as object),
  createConnection: jest.fn(),
 
  
}));

describe('Devis Entity', () => {
  let connection: Connection;
  let devisRepository: Repository<Devis>;
  let orderRepository: Repository<Order>;
  let preparatorSessionRepository: Repository<PreparatorSession>;
  let mockDevis: Devis;
  let mockOrder: Order;
  let mockDevis2: Devis;
  let mockPreparatorSession: PreparatorSession;

  beforeAll(async () => {
    // Mock the createConnection method to return a mock connection
    (createConnection as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockImplementation(entity => {
        if (entity === Devis) {
          return devisRepository;
        } else if (entity === Order) {
          return orderRepository;
        } else if (entity === PreparatorSession) {
          return preparatorSessionRepository;
        }
      }),
      close: jest.fn(),
    });

    // Get repositories for entities
    devisRepository = mock<Repository<Devis>>();
    orderRepository = mock<Repository<Order>>();
    preparatorSessionRepository = mock<Repository<PreparatorSession>>();
  });

  beforeEach(() => {
    // Mock data
    mockDevis = new Devis();
    mockDevis.idDevis = 1;
    mockDevis.idPreparator = 1;

    mockDevis2 = new Devis();
    mockDevis2.idDevis = 2;
    mockDevis2.idPreparator = 1;
    mockOrder = new Order();
    mockOrder.idOrder = 1;
    mockPreparatorSession = new PreparatorSession();



    // Associate Devis with Order and PreparatorSession
    mockDevis.order = mockOrder;
    mockDevis.preparatorSession = mockPreparatorSession;
   
    mockDevis2.order = mockOrder;
    mockDevis2.preparatorSession = mockPreparatorSession;
  });

  it('should create a Devis instance successfully', () => {
    // Assertions
    expect(mockDevis).toBeInstanceOf(Devis);
    expect(mockDevis.idDevis).toEqual(1);
    expect(mockDevis.order).toBe(mockOrder);
    expect(mockDevis.preparatorSession).toBe(mockPreparatorSession);

    expect(mockDevis2).toBeInstanceOf(Devis);
    expect(mockDevis2.idDevis).toEqual(2);
    expect(mockDevis2.order).toBe(mockOrder);
    expect(mockDevis2.preparatorSession).toBe(mockPreparatorSession);
  });
  it('should establish the ManyToOne relationship with PreparatorSession', () => {
 

    // Set up mock data
    mockDevis.preparatorSession = mockPreparatorSession;
    mockPreparatorSession.devis=[mockDevis,mockDevis2];
 
    // Assert that the relationship is correctly set
    expect(mockDevis.preparatorSession).toBe(mockPreparatorSession);
  
    // Ensure the inverse relationship is also set
    expect(mockPreparatorSession.devis).toContain(mockDevis);
    expect(mockPreparatorSession.devis).toContain(mockDevis2);
  });

});
