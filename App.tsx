import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Share,
  Button
} from 'react-native';
import axios from 'axios';
import Video from 'react-native-video';
import * as Animatable from 'react-native-animatable';
import RNFS from 'react-native-fs';
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';
import { InterstitialAd, AdEventType, TestIds } from '@react-native-firebase/admob';

function App() {
  const [data, setData] = useState(null);
  const [mediaUri, setMediaUri] = useState(null);
  const [previousFilePath, setPreviousFilePath] = useState(null);

  const onArrowPress = (direction) => {
    if (swiperRef.current) {
      if (direction === 'left') {
        swiperRef.current.scrollBy(-1);
      } else if (direction === 'right') {
        swiperRef.current.scrollBy(1);
      }
    }
  };

  const fetchData = async () => {
    try {
      // Удалить предыдущий файл видео, если он существует
      if (previousFilePath) {
        await RNFS.unlink(previousFilePath);
        setPreviousFilePath(null);
      }

      const response = await axios.get('http://10.0.2.2:8080/getmessage');
      console.log('Data fetched:', response.data);
      setData(response.data);

      if (response.data.fileType.includes('video')) {
        const filePath = `${RNFS.DocumentDirectoryPath}/${response.data.fileName}`;
        await RNFS.writeFile(filePath, response.data.file, 'base64');
        setMediaUri(`file://${filePath}`);
        setPreviousFilePath(filePath);
      } else {
        setMediaUri(`data:${response.data.fileType};base64,${response.data.file}`);
      }

    } catch (error) {
      console.error(error);
    }
  };

  const onSwipeLeft = () => {
    fetchData();
  };

  const onSwipeRight = () => {
    fetchData();
  };

  const onArrowPressLeft = () => {
    onSwipeRight();
  };

  const onArrowPressRight = () => {
    onSwipeLeft();
  };
  // const adUnitId = 'ca-app-pub-2189745975070036~8512489841'; 
  // const interstitial = InterstitialAd.createForAdRequest(adUnitId);
  useEffect(() => {
    const eventListener = interstitial.onAdEvent((type, error) => {
      // if (type === AdEventType.LOADED) {
      //   interstitial.show();
      // }
      // interstitial.load();
      fetchData();
      // return () => {
      //   eventListener();
      // };
    });

  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <GestureRecognizer
        onSwipeLeft={onSwipeLeft}
        onSwipeRight={onSwipeRight}
        style={styles.container}
      >
        
        <TouchableOpacity style={styles.leftArrow} onPress={onArrowPressLeft}>
          <Text style={styles.arrowText}>&#8592;</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rightArrow} onPress={onArrowPressRight}>
          <Text style={styles.arrowText}>&#8594;</Text>
        </TouchableOpacity>
        {data ? (
          <View style={styles.slide}>
            <Animatable.View animation="fadeIn" duration={500} style={styles.mediaContainer}>
              {data.fileType && data.fileType.includes('image') && (
                <Image
                  style={styles.media}
                  source={{ uri: mediaUri }}
                  resizeMode="contain"
                />
              )}
              {data.fileType && data.fileType.includes('video') && mediaUri &&(
                <Video
                  source={{ uri: mediaUri }}
                  style={styles.media}
                  controls={true}
                  resizeMode="contain"
                  onError={(e) => {
                    console.log("Video onError", e);
                  }}
                  onLoad={(e) => {
                    console.log("Video onLoad", e);
                  }}
                  repeat={true}
                />
              )}
            </Animatable.View>
            <Text style={styles.text}>{data.text}</Text>
          </View>
        ) : (
          <View style={styles.slide}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
      </GestureRecognizer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  mediaContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: undefined,
    height: undefined,
    flex: 1,
    alignSelf: 'stretch',
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    color: '#fff',
  },
  loadingText: {
    fontSize: 20,
    color: '#fff',
  },
  leftArrow: {
    position: 'absolute',
    left: 20,
    top: '50%',
    zIndex: 1,
  },
  rightArrow: {
    position: 'absolute',
    right: 20,
    top: '50%',
    zIndex: 1,
  },
  arrowText: {
    fontSize: 36,
    color: '#fff',
  },
});

export default App;