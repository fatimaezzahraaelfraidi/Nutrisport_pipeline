import { faEnvelope, faFile, faHand, faHands, faHandsHoldingChild, faHandsHoldingCircle, faInfo, faQuestion, faSignOut, faSignature } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useState } from 'react';
import { Modal, View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { signOut } from './../services/ApiService'; // Update with the correct path
 

interface SettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
  user: {
    name: string | null;
    email: string | null;
  
  };
  navigation:any
  
}
const handleLogout = async (navigation: any) => {
  
  try {
    await signOut();
    navigation.navigate('UserSigninScreen');
    console.log('logout');

    
  } catch (error:any) {
    console.error('Logout error:', error.message);
    // Handle logout error
  }
};
const Settings:React.FC<SettingsModalProps> = ({ isVisible, onClose, user, navigation }) => {
  function handleHistory(): void {
    navigation.navigate('DemandHistory');
    console.log('Demand history');
  }

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* User Info Section */}
          <View style={styles.userInfo}>
            {/* <Image source={{ uri: user.profileImage }} style={styles.profileImage} /> */}
            <Image style={styles.profileImage} resizeMode="cover" source={require('../images/user.png')}/>
            <View style={styles.textContainer}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Buttons Section */}
          <TouchableOpacity style={styles.button}  >
            <View style={{flexDirection:'row' , }}>
            <FontAwesomeIcon icon={faInfo} size={20} color="#004651" />
            <Text style={styles.buttonText}>About Us</Text>
            </View>
            <Text style={styles.buttonText}>{'>'}</Text>
          </TouchableOpacity>

          {/* Another Button (Copy and modify for additional buttons) */}
          <TouchableOpacity style={styles.button} onPress={() => handleHistory()}> 
            <View style={{flexDirection:'row' , }}>
            <FontAwesomeIcon icon={faFile} size={20} color="#004651" />
            <Text style={styles.buttonText}>Demand History</Text>
            </View>
            <Text style={styles.buttonText}>{'>'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}  >
            <View style={{flexDirection:'row' , }}>
            <FontAwesomeIcon icon={faHands} size={20} color="#004651" />
            <Text style={styles.buttonText}>Need help?</Text>
            </View>
            <Text style={styles.buttonText}>{'>'}</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity style={styles.buttonLogOut} onPress={() => handleLogout(navigation)}>
          <View style={{flexDirection:'row' , }}>
            <FontAwesomeIcon icon={faSignOut} size={20} color="#004651" />
            <Text style={styles.buttonText}>Log Out </Text>
            </View>
            <Text style={styles.buttonText}>{'>'}</Text>
          </TouchableOpacity>

          {/* Close Modal Button */}
         
        </View>
      </View>
    </Modal>
  );
};

 



const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '70%',
    height: '50%',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#004651',
    fontWeight: 'bold',
  },
  separator: {
    height: 0.5,
    backgroundColor: '#004651',
    marginVertical: 16,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.2,
    borderBottomColor: '#004651',
    width: '100%',
    backgroundColor: '#fff',
    marginBottom: 10,
    alignContent: 'center',
    // marginLeft: 30,
  },
  buttonLogOut: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.2,
    borderBottomColor: '#004651',
    width: '100%',
    backgroundColor: '#fff',
    marginBottom: 10,
    alignContent: 'center',
     marginTop: 50
  },
  buttonText: {
    fontSize: 16,
    color: '#004651',
     marginLeft: 20,
  },
  closeButton: {
    backgroundColor: '#004651',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
  },
});

export default Settings;
