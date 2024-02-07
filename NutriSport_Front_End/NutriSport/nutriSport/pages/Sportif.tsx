import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import { Picker as SelectPicker } from '@react-native-picker/picker';
import { saveDemande } from '../services/ApiService';

const Sportif = ({navigation}: {navigation: any}) => {
  const [caloricValue, setCaloricValue] = useState('');
  const [description, setDescription] = useState('');
  const [proteinValue, setProteinValue] = useState('');
  const [carbohydratesValue, setCarbohydratesValue] = useState('');
  const [fatsValue, setFatsValue] = useState('');
  const [mealType, setMealType] = useState('lunch');
  const [deliveryDate, setDeliveryDate] = useState('');

  const handlePublish = async () => {
    try {
      // Prepare the data to be sent
      const data = {
        caloricValue,
        proteinValue,
        description,
        carbohydratesValue,
        fatsValue,
        mealType,
       // deliveryDate, 
      };
      console.log("alooo");
      const responseData = await saveDemande(data);
      
      console.log('Form submitted!', responseData);
      Alert.alert('Success', responseData, [
        { text: 'OK', onPress: () => {
          navigation.push('Sportif');
        } },
      ]);
      // You can handle the response data here, if needed
    } catch (error) {
      // Handle the error here
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="Voir Offres" onPress={() => {
          navigation.navigate('Home');
        } }></Button>
      <Text style={styles.heading}>Publier une demande :</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Besoins Caloriques:</Text>
        <TextInput
          style={styles.input}
          value={caloricValue}
          onChangeText={setCaloricValue}
          placeholder="Entrez les besoins caloriques"
          keyboardType="numeric"
          placeholderTextColor="black" 
        />

        <Text style={styles.label}>Besoins Graisse:</Text>
        <TextInput
          style={styles.input}
          value={fatsValue}
          onChangeText={setFatsValue}
          placeholder="Entrez les besoins graisse"
          keyboardType="numeric"
          placeholderTextColor="black" 
        />

        <Text style={styles.label}>Besoins Carbohydrates:</Text>
        <TextInput
          style={styles.input}
          value={carbohydratesValue}
          onChangeText={setCarbohydratesValue}
          placeholder="Entrez les besoins carbohydrate"
          keyboardType="numeric"
          placeholderTextColor="black" 
        />

        <Text style={styles.label}>Besoins Proteins:</Text>
        <TextInput
          style={styles.input}
          value={proteinValue}
          onChangeText={setProteinValue}
          placeholder="Entrez les besoins en protéines"
          keyboardType="numeric"
          placeholderTextColor="black" 
        />

        <Text style={styles.label}>Description:</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Entrez la description"
          placeholderTextColor="black" 
        />

<Text style={styles.label}>Type repas:</Text>
        <SelectPicker
          style={styles.input}
          selectedValue={mealType}
          onValueChange={setMealType}
        >
          <SelectPicker.Item label="breakfast" value="breakfast" />
          <SelectPicker.Item label="lunch" value="lunch" />
          <SelectPicker.Item label="dinner" value="dinner" />
          <SelectPicker.Item label="snack" value="snack" />
        </SelectPicker>


        <Text style={styles.label}>Date de livraison souhaitée:</Text>
        <TextInput
          style={styles.input}
          value={deliveryDate}
          onChangeText={setDeliveryDate}
          placeholder="Entrez la date de livraison souhaitée"
          placeholderTextColor="black" 
        />

        <Button title="Publier" onPress={handlePublish} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white', // Set the background color to white
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black', // Set the text color to black
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 5,
    color: 'black', // Set the text color to black
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white', // Set the background color to white
    color: 'black', // Set the text color to black
  },
});

export default Sportif;
