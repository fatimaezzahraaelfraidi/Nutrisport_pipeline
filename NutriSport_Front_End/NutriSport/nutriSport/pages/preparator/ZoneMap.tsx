import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faNeuter,faDrawPolygon, faThumbTack} from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

import MapView, {LatLng, MAP_TYPES, Marker, Polygon, Polyline} from 'react-native-maps';

const {width, height} = Dimensions.get('window');

const ASPECT_RATIO = width / height;

/*Change it by the current position of the user later*/
const LATITUDE = 33.7001597;
const LONGITUDE = -7.3571325;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
let id = 0;

class ZoneMap extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = {
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      markers: [],
      polylines: [],
      polygons: [],
      currentPolyline: [],
      isDrawing: false,
      polygonData: [],

    };
    
  }
  toggleDrawingMode = () => {
    this.setState((prevState: any) => ({
      isDrawing: !prevState.isDrawing,
    }));
  };
  
//   finishPolygon = () => {
//     // Finish the polygon by closing the currentPolyline
//     const { currentPolyline } = this.state;
  
//     if (currentPolyline.length > 1) {
//       const closedPolyline = [...currentPolyline, currentPolyline[0]];
//       const polygonCoordinates = closedPolyline.map((coord) => ({
//         latitude: coord.latitude,
//         longitude: coord.longitude,
//       }));
  
//       this.setState((prevState : any) => ({
//         polygons: [...prevState.polygons, closedPolyline],
//         isDrawing: false,
//         markers: [],
//         currentPolyline: [],
//         // Update the polygonData state with the JSON data
//         polygonData: [...prevState.polygonData, polygonCoordinates],
//       }), () => {
//         // Log the JSON data to the console after the state is updated
//         this.props.onPolygonDataChange(this.state.polygonData);
//        // console.log("NEW JSON");
//         //console.log(JSON.stringify(this.state.polygonData, null, 2));
//       });
//     }
//   };
finishPolygon = () => {
    const { currentPolyline } = this.state;
  
    if (currentPolyline.length > 1) {
      const closedPolyline = [...currentPolyline, currentPolyline[0]];
      const polygonCoordinates = closedPolyline.map((coord) => [
        coord.latitude,
        coord.longitude,
        
      ]);
  
      this.setState(
        (prevState: any) => ({
          polygons: [...prevState.polygons, closedPolyline],
          isDrawing: false,
          markers: [],
          currentPolyline: [],
          polygonData: [...prevState.polygonData, polygonCoordinates],
        }),
        () => {
          console.log("NEW JSON");
          console.log(JSON.stringify(this.state.polygonData, null, 2));
          this.props.onPolygonDataChange(this.state.polygonData);
        }
      );
    }
  };
  
  
  


  onPress = (e: any) => {
    const { isDrawing, markers, currentPolyline } = this.state;
  
    if (isDrawing) {
      if (markers.length === 0) {
        // Show faThumbTack only if drawing mode is enabled and it's the first marker
        this.setState({
          markers: [{ id: 0, coordinate: e.nativeEvent.coordinate }],
          currentPolyline: [e.nativeEvent.coordinate], // Include the first coordinate
        });
      } else {
        // Continue drawing process
        const newMarker = { id: markers.length, coordinate: e.nativeEvent.coordinate };
        this.setState({
          markers: [...markers, newMarker],
          currentPolyline: [...currentPolyline, newMarker.coordinate],
        });
      }
    }
  };
  
  

  render() {
    const { isDrawing, markers, polylines, polygons, polygonData } = this.state;
    const drawButtonStyle = isDrawing
      ? { backgroundColor: '#004651', borderColor: 'white' }
      : { backgroundColor: 'white', borderColor: '#004651' };

    return (
      <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        <MapView
          style={styles.mapStyle}
          initialRegion={{
            latitude: 33.7001597,
            longitude: -7.3571325,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          mapType={MAP_TYPES.STANDARD}
          onPress={this.onPress}
          customMapStyle={mapStyle}
        >
          {markers.map((marker:any) => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              onPress={marker.id === 0 ? this.finishPolygon : undefined}
            >
              <View style={styles.markerButton}>
              {/* <FontAwesomeIcon icon={faFilter} size={20} color="#004651" /> */}
                {marker.id === 0 ? (
                  <FontAwesomeIcon icon={faThumbTack} size={10} color="#004651"  />
                ) : <FontAwesomeIcon icon={faNeuter} size={10} color="#004651"  />}
                
              </View>
            </Marker>
          ))}
          {polylines.map((polyline:any, index:any) => (
            <Polyline
              key={index}
              coordinates={polyline}
              strokeColor="#F00"
              strokeWidth={3}
              
            />
          ))}
        {polygons.map((polygon: any, index: any) => (
            <Polygon
              key={index}
              coordinates={polygon}
              fillColor="rgba(0, 70, 81, 0.2)" // Set the fill color
              strokeColor="#004651"
              strokeWidth={2}
            />
          ))}
          {polygons.length > 0 && (
            <Polygon
              key={polygons.length} // You might want to use a more meaningful key
              coordinates={polygons[polygons.length - 1]}
              fillColor="rgba(0, 70, 81, 0.2)" // Set the fill color
              strokeColor="#004651"
              strokeWidth={2}
            />
          )}
        </MapView>
        <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={this.toggleDrawingMode}
              style={[styles.drawButton, drawButtonStyle]}
            >
              <FontAwesomeIcon icon={faDrawPolygon} size={20} color={isDrawing ? 'white' : '#004651'} />
              
            </TouchableOpacity>
          </View>

        
      </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
 container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  
  drawButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  markerButton: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1, // Use borderWidth instead of borderColor
    borderColor: '#004651',
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 20,
    marginHorizontal: 10,
  },
});
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


export default ZoneMap;