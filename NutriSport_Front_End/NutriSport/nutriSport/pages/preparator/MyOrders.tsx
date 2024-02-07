// import React, { useEffect, useState } from 'react';
// import { View, Text, TouchableOpacity, Image, Dimensions,ScrollView } from 'react-native';
// import NavigationBar from '../../components/NavigationBar-p';
// import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
// import { IconDefinition, faArchive, faCheckDouble, faHandHoldingDollar, faHourglass, faMapLocationDot, faMotorcycle, faStar, faUtensils, faWalking } from '@fortawesome/free-solid-svg-icons';
// import { fetchOrders, fetchOrdersOfPreparator, setOrderStatus } from '../../services/ApiService';
// import {
//   connectSocket,
//   disconnectSocket,
//   subscribeToOrderPaymentChanged,
//   subscribeToOrderStatusChanged,
//   unsubscribeFromOrderPaymentChanged,
//   unsubscribeFromOrderStatusChanged,
// } from '../../services/socketService';
// import RateOrder from '../sportif/RateOrder';
// import TrackOrder from './TrackOrder';

// const screenWidth = Dimensions.get('window').width;
// const screenHeight= Dimensions.get('window').height;

// const OrdersPage: React.FC = () => {
  
//   const [orders, setOrders] = useState<Order[]>([]);
//   //const [selectedOrderId, setSelectedOrderId] = useState<any>();
//   const [isModalVisible, setModalVisible] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState<Order>();
//   const handleOpenModal = (order : Order) => {
//     console.log('Modal opened for orderId:', order.idOrder);
//     setSelectedOrder(order);
//     setModalVisible(true);
//   };
//   useEffect(() => {
//     const getOrders = async () => {
//       try {
//         const data = await fetchOrdersOfPreparator();
//         setOrders(data);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//     };
//     // Connect to the Socket.IO server
//     connectSocket();

//     // Subscribe to orderStatusChanged event
//     subscribeToOrderStatusChanged((updatedOrder) => {
//       setOrders((prevOrders) => {
//         const updatedOrders = prevOrders.map((order) =>
//           order.idOrder === updatedOrder.orderId ? { ...order, orderStatus: updatedOrder.newStatus } : order
//         );
//         return updatedOrders;
//       });
//     });

    
//     // Subscribe to orderPaymentChanged event
//     subscribeToOrderPaymentChanged((updatedOrder) => {
//       setOrders((prevOrders) => {
//         const updatedOrders = prevOrders.map((order) =>
//           order.idOrder === updatedOrder.orderId ? { ...order, isPaid: true } : order
//         );
//         return updatedOrders;
//       });
//     });

//     // Call the function to fetch orders
//     getOrders();
//     // Cleanup function to disconnect from the Socket.IO server when the component unmounts
//     return () => {
//       // Disconnect from the Socket.IO server
//       disconnectSocket();
//       // Unsubscribe from orderStatusChanged event
//       unsubscribeFromOrderStatusChanged();
//       // Unsubscribe from orderPaymentChanged event
//       unsubscribeFromOrderPaymentChanged();

//     };
//   }, []); 

//   // Function to map status to color
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'Being Prepared':
//         return '#64b1bd';
//       case 'Being Delivered':
//         return '#004651';
//       case 'Delivered':
//         return '#46818a';
//       case 'Closed':
//         return '#797979';
//       default:
//         return '#000';
//     }
//   };

//   // Function to map status to button
//   const getButtonText = (order:Order) => {
//     switch (order.orderStatus) {
//       case 'Being Prepared':
//         return 'Done Preparing';
//       case 'Being Delivered':
//         if(order.offer.isDeliverable)  return 'See Details';
//         else return 'Waiting for Pick Up'
//       case 'Delivered':
//         if(order.offer.isDeliverable)  return 'Order Done';
//         else return 'Meal Picked Up'
//       case 'Closed':
//       return 'Closed'
//       default:
//         return '';
//     }
//   };
//   // Function to map status to icon
//   const getIcon = (order:Order) :IconDefinition => {
//     switch (order.orderStatus) {
//       case 'Being Prepared':
//         return faUtensils;
//       case 'Being Delivered':
//         if(order.offer.isDeliverable) return faMapLocationDot;
//         else return faHourglass;
//       case 'Delivered':
//         if(order.offer.isDeliverable) return faStar;
//         else return faCheckDouble;
//       default:
//         return faArchive;
//     }
//   };
//   // Function to sort orders based on status
//   const sortOrders = (a: { orderStatus: string; }, b: { orderStatus: string; }) => {
//     // Define the priority order of statuses
//     const priorityOrder = ['Being Prepared', 'Being Delivered', 'Delivered', 'Closed'];

//     // Get the index of each status in the priority order
//     const statusAIndex = priorityOrder.indexOf(a.orderStatus);
//     const statusBIndex = priorityOrder.indexOf(b.orderStatus);

//     // Compare the statuses based on their index in the priority order
//     return statusAIndex - statusBIndex;
//   };

//   // Sort orders based on status
//   //const sortedOrders = orders.sort(sortOrders);
  
//   const formattedOrders = orders.map((order) => {
//     const formattedDate = new Date(order.createdAt);
//     const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
//     const formattedDateString = formattedDate.toLocaleDateString('en-US', options);
//     // Truncate the description if it exceeds the maximum length
//     // order.description="hi desc";
//     // const truncatedDescription = order.description.length > 100
//     // ? `${order.description.slice(0, 100)}...`
//     // : order.description;
//     let desc = "Order based on ";
//     let price;
//       price = order.offer.price;
     
      
//     return {
//       ...order,
//       createdAt: formattedDateString,
//       price:price,
//     };
//   });

//     async function donePreparingMeal(order: Order): Promise<void> {
//        console.log("clicked for id : ", order.idOrder);
//        await setOrderStatus(order.idOrder, 'delivery');
//     }

//     async function mealPickedUp(order: Order) {
//         console.log("clicked for id : ", order.idOrder);
//         await setOrderStatus(order.idOrder, 'delivered');
//     }

//   return (
//     <View style={{ flex: 1, padding: 16 , backgroundColor:'white'}}>
//         {/* Top Bar with Logo */}
//       <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
//         <Image source={require('../../images/nutrisport.png')} style={{ width: 200, height: 45, borderRadius: 12.5, alignSelf: 'center' }}/>
//       </View>

//       {orders.length == 0 && (
//         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//           <Image source={require('../../images/noOrdersYet.png')} style={{ width: 200, height: 200 }} />
//         </View>
//       )} 
//       {orders.length != 0 && (
//         <>
//         {/* Page title */}
//         <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
//           <Text style={{fontSize: 24,fontWeight: 'bold',marginVertical: 12, color:'#004651',justifyContent: 'center',}}>NEW ORDERS</Text>
//         </View>

//         {/* Orders List */}
//         <View style={{ flex: 1, width: '100%' }}>
//   <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
//     {formattedOrders.map((order) => (
//       <TouchableOpacity key={order.idOrder} style={{ marginBottom: 10 , borderWidth: 0.5, borderColor: getStatusColor(order.orderStatus), borderRadius: 10, padding: 10 }}>
//         {/* First row */}
//         <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
//           {/* First column */}
//           <View style={{ flex: 1 }}>
//             <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: '#000' }}>Order n°{order.idOrder} - {order.offer.title} (x1)</Text>
//             <Text style={{ fontSize: 15, color: 'gray' }}>Ordered at: {order.createdAt}</Text>
//             <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                 <Text style={{ fontSize: 15, color: 'gray' }}>Order for: Sportif X</Text>
//             </View>
//             <View style={{ flexDirection: 'row', alignItems: 'center'}}>
//             {order.offer.isDeliverable ? (
//             <>
//                 <FontAwesomeIcon icon={faMotorcycle} size={20} style={{ marginRight: 5 }} color='#072103' />
//                 <Text style={{ fontSize: 17, color: 'gray' }}>To Deliver</Text>
//             </>
//             ) : (
//             <>
//                 <FontAwesomeIcon icon={faWalking} size={20} style={{ marginRight: 5 }} color='#072103' />
//                 <Text style={{ fontSize: 17, color: 'gray' }}>Pick Up</Text>
//             </>
//             )}
//           </View>
//           </View>
//           {/* Second column */}
//           <View style={{flexDirection: 'row', // Ensure icon and text are in the same line
//             alignItems: 'center', // Align items in the center vertically
//             justifyContent: 'center'}}>
//             <FontAwesomeIcon icon={faHandHoldingDollar} size={20} style={{ marginRight: 5 }} color='#072103' />
//             {order.isPaid ? (
//               <Text style={{ fontSize: 17, color: 'gray' }}>PAID</Text>
//             ) : (
//               <Text style={{ fontSize: 17, color: 'gray' }}>NOT PAID</Text>
//             )}
//           </View>
//         </View>

//         {/* Second row */}
        
//         <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
//         <TouchableOpacity
//             style={{
//             backgroundColor: getStatusColor(order.orderStatus),
//             paddingVertical: 5,
//             paddingHorizontal: 10,
//             borderRadius: 5,
//             flexDirection: 'row', // Ensure icon and text are in the same line
//             alignItems: 'center', // Align items in the center vertically
//             justifyContent: 'center', // Center content horizontally
//             elevation:10
//             }}
//             onPress={() => {
//                 if (getButtonText(order) === 'Done Preparing') {
//                   donePreparingMeal(order);
//                 } else if (getButtonText(order) === 'Waiting for Pick Up') {
//                   mealPickedUp(order);
//                 } else if(getButtonText(order) === 'See Details'){
//                   handleOpenModal(order);
//                 }
//               }}
//             >
//             <FontAwesomeIcon icon={getIcon(order)} size={15} color="#fff" />
//             <Text style={{ marginLeft: 5, color: 'white', fontWeight: 'bold' }}>{getButtonText(order)}</Text>

//         </TouchableOpacity>
//         </View>

//       </TouchableOpacity>
//     ))}
//   </ScrollView>
//   <TrackOrder order={selectedOrder} isVisible={isModalVisible}  sportifLocationL={selectedOrder?.sportifSession.currentPosition.coordinates[0]} sportifLocationLL={selectedOrder?.sportifSession.currentPosition.coordinates[1]} onClose={() => setModalVisible(false)} navigation={undefined}></TrackOrder>
// </View>








//         </>
//       )}         

//       {/* Navigation Bar */}
//       <NavigationBar screenWidth={screenWidth} /> 
//     </View>
//   );
// };

// export default OrdersPage;
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions,ScrollView } from 'react-native';
import NavigationBar from '../../components/NavigationBar-p';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { IconDefinition, faArchive, faCheckDouble, faHandHoldingDollar, faHourglass, faMapLocationDot, faMotorcycle, faStar, faUtensils, faWalking } from '@fortawesome/free-solid-svg-icons';
import { fetchOrders, fetchOrdersOfPreparator, setOrderStatus } from '../../services/ApiService';
import {
  connectSocket,
  disconnectSocket,
  subscribeToNewOrderSavedOnOffer,
  subscribeToOrderPaymentChanged,
  subscribeToOrderStatusChanged,
  unsubscribeFromNewOrderSavedOnOffer,
  unsubscribeFromOrderPaymentChanged,
  unsubscribeFromOrderStatusChanged,
} from '../../services/socketService';
import RateOrder from '../sportif/RateOrder';
import TrackOrder from './TrackOrder';

const screenWidth = Dimensions.get('window').width;
const screenHeight= Dimensions.get('window').height;

const OrdersPage: React.FC = () => {
  
  const [orders, setOrders] = useState<Order[]>([]);
  //const [selectedOrderId, setSelectedOrderId] = useState<any>();
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order>();
  
  const handleOpenModal = (order : Order) => {
    console.log('Modal opened for orderId:', order.idOrder);
    setSelectedOrder(order);
    setModalVisible(true);
  };
  useEffect(() => {
    const getOrders = async () => {
      try {
        const data = await fetchOrdersOfPreparator();
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

    
    // Subscribe to orderPaymentChanged event
    subscribeToOrderPaymentChanged((updatedOrder) => {
      setOrders((prevOrders) => {
        const updatedOrders = prevOrders.map((order) =>
          order.idOrder === updatedOrder.orderId ? { ...order, isPaid: true } : order
        );
        return updatedOrders;
      });
    });
    const handleNewOrder = async ({ newOrder }: { newOrder: any }) => {
      try {
        // Check if the order already exists in the orders state
        const orderExists = orders.some((order) => order.idOrder === newOrder.idOrder);
        if (!orderExists) {
          // Update price and delivery information based on whether it's from an offer or a demand
          let price;
          let title;
          let deliv;
    
          if (newOrder.offer) {
            price = newOrder.offer.price;
            title = newOrder.offer.title;
            deliv = newOrder.offer.isDeliverable ? 'Delivery' : 'Pick Up';
          } else {
            price = newOrder.devis.proposed_price;
            title = newOrder.devis.title;
            deliv = 'Delivery'; // Assuming delivery for a demand
          }
    
          // Update the order with new price and delivery information
          const updatedOrder = {
            ...newOrder,
            price: price,
            title: title,
            deliv: deliv
          };
    
          // Update state with the updated order
          setOrders((prevOrders) => [...prevOrders, updatedOrder]);
        }
      } catch (error) {
        console.error('Error handling new order:', error);
      }
    };
    

    // Subscribe to newDevisForDemand event
    subscribeToNewOrderSavedOnOffer(handleNewOrder);

    // Call the function to fetch orders
    getOrders();
    // Cleanup function to disconnect from the Socket.IO server when the component unmounts
    return () => {
      // Disconnect from the Socket.IO server
      disconnectSocket();
      // Unsubscribe from orderStatusChanged event
      unsubscribeFromOrderStatusChanged();
      // Unsubscribe from orderPaymentChanged event
      unsubscribeFromOrderPaymentChanged();

      unsubscribeFromNewOrderSavedOnOffer();


    };
  }, []); 

  // Function to map status to color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Being Prepared':
        return '#64b1bd';
      case 'Being Delivered':
        return '#004651';
      case 'Delivered':
        return '#46818a';
      case 'Closed':
        return '#797979';
      default:
        return '#000';
    }
  };


 // Function to map status to button
 const getButtonText = (order:Order) => {
  switch (order.orderStatus) {
    case 'Being Prepared':
      return 'Done Preparing';
    case 'Being Delivered':
      if((order.offer?.isDeliverable) || (order.devis)){
        return 'See Details';
      }
      else return 'Waiting for Pick Up'
    case 'Delivered':
      if((order.offer?.isDeliverable) || (order.devis)){
        return 'Order Done';
      }
      else return 'Meal Picked Up'
    case 'Closed':
    return 'Closed'
    default:
      return '';
  }
};
// Function to map status to icon
const getIcon = (order:Order) :IconDefinition => {
  switch (order.orderStatus) {
    case 'Being Prepared':
      return faUtensils;
    case 'Being Delivered':
      if((order.offer?.isDeliverable) || (order.devis)){
        return faMapLocationDot;
      }
      else return faHourglass;
    case 'Delivered':
      if((order.offer?.isDeliverable) || (order.devis)){
        return faStar;
      }
      else return faCheckDouble;
    default:
      return faArchive;
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
  //const sortedOrders = orders.sort(sortOrders);
  
  const formattedOrders = orders.map((order) => {
    const formattedDate = new Date(order.createdAt);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDateString = formattedDate.toLocaleDateString('en-US', options);

    let price, title, deliv;
    if(order.offer){
      price = order.offer.price;
      title = order.offer.title;
      if(order.offer.isDeliverable) deliv='Delivery'
      else deliv='Pick Up'
    }else{
      price = order.devis.proposed_price;
      title = order.devis.title;
      deliv='Delivery'
    }

    return {
      ...order,
      createdAt: formattedDateString,
      price:price,
      title:title,
      deliv:deliv
    };
  });

    async function donePreparingMeal(order: Order): Promise<void> {
       console.log("clicked for id : ", order.idOrder);
       await setOrderStatus(order.idOrder, 'delivery');
    }

    async function mealPickedUp(order: Order) {
        console.log("clicked for id : ", order.idOrder);
        await setOrderStatus(order.idOrder, 'delivered');
    }

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
          <Text style={{fontSize: 24,fontWeight: 'bold',marginVertical: 12, color:'#004651',justifyContent: 'center',}}>NEW ORDERS</Text>
        </View>

        {/* Orders List */}
        <View style={{ flex: 1, width: '100%' }}>
  <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
    {formattedOrders.map((order) => (
      <TouchableOpacity key={order.idOrder} style={{ marginBottom: 10 , borderWidth: 0.5, borderColor: getStatusColor(order.orderStatus), borderRadius: 10, padding: 10 }}>
        {/* First row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* First column */}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: '#000' }}>Order n°{order.idOrder} - {order.title} (x1)</Text>
            <Text style={{ fontSize: 15, color: 'gray' }}>Ordered at: {order.createdAt}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 15, color: 'gray' }}>Order for: {order.sportifSession?.name}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center'}}>
            {
            order.deliv==='Delivery' ? (
            <>
                <FontAwesomeIcon icon={faMotorcycle} size={20} style={{ marginRight: 5 }} color='#072103' />
                <Text style={{ fontSize: 17, color: 'gray' }}>To Deliver</Text>
            </>
            ) : (
            <>
                <FontAwesomeIcon icon={faWalking} size={20} style={{ marginRight: 5 }} color='#072103' />
                <Text style={{ fontSize: 17, color: 'gray' }}>Pick Up</Text>
            </>
            )}
          </View>
          </View>
          {/* Second column */}
          <View style={{flexDirection: 'row', // Ensure icon and text are in the same line
            alignItems: 'center', // Align items in the center vertically
            justifyContent: 'center'}}>
            <FontAwesomeIcon icon={faHandHoldingDollar} size={20} style={{ marginRight: 5 }} color='#072103' />
            {order.isPaid ? (
              <Text style={{ fontSize: 17, color: 'gray' }}>PAID</Text>
            ) : (
              <Text style={{ fontSize: 17, color: 'gray' }}>NOT PAID</Text>
            )}
          </View>
        </View>

        {/* Second row */}
        
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
        <TouchableOpacity
            style={{
            backgroundColor: getStatusColor(order.orderStatus),
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderRadius: 5,
            flexDirection: 'row', // Ensure icon and text are in the same line
            alignItems: 'center', // Align items in the center vertically
            justifyContent: 'center', // Center content horizontally
            elevation:10
            }}
            onPress={() => {
                if (getButtonText(order) === 'Done Preparing') {
                  donePreparingMeal(order);
                } else if (getButtonText(order) === 'Waiting for Pick Up') {
                  mealPickedUp(order);
                } else if(getButtonText(order) === 'See Details'){
                  handleOpenModal(order);
                }
              }}
            >
            <FontAwesomeIcon icon={getIcon(order)} size={15} color="#fff" />
            <Text style={{ marginLeft: 5, color: 'white', fontWeight: 'bold' }}>{getButtonText(order)}</Text>

        </TouchableOpacity>
        </View>

      </TouchableOpacity>
    ))}
  </ScrollView>
  <TrackOrder order={selectedOrder} isVisible={isModalVisible}
    sportifLocationL={selectedOrder?.sportifSession.currentPosition.coordinates[0]}
     sportifLocationLL={selectedOrder?.sportifSession.currentPosition.coordinates[1]}
      onClose={() => setModalVisible(false)} navigation={undefined}
      ></TrackOrder>
      </View>








        </>
      )}         

      {/* Navigation Bar */}
      <NavigationBar screenWidth={screenWidth} /> 
    </View>
  );
};

export default OrdersPage;
