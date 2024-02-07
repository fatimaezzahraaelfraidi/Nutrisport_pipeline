import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions,ScrollView} from 'react-native';
import Modal from 'react-native-modal';
import NavigationBar from '../../components/NavigationBar-p';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBolt, faBowlFood, faBurger, faClock, faDna, faDumbbell, faFireFlameCurved, faMotorcycle, faOilWell, faPersonWalking, faPlusCircle, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import {  fetchOffers, updateAvailability } from '../../services/ApiService';
import storage from '@react-native-firebase/storage'; 
import { io } from 'socket.io-client';
import { connectSocket1, disconnectSocket1, subscribeToUpdateOffers, unsubscribeFromUpdateOffers } from '../../services/socketService';
const screenWidth = Dimensions.get('window').width;
const screenHeight= Dimensions.get('window').height;
const getPicFromFireBase=async(url:string)=>{
      
    const  urll = await storage().ref(url).getDownloadURL();
    console.log(urll);
    return  urll;

}

const MyOffers =  ({navigation}: {navigation: any}) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isAvailable,setIsAvailable] = useState(true);

  useEffect(() => {
    const getOffers = async () => {
      try {
        const data = await fetchOffers();
        console.log(data);
        const offersWithUrls = await Promise.all(data.map(async (offer: Offer) => {
            const imageUrl = await getPicFromFireBase(offer.imageUrl);
            return { ...offer, imageRef: imageUrl };
          }));
          setOffers(offersWithUrls);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    // Connect to the Socket.IO server
    connectSocket1();
    
    subscribeToUpdateOffers((newOffer) => {
    //   // Update the offers list with the new offer
      setOffers((prevOffers) => [newOffer, ...prevOffers]);
    });

    getOffers();
     // Cleanup function to disconnect from the Socket.IO server when the component unmounts
     return () => {
      // Disconnect from the Socket.IO server
      disconnectSocket1();
      // Unsubscribe from orderStatusChanged event
      unsubscribeFromUpdateOffers();
    };
  }, []);
  //see offer details
  const handleOfferClick = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsAvailable(offer.isAvailable)
  };

  // Function to map status to color
  const getStatusColor = (isAvailable: boolean) => {
    if(isAvailable)
      return '#004651';
    else
      return '#797979';
  };


  // Function to sort offers based on availability
  const sortOffers = (a: { isAvailable: boolean; }, b: { isAvailable: boolean; }) => {
    // Define the priority order of availability
    const priorityOrder = [true, false];

    // Get the index of each status in the priority order
    const statusAIndex = priorityOrder.indexOf(a.isAvailable);
    const statusBIndex = priorityOrder.indexOf(b.isAvailable);

    // Compare the statuses based on their index in the priority order
    return statusAIndex - statusBIndex;
  };
  // Sort Offers based on status
  const sortedOffers = offers ? offers.sort(sortOffers) : [];

 // const sortedOffers = offers.sort(sortOffers);
  const formatteOffers = sortedOffers.map((offer) => {
    const formattedDate = new Date(offer.createdAt);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const optionsTime: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric'};
    const formattedDateString = formattedDate.toLocaleDateString('en-US', options);
    const formattedTimeString = formattedDate.toLocaleTimeString('fr-FR', optionsTime);
  
    return {
      ...offer,
      createdAt: formattedDateString,
      timeCreatedAt:formattedTimeString, 
      // description: truncatedDescription,
    };
  });
  

  function addNewOffers(): void {
    navigation.navigate('PostOffer');
  }

  async function setOfferAvailability(selectedOffer: Offer | null, arg1: boolean) {
    const availability = arg1 ? 1 : 0;
    setIsAvailable(arg1);
    try {
      const responseData = await updateAvailability(selectedOffer?.idOffer, availability);
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <View style={{ flex: 1, padding: 16 , backgroundColor:'white'}}>
        {/* Top Bar with Logo */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Image source={require('../../images/nutrisport.png')} style={{ width: 200, height: 45, borderRadius: 12.5, alignSelf: 'center' }}/>
      </View>
       {/* Page title */}
       <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal:8}} >
          <Text style={{fontSize: 24,fontWeight: 'bold',marginVertical: 12, color:'#004651',justifyContent: 'center',}}>OFFERS</Text>
          <TouchableOpacity onPress={() => addNewOffers()} style={{flexDirection: 'row',alignItems:'center',backgroundColor:'#004651',paddingVertical: 5,paddingHorizontal: 10,borderRadius: 50,}}>
            <FontAwesomeIcon icon={faPlusCircle} size={15} color="#fff" />
            <Text style={{paddingLeft:5, color: 'white', fontWeight:'bold'}}>New offer</Text>
          </TouchableOpacity>
        </View>

      {offers.length == 0 && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Image source={require('../../images/noOffersYet.png')} style={{ width: 200, height: 200 }} />
        </View>
      )} 
      {offers.length != 0 && (
        <>
       

        {/* Orders List */}
        <View style={{ flex: 1, width: '100%' }}>
          <ScrollView contentContainerStyle={{paddingBottom: 50 }}>
            {formatteOffers.map((offer) => ( 
                <TouchableOpacity key={offer.idOffer} onPress={() => handleOfferClick(offer)}  style={{flexDirection: 'row',alignItems: 'center',borderWidth:2,borderColor:getStatusColor(offer.isAvailable),borderRadius:10,marginBottom: 10,height:120}}>
                  <Image source={{ uri: offer.imageRef }} style={{marginLeft:3,minHeight: 110, maxHeight: 110, minWidth:110, maxWidth:110, borderRadius: 20 }} />
                 
                  <View style={{flex:1,marginHorizontal: 8, justifyContent:'space-between',flexDirection:'column'}}> 
                  {/* <Image source={{ uri: offer.imageRef }} style={{minHeight: 110, maxHeight: 110, minWidth:110, maxWidth:110, borderRadius: 20 }} /> */}
                    <View style={{marginHorizontal: 3, justifyContent:'space-between',flexDirection:'row'}}> 
                    
                      <Text style={{ fontSize: 18,fontWeight: 'bold',marginBottom: 5,color:'#004651'}}>{offer.title}</Text> 
                      <View style={{marginHorizontal:0 , alignItems:'flex-end' ,flexDirection:'column'}}>
                        <Text style={{ fontSize: 14,fontWeight: 'normal',marginBottom: 0,color:'#004651'}}>{offer.createdAt}</Text>
                        <Text style={{ fontSize: 12,fontWeight: 'normal',marginBottom: 5,color:'#004651'}}>{offer.timeCreatedAt}</Text>
                      </View>
                      
                    </View>  
                    <View style={{marginHorizontal: 8, justifyContent:'space-between',flexDirection:'column'}}> 
                      <Text style={{fontSize: 14,color: 'gray',}}>{offer.description.length > 100
                        ? `${offer.description.slice(0, 100)}...`
                        : offer.description}</Text>
                    </View> 
                    {/* <TouchableOpacity style={{width:100,flexDirection: 'row',alignItems:'center',backgroundColor: '#004651',paddingVertical: 5,paddingHorizontal: 10,borderRadius: 5,}}>
                        <FontAwesomeIcon icon={faBurger} size={15} color="#fff" />
                        <Text style={{paddingLeft:5,color: 'white', fontWeight:'bold'}}>{demand.mealType}</Text>
                      </TouchableOpacity>   */}
                  </View>          
                </TouchableOpacity>
            ))}
            <Modal 
              isVisible={selectedOffer !== null}
              onBackdropPress={() => setSelectedOffer(null)}
              onSwipeComplete={() => setSelectedOffer(null)} // Close modal when swiped to bottom
              swipeDirection={['down']} // Allow swipe down to close
              style={{ justifyContent: 'flex-end', margin: 0 }}>
              <View style={{ backgroundColor: 'white', padding: 16, borderTopLeftRadius: 20, borderTopRightRadius: 20 , height:screenHeight*0.9}}>
                {/* Display the offer details in the modal */}
                <View style={{ padding:5,  alignContent:'center', height:"100%"}}>
                      <Text style={{textAlign:'center', fontFamily: "Poppins-SemiBold", fontSize:20, fontWeight:'bold', color:'#004651', marginBottom:20}}>{selectedOffer?.title}</Text>
                      {selectedOffer && selectedOffer.imageRef && (
                        <Image source={{ uri: selectedOffer?.imageRef }} style={{alignSelf: 'center', minHeight: 180, maxHeight: 180, minWidth:180, maxWidth:180, borderRadius: 5,borderColor:'black',borderWidth:1, marginBottom:15 }} />
                      )}
                      <View style={{  flexDirection: 'row', justifyContent: 'space-between', marginBottom:1, marginTop:15, }}>

                            <View style={{ borderRadius: 50, padding: 4, marginRight: 4, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor:'#004651'}}>
                                  <FontAwesomeIcon icon={faClock} size={15} color="#fff" style={{ marginLeft: 6 }} />
                                  {selectedOffer?.preparation_time && (
                                  <Text style={{ fontWeight: 'bold', color:  '#fff' , fontFamily: "Poppins-SemiBold", marginRight:6 }}> {selectedOffer?.preparation_time} min</Text>
                                  )}
                                  
                            </View>
                            
                            <View style={{ borderRadius: 50, padding: 4, marginRight: 4, backgroundColor:'#004651' }}>
                                  <Text style={{ fontWeight: 'bold', fontFamily: "Poppins-SemiBold",fontSize:15, color:  '#fff' }}>{selectedOffer?.price} MAD</Text>
                            </View>

                            <View style={{ borderRadius: 50, padding: 4, marginRight: 4, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor:'#004651'}}>
                              {selectedOffer?.isDeliverable ? (
                                <FontAwesomeIcon icon={faMotorcycle} size={15} color="#fff" style={{ marginLeft: 6 }} />
                              ) : (
                                <FontAwesomeIcon icon={faPersonWalking} size={15} color="#fff" style={{ marginLeft: 6 }} />
                              )}
                              <Text style={{ fontWeight: 'bold', fontFamily: "Poppins-SemiBold",fontSize:15, color:  '#fff', marginRight:6 }}></Text>
                            </View>
                      </View>

                      <View style={{ marginTop:10, padding:0, justifyContent:'center', alignContent:'center',  }}>
                          <View style={{borderWidth:1,borderColor:'#f5f5f5', padding:1,justifyContent:'center', alignContent:'center', alignSelf:'center',  width:'100%', backgroundColor:'white', elevation: 10, }}>
                                  <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom:5}}>
                                        <FontAwesomeIcon icon={faBolt} size={16} color="#004651" style={{ marginLeft: 6, marginTop:2 }} />
                                        <Text style={{fontSize:16, color:'black', fontFamily: "Poppins-SemiBold", fontWeight:'bold'}}> Carbohydrates Values : {selectedOffer?.carbohydratesValue} g</Text>
                                  </View>
                                  <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom:5}}>
                                        <FontAwesomeIcon icon={faDna} size={16} color="#004651" style={{ marginLeft: 6, marginTop:2 }} />
                                        <Text style={{fontSize:16, color:'black', fontFamily: "Poppins-SemiBold", fontWeight:'bold'}}> Proteins Values: {selectedOffer?.proteinValue} g</Text>
                                  </View>
                                  <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom:5}}>
                                        <FontAwesomeIcon icon={faOilWell} size={16} color="#004651" style={{ marginLeft: 6, marginTop:2 }} />
                                        <Text style={{fontSize:16, color:'black', fontFamily: "Poppins-SemiBold", fontWeight:'bold'}}> Fats Values: {selectedOffer?.fatsValue} g</Text>
                                  </View>
                                  <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom:5}}>
                                        <FontAwesomeIcon icon={faFireFlameCurved}size={16} color="#004651" style={{ marginLeft: 6, marginTop:2 }} />
                                        <Text style={{fontSize:16, color:'black', fontFamily: "Poppins-SemiBold", fontWeight:'bold'}}> Caloric Values : {selectedOffer?.caloricValue} cal</Text>
                                  </View>
                          </View>
                      </View>
                      <View style={{marginTop:5}}>
                        <Text style={{fontSize:16, fontWeight:'bold', alignSelf:'flex-start',  fontFamily: "Poppins-SemiBold", color:'#004651', textAlign:'justify'}}>Description : </Text>
                        <Text style={{fontSize:16, fontWeight:'bold', alignSelf:'flex-start',  fontFamily: "Poppins-SemiBold",color:'#5c5c5c', textAlign:'justify'}}>   {selectedOffer?.description}</Text>
                      </View>
                      <View style={{ position: 'absolute', bottom: 10, flexDirection:'row',alignItems:'center',justifyContent:'space-between', alignContent:'center' ,  width:"100%" }}>
                          <Text style={{fontSize:16, fontWeight:'bold',  fontFamily: "Poppins-SemiBold", color:'#004651', textAlign:'justify'}}>Your offer is available ? </Text>
                          <View style={{ width: 80, height: 30, alignItems: 'center', borderWidth: 1, borderRadius: 50, flexDirection: 'row', backgroundColor: 'white', borderColor: '#004651', paddingLeft: 1, paddingRight: 1, marginHorizontal: 8 }}>
          <TouchableOpacity style={{ width: '50%', height: '96%', backgroundColor: isAvailable === true ? '#004651' : 'white', borderRadius: 50 }} onPress={() => { setOfferAvailability(selectedOffer,true)}}>
            <Text style={{ marginLeft: 8, marginTop: 3 ,color:isAvailable === true ? 'white' : '#004651', fontWeight:'bold'}}>Yes </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ width: '50%', height: '96%', borderRadius: 50, backgroundColor: isAvailable === true ? 'white' : '#004651' }} onPress={() => { setOfferAvailability(selectedOffer,false); }}>
            <Text style={{ marginLeft: 8, marginTop: 3 ,color:isAvailable === true ? '#004651' : '#fff' , fontWeight:'bold'}}>No </Text>
          </TouchableOpacity>
        </View>
                      </View>
                </View>
              </View>
            </Modal>
          </ScrollView>
        </View>
        </>
      )}         

      {/* Navigation Bar */}
      <NavigationBar screenWidth={screenWidth} /> 
    </View>
  );
};

export default MyOffers;
