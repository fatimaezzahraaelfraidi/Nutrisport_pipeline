import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { fetchOffres } from '../services/ApiService';

type ItemData = {
  imageUrl: string;
  idOffer: string;
  mealName: string;
  caloricValue : number;
  proteinValue : number;
  fatsValue : number
  carbohydratesValue : number;
  price : number;
  mealType : string;
  description : string;
  createdAt : Date;

  
};



  type ItemProps = {
    item: ItemData;
    onPress: () => void;
    backgroundColor: string;
    textColor: string;
  };
  
  const Item = ({ item, onPress, backgroundColor, textColor }: ItemProps) => (
    <TouchableOpacity onPress={onPress} style={[styles.item, { backgroundColor }]}>
      <Image
        source={{ uri: "https://www.kasandbox.org/programming-images/avatars/purple-pi-pink.png" }} // replace 'imageUrl' with the actual property name in your item data
        style={styles.image}
      />
      <View style={styles.itemDetails}>
        <Text style={[styles.title, { color: textColor }]}>{item.description}</Text>
        <Text>{`Caloric Needs: ${item.caloricValue}`}</Text>
        <Text>{`Protein Needs: ${item.proteinValue}`}</Text>
        <Text>{`Carbohydrates: ${item.carbohydratesValue}`}</Text>
        <Text>{`Fat Values: ${item.fatsValue}`}</Text>
        <Text>{`Price: $${item.price}`}</Text>
        <Text>{`Meal Type: ${item.mealType}`}</Text>
        <Text>{`Created At: ${item.createdAt}`}</Text>
      </View>
    </TouchableOpacity>
  );
  
  
  const Offres = () => {
    const [selectedId, setSelectedId] = useState<string>();
    const [data, setData] = useState<ItemData[]>([]);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const apiData = await fetchOffres();
          setData(apiData);
        } catch (error) {
          // Handle error, e.g., show an error message to the user
          console.error('Error fetching data:', error);
        }
      };
  
      fetchData();
    }, []);
  
    const renderItem = ({ item }: { item: ItemData }) => {
      const backgroundColor = item.idOffer == selectedId ? '#6e3b6e' : '#f9c2ff';
      const color = item.idOffer === selectedId ? 'white' : 'black';
  
      return (
        <Item
          item={item}
          onPress={() => setSelectedId(item.idOffer)}
          backgroundColor={backgroundColor}
          textColor={color}
        />
      );
    };
  
    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.idOffer}
          extraData={selectedId}
        />
      </SafeAreaView>
    );
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: StatusBar.currentHeight ?? 0,
    },
    item: {
        flexDirection: 'row',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
      },
      image: {
        width: 50, // Set the width of the image as needed
        height: 50, // Set the height of the image as needed
        marginRight: 10, // Add margin between image and text
        borderRadius: 25, // Add border radius for a circular image
      },
      itemDetails: {
        flex: 1,
      },
    
    title: {
      fontSize: 32,
    },
  });
  
  export default Offres;