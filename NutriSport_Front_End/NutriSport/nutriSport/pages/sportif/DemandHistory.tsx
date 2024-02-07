// OrderHistory.js

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ScrollView, TouchableOpacity, Modal, Dimensions } from 'react-native';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBolt, faDna, faFireFlameCurved, faMotorcycle, faOilWell, faPersonWalking, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { fetchDemands, fetchDemandsHistory } from '../../services/ApiService';
import NavigationBar from '../../components/NavigationBar-s';

const screenWidth = Dimensions.get('window').width;
const screenHeight= Dimensions.get('window').height;
const DemandHistory = () => {
  const [selectedDeliveryMode,setselectedDeliveryMode] = useState(0);

  const [demands, setDemands] = useState<dataHistory[]>([]);
  interface dataHistory {
    idDemand: number;
    title: string;
    mealType: string;
    caloricValue: number;
    fatsValue: number;
    proteinValue: number;
    carbohydratesValue: number;
    description: string | null;
    desired_delivery_date: Date;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
    sportifSession: string;
    formattedDate: string;
    devis: Devis[]; // Array of devis
    order:Order;
  }
 

  useEffect(() => {
    const getDemands = async () => {
      try {
        const data = await fetchDemandsHistory();
        console.log(data);
        setDemands(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
   
    getDemands(); 
  }, []);


  return (
    <View style={styles.container}>
      <View  style={styles.container1}>
                    <Image style={styles.image} resizeMode="cover" source={require('./../../images/nutrisport.jpg')}/>
      </View>
                <View  style={{marginTop:20, marginBottom:10 }}>
                    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center',marginBottom:10 }}>
                        <Text style={styles.textPost}>Demand History</Text>
                    </View>
                    {/* <View style={{ width: 250, height: 30, alignItems: 'center', borderWidth: 1, borderRadius: 50, flexDirection: 'row', backgroundColor: 'white', borderColor: '#004651', paddingLeft: 1, paddingRight: 1, marginHorizontal: 80 }}>
                        <TouchableOpacity style={{ width: '50%', height: '96%', backgroundColor: selectedDeliveryMode === 0 ? '#004651' : 'white', borderRadius: 50 }} onPress={() => { setselectedDeliveryMode(0); }}>
                          <Text style={{ marginLeft: 8, marginTop: 3, color: selectedDeliveryMode === 0 ? 'white' : '#004651' }}>Available</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ width: '50%', height: '96%', borderRadius: 50, backgroundColor: selectedDeliveryMode === 0 ? 'white' : '#004651' }} onPress={() => { setselectedDeliveryMode(1); }}>
                          <Text style={{ marginLeft: 8, marginTop: 3, color: selectedDeliveryMode === 0 ? '#004651' : 'white' }}>Not Available </Text>
                        </TouchableOpacity>
                    </View> */}
                </View>
               
                <ScrollView contentContainerStyle={{paddingBottom: 50 }}>
                {demands.map((demand) => ( 
                <View key={demand.idDemand} style={{alignItems: 'center',borderWidth:2,borderColor:'#004651',borderRadius:10,marginBottom: 10,marginLeft: 10,height:380,width:"96%", elevation: 10,backgroundColor:"white" }}>
                    <View style={{flexDirection: 'row',height:50,width:"100%", padding:10,}}>
                        
                        <View style={{flexDirection: 'column',height:90,width:"60%"}}>
                        <View style={{flexDirection: 'row',width:"100%" }}>
                          {/* title */}
                          <Text style={{fontSize:14, color:'black', fontFamily: "Poppins-SemiBold", fontWeight:'400' }}>Title : {demand.title}</Text>
                          <View style={{ marginLeft:30,marginTop:-5,width:80, height: 35, backgroundColor: 'white',borderWidth:1, borderRadius: 50,borderColor:'#004651',}} >
                                <Text style={{  marginTop: 3,  width:"100%",color:'#004651',textAlign:'center' }}> {demand.mealType}</Text>
                          </View>
                          </View>
                          {/* date */}
                          <Text style={{fontSize:14, color:'black', fontFamily: "Poppins-SemiBold", fontWeight:'400' }}>Saved on:{demand.formattedDate} </Text>
                          </View>
                        <View style={{alignContent:'flex-end',height:90,width:"40%"}}>
                            <View style={{ width: 110, height: 40, backgroundColor: demand.isAvailable ? '#E3AF3D'  : '#004651' ,borderWidth:1, borderBottomLeftRadius: 50,borderTopLeftRadius: 50,borderColor:'#004651',marginBottom:30 ,marginLeft:50}} >
                                <Text style={{ textAlign:'center',marginTop:8, width:"100%" ,color: demand.isAvailable ?  '#004651' : 'white'}}> {demand.isAvailable?"Available":"Not Available"}</Text>
                            </View>
                        </View>
                    </View>
                          {/* desc */}
                    <View style={{flexDirection: 'column' ,width:"100%", marginTop:20,marginBottom:8,marginLeft:20}}>
                        
                         <Text style={{fontSize:14, color:'black', fontFamily: "Poppins-SemiBold", fontWeight:'400' }}>{demand.description} </Text>
                    </View>
                        {/* needs */}
                    <View style={{flexDirection: 'column',height:70,width:"100%" }}>
                      <Text style={{width:"100%",textAlign:'center' , fontSize:15, color:'black', fontFamily: "Poppins-SemiBold", fontWeight:'400'  }}>Needs: </Text>
                      <View style={{flexDirection:"column" ,width:"100%"}}>
                          <View style={{flexDirection:"row" ,width:"100%"}}>
                                <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom:5,width:"50%"}}>
                                      <FontAwesomeIcon icon={faBolt} size={19} color="#004651" style={{ marginLeft: 6, marginTop:2 }} />
                                      <Text style={{fontSize:14, color:'black', fontFamily: "Poppins-SemiBold", fontWeight:'400'}}> Carbohydrates : {demand.carbohydratesValue}g</Text>
                                </View>
                                <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom:5,width:"50%"}}>
                                      <FontAwesomeIcon icon={faDna} size={19} color="#004651" style={{ marginLeft: 6, marginTop:2 }} />
                                      <Text style={{fontSize:14, color:'black', fontFamily: "Poppins-SemiBold", fontWeight:'400'}}> Proteins:{demand.proteinValue} g</Text>
                                </View>
                          </View>
                          <View style={{flexDirection:"row" ,width:"100%"}}> 
                              <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom:5,width:"50%"}}>
                                    <FontAwesomeIcon icon={faOilWell} size={20} color="#004651" style={{ marginLeft: -50, marginTop:2 }} />
                                    <Text style={{fontSize:16, color:'black', fontFamily: "Poppins-SemiBold", fontWeight:'400'}}> Fats:{demand.fatsValue} g</Text>
                              </View>
                              <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom:5,width:"50%"}}>
                                    <FontAwesomeIcon icon={faFireFlameCurved}size={20} color="#004651" style={{ marginLeft:8, marginTop:2 }} />
                                    <Text style={{fontSize:16, color:'black', fontFamily: "Poppins-SemiBold", fontWeight:'400'}}> Caloric :{demand.caloricValue} cal</Text>
                              </View>
                          </View>
                    </View>
                    </View>


                    <View style={{flexDirection: 'column',height:70,width:"100%", padding:10}}>
                        <View style={{  width:"100%",flexDirection:'row', justifyContent: 'center',marginLeft:20,marginBottom:6}}>
                            <View style={{  width:300, height: 35, backgroundColor: 'white',borderWidth:1, borderRadius: 50,borderColor:'#004651',marginLeft:-50}} >
                                <Text style={{ marginLeft: 8, marginTop: 3, width:"100%",color:'#004651',textAlign:'center',fontSize:15,  fontFamily: "Poppins-SemiBold", fontWeight:'400'  }}> devis linked to demand: {demand.devis.length}</Text>
                            </View>
                        </View>  
                        <View style={{flexDirection: 'column' ,width:"100%", marginBottom:8}}>
                          <Text style={{width:"100%",textAlign:'center' ,fontSize:14, color:'black', fontFamily: "Poppins-SemiBold", fontWeight:'400' }}>  {demand.order? `a devis has been accepted with price:  ${demand.order.price} DH`:'No devis was accepted'     }  </Text>
                        </View> 
                        <View style={{  width:"100%",flexDirection:'row', justifyContent: 'center',marginLeft:20,marginBottom:6}}>
                            <View style={{  width:300, height: 35, backgroundColor: 'white',borderWidth:1, borderRadius: 50,borderColor:'#004651',marginLeft:-50}} >
                                <Text style={{ marginLeft: 8, marginTop: 3, width:"100%",color:'#004651' ,textAlign:'center',fontSize:15 , fontFamily: "Poppins-SemiBold", fontWeight:'400'  }}>order linked to demand: </Text>
                            </View>
                        </View>  
                        <View style={{flexDirection: 'column' ,width:"100%", marginBottom:8}}>
                          <Text style={{width:"100%",textAlign:'center', fontSize:14 , fontFamily: "Poppins-SemiBold", fontWeight:'400', color:'black'}}>  {demand.order?.orderStatus?` order Number: ${demand.order?.idOrder}        status: ${demand.order?.orderStatus}  `:'No order yet'} </Text>
                        </View>
                    </View>
                </View>
                ))}

                
                </ScrollView>
                  {/* Navigation Bar */}
      <NavigationBar screenWidth={screenWidth} /> 
  
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    overflow: "hidden",
    width: "100%",marginBottom:10,
    height: "100%",
    flex: 1, 
  },
  orderItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  container1: {
    flexDirection: 'row', 
    justifyContent: 'center',
    alignItems: 'center' ,
    marginBottom:10,
    marginTop:25
},    image: {
  width: 200, 
  height: 45, 
  borderRadius: 12.5, 
  alignSelf: 'center'
},
textPost:{
  fontSize: 20,
  fontWeight: "300",
  fontFamily: "Poppins-Light",
  color: "#000",
  textAlign: "left",
},
});

export default DemandHistory;
