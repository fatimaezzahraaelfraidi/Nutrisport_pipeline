
import config from './../pages/config';
//const baseUrl = 'http://192.168.43.78:3400/';




export const createPaymentIntent = async (data: any) => {
  try {
    const response = await fetch(`${config.API_BASE_URL}:${config.PORT}/payments/intents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
