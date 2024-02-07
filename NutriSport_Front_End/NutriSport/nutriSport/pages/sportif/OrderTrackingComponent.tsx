
import React, {  useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Image, Text,  Button, TouchableOpacity, Dimensions} from 'react-native';
import LottieView from 'lottie-react-native';
import { BottomSheetModal, BottomSheetScrollView, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheck, faKitchenSet, faMotorcycle } from "@fortawesome/free-solid-svg-icons";
import DeliveryMap from './../sportif/DeliveryMap';  

import RateOrder from './RateOrder';
import {getOrderByIdOrder,getDevisById,getOfferById} from './../../services/ApiService'
// import BottomSheet from '@gorhom/bottom-sheet';

import {
  connectSocket,
  disconnectSocket,
  subscribeToOrderStatusChanged,
  unsubscribeFromOrderStatusChanged,
} from '../../services/socketService';
import { ActivityIndicator } from 'react-native';
enum OrderStatus {
  PREPARATION ='Being Prepared',
  DELIVERY = 'Being Delivered',
  DELIVERED = 'Delivered',
  CLOSED = 'Closed'
}
const orderStatuses=[OrderStatus.PREPARATION, OrderStatus.DELIVERY, OrderStatus.DELIVERED];
const statusIcons = [faKitchenSet, faMotorcycle, faCheck]; 
const screenWidth = Dimensions.get('window').width;
const OrderTrackingComponent = ({ route, navigation }: { route: any; navigation: any }) => {
const [currentStatus, setCurrentStatus] = React.useState<OrderStatus>(OrderStatus.PREPARATION);
const [isModalVisible, setModalVisible] =   React.useState(false);
const[currentOrder, setCurrentOrder] =React.useState<Order | null>(null);
const[preparatorInfo, setPreparatorInfo] =React.useState<User | null>(null);
const[demandInfo, setDemandInfo] =React.useState<JSON | null>(null);
const[offerInfo, setOfferInfo] =React.useState<JSON | null>(null);
const[firstTime, setFirstTime] = React.useState(true);
const [preparatorCurrentLocation, setPreparatorCurrentLocation] = useState<{ latitude: number; longitude: number }>({ latitude: 0, longitude: 0 });
const [sportifCurrentLocation, setSportifCurrentLocation] = useState<{ latitude: number; longitude: number }>({ latitude: 0, longitude: 0 });
const [isLoading, setIsLoading] = useState(true);
// Function to close the modal and navigate to Orders screen
const closeModalAndNavigateToOrders = () => {
  setModalVisible(false); // Assuming setModalVisible is a state setter function
  navigation.navigate('Orders'); // Replace 'Orders' with the name of your Orders screen in the navigation stack
};

  // useEffect(() => {
  //   const orderId = route.params?.orderId; //   orderId is passed as a route parameter

  //   const getOrderDetails = async () => {
  //     try {
  //       const data = await getOrderByIdOrder(orderId);
  //    //   console.log(data);
  //       setCurrentOrder(data);
  //       setCurrentStatus(data?.orderStatus);
  
  //  //     console.log('currentOrder', currentOrder);

  //   if(data.devis && (demandInfo==null)){
  //         const demandData = await getDevisById(data.devis.idDevis);
  //         setDemandInfo(demandData);
  //       //  console.log('demandData', demandData);
  //       }
  //       if(data.offer && (offerInfo==null)){
  //         const offerData = await getOfferById(data.offer.idOffer);
  //         setOfferInfo(offerData);
  //     //    console.log('offerData', offerData);
  //       }
      
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     }
  //   };
  //   // Connect to the Socket.IO server
  //   connectSocket();

  //   // Subscribe to orderStatusChanged event
  //   subscribeToOrderStatusChanged((updatedOrder) => {
  //     console.log('Order updated :',updatedOrder.orderId ,'new status',updatedOrder.newStatus);
  //       if(updatedOrder.orderId==currentOrder?.idOrder ){
  //         console.log('Order current :',currentOrder?.idOrder ,'old status',currentStatus);
  //          // setCurrentOrder(updatedOrder);
  //           setCurrentStatus(updatedOrder.newStatus)
  //       }
  //   });

  //   // Call the function to fetch orders
  //  getOrderDetails();
   
  // }, [route.params?.orderId]); 
  useEffect(() => {
    const orderId = route.params?.orderId;
  
    const getOrderDetails = async () => {
      try {
        const data = await getOrderByIdOrder(orderId);
        
        setCurrentOrder(data);
        setCurrentStatus(data?.orderStatus);
  
        if (data.devis && demandInfo == null) {
          console.log("devis ")
          const demandData = await getDevisById(data.devis.idDevis);
          const latitude1 = demandData?.preparatorSession?.currentPosition?.coordinates[0];
          const longitude1 = demandData?.preparatorSession?.currentPosition?.coordinates[1];
          setPreparatorCurrentLocation({ latitude : latitude1, longitude : longitude1 });
          console.log("preparator"+latitude1+" "+longitude1);
          const latitude2 = data?.sportifSession?.currentPosition?.coordinates[0];
          const longitude2 = data?.sportifSession?.currentPosition?.coordinates[1];
          setSportifCurrentLocation({ latitude : latitude2, longitude: longitude2 });
          console.log("sportif"+latitude2+" "+longitude2);
          setDemandInfo(demandData);
        }
        if (data.offer && offerInfo == null) {
          console.log("offer  "+data.offer.idOffer)
          const offerData = await getOfferById(data.offer.idOffer);
          // Extract preparator location from the offerData
        const latitude1 = offerData?.preparatorSession?.currentPosition?.coordinates[0];
        const longitude1 = offerData?.preparatorSession?.currentPosition?.coordinates[1];
        setPreparatorCurrentLocation({ latitude : latitude1, longitude : longitude1 });
        console.log("preparator"+latitude1+" "+longitude1);

        const latitude2 = data?.sportifSession?.currentPosition?.coordinates[0];
        const longitude2 = data?.sportifSession?.currentPosition?.coordinates[1];
        setSportifCurrentLocation({ latitude : latitude2, longitude: longitude2 });
        console.log("sportif"+latitude2+" "+longitude2);
        setOfferInfo(offerData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    // Connect to the Socket.IO server
    connectSocket();
  
    // Subscribe to orderStatusChanged event
    subscribeToOrderStatusChanged((updatedOrder) => {
      console.log('Order updated:', updatedOrder.orderId, 'new status', updatedOrder.newStatus);
      // Use the callback form of setState to get the latest state
      setCurrentOrder((prevOrder) => {
        if (updatedOrder.orderId === prevOrder?.idOrder) {
          console.log('Order current:', prevOrder?.idOrder, 'old status', currentStatus);
          setCurrentStatus(updatedOrder.newStatus);
        }
        return prevOrder;
      });
    });
  
    // Call the function to fetch orders
    getOrderDetails();
  
    return () => {
      // Disconnect from the Socket.IO server
      disconnectSocket();
      // Unsubscribe from orderStatusChanged event
      unsubscribeFromOrderStatusChanged();
    };
  }, [route.params?.orderId, currentStatus]);
  
  
  const handleOpenModal = () => {
   
    //setSelectedOrderId(idOrder);
    setModalVisible(true);
  };
  const updateOrderStatus = (newStatus:any) => {
    if (newStatus=='Being Prepared')
      setCurrentStatus(OrderStatus.PREPARATION);
    if (newStatus=='Being Delivered')
      setCurrentStatus(OrderStatus.DELIVERY);
    if (newStatus=='Delivered')
      setCurrentStatus(OrderStatus.DELIVERED);
    if (newStatus=='Closed')
      setCurrentStatus(OrderStatus.CLOSED);

  };
    // ref
    // const bottomSheetRef = useRef<BottomSheet>(null);

    // variables
    const snapPoints = useMemo(() => ['6%','15%','25%', '50%','70%'], []);
 
  // Render content based on order status
  const renderContent = () => {
    switch (currentStatus) {
      case  OrderStatus.PREPARATION:
        return (
          <View style={styles.bodyContainer}>
            <Text style={styles.statusText}>Meal in Preparation</Text>
            {/* Use LottieView to display the animation */}
            <LottieView
              style={{ width: 200, height: 200 }}
              source={require('./../../images/lottie/cooking.json')} // Replace with your animation file
              autoPlay
              loop
            />
          </View>
        );
        case OrderStatus.DELIVERY:
          return (
            <View style={styles.bodyContainer}>
              <Text style={styles.statusText}>Your meal is on the way!</Text>
              {preparatorCurrentLocation.latitude !== 0 && preparatorCurrentLocation.longitude !== 0 &&
              sportifCurrentLocation.latitude !== 0 && sportifCurrentLocation.longitude !== 0 ? (
                <View style={{ height: 350, width: screenWidth * 0.95 }}>
                  <DeliveryMap pLocation={preparatorCurrentLocation} sLocation={sportifCurrentLocation} />
                </View>
              ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#004651" />
                </View>
              )}
            </View>
          );
      case OrderStatus.DELIVERED:
        return (
          <View style={styles.bodyContainer}>
            <Text style={styles.statusText}>Your meal has been delivered!</Text>
            <LottieView
              style={{ width: 200, height: 200 }}
              source={require('./../../images/lottie/successful-food-delivery.json')} // Replace with your animation file
              autoPlay
              loop
            />
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={async () => {
                // Handle confirmation action
                // or perform any other action
                await handleOpenModal();
                //navigation.navigate('ConfirmationScreen');
              }}
            >
              <Text style={styles.confirmButtonText}>Confirm Delivery</Text>
            </TouchableOpacity>
            <RateOrder orderId={currentOrder.idOrder} isVisible={isModalVisible} onClose={closeModalAndNavigateToOrders} navigation={undefined} />
          </View>
        );
      default:
        return null;
    }
  };

  // Render circles with icons
  const renderCircles = () => {
    const totalStatuses = orderStatuses.length;
    return (
      <View style={styles.circlesContainer}>
        {orderStatuses.map((status, index) => (
          <React.Fragment key={index}>
            {index >= 0 && (
              <View style={[styles.line, { height: calculateLineHeight(index) }]} />
            )}
            <View style={styles.circleContainer}>
              <View style={[styles.circle, {
                backgroundColor: index <= orderStatuses.indexOf(currentStatus)
                  ? '#004651' 
                  : 'white',
                  borderColor: index <= orderStatuses.indexOf(currentStatus)
                  ? 'white'
                  : '#004651' ,
              }]}>
                <FontAwesomeIcon
                  icon={statusIcons[index]}
                  size={20}
                  color={index <= orderStatuses.indexOf(currentStatus) ? 'white' : '#004651'}
                />
              </View>
            </View>
          </React.Fragment>
        ))}
        <View style={[styles.line, { height: calculateLineHeight(totalStatuses) }]} />
      </View>
    );
  };
  // Render details based on order status 
  const renderDetails= () => {
    switch (currentStatus) {
      case OrderStatus.PREPARATION:
        return (
          <View style={{marginTop:10,width:'100%' }}>
            <Text style={{  fontSize: 18, fontWeight: 'bold', marginTop: 10, textAlign: 'center' ,color:'#004651'}}> Preparation Details:</Text>
            {/* <Text style={styles.statusText}>   order number: {currentOrder?.idOrder}</Text> */}
            {currentOrder?.devis?.idDevis && (
              <View style={{marginLeft:10,width:'100%' }}>
                <Text style={styles.statusText}> your demand :</Text>
                <View style={{width:'100%' ,marginLeft:20}}>
                  <View style={{width:'100%',flexDirection: 'row' }}>
                    <Text style={styles.statusText}>title :  </Text> 
                    <Text style={styles.infoText}> {demandInfo?.demand.title}</Text> 
                  </View>
                  <View style={{width:'100%',flexDirection: 'row' }}>
                    <Text style={styles.statusText}>mealType : </Text>
                    <Text style={styles.infoText}> {demandInfo?.demand.mealType}</Text>
                  </View>
                  <View style={{width:'100%' ,}}>
                    <Text style={styles.statusText}>description : </Text>
                    <Text style={styles.descText}> {demandInfo?.demand.description}</Text>
                    </View>
                    <View style={{flexDirection :'row',width:'100%' }}>
                      <View style={{width:"50%",flexDirection: 'row' }}>
                        <Text style={{ fontSize: 18,marginTop: 10 ,fontWeight:'bold',color:'#004651' }}>carbohydrates:</Text>
                        <Text style={{ fontSize: 18,marginTop: 10 ,color:'#000'  }}> {demandInfo?.demand.carbohydratesValue} </Text>
                      </View>
                      <View style={{width:"50%",flexDirection: 'row' }}>
                        <Text style={{ fontSize: 18,marginTop: 10 ,fontWeight:'bold',color:'#004651' }}>protein: </Text>
                        <Text style={{ fontSize: 18,marginTop: 10 ,color:'#000'  }}> {demandInfo?.demand.proteinValue} </Text>
                      </View>
                    </View>
                    <View style={{flexDirection :'row',width:'100%' }}>
                      <View style={{width:"50%",flexDirection: 'row' }}>
                        <Text style={{ fontSize: 18,marginTop: 10 ,fontWeight:'bold',color:'#004651' }}>fats: </Text>
                        <Text style={{ fontSize: 18,marginTop: 10 ,color:'#000'  }}> {demandInfo?.demand.fatsValue} </Text>
                      </View>
                      <View style={{width:"50%",flexDirection: 'row' }}>
                        <Text style={{ fontSize: 18,marginTop: 10 ,fontWeight:'bold',color:'#004651' }}>caloric: </Text>
                        <Text style={{ fontSize: 18,marginTop: 10 ,color:'#000'  }}> {demandInfo?.demand.caloricValue} </Text>
                      </View>
                    </View>

                    </View>
              </View>
            )}
             {currentOrder?.offer?.idOffer && (
               <View style={{marginLeft:10,width:'100%' }}>
               <Text style={styles.statusText}> Offer :</Text>
               <View style={{marginLeft:20,width:'100%' }}>
                 <View style={{width:'100%',flexDirection: 'row' }}>
                   <Text style={styles.statusText}>title :  </Text> 
                   <Text style={styles.infoText}> {offerInfo?.title}</Text> 
                 </View>
                 <View style={{width:'100%',flexDirection: 'row' }}>
                   <Text style={styles.statusText}>mealType : </Text>
                   <Text style={styles.infoText}> {offerInfo?.mealType}</Text>
                 </View>
                 <View style={{width:'100%',flexDirection: 'row' }}>
                   <Text style={styles.statusText}>description : </Text>
                   <Text style={styles.descText}> {offerInfo?.description}</Text>
                   </View>
                   <View style={{flexDirection :'row',width:'100%' }}>
                     <View style={{width:"50%",flexDirection: 'row' }}>
                       <Text style={{ fontSize: 18,marginTop: 10 ,fontWeight:'bold',color:'#004651' }}>carbohydrates:</Text>
                       <Text style={{ fontSize: 18,marginTop: 10 ,color:'#000' ,fontWeight:'bold' }}> {offerInfo?.carbohydratesValue} g</Text>
                     </View>
                     <View style={{width:"50%",flexDirection: 'row' }}>
                       <Text style={{ fontSize: 18,marginTop: 10 ,fontWeight:'bold',color:'#004651' }}>protein: </Text>
                       <Text style={{ fontSize: 18,marginTop: 10 ,color:'#000',fontWeight:'bold'  }}> {offerInfo?.proteinValue} g</Text>
                     </View>
                   </View>
                   <View style={{flexDirection :'row',width:'100%' }}>
                     <View style={{width:"50%",flexDirection: 'row' }}>
                       <Text style={{ fontSize: 18,marginTop: 10 ,fontWeight:'bold',color:'#004651' }}>fats: </Text>
                       <Text style={{ fontSize: 18,marginTop: 10 ,color:'#000' ,fontWeight:'bold' }}> {offerInfo?.fatsValue} g</Text>
                     </View>
                     <View style={{width:"50%",flexDirection: 'row' }}>
                       <Text style={{ fontSize: 18,marginTop: 10 ,fontWeight:'bold',color:'#004651' }}>caloric: </Text>
                       <Text style={{ fontSize: 18,marginTop: 10 ,color:'#000' ,fontWeight:'bold' }}> {offerInfo?.caloricValue} cal</Text>
                     </View>
                   </View>

                   </View>
             </View>

            )}
          </View>
        );
      case OrderStatus.DELIVERY:
        return (
          <View style={{marginTop:10,width:'100%' }}>
            <Text style={{  fontSize: 18, fontWeight: 'bold', marginTop: 10, textAlign: 'center' ,color:'#004651'}}> Delivery Details:</Text>
            {/* <Text style={styles.statusText}>   order number: {currentOrder?.idOrder}</Text> */}
            {currentOrder?.devis?.idDevis && (
              <View style={{marginLeft:10,width:'100%' }}>
                <View style={{flexDirection :'row',marginLeft:20,width:'90%', alignItems:'center' }}>
                  <Text style={styles.statusText}> Preparator :</Text>
                  <Text style={{fontSize: 17,fontWeight:'bold',marginTop: 10,color:'black'}}> {demandInfo?.preparatorSession?.prenom}</Text>
                </View>
                {/* //if paied show PAIED if not show price to pay */}
                <View style={{flexDirection :'row',marginLeft:20,width:'90%', alignItems:'center' }}>
                  
                  <Text style={styles.statusText}>
                    {currentOrder?.isPaid ? ` Already Paid      ${demandInfo?.proposed_price} DH` : ` Not Paid     ${demandInfo?.proposed_price} DH`}
                  </Text>                
              </View>
              </View>
            )}
             {currentOrder?.offer?.idOffer && (
             <View style={{marginLeft:10,width:'100%' }}>
                
                <View style={{flexDirection :'row',marginLeft:20,width:'90%', alignItems:'center' }}>
                <Text style={styles.statusText}> Preparator :</Text>
                  <Text style={{fontSize: 15,fontWeight:'bold',marginTop: 10,color:'black'}}> {offerInfo?.preparatorSession?.prenom}</Text>
                </View>
                {/* //if paied show PAIED if not show price to pay */}
                <View style={{flexDirection :'row',marginLeft:20,width:'90%', alignItems:'center' }}>
                <Text style={styles.statusText}>
                  {currentOrder?.isPaid ? ` Already Paid       ${offerInfo?.price} DH` : ` Not Paid       ${offerInfo?.price} DH`}
              </Text>
              </View>

              </View>
              
            )}
          </View>
        );
      case  OrderStatus.DELIVERED:
        return (
          <View style={styles.bodyContainer}>
            <Text style={styles.statusText}>Your meal has been delivered!</Text>
            
          </View>
        );
      default:
        return null;
    }
  };
  // Function to calculate line height dynamically
  const calculateLineHeight = (index: number) => {
    const defaultHeight = 1.5;
    const increaseHeight = 2; // Adjust the height increase
  
    // Calculate dynamic height based on the position relative to the current status
    const dynamicHeight = index <= orderStatuses.indexOf(currentStatus)
      ? defaultHeight+ increaseHeight
      : defaultHeight ;
  
    // If it's the last line and the current status is at the end, adjust the height
    if (index === orderStatuses.length && index === orderStatuses.indexOf(currentStatus)+1) {
      return defaultHeight + increaseHeight;
    }

    return dynamicHeight;
    };
  
  
  return (
    <View style={styles.page}>
      <View style={styles.container1}>
          <Image style={styles.image} resizeMode="cover" source={require('./../../images/nutrisport.jpg')} />
      </View>
      <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center',marginBottom:5 }}>
          <Text style={styles.textPost}>Track your order</Text>
      </View>
      <View style={styles.circlesContainer}>
          {renderCircles()}
      </View>
      <View>       
          {renderContent()}
      </View>    
      {/* <View style={{ borderBottomColor: '#004651',borderStyle:'dashed', borderBottomWidth: StyleSheet.hairlineWidth,borderCurve:'circular',borderWidth:1} }></View> */}
      <View style={styles.contentContainer}>
        
            
           {renderDetails()}
         </View> 
    </View> 
    );
  };
const styles = StyleSheet.create({

  contentContainer: { flex: 1,alignItems: 'center',},
  circlesContainer: {flexDirection: 'row', alignItems: 'center', marginBottom:5, marginTop:10  },
  circleContainer: {flexDirection: 'row',alignItems: 'center',position: 'relative',  },
  circle: {width: 40,height: 40,borderRadius: 20,justifyContent: 'center',alignItems: 'center', borderWidth: 3,borderColor: '#004651',  },
  line: { flex: 1,height: 2,backgroundColor: '#004651', position: 'relative',},
  page: { backgroundColor: "#fff", overflow: "hidden", width: "100%", marginBottom: 10, height: "100%", flex: 1, },
  container1: {flexDirection: 'row',justifyContent: 'center', alignItems: 'center', marginBottom: 10, marginTop: 25 },
  image: { width: 200, height: 45, borderRadius: 12.5, alignSelf: 'center'},
  bodyContainer: { alignItems: 'center', },
  statusText: {fontSize: 18,fontWeight: 'bold', marginTop: 10,textAlign: 'left', color:'#004651' },
  infoText: {fontSize: 18,  marginTop: 10, textAlign: 'left', color:'black',fontWeight:'bold' },
  descText: {fontSize: 18,  marginTop: 40,  textAlign: 'left', color:'black',fontWeight:'bold',marginLeft: -130, width:"90%"},
  confirmButton: { marginTop: 20, backgroundColor: '#004651', padding: 10,borderRadius: 5 },
  confirmButtonText: {color: '#fff', fontWeight: 'bold',textAlign: 'center' },
  textPost:{ fontSize: 20, fontWeight: "100",fontFamily: "Poppins-Light", color: "#000", textAlign: "left",},

});

export default OrderTrackingComponent;
