import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, Alert, ScrollView, TouchableOpacity } from 'react-native';

import { signup,signIn, saveLocation } from '../../services/ApiService';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEnvelope, faIdCard, faLock, faMotorcycle, faPersonWalking, faPhone, faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import messaging from '@react-native-firebase/messaging';
import GetLocation from 'react-native-get-location';


const UserRegistrationScreen =  ({navigation}: {navigation: any}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [cin, setCin] = useState('');
  const [selectedRole,setSelectedRole] = useState("ROLE_SPORTIF");


  const registerUser = async () => {
    if (!email ||  !password  ||  !firstName ||  !lastName||  !phone || (selectedRole === "ROLE_CHEF" && !cin)) 
        Alert.alert('Error', 'fill in all required fields.');
      else{
        await messaging().registerDeviceForRemoteMessages();
        const token = await messaging().getToken();
        console.log(token)
    const data1 = {
      "user": {
                "firstName": firstName,
                "lastName": lastName,
                "email": email,
                "phoneNumber": phone,
                ...(selectedRole === "ROLE_CHEF" && { "cinNumber": cin }),
            },
            "email": email,
            "password": password,
            "role": selectedRole
            
        }
        console.log(token)
      const data2 = {
        "login": email,
        "password":password,
        "fcmToken" : token,
        }
    //navigation.push('Demands');
    try {console.log('befor signup');
      
      const resp1 = await signup(data1);
      console.log(resp1);
      const resp2 = await signIn(data2);
      console.log(resp2);
      if (resp2.role === "[ROLE_CHEF]") {
        GetLocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
        })
          .then(async location => {
            console.log(location);
            console.log(location.longitude);
            console.log(location.latitude);
            const resp = await saveLocation(location.latitude, location.longitude);
            console.log(resp);
            // Do something with the location, such as sending it to the server
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
        // Navigate to the Demands page for chefs
        navigation.push('Demands');
      } else {
        // Navigate to the home page for sportif
        GetLocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
        })
          .then(async location => {
            console.log(location);
            console.log(location.longitude);
            console.log(location.latitude);
            const resp = await saveLocation(location.latitude, location.longitude);
            console.log(resp);
            // Do something with the location, such as sending it to the server
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
        navigation.push('Home');
      }
      // Handle successful signin, e.g., navigation to another screen
    } catch (error: any) {
      console.error('Error during user signup:', error.message);
    }
  };
  }

  return (
    <ScrollView style={styles.page}>
        <View style={styles.container1}>
          <Image style={styles.image} resizeMode="cover" source={require('./../../images/nutrisport.jpg')} />
        </View>
        <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center',marginBottom:10  }}>
            <Text style={styles.welcome}>Create your account</Text>
            <Text style={styles.signInTo}>Easily & Free</Text>
        </View>
        
    
        <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center',marginBottom:5  }}>
          <View style={{ width: 224, height: 40, alignItems: 'center', borderWidth: 1, borderRadius: 50, flexDirection: 'row', backgroundColor: 'white', borderColor: '#004651', paddingLeft: 1, paddingRight: 1, marginHorizontal: 8,marginBottom:10  }}>
            <TouchableOpacity style={{ width: 100, height: '96%', backgroundColor: selectedRole == "ROLE_SPORTIF" ? '#004651' : 'white', borderRadius: 50 ,alignItems: 'center',  }} onPress={() => { setSelectedRole("ROLE_SPORTIF"); }}>
              <Text style={{fontSize:18,color:selectedRole === "ROLE_SPORTIF" ? 'white' : '#004651',marginTop: 3, fontWeight:'bold' }}>Sportif</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: 120, height: '96%', borderRadius: 50, backgroundColor: selectedRole ==="ROLE_SPORTIF" ? 'white' : '#004651' ,alignItems: 'center',  }} onPress={() => { setSelectedRole("ROLE_CHEF"); }}>
              <Text style={{fontSize:18,color:selectedRole === "ROLE_SPORTIF" ? '#004651' : 'white', marginTop: 3, fontWeight:'bold' }}>Preparator</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.rectangleView}>
              <TextInput style={{ fontSize: 14,fontFamily: "Poppins-Regular",color: "black",textAlign: "left" ,marginLeft:20}} placeholderTextColor={'black'} placeholder="Enter your first name" value={firstName} onChangeText={setFirstName} />
              <FontAwesomeIcon icon={faUser}   size={20} color="#004651" style={{ position:'absolute',right:20 ,marginTop :17}} />
          </View>
          <View style={styles.rectangleView}>
              <TextInput style={{ fontSize: 14,fontFamily: "Poppins-Regular",color: "black",textAlign: "left" ,marginLeft:20}} placeholderTextColor={'black'} placeholder="Enter your Last name" value={lastName} onChangeText={setLastName} />
              <FontAwesomeIcon icon={faUsers}   size={20} color="#004651" style={{ position:'absolute',right:20 ,marginTop :17}} />
          </View>
        
        {selectedRole === "ROLE_CHEF" && (
          <View style={styles.rectangleView}>
            <TextInput
              style={{ fontSize: 14, fontFamily: "Poppins-Regular", color: "black", textAlign: "left", marginLeft: 20 }}
              placeholderTextColor={'black'}
              placeholder="Enter your CIN "
              value={cin}
              onChangeText={setCin}
            />
            <FontAwesomeIcon icon={faIdCard} size={20} color="#004651" style={{ position: 'absolute', right: 20, marginTop: 17 }} />
          </View>  )}
          <View style={styles.rectangleView}>
              <TextInput style={{ fontSize: 14,fontFamily: "Poppins-Regular",color: "black",textAlign: "left" ,marginLeft:20}} placeholderTextColor={'black'} placeholder="Enter your phone number" keyboardType='phone-pad' value={phone} onChangeText={setPhone} />
              <FontAwesomeIcon icon={faPhone}   size={20} color="#004651" style={{ position:'absolute',right:20 ,marginTop :17}} />
          </View>
          <View style={styles.rectangleView}>
              <TextInput style={{ fontSize: 14,fontFamily: "Poppins-Regular",color: "black",textAlign: "left" ,marginLeft:20}} placeholderTextColor={'black'} placeholder="Enter your email" value={email} keyboardType='email-address' onChangeText={setEmail} />
              <FontAwesomeIcon icon={faEnvelope}   size={20} color="#004651" style={{ position:'absolute',right:20 ,marginTop :17}} />
          </View>

          <View style={styles.rectangleView}>
              <TextInput style={{ fontSize: 14,fontFamily: "Poppins-Regular",color: "black",textAlign: "left" ,marginLeft:20}} secureTextEntry={true}  placeholderTextColor={'black'} placeholder="Enter your password" value={password} onChangeText={setPassword} />
              <FontAwesomeIcon icon={faLock}   size={20}  color="#004651" style={{ position:'absolute',right:20 ,marginTop :17,}} />
          </View>
          <View style={{ marginBottom:85}}>
                      </View>
          
         
         
         
      
        </View>
        <View >
              <TouchableOpacity style={styles.button}  onPress={registerUser}>
                  <Text style={styles.buttonText}>NEXT</Text>
              </TouchableOpacity>
        </View>

       
          <View  style={{flexDirection: 'row',alignContent: 'center', justifyContent: 'center', alignItems: 'center',}} >
            <Text style={{ textAlign:'center',fontSize: 12,fontWeight: "700",fontFamily: "Poppins-Bold",color: "#004651",}}>Already a Member? </Text>
            <TouchableOpacity    onPress={() => {navigation.navigate('UserSigninScreen');}}  >
                  <Text style={{ textAlign:'center',fontSize: 12,fontWeight: "700",fontFamily: "Poppins-Bold",color: "#004651",}}>Login now</Text>
            </TouchableOpacity>  
          </View>


       
    </ScrollView>
  );
};
const styles = StyleSheet.create({
 
  page: {
  backgroundColor: "#fff",
  overflow: "hidden",
  flexDirection: 'column',
  width: "100%",
  height: "100%",
 
  },
  container1: {
  
   marginBottom: 50,
  marginTop: 55,
  },
  image: {
  width: 200,
  height: 45,
  borderRadius: 12.5,
  alignSelf: 'center'
  },

  welcome: {
    fontSize: 20,
    letterSpacing: 3.4,
    fontWeight: "800",
    fontFamily: "Poppins-ExtraBold",
    color: "#252525",
    
    
    },
    signInTo: {
      fontSize: 14,
      fontWeight: "500",
      fontFamily: "Poppins-Medium",
      color: "#252525",
       
      },
      rectangleView: {
        borderRadius: 10,
        backgroundColor: "rgba( 180,  180, 180, 0.1)",
        flexDirection: 'row',
        marginBottom:10,
        width: "90%",
        height: 61
        },
        button:{
          borderRadius: 20,
          alignItems:'center',
          flexDirection:'row',
          justifyContent:'center',
          backgroundColor: "#004651",
          width: 300,
          height: 70,
          position: 'absolute',
          bottom:10,
          left: 50,

  },
  
  buttonText: {
    fontSize: 14,
    letterSpacing: 1,
    lineHeight: 40,
    textTransform: "uppercase",
    fontWeight: "700",
    fontFamily: "Yu Gothic UI",
    color: "#fff",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
},
  
  });

export default UserRegistrationScreen;
 