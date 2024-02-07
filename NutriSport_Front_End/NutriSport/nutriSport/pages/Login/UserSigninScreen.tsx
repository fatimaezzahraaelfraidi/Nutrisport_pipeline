import { faEnvelope, faEye, faEyeSlash, faFolder, faKey, faLock, faMailBulk, faMailForward, faMailReply } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, Alert, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import GetLocation from 'react-native-get-location';
import {  saveLocation, signIn } from '../../services/ApiService';
import messaging from '@react-native-firebase/messaging';

const UserSigninScreen =  ({navigation}: {navigation: any}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Add this line
  const [loading, setLoading] = useState(false);
  const signinUser = async () => {
    if (!email || !password)
      Alert.alert('Error', 'Fill in all required fields.');
    else {
      setLoading(true); // Set loading to true when starting the signin process

      try {
        await messaging().registerDeviceForRemoteMessages();
        const token = await messaging().getToken();
        console.log(token);
        const data = {
          login: email,
          password: password,
          fcmToken: token,
        };

        const resp = await signIn(data);
        console.log(resp);
        if (resp.role === '[ROLE_CHEF]') {
          GetLocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 15000,
          })
            .then(async (location) => {
              console.log(location);
              console.log(location.longitude);
              console.log(location.latitude);
              const resp = await saveLocation(location.latitude, location.longitude);
              console.log(resp);
              setLoading(false); // Turn off loading after successful response
              navigation.push('Demands');
            })
            .catch((error) => {
              setLoading(false); // Turn off loading if there's an error
              // Handle error
            });
        } else {
          GetLocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 15000,
          })
            .then(async (location) => {
              console.log(location);
              console.log(location.longitude);
              console.log(location.latitude);
              const resp = await saveLocation(location.latitude, location.longitude);
              console.log(resp);
              setLoading(false); // Turn off loading after successful response
              navigation.push('Home');
            })
            .catch((error) => {
              setLoading(false); // Turn off loading if there's an error
              // Handle error
            });
        }
      } catch (error: any) {
        setLoading(false); // Turn off loading if there's an error
        console.error('Error during user signin:', error.message);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <ScrollView style={styles.page}>
        <View style={styles.container1}>
          <Image style={styles.image} resizeMode="cover" source={require('./../../images/nutrisport.jpg')} />
        </View>
        <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center',marginBottom:50  }}>
            <Text style={styles.welcome}>WELCOME</Text>
            <Text style={styles.signInTo}>sign in to access your account</Text>
        </View>

        <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}>
        {/* Email input */}
        <View style={styles.rectangleView}>
          <TextInput style={{ fontSize: 14, fontFamily: 'Poppins-Regular', color: 'black', textAlign: 'left', marginLeft: 20 }} placeholder="Enter your email" keyboardType='email-address' value={email} onChangeText={setEmail} />
          <FontAwesomeIcon icon={faEnvelope} size={20} color="#004651" style={{ position: 'absolute', right: 20, marginTop: 17 }} />
        </View>

        {/* Password input with show/hide toggle */}
        <View style={styles.rectangleView}>
          <TextInput
            style={{ fontSize: 14, fontFamily: 'Poppins-Regular', color: 'black', textAlign: 'left', marginLeft: 20, flex: 1 }}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword} // Toggle secureTextEntry based on showPassword state
          />
          {/* Toggle button below the password input */}
          <TouchableOpacity onPress={togglePasswordVisibility} style={{marginTop: 17,marginRight:20}}>
            <FontAwesomeIcon icon={showPassword ?faEye  :faEyeSlash }  color="#004651" size={20}/>
          </TouchableOpacity>
        </View>
          

          <View style={{ width:"90%",marginBottom:160}}>
            <Text style={{ textAlign:'right',fontSize: 12,fontWeight: "700",fontFamily: "Poppins-Bold",color: "#004651",}}>Forget password ?</Text>
          </View>
          
         
         
         
      
        </View>
        <View >
              <TouchableOpacity style={styles.button}  onPress={signinUser}>
                  <Text style={styles.buttonText}>LOG IN</Text>
              </TouchableOpacity>
        </View>
        <View  style={{flexDirection: 'row',alignContent: 'center', justifyContent: 'center', alignItems: 'center',}} >
            <Text style={{ textAlign:'center',fontSize: 12,fontWeight: "700",fontFamily: "Poppins-Bold",color: "#004651",}}>New Member? </Text>
            <TouchableOpacity    onPress={() => {navigation.navigate('UserRegistrationScreen');}}  >
                  <Text style={{ textAlign:'center',fontSize: 12,fontWeight: "700",fontFamily: "Poppins-Bold",color: "#004651",}}>Register now</Text>
              </TouchableOpacity>  
        </View>

        {loading && (
        <View >
          <ActivityIndicator size="large" color="#004651" />
        </View>
      )}
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
  
   marginBottom: 60,
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
        marginBottom:40,
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
          bottom:30,
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

export default UserSigninScreen;
