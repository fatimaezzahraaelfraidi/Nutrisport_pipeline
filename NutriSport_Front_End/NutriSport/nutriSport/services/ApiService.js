// ApiService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// const API_BASE_URL = 'http://192.168.43.78';

// const PORT = '3100';
// const PORT = '3200';
// const PORT = '3300';
import config from './../pages/config';

export const fetchOffres = async () => {
  console.log('fetch offers');
  const sessionId = await AsyncStorage.getItem('sessionId');
  try {
    const response = await fetch(`${config.API_BASE_URL}:${config.PORT}/api/offers-and-requests-management/ssessions/${sessionId}`);
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
export const saveOffre = async (data) => {
  console.log(data);
  const sessionId = await AsyncStorage.getItem('sessionId');
  try {

    const response = await fetch(`${config.API_BASE_URL}:${config.PORT}/api/offers-and-requests-management/offers/${sessionId}`, {
 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (response.status === 200) {
      return "Offre Publiée";
    } else {
      throw new Error(response.ok);
    }
  } catch (error) {

    console.error('Error in API call:', error);
    throw error;
  }
};
export const saveDemande = async (data) => {
  console.log('data',data);
  const sessionId = await AsyncStorage.getItem('sessionId');
  try {

    const response = await fetch(`${config.API_BASE_URL}:${config.PORT}/api/offers-and-requests-management/demands/${sessionId}`, {

      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (response.status === 200) {
      return "Demande Publiée";
    } else {
      throw new Error('Network response was not ok');
    }
  } catch (error) {
    console.error('Error in API call:', error);
    throw error;
  }
};
export const nearbyDemands=async ()=>{  try {
  const sessionId = await AsyncStorage.getItem('sessionId');
  const response = await fetch(`${config.API_BASE_URL}:${config.PORT}/api/offers-and-requests-management/psessions/${sessionId}/100000000`);
  console.log(response);
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Error fetching data:', error);
  throw error;
}
};
export const fetchOrders = async () => {
  console.log('fetch orders');

  const sessionId = await AsyncStorage.getItem('sessionId');

  try {
    const response = await fetch(`${config.API_BASE_URL}:${config.PORT}/api/orders-management/orders/${sessionId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
export const fetchDemands = async () => {
  console.log('fetch demands');

  const sessionId = await AsyncStorage.getItem('sessionId');

  try {
    const response = await fetch(`${config.API_BASE_URL}:${config.PORT}/api/offers-and-requests-management/demands/${sessionId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
export const fetchDevisOfDemand = async (demandId) => {
  console.log('fetch devis of demand '+demandId);
  try {
    const response = await fetch(`${config.API_BASE_URL}:${config.PORT}/api/offers-and-requests-management/devis/demand/${demandId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
export const AcceptDevis = async (devisId, method) => {
  console.log('Accept devis number ' + devisId);
  try {
    const response = await fetch(`${config.API_BASE_URL}:${config.PORT}/api/offers-and-requests-management/devis/${devisId}/${method}`, {
      method: 'PATCH', // Use PATCH method for accepting devis
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
export const fetchOffers = async () => {
  console.log('fetch offers for preparator');
  const sessionId = await AsyncStorage.getItem('sessionId');
  try {
    const response = await fetch(`${config.API_BASE_URL}:${config.PORT}/api/offers-and-requests-management/offers/${sessionId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
export const proposeDevisS= async (demandId,proposedPrice) => {
  console.log('propose devis');
  const sessionId = await AsyncStorage.getItem('sessionId');
  try {
    const response = await fetch(`${config.API_BASE_URL}:${config.PORT}/api/offers-and-requests-management/devis/${sessionId}/${demandId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({"proposed_price" : proposedPrice}),
    });
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
export const saveOrder = async (offerId, method) => {
  const sessionId = await AsyncStorage.getItem('sessionId');
  const url = `${config.API_BASE_URL}:${config.PORT}/api/orders-management/orderOffer/${sessionId}/${offerId}/${method}`;
  console.log(offerId);
  try {
    const response = await fetch(url, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      console.error('Error saving order:', response.status, response.statusText);
      return 404;
    } else {
      console.log('Order saved successfully');
      return 200;
    }
  } catch (error) {
    console.error('Network error:', error.message);
    return 401;
  }
};
export const setOrderStatus = async (orderId, status) => {
  const url = `${config.API_BASE_URL}:${config.PORT}/api/orders-management/orders/${orderId}/${status}`;

  try {
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      
    });

    if (response.ok) {
      // Successful response from the server
      console.log('Offer availability updated successfully');
    } else {
      // Handle errors if needed
      console.error('Failed to update Offer availability:', response.statusText);
    }
  } catch (error) {
    // Handle network errors or other issues
    console.error('Error updating Offer availability:', error.message);
  }
};
export const setRankPreparator = async (rank, orderId) => {
  const url = `${config.API_BASE_URL}:${config.PORT}/api/orders-management/preparators/${orderId}/${rank}`;
  try {
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      // Successful response from the server
      console.log('Rating sent successfully');
      // Call the setOrderStatus API after successfully sending the rating
      await setOrderStatus(orderId, 'closed');
    } else {
      // Handle errors if needed
      console.error('Failed to send rating:', response.statusText);
    }
  } catch (error) {
    // Handle network errors or other issues
    console.error('Error sending rating:', error.message);
  }
};
export const signIn = async (data) => {

  const url = `${config.API_BASE_URL}:${config.PORT}/api/user-management/signin`;

  try {
    const response = await fetch(url, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (response.status === 200) {
      console.log('status=200');  
      // Extract user session information from the response
      const userData = await response.json();
      // Save the token in AsyncStorage
      await AsyncStorage.setItem('token', userData.token); 
      // Save user session information in AsyncStorage
      await AsyncStorage.setItem('role', userData.role);
      await AsyncStorage.setItem('sessionId', userData.sessionId.toString());
      await AsyncStorage.setItem('userFullName', userData.userFullName);
      await AsyncStorage.setItem('userMail', userData.userMail);
      
      return userData;
    } else {
    
      console.log('not status=200'); 
      throw new Error('forbidden access');
    }
  } catch (error) {
    console.error('Error in API call:', error);
    throw error;
  }
   
};
export const signup = async (data) => {
  const url = `${config.API_BASE_URL}:${config.PORT}/api/user-management/signup`;

  try {
    const response = await fetch(url, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (response.status === 200) {
      console.log('status=200');  
      return response.json();
    } else {
    
      console.log('not status=200'); 
      throw new Error('forbidden access');
    }
  } catch (error) {
    console.error('Error in API call:', error);
    throw error;
  }
   
};
export const CountOrderedOffers = async () => {
  const sessionId = await AsyncStorage.getItem('sessionId');
  console.log('count orders of offers');
  try {
    const response = await fetch(`${config.API_BASE_URL}:${config.PORT}/api/orders-management/countOrders/${sessionId}`);

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
export const fetchOrdersOfPreparator = async () => {
  const sessionId = await AsyncStorage.getItem('sessionId');
  console.log('fetch orders of preparator');
  try {
    const response = await fetch(`${config.API_BASE_URL}:${config.PORT}/api/orders-management/orders/preparatorOrders/${sessionId}`);
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
export const setPaymentStatus = async (orderId) => {
  const url = `${config.API_BASE_URL}:${config.PORT}/api/orders-management/statusPayment/${orderId}`;

  try {
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      
    });

    if (response.ok) {
      // Successful response from the server
      console.log('Order payment updated successfully');
    } else {
      // Handle errors if needed
      console.error('Failed to update order payment:', response.statusText);
    }
  } catch (error) {
    // Handle network errors or other issues
    console.error('Error updating order payment:', error.message);
  }
};
export const fetchMyDevisOfDemand = async (demandId) => {
  const sessionId = await AsyncStorage.getItem('sessionId');
  console.log('fetch devis of demand');
  try {
    const response = await fetch(`${config.API_BASE_URL}:${config.PORT}/api/offers-and-requests-management/allDevis/${demandId}/${sessionId}`);
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
export const signOut = async () => {
  const token = await AsyncStorage.getItem('token');

  try {
    const response = await fetch(`${config.API_BASE_URL}:${config.PORT}/api/user-management/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      // Remove the token and other user information from AsyncStorage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('role');
      await AsyncStorage.removeItem('sessionId');
      await AsyncStorage.removeItem('userFullName');
      await AsyncStorage.removeItem('userMail');
    } else {
      throw new Error('Logout failed');
    }
  } catch (error) {
    console.error('Error in API call:', error);
    throw error;
  }
};

export const getOrderByIdOrder = async (orderId) => {
  console.log('GET order by Id fettch order');
  
  try {
    const response = await fetch(`${config.API_BASE_URL}:${config.PORT}/api/orders-management/${orderId}`);
    const data = await response.json();
    console.log(data)
    return data;
  } catch (error) {
    console.error('Error getting data:', error);
    throw error;
  }
};
export const getDevisById = async (devisId) => {
  console.log('GET devis by Id');
  
  try {
    const response = await fetch(`${config.API_BASE_URL}:${config.PORT}/api/offers-and-requests-management/devis/${devisId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting data:', error);
    throw error;
  }
};
export const getOfferById = async (offerId) => {
  console.log('GET offer by Id');
  
  try {
    const response = await fetch(`${config.API_BASE_URL}:${config.PORT}/api/offers-and-requests-management/offers/id/${offerId}`);
    const data = await response.json();
    console.log(data)
    return data;
  } catch (error) {
    console.error('Error getting data:', error);
    throw error;
  }
};
export const saveLocation = async (lat, lon) => {
  const token = await AsyncStorage.getItem('token');

  try {
    const response = await fetch(`${config.API_BASE_URL}:${config.PORT}/api/user-management/saveLocationSession/${lat},${lon}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      console.log('location saved');
      await AsyncStorage.setItem('latitude', String(lat)); // Stringify latitude
      await AsyncStorage.setItem('longitude', String(lon)); // Stringify longitude
    } else {
      throw new Error('Logout failed');
    }
  } catch (error) {
    console.error('Error in API call:', error);
    throw error;
  }
}

export const updateAvailability = async (offerId, availability) => {
  const url = `${config.API_BASE_URL}:${config.PORT}/api/offers-and-requests-management/offer/${offerId}/${availability}`;
  try {
    const response = await fetch(url, {
      method: 'patch',
      headers: {
        'Content-Type': 'application/json',
      },
      
    });

    if (response.ok) {
      // Successful response from the server
      console.log('Order status updated successfully');
    } else {
      // Handle errors if needed
      console.error('Failed to update order status:', response.statusText);
    }
  } catch (error) {
    // Handle network errors or other issues
    console.error('Error updating order status:', error.message);
  }
};


export const fetchDemandsHistory = async () => {
  console.log('fetch demands');

  const sessionId = await AsyncStorage.getItem('sessionId');

  try {
    const response = await fetch(`${config.API_BASE_URL}:${config.PORT}/api/offers-and-requests-management/demands/${sessionId}`);
    const data = await response.json();

    // Iterate through each demand
    for (let demand of data) {
      // Format the desired_delivery_date
      demand.formattedDate = formatDate(demand.desired_delivery_date);

      // Fetch devis for the current demand
      const devis = await fetchDevisOfDemand(demand.idDemand);
      // Associate the fetched devis array with the current demand
      demand.devis = devis;
    
    
    }
    const orders = await fetchOrders(sessionId)
    
    // Filter orders with devis not null
    const ordersWithDevis = orders.filter(order => order.devis !== null);
     
      
    for (let order of ordersWithDevis) {
      // Find the demand associated with the order's devis
      const demand = data.find(demand => demand.devis.some(dev => dev.idDevis === order.devis.idDevis));
  
      // Add order to the demand's order property
      if (demand) {
          demand.order = order;
      }
  }
  return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }

};


export const getDemandOfDevis = async (devisId) => {
  console.log('fetch demand of devis');
  try {
    const response = await fetch(`${API_BASE_URL}:${PORT}/api/offers-and-requests-management/demandOfDevis/${devisId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }

};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { day: '2-digit', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
};



