import { NextFunction, Request, Response } from "express";
import { PaymentController } from "./../src/controller/PaymentController";
 
// Now you can use the stripe instance for testing

// Mock Stripe library
jest.mock('stripe', () => {
  return jest.fn().mockReturnValue({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        client_secret: 'test_secret'
      })
    }
  });
});

describe('PaymentController', () => {
  let paymentController: PaymentController;
  let mockRequest: Request;
  let mockResponse: Response;
  let mockNext: NextFunction;

  beforeEach(() => {
    paymentController = new PaymentController();
    mockRequest = {} as Request;
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as unknown as Response;
    mockNext = jest.fn();
  });

  it('should create a payment intent', async () => {
    // Arrange
    const amount = 1000; // $10.00 (in pennies)
    mockRequest.body = { amount };

    // Act
    await paymentController.paymentIntent(mockRequest, mockResponse, mockNext);

    // Assert
    expect(mockResponse.json).toHaveBeenCalledWith({ paymentIntent: 'test_secret' });
  });

  it('should handle errors', async () => {
    // Arrange
    jest.spyOn(console, 'error').mockImplementationOnce(() => {}); // Suppress console.error output
    jest.spyOn(mockResponse, 'status').mockReturnValueOnce(mockResponse); // Mock status().send() chain
    jest.spyOn(mockResponse, 'send').mockImplementationOnce(() => {}); // Mock send() to do nothing
    
    // Act
    await paymentController.paymentIntent(mockRequest, mockResponse, mockNext);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });
});
