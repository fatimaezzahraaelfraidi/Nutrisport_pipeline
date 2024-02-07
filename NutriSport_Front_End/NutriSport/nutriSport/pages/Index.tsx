import * as React from "react";
import {Image, StyleSheet, Text, View, Pressable, Button, TouchableOpacity} from "react-native";
import Settings from './Settings'; // Import the modal component


const Index = ({navigation}: {navigation: any}) => {




  	return (
    		<View style={styles.idexSytyle}> 
            <View  style={styles.container}>
              <Image style={styles.image} resizeMode="cover" source={require('./../images/g12.jpg')}/>
              <Text style={styles.text}>NutriSport</Text> 
            </View>
            <View style={styles.container}>
              <Image style={styles.plate} resizeMode="cover" source={require('./../images/plate1.jpg')}/>
            </View>
            <View style={styles.container2}>
                <View style={styles.container}>
                    <Text style={styles.welcome} >Welcome </Text> 
                </View>
                <View style={styles.container}>
                    <Text style={styles.ordertext} >Order your healthy food based on your own needs  </Text>   
                </View>
                <View style={styles.container}>
                      <TouchableOpacity style={styles.button}
                                onPress={() => {navigation.navigate('UserSigninScreen');}} 
       
                                 >
                           
                              <Text style={styles.buttonText}>Get Started</Text>
                      </TouchableOpacity>
                    {/* <TouchableOpacity
                        style={styles.tmpButton}
                        // onPress={() => {navigation.navigate('Home');}}
                        onPress={() => {navigation.navigate('Home');}}
                    >
                      <Text style={styles.tmpButtonText}>User Sportif</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.tmpButton}
                      onPress={() => {navigation.navigate('Demands');}}
                    >
                        <Text style={styles.tmpButtonText}>User Préparateur</Text>


    </TouchableOpacity> */}
                </View>
            </View>
        </View>);
};

const styles = StyleSheet.create({
    container2: {
      alignItems: 'center', // Align items horizontally in the center
    },
    idexSytyle:{
      backgroundColor: "#fff",
      flex: 1,
      overflow: "hidden",
      width: "100%",
      height: "100%",
    },
    container: {
      flexDirection: 'row', // Horizontal layout
      alignItems: 'center', // Align items vertically in the center
      justifyContent : 'center',
      margin :15,
      marginTop:43,
    },
    text: {
      fontSize: 37,
      lineHeight: 40,
      fontWeight: "700",
      fontFamily: "Poppins-Bold",
      color: "#004651",
      textAlign: "center",
      width: 258,
      height: 49

    },
    image: {
      width: 50, // Adjust the width as needed
      height: 50, // Adjust the height as needed
      resizeMode: 'contain', // or 'cover' or 'stretch' as per your requirement
    },
    plate:{
      width: 250,
      height: 250
    },
    welcome:{
      fontSize: 28,
      lineHeight: 32,
      fontWeight: "700",
      fontFamily: "Poppins-Bold",
      color: "#3a3a3a",
      textAlign: "center",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      width: 327
    },
    ordertext: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: "Poppins-Regular",
      color: "#3a3a3a",
      textAlign: "center",
      width: 327
      },
    button:{
      borderRadius: 8,
      backgroundColor: "#004651",
      width: 300,
      height: 48
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
      justifyContent: "center",

    },
    tmpButton: {
      margin: 10,

      borderRadius: 8,
      backgroundColor: "#004651",
     
      padding: 10,
      width: 180, // Set the width as needed
      alignItems: 'center',
    },
    tmpButtonText: {
      color: 'white',
      fontSize: 16,
    },


});

export default Index;
