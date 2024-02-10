import { View, Text, TextInput,  ScrollView, StyleSheet, Alert, Image, TouchableOpacity, Button   } from 'react-native';
import React, { useState } from 'react'; 
import {  Picker as SelectPicker } from '@react-native-picker/picker';
import { saveDemande } from '../../services/ApiService';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendarDays, faClock  } from '@fortawesome/free-solid-svg-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { io } from 'socket.io-client';
import config from '../config';

const PostRequest =  ({navigation}: {navigation: any}) => {
    const [desired_delivery_date, setDate] = useState(new Date());
    const [caloricValue, setCaloricValue] = useState('');
    const [description, setDescription] = useState('');
    const [proteinValue, setProteinValue] = useState('');
    const [carbohydratesValue, setCarbohydratesValue] = useState('');
    const [fatsValue, setFatsValue] = useState('');
    const [mealType, setMealType] = useState('breakfast');
    const [title, setTitle] = useState('');
    // for dateTimePicker
    const [show, setShow] = useState(false);
    const [mode, setMode] = useState('date');
    const [positiveButtonLabel, setPositiveButtonLabel] = useState('deliver me this time');

    const showDatepicker = () => {
        setShow(true);
        setMode('date');
        setPositiveButtonLabel('deliver me this day');
    };

    const showTimepicker = () => {
        setShow(true);
        setMode('time');
        setPositiveButtonLabel('deliver me this time')
    };

    const handleDateChange = (_event: any, selectedDate?: Date) => {
        setShow(false);
        if (selectedDate) {
            setDate(selectedDate);
          
        }
    };
    
    const handlePublish = async () => {
        if (!caloricValue ||
            !proteinValue ||
            !description ||
            !carbohydratesValue ||
            !fatsValue) {
            Alert.alert('Error', 'fill in all required fields.');
        }

else{
        try {
          // Prepare the data to be sent
            const data = {
            title,
            caloricValue,
            proteinValue,
            description,
            carbohydratesValue,
            fatsValue,
            mealType,
            desired_delivery_date,
            };
        const responseData = await saveDemande(data);
        
          console.log('Form submitted!', responseData);
        //   const socket1 = io('http://192.168.43.78:3100');
          const socket1 = io(`${config.API_BASE_URL}:${config.PORT}`);


          socket1.emit('newDemand', responseData); 
          Alert.alert('Success', responseData, [
            { text: 'OK', onPress: () => {
                navigation.push('DemandsS');
            } },
          ]);  
          // You can handle the response data here, if needed
        } catch (error) {
          // Handle the error here
        }}
    };
  
 
    return ( 
     
       

        <View style={styles.postReqSytyle}> 
                <View  style={styles.container1}>
                    <Image style={styles.image} resizeMode="cover" source={require('./../../images/nutrisport.jpg')}/>
                </View>
                <View  style={{marginTop:20, marginBottom:10 }}>
                    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center',marginBottom:10 }}>
                        <Text style={styles.textPost}>Post your request</Text>
                    </View>
                    
                    <ScrollView style={{ marginLeft:40,marginTop:20,marginRight:40,marginBottom:10}}>
                    <View style={styles.container6}>
                                    <Text style={styles.label}>Title :  <Text style={styles.required}>*</Text></Text>
                                    <TextInput
                                    style={styles.input1}
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholder="Add name of your meal ..."
                                    keyboardType="default"
                                    placeholderTextColor="black" 
                                    />
                        </View>
                     
                        <View>
                            <Text style={styles.label}>Meal Type:  <Text style={styles.required}>*</Text></Text>
                            <View style={styles.input1}>
                                <SelectPicker selectedValue={mealType} onValueChange={setMealType} >
                                        <SelectPicker.Item label="breakfast" value="breakfast" />
                                        <SelectPicker.Item label="lunch" value="lunch" />
                                        <SelectPicker.Item label="dinner" value="dinner" />
                                        <SelectPicker.Item label="snack" value="snack" />
                                </SelectPicker>
                            </View>
                        </View>
                        <View style={styles.container5}>
                        <View style={styles.container6}>
                                <Text style={styles.label}>Caloric Needs:  <Text style={styles.required}>*</Text></Text>
                                <TextInput
                                style={styles.input3}
                                value={caloricValue}
                                onChangeText={setCaloricValue}
                                placeholder="00.0"
                                keyboardType="numeric"
                                placeholderTextColor="black" 
                                />
                            </View>
                            <View style={styles.container6}>
                                <Text style={styles.label}>Fat Needs:  <Text style={styles.required}>*</Text></Text>
                                <TextInput
                                style={styles.input3}
                                value={fatsValue}
                                onChangeText={setFatsValue}
                                placeholder="00.0"
                                keyboardType="numeric"
                                placeholderTextColor="black" 
                                />
                        </View> 
                        
                        </View>
                        <View style={styles.container5}>
                        <View style={styles.container6}>
                                <Text style={styles.label}>Carbohydrates Needs:  <Text style={styles.required}>*</Text></Text>
                                <TextInput
                                style={styles.input3}
                                value={carbohydratesValue}
                                onChangeText={setCarbohydratesValue}
                                placeholder="00.0"
                                keyboardType="numeric"
                                placeholderTextColor="black" 
                                />
                            </View>
                            <View style={styles.container6}>
                                <Text style={styles.label}>Proteins Needs:  <Text style={styles.required}>*</Text></Text>
                                <TextInput
                                style={styles.input3}
                                value={proteinValue}
                                onChangeText={setProteinValue}
                                placeholder="00.0"
                                keyboardType="numeric"
                                placeholderTextColor="black" 
                                />
                        </View> 
                        
                        </View>
                        <View style={styles.container6}>
                                <Text style={styles.label}>Description:  <Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={styles.descriptionInput}
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Enter ingredients, specific needs ..."
                                    placeholderTextColor="black"
                                    multiline
                                    numberOfLines={4} // Adjust the number of lines as needed
                                />
                        </View>
                        <View style={styles.container6}>
                                <Text style={styles.label}>Desired Delivery Date  <Text style={styles.required}>*</Text></Text>
                                <View style={[styles.alignCenter]}>
                                <TouchableOpacity onPress={showDatepicker} style={{ flexDirection: 'row',  width: '50%',}}>
                                        <FontAwesomeIcon icon={faCalendarDays}   size={20} color="#004651" style={{ marginRight: 10 ,marginTop :7}} />
                                        <View style={{ 
                                                borderRadius: 4,
                                                backgroundColor: "#fff",
                                                borderStyle: "solid",
                                                borderColor: "#e5e7f0",
                                                borderWidth: 1,
                                                width: "50%",
                                                flex: 1,
                                                marginTop:7}}>
                                            <Text  style={{ textAlign: 'center' }}>                                       
                                                {desired_delivery_date.getDate().toString()+"/"+(desired_delivery_date.getMonth()+1).toString()
                                                +"/" +desired_delivery_date.getFullYear().toString()}
                                            </Text>
                                        </View>
                                </TouchableOpacity>
                
                                </View>  
                        </View>
                        <View style={styles.container6}>
                                <Text style={styles.label}>Desired Delivery time  <Text style={styles.required}>*</Text></Text>
                                <View style={[styles.alignCenter]}>
                                    <TouchableOpacity onPress={showTimepicker} style={{ flexDirection: 'row',  width: '50%',}}>
                                            <FontAwesomeIcon icon={faClock}   size={20} color="#004651" style={{ marginRight: 10 ,marginTop :7}} />
                                            <View style={{
                                                    borderRadius: 4,
                                                    backgroundColor: "#fff",
                                                    borderStyle: "solid",
                                                    borderColor: "#e5e7f0",
                                                    borderWidth: 1,
                                                    width: "50%",
                                                    flex: 1,
                                                    marginTop:7}}>
                                                <Text  style={{ textAlign: 'center' }}>                                       
                                                    {desired_delivery_date.getHours().toString()+":"+(desired_delivery_date.getMinutes()).toString()}
                                                </Text>
                                            </View>
                                    </TouchableOpacity>
                                    {show && (
                                        <DateTimePicker
                                            testID="dateTimePicker"
                                            value={desired_delivery_date}
                                            mode={mode}
                                            display="spinner"
                                            is24Hour={true}
                                            //  display="default"
                                            positiveButton={{label: positiveButtonLabel, textColor: '#004651'}}
                                            negativeButton={{label: 'cancel', textColor: '#004651'}}
                                            onChange={handleDateChange}
                                            minimumDate={new Date()} 
                                            style={{ backgroundColor: "#004651",borderColor:"#004651"}}       
                                        />
                                    )}
                                </View>  
                        </View>
                        
                            
                        
                    </ScrollView>
                    
                    <View style={styles.container}>
                        <TouchableOpacity style={styles.button} onPress={handlePublish}>
                            <Text style={styles.buttonText}>POST MY REQUEST</Text>
                        </TouchableOpacity>
                    </View>
                </View>
        </View>
        );
    }
const styles = StyleSheet.create({
    errorText: {
        color: 'red',
        marginTop: 5,
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
    button:{
            borderRadius: 8,
            backgroundColor: "#004651",
            width: 300,
            height: 48,
            position: 'absolute',
            bottom: 5,
    },
    container: {
            flexDirection: 'row', // Horizontal layout
            alignItems: 'center', // Align items vertically in the center
            justifyContent : 'center',
            margin :15,
            marginTop:43,
    },
    postReqSytyle:{
            backgroundColor: "#fff",
            overflow: "hidden",
            width: "100%",marginBottom:10,
            height: "100%",
            flex: 1, 
    },
    container1: {
            flexDirection: 'row', 
            justifyContent: 'center',
            alignItems: 'center' ,
            marginBottom:10,
            marginTop:25
    },
    container5:{ 
        flexDirection: 'row',
        width: '100%',
        marginBottom:10  
    },
    container6:{ 
        flexDirection:'column',
        flex:1,
        width: '100%',
        marginBottom:10 
    },
    required:{ color: "red"},
    alignCenter:{ alignItems: 'center',justifyContent: 'center'},
    image: {
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
    postYourRequest: {
        fontSize: 20,
        fontWeight: "300",
        fontFamily: "Poppins-Light",
        color: "#000",
        textAlign: "left",
        marginTop:20,
    },
    label: {
            alignSelf: "stretch",
            fontSize: 12,
            lineHeight: 16,
            fontWeight: "600",
            fontFamily: "Poppins-SemiBold",
            color: "#697386",
            textAlign: "left"
    },
    input1: {
            borderRadius: 5,
            backgroundColor: "#fff",
            borderStyle: "solid",
            borderColor: "#697386",
            borderWidth: 1,
            width: "100%",
            height: 40,
            justifyContent: 'center',
            marginBottom:10
    },
    input3:{
            borderRadius: 5,
            backgroundColor: "#fff",
            borderStyle: "solid",
            borderColor: "#697386",
            borderWidth: 1,
            flex: 1,
            width: "95%",
            height: 40,
    },
    descriptionInput: {
            borderRadius: 5,
            backgroundColor: "#fff",
            borderStyle: "solid",
            borderColor: "#697386",
            borderWidth: 1,
            flex: 1,
            width: "100%",
            height: 106,
            textAlignVertical: 'top',
            padding: 10,
            marginBottom:10,
    },
    slash : {      
            fontSize: 19,
            lineHeight: 32, 
            fontFamily: "Poppins-SemiBold",
            color: "#697386", 
    },
});
    
    export default PostRequest;