import { faCircleInfo, faInfo, faInfoCircle, faPersonWalking, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useEffect, useState } from 'react';
import { Button, View, Text, Image, ScrollView, Alert } from 'react-native';
import { AcceptDevis, fetchDevisOfDemand } from '../../services/ApiService';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useStripe } from '@stripe/stripe-react-native';
import { createPaymentIntent } from '../../services/paymentGateway';
import { connectSocket, connectSocketService2, disconnectSocket, disconnectSocketService2, subscribeToNewDevisForDemand, unsubscribeFromToNewDevisForDemand } from '../../services/socketService';

interface DemandDevisProps {
  route: {
    params: {
      demand?: Demand;
    };
  };
}

const DemandDevis: React.FC<DemandDevisProps> = ({ route }: DemandDevisProps) => { 
  const { demand } = route.params;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const navigation = useNavigation();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  if (!demand) {
    // Handle the case when demand is undefined
    return (
      <View style={{ flex: 1, padding: 16, backgroundColor: 'black',alignItems:'center'}}>
        <Text>No demand data available</Text>
      </View>
    );
  }
  const [devis, setDevis] = useState<Devis[]>([]);
  useEffect(() => {
    const getDevis = async () => {
      try {
        const data = await fetchDevisOfDemand(demand.idDemand);
        //console.log(data);
        setDevis(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const handleNewDevis = ({ demandId, newDevis }: { demandId: number, newDevis: any }) => {
      if (demandId === demand.idDemand) {
        setDevis((prevDevis) => [...prevDevis, newDevis]);
      }
    };

    // Connect to the Socket.IO server
    connectSocketService2();

    // Subscribe to newDevisForDemand event
    subscribeToNewDevisForDemand(handleNewDevis);

    // Call the function to fetch devis
    getDevis();

    // Cleanup function
    return () => {
      // Disconnect from the Socket.IO server
      disconnectSocketService2();
      // Unsubscribe from newDevisForDemand event
      unsubscribeFromToNewDevisForDemand();
    };
  }, [demand.idDemand]); // Include demand.idDemand in the dependency array to re-run effect when it changes

  const payOrder = async (idDevis:number,amount:number) => {
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
      AcceptDevis(idDevis,'online')
      .then((data) => {
        console.log('Accept Devis Response:', data);
        navigation.navigate('Orders' as never);
      })
      .catch((error) => {
        console.error('Error accepting devis:', error);
      });
    } catch (error) {
      Alert.alert("please use a payment method");
    }
  };

  const formattedDemand = ()  => {
    const formattedDate = new Date(demand.desired_delivery_date);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const optionsTime: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric'};
    const formattedDateString = formattedDate.toLocaleDateString('en-US', options);
    const formattedTimeString = formattedDate.toLocaleTimeString('fr-FR', optionsTime);  
    const f = formattedDateString+'  :  '+formattedTimeString;
    return {
      ...demand,
      desired_delivery_date:f,
    };
  }
  
  function handlePress(idPreparator : number): void {
    console.log('see profile preparator '+idPreparator);
  }
  function acceptDevis(idDevis : number, price: number): void {
    Alert.alert(
      "Payment Method",
      "Choose your payment method:",
      [
        {
          text: "Cash on Delivery",
          onPress: () => acceptDevisWithPayment(idDevis, "cash", price),
        },
        {
          text: "Online Payment",
          onPress: () => acceptDevisWithPayment(idDevis, "online", price),
        },
      ],
      { cancelable: true }
    );
  }
  
  async function acceptDevisWithPayment(idDevis: number, paymentMethod: string, price:number): Promise<void> {
    console.log('Accepting devis with payment method:', paymentMethod);
    // Call accept devis with payment method
    if(paymentMethod==="online"){
      await payOrder(idDevis,price*100);
    }else{
      AcceptDevis(idDevis,'cash')
      .then((data) => {
        console.log('Accept Devis Response:', data);
        navigation.navigate('Orders' as never);
      })
      .catch((error) => {
        console.error('Error accepting devis:', error);
      });
    }
    
  }

  return (    
    <View style={{  flex: 1, padding: 16 , backgroundColor:'white'}}>
        {/* Top Bar with Logo */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Image source={require('../../images/nutrisport.png')} style={{ width: 200, height: 45, borderRadius: 12.5, alignSelf: 'center' }}/>
        </View>

        {/* Page title */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{fontSize: 24,fontWeight: 'bold',marginVertical: 12, color:'#004651',justifyContent: 'center',}}>Devis of your demand</Text>
        </View>

        {/* Demand details  */}
        <View style={{flexDirection: 'row', alignItems: 'center', borderWidth: 2, marginVertical: 12, borderColor: '#004651', borderRadius: 10, marginBottom: 10, height: 120}}>
          <View style={{marginHorizontal: 10, alignItems: 'flex-start', flexDirection: 'column'}}>
            <View style={{flexDirection: 'row', justifyContent:'space-between', width:'100%'}}>
              <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 0, color: '#004651'}}>Demand :</Text>
                <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 0, color: 'grey'}}> {formattedDemand().title}</Text>
              </View>
              <View style={{flexDirection: 'row', flexWrap: 'wrap',marginRight:10}}>
                <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 0, color: '#004651'}}>{formattedDemand().mealType.toUpperCase()}</Text>
              </View>
            </View>
            <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
              <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 0, color: '#004651'}}>Desired delivery date : </Text>
              <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 0, color: 'grey'}}> {formattedDemand().desired_delivery_date}</Text>
            </View>
            <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 0}}>
                <Text style={{ color: '#004651' }}>I Need : </Text>
                <Text style={{color: 'grey' }}>{formattedDemand().description.length > 100
                        ? `${formattedDemand().description.slice(0, 100)}...`
                        : formattedDemand().description}</Text>
              </Text>
            </View>
          </View>
        </View>


        {/* Demand devis */}
        <View style={{flexDirection: 'row',alignItems:'center',justifyContent:'flex-start',paddingVertical: 0,paddingHorizontal: 20,borderRadius: 5,}}>
          <FontAwesomeIcon icon={faCircleInfo} size={20} color="#004651" />
          <Text style={{paddingHorizontal:15,color: '#004651', fontWeight:'bold', fontSize:15}}>Please accept one devis</Text>
        </View>
        <View style={{flex:1,flexDirection: 'row',alignItems: 'baseline',borderWidth:0,marginVertical: 12,borderColor:'#004651',borderRadius:10,marginBottom: 10}}>
        {devis.length != 0 && (
          <ScrollView contentContainerStyle={{paddingBottom: 0}}>
            {devis.map((d, index) => ( 
              <View  key={index}  style={{flexDirection: 'column',alignItems: 'flex-start',borderBottomWidth:2,paddingHorizontal:10,marginVertical: 12,borderColor:'gray',marginHorizontal:10,marginBottom: 10,height:120}}>
              <View style={{width:'100%',paddingTop:10, justifyContent:'space-between', flexDirection:'row',alignItems:'center'}}>
                <View style={{ borderRadius: 25, backgroundColor: '#004651', padding: 4, marginRight: 4 , flexDirection:'row',justifyContent: 'center', alignItems: 'center'}}>
                  <FontAwesomeIcon icon={faThumbsUp} size={15} color="white" style={{ marginLeft: 6 }} />
                  <Text style={{ fontWeight: 'bold', color:  'white', marginLeft:5 }}>{d.preparatorSession.preparatorRank}%</Text>
                  <Text style={{ fontWeight: 'normal',fontSize:10, color:  'white', marginLeft:2}}>(99)</Text>
                </View>
                <View style={{  alignItems: 'center'}}>
                  <Text style={{ fontWeight: 'bold', fontSize:18,color:'grey', marginLeft:2,}}>Preparator {d.preparatorSession.idPreparator} = {d.idDevis}</Text>
                </View>
                <TouchableWithoutFeedback onPress={() => handlePress(d.preparatorSession.idPreparator)}  >
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold', color: '#004651', marginLeft: 2 , textDecorationLine:'underline'}}>See Profile</Text>
                  </View>
                </TouchableWithoutFeedback>
              </View> 
              <View style={{width:'100%',paddingTop:30, justifyContent:'space-between', flexDirection:'row',alignItems:'center'}}>
                <View style={{  alignItems: 'center', flexDirection:'row'}}>
                  <Text style={{ fontWeight: 'bold', fontSize:16,color:'grey', marginLeft:2,}}>Proposed price : </Text>
                  <Text style={{ fontWeight: 'bold', fontSize:18,color:'#004651', marginLeft:2,}}>{d.proposed_price} MAD</Text>
                </View>
                <TouchableWithoutFeedback onPress={() => acceptDevis(d.idDevis, d.proposed_price)}  >
                  <View style={{ alignItems: 'center', backgroundColor:'#004651', width:'25%', height:35 , justifyContent:'center', borderRadius:50}}>
                    <Text style={{ fontWeight: 'bold', color: 'white', marginLeft: 2 , }}>Accept</Text>
                  </View>
                </TouchableWithoutFeedback>
              </View>
              </View>
            ))}
          </ScrollView>
        )}
        {devis.length == 0 && (
          <View style={{flex:1,height:'100%',flexDirection: 'row',alignItems:'center',justifyContent:'center',paddingVertical: 0,paddingHorizontal: 20,borderRadius: 5}}>
          <Text style={{paddingHorizontal:15,color: '#004651', fontWeight:'bold', fontSize:15}}>waiting for devis ..!</Text>
        </View>
        )}
        </View>

    </View>
  );
};

export default DemandDevis;