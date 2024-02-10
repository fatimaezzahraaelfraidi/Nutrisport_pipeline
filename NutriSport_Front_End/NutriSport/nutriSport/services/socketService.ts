import io from 'socket.io-client';


import config from './../pages/config';
// const socket = io('http://192.168.43.78:3200');
// const socketService2 = io('http://192.168.43.78:3100');
const socket = io(`${config.API_BASE_URL}:${config.PORT}`);
const socketService2 = io(`${config.API_BASE_URL}:${config.PORT}`);


export const connectSocket = () => {
  socket.connect();
};

export const disconnectSocket = () => {
  socket.disconnect();
};

export const subscribeToOrderStatusChanged = (callback: (updatedOrder: any) => void) => {
  socket.on('orderStatusChanged', callback);
};

export const unsubscribeFromOrderStatusChanged = () => {
  socket.off('orderStatusChanged');
};

// const socket1 = io('http://192.168.43.78:3100');
const socket1 = io(`${config.API_BASE_URL}:${config.PORT}`);


export const connectSocket1 = () => {
  socket1.connect();
};

export const disconnectSocket1 = () => {
  socket1.disconnect();
};

export const subscribeToUpdateOffers = (callback: (newOffer: any) => void) => {
  socket1.on('newOffer', (callback));
};

export const unsubscribeFromUpdateOffers = () => {
  socket1.off('newOffer');
};
export const subscribeToUpdateDemands = (callback: (newDemand: any) => void) => {
  socket1.on('newDemand', (callback));
};

export const unsubscribeFromUpdateDemands = () => {
  socket1.off('newDemand');
};

export const subscribeToOrderPaymentChanged = (callback: (updatedOrder: any) => void) => {
  socket.on('orderPaymentChanged', callback);
};

export const unsubscribeFromOrderPaymentChanged = () => {
  socket.off('orderPaymentChanged');
};

export const connectSocketService2 = () => {
  socketService2.connect();
};

export const disconnectSocketService2 = () => {
  socketService2.disconnect();
};

export const subscribeToNewDevisForDemand = (callback: (updatedOrder: any) => void) => {
  socketService2.on('newDevisForDemand', callback);
};

export const unsubscribeFromToNewDevisForDemand = () => {
  socketService2.off('newDevisForDemand');
};
export const subscribeToNewOfferSaved = (callback: (updatedOffer: any) => void) => {
  socketService2.on('newOfferSaved', callback);
};

export const unsubscribeFromNewOfferSaved = () => {
  socketService2.off('newOfferSaved');
};

export const subscribeToNewOrderSavedOnOffer = (callback: (updatedOrder: any) => void) => {
  socket.on('newOrderSavedOnOffer', callback);
};

export const unsubscribeFromNewOrderSavedOnOffer = () => {
  socket.off('newOrderSavedOnOffer');
};

export const subscribeToNewDemandSaved = (callback: (newDemand: any) => void) => {
  socketService2.on('newDemandSaved', callback);
};

export const unsubscribeFromNewDemandSaved  = () => {
  socketService2.off('newDemandSaved');
};



