import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions,ScrollView } from 'react-native';
import NavigationBar from '../../components/NavigationBar-s';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { IconDefinition, faMapLocationDot, faStar } from '@fortawesome/free-solid-svg-icons';
import { fetchOrders } from '../../services/ApiService';
import RateOrder from './RateOrder';

import {
  connectSocket,
  disconnectSocket,
  subscribeToOrderStatusChanged,
  unsubscribeFromOrderStatusChanged,
} from '../../services/socketService';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;
const screenHeight= Dimensions.get('window').height;

const OrdersPage  = ({ navigation }: { navigation: any }) => {
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<any>();
  const handleOpenModal = (idOrder : number) => {
    console.log('Modal opened for orderId:', idOrder);
    setSelectedOrderId(idOrder);
    setModalVisible(true);
  };
  useEffect(() => {
    const getOrders = async () => {
      try {
        const data = await fetchOrders();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    // Connect to the Socket.IO server
    connectSocket();

    // Subscribe to orderStatusChanged event
    subscribeToOrderStatusChanged((updatedOrder) => {
      setOrders((prevOrders) => {
        const updatedOrders = prevOrders.map((order) =>
          order.idOrder === updatedOrder.orderId ? { ...order, orderStatus: updatedOrder.newStatus } : order
        );
        return updatedOrders;
      });
    });

    // Call the function to fetch orders
    getOrders();
    // Cleanup function to disconnect from the Socket.IO server when the component unmounts
    return () => {
      // Disconnect from the Socket.IO server
      disconnectSocket();
      // Unsubscribe from orderStatusChanged event
      unsubscribeFromOrderStatusChanged();
    };
  }, []); 
  // useFocusEffect to refetch orders when component regains focus
  useFocusEffect(
    React.useCallback(() => {
      const refreshOrders = async () => {
        try {
          const data = await fetchOrders();
          setOrders(data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      refreshOrders();

      return () => {
        // Cleanup function if needed
      };
    }, [])
  );
  // Function to map status to color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Being Prepared':
        return '#004651';
      case 'Being Delivered':
        return '#004651';
      case 'Delivered':
        return '#2C965B';
      case 'Closed':
        return '#797979';
      default:
        return '#000';
    }
  };

  // Function to map status to button
  const getButtonText = (status: string) => {
    switch (status) {
      case 'Being Prepared':
        return 'Track';
      case 'Being Delivered':
        return 'Track';
      case 'Delivered':
        return 'Rate';
      default:
        return '';
    }
  };
  // Function to map status to icon
  const getIcon = (status: string) :IconDefinition => {
    switch (status) {
      case 'Being Prepared':
        return faMapLocationDot;
      case 'Being Delivered':
        return faMapLocationDot;
      case 'Delivered':
        return faStar;
      default:
        return faStar;
    }
  };
  // Function to sort orders based on status
  const sortOrders = (a: { orderStatus: string; }, b: { orderStatus: string; }) => {
    // Define the priority order of statuses
    const priorityOrder = ['Being Prepared', 'Being Delivered', 'Delivered', 'Closed'];

    // Get the index of each status in the priority order
    const statusAIndex = priorityOrder.indexOf(a.orderStatus);
    const statusBIndex = priorityOrder.indexOf(b.orderStatus);

    // Compare the statuses based on their index in the priority order
    return statusAIndex - statusBIndex;
  };

  // Sort orders based on status
  const sortedOrders = orders.sort(sortOrders);
  
  const formattedOrders = sortedOrders.map((order) => {
    const formattedDate = new Date(order.createdAt);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDateString = formattedDate.toLocaleDateString('en-US', options);
    // Truncate the description if it exceeds the maximum length
    // order.description="hi desc";
    // const truncatedDescription = order.description.length > 100
    // ? `${order.description.slice(0, 100)}...`
    // : order.description;
    let desc = "Order based on ";
    let price;
    if(order.offer === null){
      desc+=" devis n°"+order.devis.idDevis;
      price=order.devis.proposed_price;
    }
    else{
      desc+=" offer n°"+order.offer.idOffer+" : "+order.offer.title+"\n";
      price = order.offer.price;
    }
    return {
      ...order,
      createdAt: formattedDateString,
      description: desc,
      price:price,
    };
  });

  return (
    <View style={{ flex: 1, padding: 16 , backgroundColor:'white'}}>
        {/* Top Bar with Logo */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Image source={require('../../images/nutrisport.png')} style={{ width: 200, height: 45, borderRadius: 12.5, alignSelf: 'center' }}/>
      </View>

      {orders.length == 0 && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Image source={require('../../images/noOrdersYet.png')} style={{ width: 200, height: 200 }} />
        </View>
      )} 
      {orders.length != 0 && (
        <>
        {/* Page title */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{fontSize: 24,fontWeight: 'bold',marginVertical: 12, color:'#004651',justifyContent: 'center',}}>ORDERS</Text>
        </View>

        {/* Orders List */}
        <View style={{ flex: 1, width: '100%' }}>
          <ScrollView contentContainerStyle={{paddingBottom: 50 }}>
            {formattedOrders.map((order) => ( 
                <TouchableOpacity key={order.idOrder} style={{flexDirection: 'row',alignItems: 'center',borderWidth:2,borderColor:getStatusColor(order.orderStatus),borderRadius:10,marginBottom: 10,height:120}}>
                  <View style={{width: 15,height: '100%',backgroundColor:getStatusColor(order.orderStatus),borderWidth:5,borderColor:getStatusColor(order.orderStatus),borderRadius:20,}} />
                  <View style={{ marginLeft: 8, flex: 3 }}>
                    <View style={{flex: 1}}>
                      <Text style={{ fontSize: 18,fontWeight: 'bold',marginBottom: 5,color:'#000'}}>Orders n°{order.idOrder}</Text>
                      <Text style={{fontSize: 14,color: 'gray',}}>{order.description}</Text>
                      <Text style={{fontSize: 15,color: 'gray',}}>{order.createdAt}</Text>
                    </View>
                  </View>
                  <View style={{flex: 1,height:'80%',flexDirection: 'column',alignItems:'center',justifyContent:'space-between',marginLeft:5, marginBottom:0,marginTop:0}}>
                      <Text style={{fontSize: 15,fontWeight: 'bold',color:'#000'}}>{order.price} MAD</Text>
                      {order.orderStatus !== 'Closed' && (
                        <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: getStatusColor(order.orderStatus),
                          paddingVertical: 5,
                          paddingHorizontal: 10,
                          borderRadius: 5,
                        }}
                        onPress={     
                        //   getButtonText(order.orderStatus) === 'Rate'
                        //     ? () => handleOpenModal(order.idOrder)
                        //     : undefined
                        () => {
                          if (getButtonText(order.orderStatus) === 'Track') { 
                            navigation.navigate('OrderTrackingComponent', { orderId: order.idOrder });
                          } else if (getButtonText(order.orderStatus) === 'Rate') {
                            handleOpenModal(order.idOrder);
                          }
                        }

                        }
                      >
                        <FontAwesomeIcon icon={getIcon(order.orderStatus)} size={15} color="#fff" />
                        <Text style={{ paddingLeft: 5, color: 'white', fontWeight: 'bold' }}>
                          {getButtonText(order.orderStatus)}
                        </Text>
                      </TouchableOpacity>
                      
                      )}
                    </View>
                    
                </TouchableOpacity>
            ))}
          </ScrollView>
          <RateOrder orderId={selectedOrderId} isVisible={isModalVisible} onClose={() => setModalVisible(false)} navigation={undefined} />
        </View>
        </>
      )}         

      {/* Navigation Bar */}
      <NavigationBar screenWidth={screenWidth} /> 
    </View>
  );
};

export default OrdersPage;
