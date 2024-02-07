import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions,ScrollView } from 'react-native';
import NavigationBar from '../../components/NavigationBar-s';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBowlFood, faBurger, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { fetchDemands } from '../../services/ApiService';
import { connectSocket1, subscribeToUpdateDemands, disconnectSocket1, unsubscribeFromUpdateDemands } from '../../services/socketService';

const screenWidth = Dimensions.get('window').width;
const screenHeight= Dimensions.get('window').height;

const DemandsPage =  ({navigation}: {navigation: any}) => {
  const [demands, setDemands] = useState<Demand[]>([]);
  useEffect(() => {
    const getDemands = async () => {
      try {
        const data = await fetchDemands();
        console.log(data);
        setDemands(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    // Connect to the Socket.IO server
    connectSocket1();
    
    subscribeToUpdateDemands((newDemand) => {
    //   // Update the offers list with the new offer
      setDemands((prevDemands) => [newDemand, ...prevDemands]);
    });
    getDemands();
     // Cleanup function to disconnect from the Socket.IO server when the component unmounts
     return () => {
      // Disconnect from the Socket.IO server
      disconnectSocket1();
      // Unsubscribe from orderStatusChanged event
      unsubscribeFromUpdateDemands();
    };
  }, []);
  //see demand details
  // Function to navigate to DemandDevis screen with demand details
const handlePress = (demand: Demand) => {
  if(demand.isAvailable=== true)
    navigation.navigate('DemandDevis', { demand: demand });

    //else add page demand history
};


  // Function to map status to color
  const getStatusColor = (isAvailable: boolean) => {
    if(isAvailable)
      return '#004651';
    else
      return '#797979';
  };


  // Function to sort demands based on availability
  const sortDemands = (a: { isAvailable: boolean; }, b: { isAvailable: boolean; }) => {
    // Define the priority order of availability
    const priorityOrder = [true, false];

    // Get the index of each status in the priority order
    const statusAIndex = priorityOrder.indexOf(a.isAvailable);
    const statusBIndex = priorityOrder.indexOf(b.isAvailable);

    // Compare the statuses based on their index in the priority order
    return statusAIndex - statusBIndex;
  };
  // Sort demands based on status
  const sortedDemands = demands.sort(sortDemands);
  const formattedDemands = sortedDemands.map((demand) => {
    const formattedDate = new Date(demand.createdAt);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const optionsTime: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric'};
    const formattedDateString = formattedDate.toLocaleDateString('en-US', options);
    const formattedTimeString = formattedDate.toLocaleTimeString('fr-FR', optionsTime);
  
    return {
      ...demand,
      createdAt: formattedDateString,
      timeCreatedAt:formattedTimeString, 
      // description: truncatedDescription,
    };
  });
  

  function addNewDemand(): void {
    navigation.navigate('PostRequest');
  }

  return (
    <View style={{ flex: 1, padding: 16 , backgroundColor:'white'}}>
        {/* Top Bar with Logo */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Image source={require('../../images/nutrisport.png')} style={{ width: 200, height: 45, borderRadius: 12.5, alignSelf: 'center' }}/>
      </View>
       {/* Page title */}
       <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal:8}} >
          <Text style={{fontSize: 24,fontWeight: 'bold',marginVertical: 12, color:'#004651',justifyContent: 'center',}}>DEMANDS</Text>
          <TouchableOpacity onPress={() => addNewDemand()} style={{flexDirection: 'row',alignItems:'center',backgroundColor:'#004651',paddingVertical: 5,paddingHorizontal: 10,borderRadius: 50,}}>
            <FontAwesomeIcon icon={faPlusCircle} size={15} color="#fff" />
            <Text style={{paddingLeft:5, color: 'white', fontWeight:'bold'}}>New demand</Text>
          </TouchableOpacity>
        </View>

      {demands.length == 0 && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Image source={require('../../images/noDemandsYet.png')} style={{ width: 200, height: 200 }} />
        </View>
      )} 
      {demands.length != 0 && (
        <>
       

        {/* Orders List */}
        <View style={{ flex: 1, width: '100%' }}>
          <ScrollView contentContainerStyle={{paddingBottom: 50 }}>
            {formattedDemands.map((demand) => ( 
                <TouchableOpacity key={demand.idDemand} onPress={() => handlePress(demand)} style={{flexDirection: 'row',alignItems: 'center',borderWidth:2,borderColor:getStatusColor(demand.isAvailable),borderRadius:10,marginBottom: 10,height:120}}>
                  <View style={{width: 15,height: '100%',backgroundColor:getStatusColor(demand.isAvailable),borderWidth:5,borderColor:getStatusColor(demand.isAvailable),borderRadius:20,}} />
                  <View style={{flex:1,marginHorizontal: 8, justifyContent:'space-between',flexDirection:'column'}}> 
                    <View style={{marginHorizontal: 8, justifyContent:'space-between',flexDirection:'row'}}> 
                      <Text style={{ fontSize: 18,fontWeight: 'bold',marginBottom: 5,color:'#004651'}}>{demand.title} /{demand.idDemand}</Text> 
                      <View style={{marginHorizontal:0 , alignItems:'flex-end' ,flexDirection:'column'}}>
                        <Text style={{ fontSize: 14,fontWeight: 'normal',marginBottom: 0,color:'#004651'}}>{demand.createdAt}</Text>
                        <Text style={{ fontSize: 12,fontWeight: 'normal',marginBottom: 5,color:'#004651'}}>{demand.timeCreatedAt}</Text>
                      </View>
                    </View>  
                    <View style={{marginHorizontal: 8, justifyContent:'space-between',flexDirection:'column'}}> 
                      <Text style={{fontSize: 14,color: 'gray',}}>{demand.description.length > 100
                        ? `${demand.description.slice(0, 100)}...`
                        : demand.description}</Text>
                    </View> 
                    {/* <TouchableOpacity style={{width:100,flexDirection: 'row',alignItems:'center',backgroundColor: '#004651',paddingVertical: 5,paddingHorizontal: 10,borderRadius: 5,}}>
                        <FontAwesomeIcon icon={faBurger} size={15} color="#fff" />
                        <Text style={{paddingLeft:5,color: 'white', fontWeight:'bold'}}>{demand.mealType}</Text>
                      </TouchableOpacity>   */}
                  </View>          
                </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        </>
      )}         

      {/* Navigation Bar */}
      <NavigationBar screenWidth={screenWidth} /> 
    </View>
  );
};

export default DemandsPage;