import { View, Text, TextInput,  ScrollView, StyleSheet, Alert, Image, TouchableOpacity, Button, ActivityIndicator, Dimensions, Switch   } from 'react-native';
import React, { useState } from 'react'; 
import {  Picker as SelectPicker } from '@react-native-picker/picker';
import { launchImageLibrary, launchCamera, ImagePickerResponse, ImageLibraryOptions, MediaType } from 'react-native-image-picker';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCamera, faFolderPlus } from '@fortawesome/free-solid-svg-icons';
import storage from '@react-native-firebase/storage';
import { saveOffre } from '../../services/ApiService';
import ZoneMapComponent from './ZoneMap'; // Adjust the path accordingly
import NavigationBar from '../../components/NavigationBar-p';
import { io } from 'socket.io-client';
const screenWidth = Dimensions.get('window').width;
import config from './../../pages/config';
const PostOffer = ({navigation}: {navigation: any}) => {
    const [title, setTitle] = useState('');
    const [caloricValue, setCaloricValue] = useState('');
    const [description, setDescription] = useState('');
    const [proteinValue, setProteinValue] = useState('');
    const [carbohydratesValue, setCarbohydratesValue] = useState('');
    const [fatsValue, setFatsValue] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [preparation_time , setPreparation_time] = useState('');
    const [mealType, setMealType] = useState('breakfast'); 
    const [imgContainerHeight, setImgContainerHeight] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [tranferred, setTranferred] = useState(0);
    const [imgPath, setImgPath] = useState<string | null>(null);
    const [polygonData, setPolygonData] = useState([]); 
    const [isDeliverable, setIsDeliverable] = useState(true);

    const handlePolygonDataChange = (newPolygonData: any) => {
        setPolygonData(newPolygonData);
    };
    const openImagePicker = () => {
        setImgContainerHeight(150);
      const options: ImageLibraryOptions = {
        mediaType: 'photo' as MediaType,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
      };
  
      launchImageLibrary(options, (response: ImagePickerResponse) => {
        setImgContainerHeight(150);
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else {
          const imageUri =  (response.assets?.[0]?.uri ?? '');
          setImgPath(imageUri) 
          storageImageInFireBase(imageUri);
        }
      });
    };
    
    const handleCameraLaunch = () => {
        setImgContainerHeight(150);
        const options: ImageLibraryOptions = {
            mediaType: 'photo' as MediaType,
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
        };

    
      launchCamera(options, (response: ImagePickerResponse) => {
        setImgContainerHeight(150);
        console.log('Response = ', response);
        if (response.didCancel) {
            console.log('User cancelled camera');
        } else {
          // Process the captured image
          const imageUri = (response.assets?.[0]?.uri ?? '');
          setImgPath(imageUri); 
          storageImageInFireBase(imageUri);
        }
      });
    }
    const storageImageInFireBase= async(image : string)=>{
        console.log('in firebase');
        const uploadUri=image;
        if(uploadUri!==null){
            let fileName=uploadUri.substring(uploadUri.lastIndexOf('/')+1)
            setUploading(true);
            setImageUrl(fileName);
            const task=storage().ref(fileName).putFile(uploadUri);
            //set transferred state
            task.on('state_changed',  taskSnapshot=>{
            console.log(taskSnapshot.bytesTransferred +' transferred out of  '
            +taskSnapshot.totalBytes );
            setTranferred(Math.round(taskSnapshot.bytesTransferred / taskSnapshot.totalBytes*100));
        })
            
            try {
                await storage().ref(fileName).putFile(uploadUri);
                setUploading(false);
                console.log('fileName',fileName);
            //  Alert.alert('image uploaded!');
            } catch (error) {
                 console.log(error);   
            }
        }
     
    }
   
    const handlePublish = async () => {
        if (!caloricValue ||
            !proteinValue ||
            !description ||
            !carbohydratesValue ||
            !fatsValue||
            !title||
            !imageUrl||
            !preparation_time||
            !price || !polygonData.length) {
            Alert.alert('Error', 'fill in all required fields.');
        }

        else{
       
            try {
                //console.log(JSON.stringify(polygonData, null, 2));
                // const parsedPolygonData = JSON.parse(JSON.stringify(polygonData));
                // console.log("okk");
                // console.log(parsedPolygonData);
                // Prepare the data to be sent
                const data = {
                    
                    title,
                    caloricValue,
                    proteinValue,
                    description,
                    carbohydratesValue,
                    fatsValue,
                    mealType,
                    price,
                    imageUrl,
                    preparation_time,
                    isDeliverable,
                    geographicalArea: {
                        type: 'Polygon',
                        coordinates: JSON.parse(JSON.stringify(polygonData)),
                    },
                }; 
                // Make the API call using the service

                const responseData = await saveOffre(data);
                // const socket1 = io('http://192.168.43.78:3100');
                const socket1 = io(`${config.API_BASE_URL}:${config.PORT1}`);


                socket1.emit('newOffer', responseData);
                console.log('Form submitted!', responseData);
                Alert.alert('Success', responseData, [
                    { text: 'OK', onPress: () => {
                    navigation.push('MyOffers');
                    } },
                ]);
                // socket1.disconnect();
            // You can handle the response data here, if needed
            } catch (error) {
            // Handle the error here
          }
        }
    };
    return ( 

        <View style={styles.postReqSytyle}> 
                <View  style={styles.container1}>
                    <Image style={styles.image} resizeMode="cover" source={require('./../../images/nutrisport.jpg')}/>
                </View>
                <View  style={{marginTop:20,flex:1 }}>
                    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center',marginBottom:10 }}>
                        <Text style={styles.textPost}>Post your offer</Text>
                    </View>
                
                    <ScrollView style={{ marginLeft:20,marginTop:20,marginRight:20, height:"60%", }}>
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
                                <Text style={styles.label}>Caloric :  <Text style={styles.required}>*</Text></Text>
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
                                <Text style={styles.label}>Fat :  <Text style={styles.required}>*</Text></Text>
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
                                <Text style={styles.label}>Carbohydrates :  <Text style={styles.required}>*</Text></Text>
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
                                <Text style={styles.label}>Proteins :  <Text style={styles.required}>*</Text></Text>
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
                                    <Text style={styles.label}>Select Image of your offer :  <Text style={styles.required}>*</Text></Text>
                                    <View style={{  width: 200, 
                                            height: imgContainerHeight, 
                                            alignSelf: 'center'}}>
                                        {imgPath && (
                                            <Image
                                                source={{ uri: imgPath }}
                                                style={{ flex: 1 }}
                                                resizeMode="contain"
                                            />
                                        )}
                                            {uploading?   (
                                                <View style={{alignContent: 'center', justifyContent:'center'}}>
                                                    <Text style={{marginLeft:30}}>{tranferred} % completed! </Text>
                                                    <ActivityIndicator size="large" color="#0000ff"       ></ActivityIndicator>    
                                                </View> 
                                           ): <View style={{alignContent: 'center'}}>
                                         
                                           
                                    </View> }
                                    
                                    </View>
                                    <View style={styles.container5}>
                                    <TouchableOpacity  onPress={openImagePicker} style={{ flexDirection: 'row',  width: '50%',}}>
                                            <FontAwesomeIcon icon={faFolderPlus}   size={20} color="#004651" style={{ marginRight: 10 ,marginTop :15}} />
                                            <View style={{
                                                    borderRadius: 4,
                                                    backgroundColor: "#f5f7fa",
                                                    borderStyle: "solid",
                                                    borderColor: "#e5e7f0",
                                                    borderWidth: 1,
                                                    width: "50%",
                                                    flex: 1,
                                                    marginTop:7}}>
                                                <Text  style={{ textAlign: 'center' }}>                                       
                                                    choose from gallery 
                                                </Text>
                                            </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleCameraLaunch} style={{ flexDirection: 'row',  width: '50%',}}>
                                            <FontAwesomeIcon icon={faCamera}   size={20} color="#004651" style={{ marginRight: 10 , marginLeft:5,marginTop :15}} />
                                            <View style={{
                                                    borderRadius: 4,
                                                    backgroundColor: "#f5f7fa",
                                                    borderStyle: "solid",
                                                    borderColor: "#e5e7f0",
                                                    borderWidth: 1,
                                                    width: "50%",
                                                    flex: 1,
                                                    marginTop:7}}>
                                                <Text  style={{ textAlign: 'center' ,marginTop:5}}>                                       
                                                    open camera 
                                                </Text>
                                            </View>
                                    </TouchableOpacity>
                                    </View>
                        </View>
                       
                        <View style={styles.container5}>
                            {/* <View style={styles.container6}>
                                <Text style={styles.label}>Price :  <Text style={styles.required}>*</Text></Text>
                                <View style={styles.input2}>
                                        <TextInput
                                            
                                            value={price}
                                            onChangeText={setPrice}
                                            //onChangeText={(text) => setPrice(text.replace(/^0+/, ''))}
                                            placeholder="0.0"
                                            keyboardType="numeric"
                                            placeholderTextColor="black" 
                                            style={{width: '100%',flex: 1}}
                                        />
                                        <Text  style={{position:'absolute',right:3,marginTop:5}}>DH</Text>
                                </View>
                            </View>
                            */}
                            <View style={styles.container6}>
                                <Text style={styles.label}>Price  :  <Text style={styles.required}>*</Text></Text>
                                <View style={styles.input2}>
                                        <TextInput 
                                        
                                        value={price}
                                        onChangeText={setPrice}
                                       //onChangeText={(text) => setPreparation_time(text.replace(/^0+/, ''))}
                                        placeholder="00.0"
                                        style={{ flex: 1}}
                                        keyboardType="numeric"
                                        placeholderTextColor="black" 
                                        />
                                        <Text  style={{position:'absolute',right:3,marginTop:5}}>DH</Text>
                                </View>

                            </View> 
                            <View style={styles.container6}>
                                <Text style={styles.label}>preparation time  :  <Text style={styles.required}>*</Text></Text>
                                <View style={styles.input2}>
                                        <TextInput 
                                        
                                        value={preparation_time}
                                        onChangeText={setPreparation_time}
                                       //onChangeText={(text) => setPreparation_time(text.replace(/^0+/, ''))}
                                        placeholder="00"
                                        style={{width: '100%',flex: 1}}
                                        keyboardType="numeric"
                                        placeholderTextColor="black" 
                                        />
                                        <Text  style={{position:'absolute',right:3,marginTop:5}}>MIN</Text>
                                </View>

                            </View> 
                        
                        </View>

                        <View style={{flexDirection: 'row',width: '100%',flex:1,marginBottom:10 , justifyContent:'space-between'}}>
                            <Text style={styles.label}>Is Deliverable: <Text style={styles.required}>*</Text></Text>
                            <Switch value={isDeliverable} onValueChange={(value) => setIsDeliverable(value)} thumbColor={'#004651'} />
                        </View>

                        <View >

                        </View>
                        <View style={styles.container6}>
                            <Text style={styles.label}>Select the offer position: <Text style={styles.required}>*</Text></Text>
                            <View style={styles.mapContainer}>
                            <ZoneMapComponent onPolygonDataChange={handlePolygonDataChange}  />
                            </View>
                        </View>                 
                        
                    </ScrollView>
                    
                    <View style={styles.container}>
                        <TouchableOpacity style={styles.button} onPress={handlePublish}>
                            <Text style={styles.buttonText}>POST MY OFFER</Text>
                        </TouchableOpacity>
                    </View>
                </View>
        </View>


        );
    }
const styles = StyleSheet.create({
    mapContainer:{
        borderRadius: 5,
        backgroundColor: "#fff",
        borderStyle: "solid",
        borderColor: "#697386",
        borderWidth: 1,
        flex: 1,
        width: "100%",
        height: 450,
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
    button:{
            borderRadius: 20,
            alignItems:'center',
            flexDirection:'row',
            justifyContent:'center',
            backgroundColor: "#004651",
            width: 300,
            height: 48,
            position: 'absolute',
            bottom: 30,
    },
    container: {
            flexDirection: 'row', // Horizontal layout
            alignItems: 'center', // Align items vertically in the center
            justifyContent : 'center',
           // margin :15,
            //marginTop:43,
            flex:1,
    },
    postReqSytyle:{
            backgroundColor: "#fff",
            overflow: "hidden",
            width: "100%",marginBottom:0,
            height: "100%",
            flex: 1,
    },
    container1: {
            flexDirection: 'row', 
            justifyContent: 'center',
            alignItems: 'center' ,
            marginBottom:10,
            marginTop:25,
            
    },
    container5:{ 
        flexDirection: 'row',
        width: '100%',
        flex:1,
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
    imageContainer:{
      
    }
    ,
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
            color:'#000',
            justifyContent: 'center',
            marginBottom:10
    },
    input2:{
        borderRadius: 5,
        backgroundColor: "#fff",
        borderStyle: "solid",
        borderColor: "#697386",
        borderWidth: 1,
        flex: 1,
        width: "95%",
        color:'#000',
        height: 40,
        flexDirection: 'row',
         
        
},
    input3:{
            borderRadius: 5,
            backgroundColor: "#fff",
            borderStyle: "solid",
            borderColor: "#697386",
            borderWidth: 1,
            flex: 1,
            color:'#000',
            width: "95%",
            height: 40,
            
    },
    descriptionInput: {
            borderRadius: 5,
            backgroundColor: "#fff",
            borderStyle: "solid",
            borderColor: "#697386",
            borderWidth: 1,
            color:'#000',
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
    
    export default PostOffer;

function setSelectedImage(imageUri: any) {
    throw new Error('Function not implemented.');
}
