import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions,ScrollView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlusCircle, faStar } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-native-modal'; // Import the Modal component from the library
import { setRankPreparator } from '../../services/ApiService';
const screenWidth = Dimensions.get('window').width;
const screenHeight= Dimensions.get('window').height;

const RateOrder = ({ isVisible, onClose, orderId, navigation }: { isVisible: boolean, onClose: () => void, orderId: number, navigation: any }) => {  const [rating, setRating] = useState(5);

  const handleStarPress = (selectedRating: number) => {
    console.log(orderId);
    setRating(selectedRating);
  };

  const handleSendRating = async () => {
    console.log('Rating sent for orderId:', orderId);
    try {
  //    // Call the apiService function to send the rating to the server
      await setRankPreparator(rating*20, orderId);
  //     // Close the modal or perform any other actions after successful rating submission
      onClose();
    } catch (error) {
      // Handle errors if needed
      console.error('Error sending rating:', error);
    }
  };
  const getStarImageSource = (starNumber: number) => {
    // Adjust this function based on your image source logic
    switch (starNumber) {
      case 1:
        return require('../../images/rate1.png');
      case 2:
        return require('../../images/rate2.png');
      case 3:
        return require('../../images/rate3.png');
      case 4:
        return require('../../images/rate4.png');
      case 5:
        return require('../../images/rate5.png');
      default:
        return require('../../images/g12.jpg'); // Default to the maximum rating image
    }
  };
  return (
    <Modal
        isVisible={isVisible}
        swipeDirection={['down']}
        
        style={{justifyContent: 'center',alignItems: 'center',margin: 0,}}
    >
        <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 20, alignItems: 'center' }}>
        {/* Top Image with Gold Background */}
        
        {/* Image of Rating Star Face */}
        <View style={{ width: 100, height: 100, borderRadius: 50, overflow: 'hidden', alignItems:'center' ,backgroundColor:'white'}}>
          <Image
            source={getStarImageSource(rating)}
            style={{ width: '90%', height: '90%',resizeMode: 'center', }}
          />
        </View>
        {/* Message */}
        <Text style={{ textAlign: 'center', fontSize: 18, marginBottom: 20, color:'black' }}>
          How Would You Rate This Experience?
        </Text>

        {/* Star Ratings */}
        <View style={{ flexDirection: 'row', marginBottom: 20,}}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => handleStarPress(star)}>
              <FontAwesomeIcon icon={faStar} size={30} color={star <= rating ? 'gold' : '#ccc'} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Button to Send Rating */}
        <TouchableOpacity
          onPress={handleSendRating}
          style={{ backgroundColor: '#004651', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10,  }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Send Rating</Text>
        </TouchableOpacity>
      </View>
    </Modal>


  );
};

export default RateOrder;