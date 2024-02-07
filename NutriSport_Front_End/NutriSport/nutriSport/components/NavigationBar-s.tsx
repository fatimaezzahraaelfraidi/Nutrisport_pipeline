import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { faHome, faReceipt, faGear, IconDefinition, faPhoneSquare, faBullhorn } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/native';
import Settings from './../pages/Settings';

const NavigationBar = ({ screenWidth }: { screenWidth: number }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const route = useRoute();
  const [isSettingsModalVisible, setSettingsModalVisible] = useState<boolean>(false);
  const [userData, setUserData] = useState<{ name: string | null; email: string | null }>({ name: null, email: null });

  useEffect(() => {
    // Fetch user information from AsyncStorage when the component mounts
    const fetchUserData = async () => {
      const name = await AsyncStorage.getItem('userFullName');
      const email = await AsyncStorage.getItem('userMail');
      setUserData({ name, email });
    };

    fetchUserData();
  }, []);

  const toggleSettingsModal = () => {
    setSettingsModalVisible(!isSettingsModalVisible);
  };

  const renderButton = (iconName: IconDefinition, label: string, buttonName: string, screenName: string) => (
    <TouchableOpacity
      onPress={() => {
        if (buttonName === 'Settings') {
          toggleSettingsModal();
        } else {
          navigation.navigate(screenName as never);
        }
      }}
      style={{
        alignItems: 'center',
        opacity: isFocused && route.name === screenName ? 1 : 0.7,
      }}
    >
      <FontAwesomeIcon icon={iconName} size={20} color="#fff" />
      {isFocused && route.name === screenName && (
        <Text style={{ fontWeight: 'bold', textAlign: 'center', color: '#fff' }}>{label}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={{ alignItems: 'center', position: 'absolute', bottom: 10, transform: [{ translateX: screenWidth * 0.05 }] }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: screenWidth * 0.9,
          height: 60,
          backgroundColor: '#004651',
          borderWidth: 2,
          borderColor: '#004651',
          justifyContent: 'space-between',
          borderRadius: 50,
          padding: 4,
          paddingHorizontal: 20,
        }}
      >
        {renderButton(faBullhorn, 'Demands', 'Demands', 'DemandsS')}
        {renderButton(faHome, 'Home', 'Home', 'Home')}
        {renderButton(faReceipt, 'Orders', 'Orders', 'Orders')}
        {renderButton(faGear, 'Settings', 'Settings', 'Index')}
      </View>

      {/* Settings Modal */}
      <Settings isVisible={isSettingsModalVisible} onClose={toggleSettingsModal} user={userData}  navigation={navigation} />
    </View>
  );
};

export default NavigationBar;
