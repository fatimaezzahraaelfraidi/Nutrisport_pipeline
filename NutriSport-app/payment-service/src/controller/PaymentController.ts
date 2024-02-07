import { NextFunction, Request, Response } from "express"
const stripe = require('stripe')(
    'sk_test_51OcZ5LKHpj4IFRMyPbtokQzNU1gIWHC3uGIQgrSXwxS6MWAhkXNh7SFxgwaCVS6fArxjqnfgmc201b3kgb8Je6bt00aMwY985e'
);
export class PaymentController {

    async paymentIntent(request: Request, response: Response, next: NextFunction) {
        try {
            // create a PaymentIntent
            const paymentIntent = await stripe.paymentIntents.create({
              amount: request.body.amount, // Integer, usd -> pennies, eur -> cents
              currency: 'mad',
              automatic_payment_methods: {
                enabled: true,
              },
            });
            // Return the secret
            response.json({ paymentIntent: paymentIntent.client_secret });
          } catch (e) {
            response.status(400).json({
              error: e.message,
            });
          }
    }
}