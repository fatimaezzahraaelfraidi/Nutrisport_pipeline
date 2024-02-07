import {faLocationDot, faMotorcycle, faPerson, faPersonBiking, faPersonBooth, faPersonBreastfeeding } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useRef } from 'react';
import { Dimensions} from 'react-native';
import MapView, {  MAP_TYPES, Polyline } from 'react-native-maps';
import MapMarker from 'react-native-maps/lib/MapMarker';
const {width, height} = Dimensions.get('window');

const ASPECT_RATIO = width / height;

/*Change it by the current position of the user later*/

const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const GOOGLE_MAPS_API_KEY = 'AIzaSyDcELAMQ7jNEno3GYitHGQza2O8wuye-Ok';
interface DeliveryMapProps {
  pLocation: {
    latitude: number;
    longitude: number;
  };
  sLocation: {
    latitude: number;
    longitude: number;
  };
}

const DeliveryMap: React.FC<DeliveryMapProps> = ({ pLocation, sLocation }) => {
  const preparatorLocation = {
    latitude: pLocation?.latitude, // replace with the actual latitude of the preparator
    longitude:  pLocation?.longitude, // replace with the actual longitude of the preparator  , 
  };
  const deliveryEndLocation = {
    latitude: sLocation?.latitude,  // replace with the actual latitude of the client
    longitude: sLocation?.longitude, // replace with the actual longitude of the client
  };
 
  const [deliveryManLocation, setDeliveryManLocation] = useState(preparatorLocation);
  const [polylineCoordinates, setPolylineCoordinates] = useState<Array<{ latitude: number; longitude: number; }>>([]);
  const [remainingDistance, setRemainingDistance] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);  

  const [mapReady, setMapReady] = useState(false);
  const [isRouteFetched, setIsRouteFetched] = useState(false); // Add a new state

  
  const onMapReady = () => {
    setMapReady(true);
  };
 
  const fetchRoute = async () => {
    const apiKey = GOOGLE_MAPS_API_KEY;
    const origin = `${preparatorLocation.latitude},${preparatorLocation.longitude}`;
    console.log("ORIGIN" + origin); 
    
    const destination = `${deliveryEndLocation.latitude},${deliveryEndLocation.longitude}`;
    console.log("Destination" + destination);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`
      );

      const data = await response.json();

      if (data.routes.length > 0) {
        const points = data.routes[0].overview_polyline.points;
        const decodedPoints = decodePolyline(points);

        setPolylineCoordinates(decodedPoints);
        setIsRouteFetched(true);
      }
    } catch (error) {
      console.error('Error fetching route:', error); 
    }
  };
 
  const decodePolyline = (encoded: string) => {
    const poly = [];
    let index = 0,
      lat = 0,
      lng = 0;

    while (index < encoded.length) {
      let b,
        shift = 0,
        result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlat = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlng = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      const newLat = lat * 1e-5;
      const newLng = lng * 1e-5;

      poly.push({ latitude: newLat, longitude: newLng });
    }

    return poly;
  };

  let interval: NodeJS.Timeout;

  const simulateMovement = async (resumeIndex: number = 0) => {
    let currentIndex = resumeIndex;
    const motorcycleSpeed = 60;
    interval = setInterval(() => {
      setDeliveryManLocation((prevLocation) => {
        if (currentIndex < polylineCoordinates.length) {
          const newLocation = polylineCoordinates[currentIndex];
          currentIndex++;
          updateRemainingDistance(newLocation);
          updateRemainingTime(newLocation, motorcycleSpeed);
          
          // Save the current index to AsyncStorage
          AsyncStorage.setItem('currentIndex', currentIndex.toString());

          return newLocation;
        } else {
          clearInterval(interval);
          return prevLocation;
        }
      });
    }, 1000);
  };

  
  const updateRemainingTime = (newLocation: { latitude: number; longitude: number; }, speed: number) => {
    const distanceToDestination = getDistance(
      newLocation.latitude,
      newLocation.longitude,
      deliveryEndLocation.latitude,
      deliveryEndLocation.longitude 
    );
  //change the doshed line
    const timeInHours = distanceToDestination / speed;
    const timeInMinutes = timeInHours * 60;
    setRemainingTime(timeInMinutes);
  };
  
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    // Function to calculate distance between two coordinates in kilometers
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    
    return distance;
  };
  
  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };
  
  const updateRemainingDistance = async (newLocation: { latitude: any; longitude: any; }) => { 
    if (polylineCoordinates.length === 0) { 
      setRemainingDistance(0); 
      return;
    }
  
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${newLocation.latitude},${newLocation.longitude}&destinations=${deliveryEndLocation.latitude},${deliveryEndLocation.longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
  
      const data = await response.json();
  
      if (data.status === 'OK') {
        const distance = data.rows[0].elements[0].distance.value / 1000; // Convert meters to kilometers
        setRemainingDistance(distance);
      } else {
        console.error('Error calculating distance:', data.error_message); 
      }
    } catch (error) {
      console.error('Error calculating distance:', error);
    }
  };



  useEffect(() => {
    const fetchResumeIndex = async () => {
      try {
        const storedIndex = await AsyncStorage.getItem('currentIndex');
        if (storedIndex !== null) {
          let resumeIndex = parseInt(storedIndex, 10);
          //if we finished the delivery restart it 
          if (resumeIndex >= polylineCoordinates.length)
          {
            resumeIndex = 0;
          }
          simulateMovement(resumeIndex);
        } else {
          simulateMovement();
        }
      } catch (error) {
        console.error('Error fetching resume index:', error);
      }
    };

    fetchRoute();
    if (mapReady && isRouteFetched) {
      fetchResumeIndex(); // Start simulation once both map is ready and route is fetched
    }

    return () => {
      clearInterval(interval); // Clear the interval when the component unmounts
    };
  }, [mapReady, isRouteFetched]);
  


  const renderPolylines = () => {
    let polylines = [];
  
    // Create a Polyline component with normal style for the segment between preparator and delivery man
    const normalLineStyle = { strokeWidth: 2, strokeColor: '#00465180'};
  
    // Create a Polyline component with red style for the segment between delivery man and end point
    const redLineStyle = { strokeWidth: 3, strokeColor: '#004651' };
  
    // Find the index where the delivery man's location is in polylineCoordinates
    const deliveryManIndex = polylineCoordinates.findIndex(
      (coord) =>
        coord.latitude === deliveryManLocation.latitude &&
        coord.longitude === deliveryManLocation.longitude
    );
  
    // Render polyline from preparator to delivery man's current location in red
     if (deliveryManIndex > 0) {
    const preparatorToDeliveryManCoordinates = polylineCoordinates.slice(0, deliveryManIndex + 1);
    polylines.push(
      <Polyline
        key="preparatorToDeliveryMan"
        coordinates={preparatorToDeliveryManCoordinates}
        {...redLineStyle}
      />
    );
  }
  
    // Render polyline from delivery man's current location to end point in normal color
    if (deliveryManIndex < polylineCoordinates.length - 1) {
      const deliveryManToEndCoordinates = polylineCoordinates.slice(deliveryManIndex);
      polylines.push(
        <Polyline
          key="deliveryManToEnd"
          coordinates={deliveryManToEndCoordinates}
          {...normalLineStyle}
        />
      );
    }
  
    return polylines;
  };
    
  return ( 
    
    <MapView
        style={{ flex: 1 , position: 'absolute',top: 0,left: 0,right: 0,bottom: 0,}}
        initialRegion={{
        latitude: preparatorLocation.latitude,
        longitude: preparatorLocation.longitude,
        latitudeDelta: LATITUDE_DELTA, 
        longitudeDelta: LONGITUDE_DELTA,
        }}
        mapType={MAP_TYPES.STANDARD}
        customMapStyle={mapStyle}
        onMapReady={onMapReady} >
        
        {renderPolylines()} 
        <MapMarker coordinate={preparatorLocation} title="Preparator location">
            <FontAwesomeIcon icon={faLocationDot} size={25} color={'#00A181'} />
        </MapMarker>
        <MapMarker coordinate={deliveryEndLocation} title="Your location" >
            <FontAwesomeIcon icon={faLocationDot} size={25} color={'#00A181'} />
        </MapMarker> 

        <MapMarker coordinate={deliveryManLocation} title={`${remainingDistance.toFixed(2)} km - ${remainingTime.toFixed(2)} min`} >
            <FontAwesomeIcon icon={faMotorcycle} size={30} color={'#004651'} />  
        </MapMarker>
    </MapView>
  );   
}; 

const mapStyle = [
  {
      "featureType": "all",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "on"
          },
          
      ]
  },
  {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [
          {
              
          },
          {
              "visibility": "on"
          },
          {
              "color": "#004651"
          }
      ]
  },
  {
      "featureType": "administrative",
      "elementType": "labels",
      "stylers": [
          {
              "visibility": "simplified"
          },
          
          {
              "color": "#004651"
          }
      ]
  },
  {
      "featureType": "administrative",
      "elementType": "labels.text",
      "stylers": [
          {
              
          },
          {
              
          },
          {
              "color": "#004651"
          }
      ]
  },
  {
      "featureType": "administrative.neighborhood",
      "elementType": "labels.text",
      "stylers": [
          {
              "hue": "#004651"
          },
          {
              
          },
          {
             
          },
          {
              "visibility": "simplified"
          },
          {
             
          }
      ]
  },
  {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [
          {
             
          },
          {
              
          },
          {
              "gamma": "2.31"
          },
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "landscape",
      "elementType": "labels",
      "stylers": [
          {
              "visibility": "simplified"
          },
          {
             
          },
          {
              // "gamma": "1"
          },
      ]
  },
  {
      "featureType": "landscape",
      "elementType": "labels.text.fill",
      "stylers": [
          {
              //"saturation": "-100"
          },
          {
             // "lightness": "-100"
          }
      ]
  },
  {
      "featureType": "landscape",
      "elementType": "labels.text.stroke",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "landscape.man_made",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "simplified"
          }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
          {
              "lightness": "0"
          },
          {
              "saturation": "45"
          },
          {
              "gamma": "4.24"
          },
          {
              "visibility": "simplified"
          },
          {
              "hue": "#00ff90"
          }
      ]
  },
  {
      "featureType": "poi.park",
      "elementType": "labels",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
          {
              
          },
          {
              "color": "#dfe9eb"
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "labels.text",
      "stylers": [
          {
              "visibility": "simplified"
          },
          {
              "color": "#004651"
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "labels.icon",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "road.arterial",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "transit",
      "elementType": "labels.icon",
      "stylers": [
          {
              "saturation": "-25"
          }
      ]
  },
  {
      "featureType": "transit.line",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "simplified"
          }
      ]
  },
  {
      "featureType": "transit.station.airport",
      "elementType": "labels.icon",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "lightness": "50"
          },
          {
              "gamma": ".75"
          },
          {
              "saturation": "100"
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "labels",
      "stylers": [
          {
              "visibility": "simplified"
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "labels.icon",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  }
];

export default DeliveryMap; 
