import { createConnection, Connection, Repository } from 'typeorm';
import { mock, MockProxy } from 'jest-mock-extended';
import { Offer } from '../src/entity/Offer';
import { Order } from '../src/entity/Order';
import { PreparatorSession } from '../src/entity/PreparatorSession';

// jest.mock('typeorm', () => ({
//   ...(jest.requireActual('typeorm') as object),
//   createConnection: jest.fn(),
// }));
// Import the real decorators
import * as TypeORM from 'typeorm';

// Mock the decorators using jest.mock
jest.mock('typeorm', () => ({
  ...TypeORM,
  Entity: jest.fn(),
  PrimaryColumn: jest.fn(),
  PrimaryGeneratedColumn: jest.fn(),
  Column: jest.fn(),
  CreateDateColumn: jest.fn(),
  UpdateDateColumn: jest.fn(),
  OneToOne: jest.fn(),
  JoinColumn: jest.fn(),
  ManyToOne: jest.fn(),
  OneToMany: jest.fn(),  
  createConnection: jest.fn(),
}));

describe('Offer Entity', () => {
  let connection: Connection;
  let offerRepository: Repository<Offer>;
  let orderRepository: Repository<Order>;
  let preparatorSessionRepository: Repository<PreparatorSession>;
  let mockOffer: Offer;
  let mockOrder: Order;
  let mockPreparatorSession: PreparatorSession;

  beforeAll(async () => {
    // Mock the createConnection method to return a mock connection
    (createConnection as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockImplementation(entity => {
        if (entity === Offer) {
          return offerRepository;
        } else if (entity === Order) {
          return orderRepository;
        } else if (entity === PreparatorSession) {
          return preparatorSessionRepository;
        }
      }),
      close: jest.fn(),
    });

    // Get repositories for entities
    offerRepository = mock<Repository<Offer>>();
    orderRepository = mock<Repository<Order>>();
    preparatorSessionRepository = mock<Repository<PreparatorSession>>();
  });

  beforeEach(() => {
    // Mock data
    mockOffer = new Offer();
    mockOffer.idOffer = 1;
    mockOffer.title = 'Test Offer';
    mockOffer.price = 50.0;
    mockOffer.preparation_time = 30;
    mockOffer.isDeliverable = true;
    mockOffer.isAvailable = true;

    mockOrder = new Order();
    mockOrder.idOrder = 1;

    mockPreparatorSession = new PreparatorSession();

    // Associate Offer with Order and PreparatorSession
    mockOffer.orders = mockOrder;
    mockOffer.preparatorSession = mockPreparatorSession;
  });

  it('should create an Offer instance successfully', () => {
    // Assertions
    expect(mockOffer).toBeInstanceOf(Offer);
    expect(mockOffer.idOffer).toEqual(1);
    expect(mockOffer.title).toEqual('Test Offer');
    expect(mockOffer.price).toEqual(50.0);
    expect(mockOffer.preparation_time).toEqual(30);
    expect(mockOffer.isDeliverable).toEqual(true);
    expect(mockOffer.isAvailable).toEqual(true);
    expect(mockOffer.orders).toBe(mockOrder);
    expect(mockOffer.preparatorSession).toBe(mockPreparatorSession);
  });

});
