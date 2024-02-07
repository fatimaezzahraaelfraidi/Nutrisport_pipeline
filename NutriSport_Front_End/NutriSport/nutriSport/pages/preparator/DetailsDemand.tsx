import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions,ScrollView, TextInput, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendar, faCalendarDay, faCheckCircle, faCheckDouble, faClock, faClockFour, faDumbbell, faHandHoldingDollar, faList, faMoneyBill, faMoneyBill1Wave, faPerson, faPhone, faPlusCircle, faRoad, faStar, faUser, faUserAlt, faUserAltSlash } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-native-modal'; // Import the Modal component from the library
import DeliveryMap from '../sportif/DeliveryMap';
import { fetchMyDevisOfDemand, proposeDevisS, setOrderStatus, setPaymentStatus } from '../../services/ApiService';
const screenWidth = Dimensions.get('window').width;
const screenHeight= Dimensions.get('window').height;

type demand = {
  idDemand: number;
  caloricValue: number;
  fatsValue: number;
  proteinValue: number;
  carbohydratesValue: number;
  description: string;
  desired_delivery_date: string;
  mealType: string;
  printDay:string;
  isAvailable:boolean;
  sportifSession: SportifSession;
  distance:string

};

const DetailsDemand = ({ isVisible, onClose, demand, navigation }: { isVisible: boolean, onClose: () => void, demand: demand | undefined, navigation: any }) => {
  const [devis, setDevis] = useState('');
  const [proposedDevis, setProposedDevis] = useState<Devis[]>([]);
  
  const fetchProposedDevis = async () => {
    try { 
      console.log(demand?.idDemand)
      const data = await fetchMyDevisOfDemand(demand?.idDemand);
      console.log(data);
      setProposedDevis(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (isVisible && demand) {
      fetchProposedDevis();
    }
  }, [isVisible, demand]);
  function proposeDevis(idDemand: number | undefined, devis: string):void {
    console.log("demand "+idDemand+" devis = "+devis);
    proposeDevisS(idDemand,devis).then((data) => {
      // Handle the response data if needed
      console.log('propose Devis Response:', data);
      onClose();
    })
    .catch((error) => {
      // Handle errors
      console.error('Error proposing devis:', error);
    });
  }
  const handleSwipeComplete = () => {
    onClose();
    setDevis('');
  };
  
  return (
    <Modal
      isVisible={isVisible}
      swipeDirection={['down']}
      onSwipeComplete={() => handleSwipeComplete()} // Call onClose function when swipe down is completed
      style={{ justifyContent: 'center', alignItems: 'center', margin: 0 }}>
  
  <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 20, width:350 }}>
  <View style={styles.container}>
        <FontAwesomeIcon icon={faUser} size={14} color="#004651" />
        <Text style={[styles.textFixStyle]}>REQUEST FROM:</Text>
        <Text style={[styles.variantStyle3]}>{demand?.sportifSession.name}</Text>
    </View>
    <View style={styles.container}>
        <FontAwesomeIcon icon={faPhone} size={14} color="#004651" />
        <Text style={[styles.textFixStyle]}>CONTACT PHONE:</Text>
        <Text style={[styles.variantStyle3]}>{demand?.sportifSession.phone}</Text>
    </View>
    <View style={styles.container}>
        <FontAwesomeIcon icon={faRoad} size={14} color="#004651" />
        <Text style={[styles.textFixStyle]}>FAR FROM YOU BY:</Text>
        <Text style={[styles.variantStyle3]}>{demand?.distance}</Text>
    </View>

     <View style={styles.container}>
     <FontAwesomeIcon icon={faClockFour} size={14} color="#004651" />
        <Text style={styles.textFixStyle}>DELIVERY DATE:</Text>
        <Text style={styles.variantStyle3}>{demand?.printDay}</Text>
    </View>
    <View style={styles.container}>
        <FontAwesomeIcon icon={faDumbbell} size={14} color="#004651" />
        <Text style={styles.textFixStyle}>NEEDS : </Text>
    </View>
   <View style={styles.container}>
          <View style={styles.needsItemsContainer}>
            <Text style={styles.variantStyle2}>{demand?.caloricValue} Calories </Text>
            <Text style={styles.variantStyle2}>{demand?.fatsValue} Fats </Text>
            <Text style={styles.variantStyle2}>{demand?.carbohydratesValue} Carbohydrates </Text>
            <Text style={styles.variantStyle2}>{demand?.proteinValue} Proteins </Text>
          </View>
    </View>
    <View style={styles.container}>
        <FontAwesomeIcon icon={faList} size={14} color="#004651" />
        <Text style={styles.textFixStyle}>DESCRIPTION : </Text>
    </View>
    <View style={styles.container}>
          <View style={styles.needsItemsContainer}>
              <Text style={styles.variantStyle2}>{demand?.description}</Text>
          </View>
    </View>
    
    
    {proposedDevis.length !== 0 && (
      <>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#a2a7a8', margin: 10 }} />
    <View style={styles.container}>
        <FontAwesomeIcon icon={faDumbbell} size={14} color="#004651" />
        <Text style={styles.textFixStyle}> PROPOSED DEVIS : </Text>
    </View>
       
        {proposedDevis.map((currentDevis, index) => { 
          // Parse the createdAt timestamp
          const createdAtDate = new Date(currentDevis.createdAt);
          // Format the date as 'YYYY-MM-DD'
          const formattedDate = createdAtDate.toISOString().split('T')[0];
          // Format the time as 'HH:MM'
          const formattedTime = createdAtDate.toISOString().split('T')[1].split('.')[0];
          return (
            <View key={index} style={styles.container}>
              <Text style={{ fontSize: 16, color: '#64b1bd' }}>{formattedDate} </Text> 
              <Text style={{ fontSize: 16, color: '#004651' }}>{formattedTime}                </Text> 
              
              <Text style={{ fontSize: 16,fontWeight:'700', color: '#004651' }}>{currentDevis.proposed_price} DH</Text> 
            </View>
          );
        })}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#a2a7a8', margin: 10 }} />
      </>
    )}
    
  
      <View style={{flexDirection: 'row', alignItems: 'flex-end',justifyContent:'flex-end',paddingRight:10,width: '100%', marginBottom:5}}>
          <Text style={{fontSize: 15,lineHeight: 40,fontWeight: "bold",fontFamily: "Poppins-SemiBold",color: "#697386",textAlign: "center",}}>ENTER DEVIS:</Text>
          <View style={styles.input2}>
              <TextInput value={devis} onChangeText={setDevis} placeholder="0.0" keyboardType="numeric" placeholderTextColor="black"/>
              <Text style={{ position: 'absolute', right: 3, marginTop: 5 }}>DH</Text>
          </View>
      </View>
     <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
      <TouchableOpacity
            style={{
            backgroundColor: "#64b1bd",
            paddingVertical: 8,
            paddingHorizontal: 15,
            borderRadius: 20,
            flexDirection: 'row', // Ensure icon and text are in the same line
            alignItems: 'center', // Align items in the center vertically
            alignSelf:'center',
            justifyContent: 'center', // Center content horizontally
            elevation:10
            }}
            onPress={() => {
              proposeDevis(demand?.idDemand,devis);
              }}
            >
            <FontAwesomeIcon icon={faCheckDouble} size={15} color="#fff" />
            <Text style={{ marginLeft: 5, color: 'white', fontSize:17 }}>Propose Devis</Text>

        </TouchableOpacity>
      </View>
      
  </View>
    
</Modal>

  


  );
};
const styles = StyleSheet.create({
  container: {
        flexDirection: 'row', // Horizontal layout
        alignItems: 'center', // Align items vertically in the center
        marginBottom:10
    },
    textFixStyle: {
        fontSize: 14,
        color: "#004651",
        flex:3,
        marginLeft:8,
        fontWeight:'600'
        //textAlign: "center", // Remove this line
    },
    variantStyle3: {
        fontSize: 14,
        color: "#000",
        flex:2,
        fontWeight:'600',
        textAlign: 'center', // Remove this line
    },
variantStyle:{
    fontSize: 13,
    lineHeight: 40,
    fontWeight: "bold",
    fontFamily: "Poppins-SemiBold",
    color: "#000",
    textAlign: "center",  
},
variantStyle2:{
    fontSize: 14,
    color: "#000",
    textAlign: "left",  
    marginLeft: 20,
   
    
},
needsContainer:{
    flexDirection: 'row',
    width: '100%',
    flex:2,
    marginLeft: 5,
},
needsItemsContainer:{
    flexDirection: 'column',
    flex:1,
    height: '100%',
    
},
modelButtonText:{
  fontSize: 13,
      lineHeight: 35,
      fontWeight: "bold",
      fontFamily: "Poppins-SemiBold",
      color: "#fff",
      textAlign: "right",
  position: 'absolute',
  bottom: 1,
  left:27
},
input2:{
  borderRadius: 11,
  backgroundColor: "#fff",
  borderStyle: "solid",
  borderColor: "#697386",
  borderWidth: 1,
  width: "40%",
  height: 40,
  flexDirection: 'row',
  marginLeft: 8,
   
  
},
})
export default DetailsDemand;