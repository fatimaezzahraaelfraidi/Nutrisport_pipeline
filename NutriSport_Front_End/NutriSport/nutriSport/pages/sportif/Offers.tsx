import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Dimensions, Keyboard, ScrollView, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { IconDefinition, faBold, faBolt, faBoltLightning, faChevronDown, faClock, faDna, faDumbbell, faFilter, faFireFlameCurved, faGear, faHome, faMotorcycle, faOilWell, faPersonWalking, faPhone, faPhoneAlt, faPhoneSquare, faReceipt, faSearch, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { CountOrderedOffers, fetchOffres, saveOrder } from '../../services/ApiService';
import NavigationBar from '../../components/NavigationBar-s';
import storage from '@react-native-firebase/storage'; 
import { useStripe } from '@stripe/stripe-react-native';
import { createPaymentIntent } from '../../services/paymentGateway';
import Modal from 'react-native-modal'; // Import the Modal component from the library
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connectSocket1, subscribeToUpdateOffers, disconnectSocket1, unsubscribeFromUpdateOffers, connectSocketService2, subscribeToNewOfferSaved, disconnectSocketService2, unsubscribeFromToNewDevisForDemand } from '../../services/socketService';
import { useNavigation } from '@react-navigation/native';
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const OffersPage: React.FC = () => {
  const navigation = useNavigation();
  const [selectedMealFilter, setSelectedMealFilter] = useState<string | null>(null);
  const [selectedDeliveryMode,setselectedDeliveryMode] = useState(0);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [isSearchActive, setIsSearchActive] = useState<boolean>(true);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null); // Track the selected offer for the modal
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const getPicFromFireBase=async(url:string)=>{
      
          const  urll = await storage().ref(url).getDownloadURL();
          console.log(urll);
          return  urll;
     
    }
    const handleOfferClick = (offer: Offer) => {
      setSelectedOffer(offer);
    };

    useEffect(() => {
      const getOffers = async () => {
        try {
          const data = await fetchOffres();
          const offersWithUrls = await Promise.all(data.map(async (offer: Offer) => {
            const imageUrl = await getPicFromFireBase(offer.imageUrl);
            const countData = await CountOrderedOffers();
            const countMap = new Map<number, string>(countData.map(({ idOffer, orderCount }: { idOffer: number, orderCount: string }) => [idOffer, orderCount]));
            const count = countMap.get(offer.idOffer) || 0; // Get the count from the map, default to 0 if not found
            return { ...offer, 
              imageRef: imageUrl,
              orderCount: count
            };
          }));
          setOffers(offersWithUrls);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      const handleNewOffer = async ({newOffer }: {newOffer: any }) => {
        try {
          // Check if the offer already exists in the offers state
          const offerExists = offers.some((offer) => offer.idOffer === newOffer.idOffer);
          if (!offerExists) {
            const imageUrl = await getPicFromFireBase(newOffer.imageUrl);
            
            const count = 0; // Get the count from the map, default to 0 if not found
            const offerWithUrl = { ...newOffer, imageRef: imageUrl, orderCount: count };
            setOffers((prevOffers) => [...prevOffers, offerWithUrl]);
          }
        } catch (error) {
          console.error('Error handling new offer:', error);
        }
      };
      
      // Connect to the Socket.IO server
    
    connectSocketService2();


    // Subscribe to newDevisForDemand event
    subscribeToNewOfferSaved(handleNewOffer);

    // Call the function to fetch devis
    getOffers();

    // Cleanup function
    return () => {
      // Disconnect from the Socket.IO server
      disconnectSocketService2();
      // Unsubscribe from newDevisForDemand event
      unsubscribeFromToNewDevisForDemand();

    };
    }, []);
    
  

  const filters = ['breakfast', 'lunch', 'dinner', 'snack'];

  const handleFilterClick = (filter: string) => {
    setSelectedMealFilter((prevFilter) => {
        return prevFilter === filter ? '' : filter;
      });
  };

  const handleSearch = () => {
    Keyboard.dismiss(); 
  };
  const payOrder = async (offerId:number,amount:number) => {
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

      const sportifSessionId = await AsyncStorage.getItem('sessionId'); // Replace it with the real value after


      try {
        const response  = await saveOrder( offerId, 'online');
        if(response == 200){
          Alert.alert("Order saved successfully");
        }
      } catch (error) {
        console.error('Error saving order:', error);
      }
    } catch (error) {
      Alert.alert("please use a payment method");
    }
  };
  function chooseMethod(offerId :any, price:any): void {
    Alert.alert(
      "Payment Method",
      "Choose your payment method:",
      [
        {
          text: "Cash on Delivery",
          onPress: () => orderWithPayment(offerId, "cash",price),
        },
        {
          text: "Online Payment",
          onPress: () => orderWithPayment(offerId, "online",price),
        },
      ],
      { cancelable: true }
    );
  }
  async function orderWithPayment(offerId: number, paymentMethod: string, price:number): Promise<void> {
    console.log('ordering with payment method:', paymentMethod);
    // Call accept devis with payment method
    if(paymentMethod==="online"){
      await payOrder(offerId,price*100);
    
    }else{

      const sportifSessionId = await AsyncStorage.getItem('sessionId'); // Replace it with the real value after


    try {
      const response  = await saveOrder( offerId, 'cash');
      if(response == 200){
        Alert.alert("Order saved successfully");
        navigation.navigate('Orders' as never);
      }
    } catch (error) {
      console.error('Error saving order:', error);
    }
    }
    
  }
  
  const handleChangeText = (text: string) => {
    setIsSearchActive(text.length > 0);
    setSearchText(text);
  };
  const filteredOffers = offers.filter((offer) => {
    // Check if the offer matches the selected meal type
    const matchesMealType = !selectedMealFilter || offer.mealType === selectedMealFilter;

    // Check if the offer matches the selected delivery mode
    const matchesDeliveryMode = selectedDeliveryMode === 0 ? offer.isDeliverable : !offer.isDeliverable;

    // Check if the search filter is active and the offer contains the search text in title or description
    const matchesSearch = !isSearchActive || (
      searchText.length === 0 ||
      offer.title.toLowerCase().includes(searchText.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchText.toLowerCase())
    );

    // Include the offer only if it matches both meal type and delivery mode
    return matchesMealType && matchesDeliveryMode && matchesSearch;
  });

  return (
    <View style={{ flex: 1, padding: 16 , backgroundColor:'white'}}>
      {/* Top Bar with Logo */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Image source={require('../../images/nutrisport.png')} style={{ width: 200, height: 45, borderRadius: 12.5, alignSelf: 'center' }}/>      
      </View>
        
      {/* Search Bar */}
      <View style={{ alignItems: 'center', marginVertical: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', width: screenWidth*0.8, 
                        backgroundColor: '#FFFFFF',borderWidth: 2, borderColor: '#004651',justifyContent: 'space-between',
                        borderRadius: 50, padding: 4,  }}>
          <TextInput placeholder="Type to search" placeholderTextColor="#979797" style={{ color: '#004651', fontSize: 15 }} value={searchText}
            onChangeText={handleChangeText}/>
          <TouchableOpacity onPress={handleSearch}>
            <FontAwesomeIcon icon={faSearch} size={20} color="#004651" style={{ marginRight: 8}} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Meal Type Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12, marginHorizontal: 6 }}>
        {filters.map((filter) => (
          <TouchableOpacity 
            key={filter}
            onPress={() => handleFilterClick(filter)}
            style={{ 
              backgroundColor: selectedMealFilter === filter ? '#004651' : '#e0e0e0',
              width: 80,
              borderRadius: 50,
              padding: 8,
            }}
          >
            <Text style={{ fontWeight: 'bold', textAlign: 'center', color: selectedMealFilter === filter ? 'white' : '#004651' }}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter and Switch Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', borderColor: '#004651', borderWidth: 1, backgroundColor: 'white', borderRadius: 50, width: 80, marginHorizontal: 8 }}>
          <FontAwesomeIcon icon={faFilter} size={20} color="#004651" style={{ marginLeft: 8 }} />
          <Text style={{ fontWeight: 'bold', textAlign: 'center', color: '#004651', marginLeft: 6 }}>Filter</Text>
        </View> 
        <View style={{ width: 80, height: 30, alignItems: 'center', borderWidth: 1, borderRadius: 50, flexDirection: 'row', backgroundColor: 'white', borderColor: '#004651', paddingLeft: 1, paddingRight: 1, marginHorizontal: 8 }}>
          <TouchableOpacity style={{ width: '50%', height: '96%', backgroundColor: selectedDeliveryMode === 0 ? '#004651' : 'white', borderRadius: 50 }} onPress={() => { setselectedDeliveryMode(0); }}>
            <FontAwesomeIcon icon={faMotorcycle} size={20} color={selectedDeliveryMode === 0 ? 'white' : '#004651'} style={{ marginLeft: 8, marginTop: 3 }} />
          </TouchableOpacity>
          <TouchableOpacity style={{ width: '50%', height: '96%', borderRadius: 50, backgroundColor: selectedDeliveryMode === 0 ? 'white' : '#004651' }} onPress={() => { setselectedDeliveryMode(1); }}>
            <FontAwesomeIcon icon={faPersonWalking} size={20} color={selectedDeliveryMode === 0 ? '#004651' : 'white'} style={{ marginLeft: 8, marginTop: 3 }} />
          </TouchableOpacity>
        </View>
      </View>
     
      <View style={{ flexDirection: 'row',  marginVertical: 5, }}></View>
      <ScrollView contentContainerStyle={{paddingBottom: 50 }}>
      {/* Offers List */}
      {filteredOffers.map((offer) => (      
        <TouchableOpacity
          key={offer.idOffer}
          onPress={() => handleOfferClick(offer)} // Call the handleOfferClick function when an offer is clicked
          style={{flexDirection: 'row', alignItems: 'center',paddingBottom:16, paddingTop: 16,paddingLeft:10,paddingRight:10, backgroundColor:  '#fff',
          borderBottomWidth: 1,   borderTopWidth: 0,   borderLeftWidth: 0,    borderRightWidth: 0, borderColor:'#C4C4C4'}}>
          <Image source={{ uri: offer?.imageRef }} style={{minHeight: 110, maxHeight: 110, minWidth:110, maxWidth:110, borderRadius: 20 }} />
          <View style={{ marginLeft: 8, flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color:  '#004651', fontFamily:'Arial' }}>{offer.title}</Text>
            <Text style={{fontSize: 14, fontWeight: 'normal', color:  'grey', fontFamily:'Arial'}}>{offer.description.length > 100
                        ? `${offer.description.slice(0, 100)}...`
                        : offer.description}</Text>
            <View style={{  flexDirection: 'row', justifyContent: 'space-between', marginBottom:1, marginTop:15 }}>
              {/*  */}
              <View style={{ borderRadius: 25, backgroundColor: '#004651', padding: 4, marginRight: 4 , flexDirection:'row',justifyContent: 'center', alignItems: 'center'}}>
                <FontAwesomeIcon icon={faThumbsUp} size={15} color="white" style={{ marginLeft: 6 }} />
                {offer.preparatorSession && (
                <Text style={{ fontWeight: 'bold', color:  'white', marginLeft:5 }}>{offer.preparatorSession.preparatorRank}%</Text>
                )}
                <Text style={{ fontWeight: 'normal',fontSize:10, color:  'white', marginLeft:2}}>({offer.orderCount})</Text>

              </View>
              <View style={{ borderRadius: 25, padding: 4, marginRight: 4 }}>
                <Text style={{ fontWeight: 'bold',fontSize:15, color:  '#004651' }}>{offer.price} MAD</Text>
              </View>
            </View> 
          </View>
        </TouchableOpacity>       
      ))} 
      <Modal 
      isVisible={selectedOffer !== null}
      onBackdropPress={() => setSelectedOffer(null)}
      onSwipeComplete={() => setSelectedOffer(null)}
      onModalHide={() => setSelectedOffer(null)}
      onModalWillHide={() => setSelectedOffer(null)}


       swipeDirection={['down']} // Allow swipe down to close
       style={{ justifyContent: 'flex-end', margin: 0 }}>
        <View style={{ backgroundColor: 'white', padding: 16, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
          {/* Display the offer details in the modal */}
          <View style={{ padding:5, justifyContent:'center', alignContent:'center'}}>
                <Text style={{textAlign:'center', fontFamily: "Poppins-SemiBold", fontSize:20, fontWeight:'bold', color:'#004651', marginBottom:20}}>{selectedOffer?.title}</Text>
                {selectedOffer && selectedOffer.imageRef && (
    <Image 
        source={{ uri: selectedOffer.imageRef }}
        style={{
            alignSelf: 'center',
            minHeight: 180,
            maxHeight: 180,
            minWidth: 180,
            maxWidth: 180,
            borderRadius: 5,
            borderColor: 'black',
            borderWidth: 1,
            marginBottom: 15
        }}
    />
)}

<View style={{  flexDirection: 'row', justifyContent: 'space-between', marginBottom:1, marginTop:15 }}>
                      
                      <View style={{ borderRadius: 50, padding: 4, marginRight: 4, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderColor:'#004651', borderWidth:1 }}>
                            <FontAwesomeIcon icon={faThumbsUp} size={15} color="#004651" style={{ marginLeft: 6 }} />
                            {selectedOffer?.preparatorSession && (
                            <Text style={{ fontWeight: 'bold', fontFamily: "Poppins-SemiBold", color:  '#004651', marginLeft:5 }}>{selectedOffer?.preparatorSession.preparatorRank}%</Text>
                            )}
                            <Text style={{ fontWeight: 'normal', fontFamily: "Poppins-SemiBold", fontSize:10, color:  '#004651', marginLeft:2}}>({selectedOffer?.orderCount})</Text>
                      </View>
                      <View style={{ borderRadius: 50, padding: 4, marginRight: 4, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderColor:'#004651', borderWidth:1 }}>
                            <FontAwesomeIcon icon={faClock} size={15} color="#004651" style={{ marginLeft: 6 }} />
                            {selectedOffer?.preparation_time && (
                            <Text style={{ fontWeight: 'bold', color:  '#004651' , fontFamily: "Poppins-SemiBold", marginRight:6 }}> {selectedOffer?.preparation_time} min</Text>
                            )}
                            
                      </View>
                    
                      
                      <View style={{ borderRadius: 50, padding: 4, marginRight: 4, borderColor:'#004651', borderWidth:1 }}>
                            <Text style={{ fontWeight: 'bold', fontFamily: "Poppins-SemiBold",fontSize:15, color:  '#004651' }}>{selectedOffer?.price} MAD</Text>
                      </View>
                      <View style={{ borderRadius: 50, padding: 4, marginRight: 4, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderColor:'#004651', borderWidth:1 }}>
                        {selectedOffer?.isDeliverable ? (
                          <FontAwesomeIcon icon={faMotorcycle} size={15} color="#004651" style={{ marginLeft: 6 }} />
                        ) : (
                          <FontAwesomeIcon icon={faPersonWalking} size={15} color="#004651" style={{ marginLeft: 6 }} />
                        )}
                        <Text style={{ fontWeight: 'bold', fontFamily: "Poppins-SemiBold",fontSize:15, color:  '#004651', marginRight:6 }}></Text>
                    </View>
                </View>
                <View style={{ marginTop:10, padding:10, justifyContent:'center', alignContent:'center',  }}>
                     <FontAwesomeIcon icon={faDumbbell} size={40} color="#004651" style={{ marginLeft: 6, alignSelf:'center', marginBottom:5 }} /> 
                     {/* <Image source={require('../../images/gymfood.jpg')} style={{ borderRadius: 12.5, alignSelf: 'center', minWidth:100, minHeight:100, maxHeight:100, maxWidth:100 }}/>*/}
                    <View style={{borderWidth:1,borderColor:'#f5f5f5', padding:5,justifyContent:'center', alignContent:'center', alignSelf:'center', width:'90%', backgroundColor:'white', elevation: 10, }}>
                          <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom:5}}>
                                <FontAwesomeIcon icon={faBolt} size={25} color="#004651" style={{ marginLeft: 6, marginTop:2 }} />
                                <Text style={{fontSize:18, color:'black', fontFamily: "Poppins-SemiBold", fontWeight:'400'}}> Carbohydrates Values : {selectedOffer?.carbohydratesValue} g</Text>
                          </View>
                          <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom:5}}>
                                <FontAwesomeIcon icon={faDna} size={25} color="#004651" style={{ marginLeft: 6, marginTop:2 }} />
                                <Text style={{fontSize:18, color:'black', fontFamily: "Poppins-SemiBold", fontWeight:'400'}}> Proteins Values: {selectedOffer?.proteinValue} g</Text>
                          </View>
                          <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom:5}}>
                                <FontAwesomeIcon icon={faOilWell} size={25} color="#004651" style={{ marginLeft: 6, marginTop:2 }} />
                                <Text style={{fontSize:18, color:'black', fontFamily: "Poppins-SemiBold", fontWeight:'400'}}> Fats Values: {selectedOffer?.fatsValue} g</Text>
                          </View>
                          <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom:5}}>
                                <FontAwesomeIcon icon={faFireFlameCurved}size={25} color="#004651" style={{ marginLeft: 6, marginTop:2 }} />
                                <Text style={{fontSize:18, color:'black', fontFamily: "Poppins-SemiBold", fontWeight:'400'}}> Caloric Values : {selectedOffer?.caloricValue} cal</Text>
                          </View>
                    </View>
                </View>
                <View style={{marginTop:5}}>
                    <Text style={{fontSize:16, fontWeight:'bold', alignSelf:'center',  fontFamily: "Poppins-SemiBold",color:'#5c5c5c', textAlign:'justify'}}>{selectedOffer?.description}</Text>
                </View>
                <TouchableOpacity style={{marginTop:25}} onPress={() => {chooseMethod(selectedOffer?.idOffer, selectedOffer?.price);}}>
                    <Text style={{ backgroundColor:'#004651',fontSize:20, fontWeight:'700', fontFamily: "Poppins-SemiBold", color: 'white', alignSelf:'center', borderRadius:25, padding:10, elevation:8 }}>Order Now</Text>
                </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </ScrollView>
      {/* Navigation Bar */}
      <NavigationBar screenWidth={screenWidth} />    
    </View>
    
  );
};

export default OffersPage;
