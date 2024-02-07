
import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Button, TouchableWithoutFeedback, TextInput, Dimensions } from 'react-native';
import { nearbyDemands, proposeDevisS } from '../../services/ApiService';
import NavigationBar from '../../components/NavigationBar-p';
import { io } from 'socket.io-client';
import Modal from 'react-native-modal'; // Import the Modal component from the library
import DetailsDemand from './DetailsDemand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connectSocketService2, disconnectSocketService2, subscribeToNewDemandSaved, unsubscribeFromNewDemandSaved } from '../../services/socketService';

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
  sportifSession: any;
  distance:string
};

const Demands = ({ navigation }: { navigation: any }) => {
  const [demands, setDemands] = useState<demand[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState<demand>();

  const screenWidth = Dimensions.get('window').width;

  const getDayName = (inputDate: string) => {
    const input = new Date(inputDate);
    const today = new Date();
  
    // Extract date components
    const inputYear = input.getFullYear();
    const inputMonth = input.getMonth();
    const inputDay = input.getDate();
  
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();
  
    // Compare date components
    if (inputYear === todayYear && inputMonth === todayMonth && inputDay === todayDay) {
      return "Today at " + input.getHours() + ":" + input.getMinutes();
    } else if (
      inputYear === todayYear &&
      inputMonth === todayMonth &&
      inputDay === todayDay + 1
    ) {
      return "Tomorrow at " + input.getHours() + ":" + input.getMinutes();
    } else {
      return (
        input.getFullYear() +
        "-" +
        (input.getMonth() + 1) +
        "-" +
        input.getDate() +
        " at " +
        input.getHours() +
        ":" +
        input.getMinutes()
      );
    }
  };

  const calculateDistance = async (origin: string, destination: string) => {
    const apiKey = 'AIzaSyDcELAMQ7jNEno3GYitHGQza2O8wuye-Ok';
    const apiUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json';
    const url = `${apiUrl}?origins=${origin}&destinations=${destination}&key=${apiKey}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      const distance = data.rows[0].elements[0].distance.text;
      return distance;
    } catch (error) {
      console.error('Error calculating distance:', error);
      return null;
    }
  };

  const processDemand = async (demand : any) => {
    console.log("m here");
    const latitude = demand.sportifSession?.currentPosition?.coordinates[0];
    const longitude = demand.sportifSession?.currentPosition?.coordinates[1];
    if (!latitude || !longitude) return demand;
    let lat = 0;
    let long = 0;
    try {
      const latString = await AsyncStorage.getItem('latitude');
      const longString = await AsyncStorage.getItem('longitude');
      if (latString && longString) {
        lat = parseFloat(latString);
        long = parseFloat(longString);
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
    }
    const origin = `${lat},${long}`;
    console.log("origin"+origin);
    const destination = `${latitude},${longitude}`;
    console.log("destination"+destination);
    const distance = await calculateDistance(origin, destination);
    const printDay = getDayName(demand.desired_delivery_date);

    return { ...demand, distance, printDay };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await nearbyDemands();
      
       
        const demandsWithPrintDay = data.map((demand:demand) => ({
          ...demand,
          printDay: getDayName(demand.desired_delivery_date),
        }));

        const demandsWithDistance = await Promise.all(
          demandsWithPrintDay.map((demand: any) => processDemand(demand))
        );

        setDemands(demandsWithDistance);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const handleNewDemand = async ({ newDemand }: { newDemand: any }) => {
      try {
        const demandExist = demands.some((demand) => demand.idDemand === newDemand.idDemand);
        if (!demandExist) {
          const demandWithDistanceAndPrintDay = await processDemand(newDemand);
          setDemands((prevDemands) => [...prevDemands, demandWithDistanceAndPrintDay]);
        }
      } catch (error) {
        console.error('Error handling new offer:', error);
      }
    };

    connectSocketService2();
    subscribeToNewDemandSaved(handleNewDemand);
    fetchData();

    return () => {
      disconnectSocketService2();
      unsubscribeFromNewDemandSaved();
    };
  }, []);
  
  const handleOpenModal = (demand : demand) => {
    console.log('Modal opened for demand Id:', demand.idDemand);
    setSelectedDemand(demand);
    setModalVisible(true);
  };

  return (
    <View style={styles.ReqSytyle}>
      <View style={styles.container1}>
        <Image
          style={styles.image}
          resizeMode="cover"
          source={require('./../../images/nutrisport.jpg')}
        />
      </View>
      <View style={{ marginTop: 20, marginBottom: 10 ,}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <Text style={styles.textPost}>Demands on your geographic zone</Text>
        </View>
      </View>
      <View style={{  backgroundColor: "#fff",flex:1}}>
          <ScrollView
            style={{
              marginLeft: 20,
              marginTop: 20,
              marginRight: 20,
              marginBottom: 80,
             
            }}
          >
           {demands.map((demand) => {
            // Your condition here
            if (demand.isAvailable) {
                return (
                <View style={styles.container2} key={demand.idDemand}>
                  <View style={styles.container3}>
                    <View style={styles.distanceContainer}>
                      <Text style={styles.textFixStyle}>Far from you by : </Text>
                      <Text style={styles.variantStyle}>{demand.distance} </Text>
                    </View>
                    <View style={styles.mealTypeContainer}>
                      <Text style={styles.mealTypeText}>{demand.mealType} </Text>
                    </View>
                  </View>
                  <View style={styles.timeContainer}>
                    <Text style={styles.textFixStyle}>Delivery Time : </Text>
                    <Text style={styles.variantStyle}>{demand.printDay} </Text>
                  </View>
                  <View style={styles.needsContainer}>
                    <Text style={styles.textFixStyle}>I NEED : </Text>
                    <View style={styles.needsItemsContainer}>
                      <Text style={styles.variantStyle2}>{demand.caloricValue} Calories </Text>
                      <Text style={styles.variantStyle2}>{demand.fatsValue} Fats </Text>
                      <Text style={styles.variantStyle2}>{demand.carbohydratesValue} Carbohydrates </Text>
                      <Text style={styles.variantStyle2}>{demand.proteinValue} Proteins </Text>
                    </View>
                  </View>
                  <View style={styles.container3}></View>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button}  onPress={() => handleOpenModal(demand)}>
                      <Text style={styles.buttonText}>See Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
               );
              } else {
                  // Return null or any other component when the condition is not met
                  return null;
              }
          })}
          </ScrollView>
          <DetailsDemand demand={selectedDemand} isVisible={isModalVisible} onClose={() => setModalVisible(false)} navigation={undefined}></DetailsDemand>
      </View>
        {/* Navigation Bar */}
        <NavigationBar screenWidth={screenWidth} /> 
    </View>
  );
};

const styles = StyleSheet.create({
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
  closeButton: {
    position: 'absolute',
    top: 1,
    right: 1,
    borderRadius: 30,
    padding: 5,
    zIndex: 1,
  },

  closeButtonText: {
    color: '#004651',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    width:"75%",
    height:"5%",
    justifyContent: 'center',
    alignItems: 'center',
   // backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
    borderRadius: 15,
    backgroundColor: "#fff",
    borderStyle: "solid",
    borderColor: "#004651",
    borderWidth: 2,
    position: "absolute",
    top: "25%",
    left: 50,
   
  },
      container1: {
        flexDirection: 'row', 
        justifyContent: 'center',
        alignItems: 'center' ,
        marginBottom:10,
        marginTop:25,
        
},
    ReqSytyle:{
            backgroundColor: "#fff",
            overflow: "hidden",
            width: "100%",marginBottom:10,
            height: "100%",
            flex: 1, 
    },
    image: {
        width: 200, 
        height: 45, 
        borderRadius: 12.5, 
        alignSelf: 'center'
    },
    textPost:{
        fontSize: 15,
        lineHeight: 40,
        fontWeight: "300",
        fontFamily: "Poppins-Light",
        color: "#000",
        textAlign: "center"
    },
    container2:{
        borderRadius: 8,
        backgroundColor: "rgba(217, 217, 217, 0.09)",
        borderStyle: "solid",
        borderColor: "#697386",
        borderWidth: 1,
        marginBottom: 10,
        width: "100%",
        height: 200,
        flexDirection:'column',
        
    },
    container3:{ 
        flexDirection: 'row',
        width: '100%',
        flex:1,
        
    },
    buttonContainer:{
            flexDirection: 'row', // Horizontal layout
            alignItems: 'center', // Align items vertically in the center
            justifyContent : 'center',
            position: 'absolute',
            right: 5,
            bottom: 5,
            flex:1
          
    },
    button:{
        borderRadius: 8,
        backgroundColor: "#004651",
        width:  72,
        height: 27,
        
        
    },
    buttonText: {
        fontSize: 10,
        lineHeight: 25,
        fontWeight: "600",
        fontFamily: "Poppins-SemiBold",
        color: "#fff",
        textAlign: "center",
        width: 72,
        height: 34
    },
    mealTypeText:{
        fontSize: 13,
        lineHeight: 40,
        fontWeight: "600",
        fontFamily: "Poppins-SemiBold",
        color: "#004651",
        textAlign: "center",
    },
    mealTypeContainer:{
            height: 40,
            position: 'absolute',
            right: 5,
            width:"25%"
    },
    distanceContainer:{
        flexDirection: 'row', // Horizontal layout
        alignItems: 'center', // Align items vertically in the center
        //justifyContent : 'center',
        position: 'absolute',
        left: 5,
        width:"75%"
        
    },
    timeContainer:{
        flexDirection: 'row', // Horizontal layout
        alignItems: 'center', // Align items vertically in the center
        marginLeft: 10,
        flex:1
    },
    textFixStyle:{
        fontSize: 13,
        fontWeight: "600",
        fontFamily: "Poppins-SemiBold",
        color: "#004651",
        textAlign: "center",
       
    },
    variantStyle3:{
      fontSize: 13,
      
      fontWeight: "bold",
      fontFamily: "Poppins-SemiBold",
      color: "#000",
      textAlign: 'center',
      flex: 1,
     
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
        fontSize: 13,
        fontWeight: "bold",
        fontFamily: "Poppins-SemiBold",
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
        marginTop:20,
    },
});

export default Demands;


