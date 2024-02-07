import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {  faCircle, faClock, faClockRotateLeft, faLocationArrow, faLocationDot} from '@fortawesome/free-solid-svg-icons';
import React from 'react';
const screenWidth = Dimensions.get('window').width;
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableHighlight,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
  Alert,
} from 'react-native';

import MapView, { Callout, MAP_TYPES, MapMarker} from 'react-native-maps';
import { nearbyDemands, proposeDevisS } from '../../services/ApiService';
import NavigationBar from '../../components/NavigationBar-p';
import GetLocation from 'react-native-get-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width, height} = Dimensions.get('window');

const ASPECT_RATIO = width / height;


const LATITUDE = 33.67338084427163
const LONGITUDE = -7.416532181355147
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;



class DemandsMap extends React.Component<any, any> {
  
  constructor(props: any) {
    super(props);

    this.state = {
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      demands: [] as Array<{
        idDemand: number;
        latitude: number;
        longitude: number;
        mealType?: string;
        desired_delivery_date?: string;
        distance?: string;
        sportifSession: any;
      }>,
      isModalVisible: false,
      selectedDemand: null,
      devis: null,
      backgroundColorValue : "#fff"



    };
    
  }
  
  seeDetails(demand : any) {
    this.setState({ selectedDemand: demand, isModalVisible: true, backgroundColorValue: 'rgba(0, 70, 81, 0.6)'});
  }
  closeModal() {
    this.setState({ isModalVisible: false , backgroundColorValue: '#fff'});
  }
  async componentDidMount() {
    const data = await nearbyDemands();
    // console.log(data);
    const userDemand = {
      idDemand: 0,
      latitude: LATITUDE,
      longitude: LONGITUDE,
    };


    const demandsWithDistance = await this.calculateDistance(userDemand, data);
    this.setState({
      demands: [userDemand, ...demandsWithDistance.map((demand, index) => ({ ...demand, idDemand: index + 1 }))]
    });
  }
  
  getRandomColor() {
    const colors = ['#004651', '#22A45D', '#00A181', '#A4E473', '#2C975C'];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }
  async calculateDistance(userCoords: { latitude: number; longitude: number }, demands: any[]) {
    const apiKey = 'AIzaSyDcELAMQ7jNEno3GYitHGQza2O8wuye-Ok';
    const apiUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json';
    let lat=0
    let long=0
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
    const demandsWithDistance = await Promise.all(
      demands.map(async (demand) => {
        const latitude = demand.sportifSession?.currentPosition?.coordinates[0] || demand.latitude;
        const longitude = demand.sportifSession?.currentPosition?.coordinates[1] || demand.longitude;
        const id = demand.idDemand;
        const origin = `${lat},${long}`;
        console.log(origin);
        const destination = `${latitude},${longitude}`;
        console.log(destination);
        const url = `${apiUrl}?origins=${origin}&destinations=${destination}&key=${apiKey}`;
  
        try {
          const response = await fetch(url);
          const data = await response.json();
          const distance = data.rows[0].elements[0].distance.text;
  
          return { ...demand, id, distance, latitude, longitude };
        } catch (error) {
          console.error('Error calculating distance:', error);
          return demand;
        }
      })
    );
  
    return demandsWithDistance;
  }
  
  getDayName = (inputDate: string) => {
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

  proposeDevis(idDemand: number | undefined, devis: string):void {
    console.log("demand "+idDemand+" devis = "+devis);
    proposeDevisS(idDemand,devis).then((data) => {
      // Handle the response data if needed
      console.log('propose Devis Response:', data);
      this.closeModal();
    })
    .catch((error) => {
      // Handle errors
      console.error('Error proposing devis:', error);
    });
  }
  handleLocationArrowClick = () => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    })
    .then(async location => {
      console.log(location);
      console.log(location.longitude);
      console.log(location.latitude);
  
      // Update the state with new latitude and longitude
      this.setState((prevState: { region: any; }) => ({
        region: {
          ...prevState.region,
          latitude: location.latitude,
          longitude: location.longitude,
        },
        currentLocation: {
          latitude: location.latitude,
          longitude: location.longitude,
        }
      }), () => {
        // This callback will be called after the state has been updated
        // You can perform any actions that depend on the updated state here
        console.log("State updated:", this.state.region);
      });
  
      // You may also want to save the location to the server here
    })
    .catch(error => {
      const { code, message} = error;
      if (code === 'CANCELLED') {
        Alert.alert('location cancelled by user or by another request');
      }
      if (code === 'UNAVAILABLE') {
        Alert.alert('Location service is disabled or unavailable');
      }
      if (code === 'TIMEOUT') {
        Alert.alert('Location request timed out');
      }
      if (code === 'UNAUTHORIZED') {
        Alert.alert('Authorization denied')
      }
    });
  }
 
  renderMarkers() {
    const { demands, currentLocation } = this.state;
    return (
      <>
        {currentLocation && (
          <MapMarker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Current Location"
            pinColor="#FF0000"
            
          >
            <View style={styles.styleLocationIcon}>
            <FontAwesomeIcon icon={faCircle} size={25} color='#004651'  />
            </View>
          </MapMarker>
          
        )}
       {demands.map((demand: any) => (
  demand.idDemand !== 0 && (
    <MapMarker
      key={demand.idDemand}
      coordinate={{
        latitude: demand.latitude,
        longitude: demand.longitude,
      }}
      pinColor={this.getRandomColor()}
    >
      <FontAwesomeIcon icon={faLocationDot} size={40} color={this.getRandomColor()} />
      <Callout onPress={() => this.seeDetails(demand)}>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutMealType}>{demand.mealType}</Text>
          <View style={styles.timingContainer}>
            <FontAwesomeIcon icon={faClockRotateLeft} size={17} color='#8f8888' />
            <Text style={styles.timingText}> {this.getDayName(demand.desired_delivery_date)}</Text>
          </View>
          <View style={styles.centerAligns}>
            <TouchableOpacity style={styles.button} onPress={() => this.seeDetails(demand)}>
              <Text style={styles.buttonText}>See Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Callout>
    </MapMarker>
  )
))}

      </>
    );
  }
  
  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
          <View style={styles.ReqSytyle}>
              <View style={styles.container1}>
                  <Image style={styles.image} resizeMode="cover" source={require('./../../images/nutrisport.jpg')} />
              </View>
              <View style={{ marginTop: 5, marginBottom: 2}}>
                  <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10}}>
                      <Text style={styles.textPost}>Demands on your geographic zone</Text>
                  </View>
              </View>
              <View style={{ backgroundColor: this.state.backgroundColorValue,flex:1, paddingTop:120}}>
                  <View style={styles.container}>
                      <MapView style={styles.mapStyle} 
                               region={this.state.region} // Pass region state as a prop
                               mapType={MAP_TYPES.STANDARD}
                               customMapStyle={mapStyle}>
                           {this.renderMarkers()}
                      </MapView>
                      <View style={styles.buttonContainer}>
                      <TouchableOpacity style={[styles.locationButton]} onPress={this.handleLocationArrowClick}>
                        <FontAwesomeIcon icon={faLocationArrow} size={25} color='#004651'/>
                        </TouchableOpacity>
                      </View>  
                  </View>
                  <Modal animationType="fade" transparent={true} visible={this.state.isModalVisible} onRequestClose={() => {this.closeModal();}}>
                       <View style={{backgroundColor: this.state.backgroundColorValue,flex:1}}>
                          <View style={styles.modalContainer}>
                              <View style={{flexDirection:'column',flex:1,width:"100%"}}>
                                  <View  style={{ flexDirection:'row'}}>
                                      <Text style={{fontSize: 20,
                                                    lineHeight: 40,
                                                    fontWeight: "bold",
                                                    fontFamily: "Poppins-SemiBold",
                                                    color: "#004651",
                                                    textAlign: 'center',
                                                    width: "100%",
                                                  }}>{this.state.selectedDemand?.mealType}
                                      </Text>
                                      <TouchableOpacity style={styles.closeButton} onPress={() => {this.closeModal();}}>
                                           <Text style={styles.closeButtonText}>X</Text>
                                      </TouchableOpacity>
                                  </View>
                                  <View style={styles.timeContainer}>
                                      <Text style={styles.textFixStyle}>Request From:</Text>
                                      <Text style={styles.variantStyle3}>user</Text>
                                  </View>
                                  <View style={styles.timeContainer}>
                                      <Text style={styles.textFixStyle}>Far from you by:</Text>
                                      <Text style={styles.variantStyle3}>{this.state.selectedDemand?.distance}</Text>
                                  </View>
                                  <View style={styles.timeContainer}>
                                      <Text style={styles.textFixStyle}>Delivery Time:</Text>
                                      <Text style={styles.variantStyle3}>{this.getDayName(this.state.selectedDemand?.desired_delivery_date)}</Text>
                                  </View>
                                  <View style={styles.needsContainer}>
                                       <Text style={styles.textFixStyle}>NEEDS : </Text>
                                       <View style={styles.needsItemsContainer}>
                                          <Text style={styles.variantStyle2}>{this.state.selectedDemand?.caloricValue} Calories </Text>
                                          <Text style={styles.variantStyle2}>{this.state.selectedDemand?.fatsValue} Fats </Text>
                                          <Text style={styles.variantStyle2}>{this.state.selectedDemand?.carbohydratesValue} Carbohydrates </Text>
                                          <Text style={styles.variantStyle2}>{this.state.selectedDemand?.proteinValue} Proteins </Text>
                                       </View>
                                  </View>
                                  <View style={{ flexDirection: 'column',flex:3,height: '100%',}}>
                                      <Text style={{fontSize: 15,
                                                    lineHeight: 40,
                                                    fontWeight: "bold",
                                                    fontFamily: "Poppins-SemiBold",
                                                    color: "#004651",
                                                    textAlign: "left",
                                                    marginLeft:2}}>Description : 
                                      </Text>
                                      <Text style={styles.variantStyle2}>{this.state.selectedDemand?.description}  </Text>
                                  </View>
                                  <View style={{flexDirection: 'row', 
                                            alignItems: 'flex-end',
                                            justifyContent:'flex-end',
                                           paddingRight:10,
                                            width: '100%',
                                            marginBottom:5
                                           }}>
                                      <Text style={{fontSize: 15,
                                                    lineHeight: 40,
                                                    fontWeight: "bold",
                                                    fontFamily: "Poppins-SemiBold",
                                                    color: "#697386",
                                                    textAlign: "center",}}>ENTER DEVIS:</Text>
                                      <View style={styles.input2}>
                                          <TextInput
                                            value={this.state.devis}
                                            onChangeText={(text) => this.setState({ devis: text })}
                                            placeholder="00.0"
                                            keyboardType="numeric"
                                            placeholderTextColor="black"
                                          />
                                          <Text style={{ position: 'absolute', right: 3, marginTop: 5 }}>DH</Text>
                                      </View>
                                 </View>
                                  <View style={{flex: 1,width: '100%',
                                        bottom: 0,left:70,
                                        alignContent:'center',
                                        justifyContent: 'center',}}>
                                      <TouchableOpacity style={{
                                                              borderRadius: 50,
                                                              width: "50%",
                                                              height: 40,
                                                              backgroundColor: "#004651",}}
                                                              onPress={() => this.proposeDevis(this.state.selectedDemand?.id, this.state.devis)}
                                      >
                                          <Text style={styles.modelButtonText}>Propose Devis</Text>
                                      </TouchableOpacity>
                                  </View>
                               </View>
                          </View>
                        </View>
                  </Modal>
              </View>
          </View>
            {/* Navigation Bar */}
        <NavigationBar screenWidth={screenWidth} /> 
      </SafeAreaView>
      
    );
  }
}

const styles = StyleSheet.create({
    timeContainer:{
        flexDirection: 'row', // Horizontal layout
        alignItems: 'center', // Align items vertically in the center
        marginLeft: 5,
        // flex:1
    },
    textPost:{
        fontSize: 17,
        lineHeight: 40,
        fontWeight: "bold",
        fontFamily: "Poppins-Light",
        color: "#000",
        textAlign: "center"
    },
    modelButtonText:{
        fontSize: 15,
            lineHeight: 35,
            fontWeight: "bold",
            fontFamily: "Poppins-SemiBold",
            color: "#fff",
            textAlign: "center",  
      },
    textFixStyle:{
        fontSize: 15,
        lineHeight: 40,
        fontWeight: "bold",
        fontFamily: "Poppins-SemiBold",
        color: "#004651",
        textAlign: "center",
       
    },
    variantStyle3:{
      fontSize: 15,
      lineHeight: 40,
      fontWeight: "bold",
      fontFamily: "Poppins-SemiBold",
      color: "#000",
      textAlign: 'center',
       flex: 1,
       marginBottom:1
     
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
        fontSize: 15,
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
        marginTop:10,
    },
  styleLocationIcon:{
    
    backgroundColor:'rgba(0, 70, 81, 0.5)',
    borderRadius:100,
    width:60,
    height:60,
    alignItems:'center',
    justifyContent:'center'
   
    },
    input2:{
        borderRadius: 11,
        backgroundColor: "#fff",
        borderStyle: "solid",
        borderColor: "#697386",
        borderWidth: 1,
        width: "35%",
        height: 40,
        flexDirection: 'row',
        marginLeft: 8,
         
        
    },
 container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  centerAligns:{
    alignItems: 'center',
    justifyContent: 'center',
    padding :8
  },
  calloutContainer: {
    backgroundColor: 'white',
    width:220,
    height:100,
    borderRadius: 55,
    borderColor: '#000',
    alignItems:'center',
    justifyContent:'center',

  },
  closeButton: {
    position: 'absolute',
    top: 0.5,
    right: 4,
    borderRadius: 30,
    padding: 5,
    zIndex: 1,
  },
  button:{
    borderRadius: 12,
    backgroundColor: "#004651",
    width:  90,
    height: 27,
    alignItems: 'center',
    justifyContent: 'center',
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
container1: {
    flexDirection: 'row', 
    justifyContent: 'center',
    alignItems: 'center' ,
    marginBottom:0,
    marginTop:5,
    
},

buttonText: {
    fontSize: 14,
    lineHeight: 25,
    fontWeight: "bold",
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
    textAlign: "center",
    width: 72,
    height: 34,
    marginTop:8,
    alignItems: 'center',
    justifyContent: 'center',
},
  locationButton: {
    width: 70,
    height: 70,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:'white',
    marginLeft:240,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 6,
    marginBottom:20
  },
  closeButtonText: {
    color: '#004651',
    fontSize: 20,
    fontWeight: 'bold',
  },
 
  modalContainer: {
    width:"80%",
    height:500,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: "#fff",
    borderStyle: "solid",
    borderColor: "#004651",
    borderWidth: 2,
    position: "absolute",
    top: "20%",
    bottom:"20%",
    left:"10%"
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  mapStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  markerButton: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1, // Use borderWidth instead of borderColor
    borderColor: '#004651',
  },
  
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 50,
    marginHorizontal: 10,
  },
  calloutMealType:{
    color : '#004651',
    fontWeight : 'bold',
    fontFamily: "Poppins-SemiBold",
    fontSize:18
    
  },
  timingContainer: {
    flexDirection: 'row', // Add this line
    alignItems: 'center',
    paddingTop:2
  },
  timingText:{
    fontWeight: "bold",
    fontFamily: "Poppins-SemiBold",
    color:'black',
    fontSize:17
  },
  calloutBigContainer:{
    backgroundColor:'none',
  }
});
const mapStyle = [
  {
      "featureType": "all",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "on"
          },
          
      ]
  },
  {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [
          {
              
          },
          {
              "visibility": "on"
          },
          {
              "color": "#004651"
          }
      ]
  },
  {
      "featureType": "administrative",
      "elementType": "labels",
      "stylers": [
          {
              "visibility": "simplified"
          },
          
          {
              "color": "#004651"
          }
      ]
  },
  {
      "featureType": "administrative",
      "elementType": "labels.text",
      "stylers": [
          {
              
          },
          {
              
          },
          {
              "color": "#004651"
          }
      ]
  },
  {
      "featureType": "administrative.neighborhood",
      "elementType": "labels.text",
      "stylers": [
          {
              "hue": "#004651"
          },
          {
              
          },
          {
             
          },
          {
              "visibility": "simplified"
          },
          {
             
          }
      ]
  },
  {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [
          {
             
          },
          {
              
          },
          {
              "gamma": "2.31"
          },
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "landscape",
      "elementType": "labels",
      "stylers": [
          {
              "visibility": "simplified"
          },
          {
             
          },
          {
              // "gamma": "1"
          },
      ]
  },
  {
      "featureType": "landscape",
      "elementType": "labels.text.fill",
      "stylers": [
          {
              //"saturation": "-100"
          },
          {
             // "lightness": "-100"
          }
      ]
  },
  {
      "featureType": "landscape",
      "elementType": "labels.text.stroke",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "landscape.man_made",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "simplified"
          }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
          {
              "lightness": "0"
          },
          {
              "saturation": "45"
          },
          {
              "gamma": "4.24"
          },
          {
              "visibility": "simplified"
          },
          {
              "hue": "#00ff90"
          }
      ]
  },
  {
      "featureType": "poi.park",
      "elementType": "labels",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
          {
              
          },
          {
              "color": "#dfe9eb"
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "labels.text",
      "stylers": [
          {
              "visibility": "simplified"
          },
          {
              "color": "#004651"
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "labels.icon",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "road.arterial",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "transit",
      "elementType": "labels.icon",
      "stylers": [
          {
              "saturation": "-25"
          }
      ]
  },
  {
      "featureType": "transit.line",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "simplified"
          }
      ]
  },
  {
      "featureType": "transit.station.airport",
      "elementType": "labels.icon",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "lightness": "50"
          },
          {
              "gamma": ".75"
          },
          {
              "saturation": "100"
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "labels",
      "stylers": [
          {
              "visibility": "simplified"
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "labels.icon",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  }
];


export default DemandsMap;