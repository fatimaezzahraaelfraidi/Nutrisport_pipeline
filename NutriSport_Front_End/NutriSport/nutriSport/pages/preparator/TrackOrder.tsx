import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendarDay, faHandHoldingDollar, faMoneyBill1Wave, faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-native-modal';
import DeliveryMap from '../sportif/DeliveryMap';
import { setOrderStatus, setPaymentStatus, getDemandOfDevis } from '../../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
const screenWidth = Dimensions.get('window').width;
const screenHeight= Dimensions.get('window').height;

const TrackOrder = ({ isVisible, onClose, order, navigation, sportifLocationL, sportifLocationLL}:
   { isVisible: boolean, onClose: () => void, order: Order | undefined, navigation: any, sportifLocationL: number | undefined,
     sportifLocationLL: number | undefined }) => {  
  const [latitudeP, setLatitudeP] = useState(0);
  const [longitudeP, setLongitudeP] = useState(0);
  const [demandOfDevis, setDemandOfDevis] = useState<Demand>();

  async function doneDelivery(order: Order | undefined) {
    console.log("clicked for id : ", order?.idOrder);
    await setOrderStatus(order?.idOrder, 'delivered');
    await setPaymentStatus(order?.idOrder);
    onClose();
  }

  const fetchCoordinates = async () => {
    try {

      const latString = await AsyncStorage.getItem('latitude');
      const longString = await AsyncStorage.getItem('longitude');
      if (latString && longString) {
        const lat = parseFloat(latString);
        const long = parseFloat(longString);
        setLatitudeP(lat);
        setLongitudeP(long);
      }

    } catch (error) {
      console.error('Error fetching coordinates:', error);
    }
  };

  useEffect(() => {
    fetchCoordinates();
  }, []);

  let lat = 0;
  let long = 0;
  if (sportifLocationL !== undefined && sportifLocationLL !== undefined) {
    lat = sportifLocationL;
    long = sportifLocationLL;
  }

  return (
    <Modal
      isVisible={isVisible}
      swipeDirection={['down']}
      onSwipeComplete={onClose}
      style={{ justifyContent: 'center', alignItems: 'center', margin: 0 }}
    >
      <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 20, width: screenWidth * 0.9 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: "#64b1bd", padding: 10, borderRadius: 15, backgroundColor: "#64b1bd", elevation: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: '#fff' }}>Order n°{order?.idOrder} - {order?.offer ? order.offer.title : order?.devis.title} </Text>
        </View>
        <Text style={{ fontSize: 17, color: 'black', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 5 }}>ORDER CONTACT</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
          <FontAwesomeIcon icon={faCalendarDay} size={20} style={{ marginRight: 10 }} color='#004651' />
          <Text style={{ fontSize: 15, color: 'black' }}>ORDERED AT: {order?.createdAt}</Text>
        </View>
        {/* Displaying payment status */}
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
          <FontAwesomeIcon icon={faHandHoldingDollar} size={20} style={{ marginRight: 5 }} color='#004651' />
          {order?.isPaid ? (
            <>
              <Text style={{ fontSize: 15, color: 'black', marginRight: 20 }}>PAID</Text>
              <FontAwesomeIcon icon={faMoneyBill1Wave} size={20} style={{ marginRight: 5 }} color='#004651' />
              <Text style={{ fontSize: 15, color: 'black' }}>ALREADY PAID: {order?.price} MAD</Text>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 15, color: 'black', marginRight: 20 }}>NOT PAID</Text>
              <FontAwesomeIcon icon={faMoneyBill1Wave} size={20} style={{ marginRight: 5 }} color='#004651' />
              <Text style={{ fontSize: 15, color: 'black' }}>SHOULD PAY: {order?.price} MAD</Text>
            </>
          )}
        </View>
        {/* Line break */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#a2a7a8', margin: 10 }} />
        {/* Displaying sportif user contact */}
        <Text style={{ fontSize: 17, color: 'black', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>SPORTIF USER CONTACT</Text>
        <View style={{ padding: 8, borderWidth: 1, borderColor: '#f5f5f5', backgroundColor: "#f5f5f5", elevation: 10, margin: 10 }}>
          <Text style={{ fontSize: 15, color: 'black' }}>Name : {order?.sportifSession.name}</Text>
          <Text style={{ fontSize: 15, color: 'black' }}>Phone : {order?.sportifSession.phone}</Text>
        </View>
        {/* Line break */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#a2a7a8', margin: 10 }} />
        {/* Displaying track location */}
        <Text style={{ fontSize: 17, color: 'black', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>TRACK LOCATION</Text>
        <View style={{ height: 300 }}>
          <DeliveryMap pLocation={{ latitude: latitudeP, longitude: longitudeP }} sLocation={{ latitude: lat, longitude: long }} />

        </View>
        {/* Button to confirm delivery */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#64b1bd",
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderRadius: 5,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              elevation: 10
            }}
            onPress={() => doneDelivery(order)}
          >
            <FontAwesomeIcon icon={faCheckDouble} size={15} color="#fff" />
            <Text style={{ marginLeft: 5, color: 'white', fontSize: 17 }}>CONFIRM DELIVERY</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default TrackOrder;