import { useStripe } from '@stripe/stripe-react-native';
import { createPaymentIntent } from '../../services/paymentGateway';

const UsePayOrder = (amount:number) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const payOrder = async (amount:number) => {
    try {
      // 1. Create a payment intent
      const response = await createPaymentIntent({
        amount: amount,
      });

      if (response.error) {
        throw new Error('Something went wrong');
      }

      // 2. Initialize the Payment sheet
      const initResponse = await initPaymentSheet({
        merchantDisplayName: 'nutriSport',
        paymentIntentClientSecret: response.paymentIntent,
      });

      if (initResponse.error) {
        console.log(initResponse.error);
        throw new Error('Something went wrong');
      }

      // 3. Present the Payment Sheet from Stripe
      const paymentResponse = await presentPaymentSheet();

      if (paymentResponse.error) {
        throw new Error(paymentResponse.error.message);
      }

      // 4. If payment is successful, you can proceed with creating the order or any other action.

    } catch (error) {
      throw new Error('Error during checkout: ' + error);
    }
  };

  return payOrder;
};

export default UsePayOrder;
