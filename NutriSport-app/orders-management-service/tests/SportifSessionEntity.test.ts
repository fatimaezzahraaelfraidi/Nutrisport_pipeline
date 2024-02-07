import { createConnection, Connection, Repository } from 'typeorm';
import { mock, MockProxy } from 'jest-mock-extended';
import { SportifSession } from './../src/entity/SportifSession';
import { Order } from './../src/entity/Order';
import { OrderStatus } from './../src/enum/EnumOrderStatus';

jest.mock('typeorm', () => ({
  ...(jest.requireActual('typeorm') as object),
  createConnection: jest.fn(),
}));

describe('SportifSession Entity', () => {
  let connection: Connection;
  let sportifSessionRepository: Repository<SportifSession>;
  let orderRepository: Repository<Order>;

  beforeAll(async () => {
    // Mock the createConnection method to return a mock connection
    (createConnection as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockImplementation(entity => {
        if (entity === SportifSession) {
          return sportifSessionRepository;
        } else if (entity === Order) {
          return orderRepository;
        }
      }),
      close: jest.fn(),
    });

    // Get repositories for entities
    sportifSessionRepository = mock<Repository<SportifSession>>();
    orderRepository = mock<Repository<Order>>();
  });

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  it('should establish a one-to-many relationship between SportifSession and Order', async () => {
    // Mock data
    const mockSportifSession: SportifSession = {
      idSession: 1,
      idSportif: 1,
      currentPosition: null,
      isActive: true,
      orders: [
        {
          idOrder: 1,
          orderStatus: OrderStatus.PREPARATION,
          devis: null,
          offer: null,
          createdAt: null,
          sportifSession: null,
          isPaid: false,
        }
      ],
      name: undefined,
      phone: undefined,
      fcmToken: ''
    };

    // Mock the findOne method of sportifSessionRepository
    jest.spyOn(sportifSessionRepository, 'findOne').mockResolvedValue(mockSportifSession);

    // Retrieve SportifSession from the mock connection
    const savedSportifSession = await sportifSessionRepository.findOne({
      where: { idSession: mockSportifSession.idSession },
      relations: ['orders'],
    });

    // Assertions
    expect(savedSportifSession).toBeDefined();
    expect(savedSportifSession.orders).toHaveLength(1);

    // Check the relationship between SportifSession and Order
    const savedOrder = savedSportifSession.orders[0];
    expect(savedOrder).toBeDefined();
    expect(savedOrder.idOrder).toEqual(1);
    expect(savedOrder.orderStatus).toEqual(OrderStatus.PREPARATION);
  });

  it('should create a SportifSession instance successfully', () => {
    // Create an instance of SportifSession
    const sportifSession = new SportifSession();
    sportifSession.idSession = 1;
    sportifSession.idSportif = 1;
    sportifSession.currentPosition = null;
    sportifSession.isActive = true;
    sportifSession.orders = [];

    // Assertions
    expect(sportifSession).toBeInstanceOf(SportifSession);
    expect(sportifSession.idSession).toEqual(1);
    expect(sportifSession.idSportif).toEqual(1);
    expect(sportifSession.currentPosition).toBeNull();
    expect(sportifSession.isActive).toEqual(true);
    expect(sportifSession.orders).toEqual([]);
  });
});