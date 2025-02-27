import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert, ActivityIndicator, Animated } from 'react-native';
import { Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { apiService } from '../services/api.service';
import { storageService } from '../services/storage.service';
import { NumberplateEntry } from '../types';

export const CameraScreen = () => {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<Camera | null>(null);
  const flashOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const triggerFlashAnimation = () => {
    // Reset opacity to 1 (white flash)
    flashOpacity.setValue(1);
    
    // Animate to transparent
    Animated.timing(flashOpacity, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const takePicture = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);
      triggerFlashAnimation();
      const photo = await cameraRef.current.takePictureAsync();
      
      // Create initial entry
      const initialEntry: NumberplateEntry = {
        id: Date.now().toString(),
        imageUri: photo.uri,
        timestamp: Date.now(),
        score: 0,
        categories: [],
      };

      // Save initial entry locally
      await storageService.addNumberplate(initialEntry);

      // Send to backend for analysis
      try {
        const analyzedEntry = await apiService.analyzeNumberplate(photo.uri);
        await storageService.updateNumberplate(analyzedEntry);
        Alert.alert('Success', 'Photo analyzed and saved!');
        navigation.goBack();
      } catch (error) {
        console.error('Analysis error:', error);
        Alert.alert(
          'Analysis Failed',
          'Photo saved locally but analysis failed. Will retry later.'
        );
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take picture');
    } finally {
      setIsProcessing(false);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} ref={cameraRef}>
        <Animated.View 
          style={[
            styles.flashOverlay,
            { opacity: flashOpacity }
          ]} 
          pointerEvents="none"
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, isProcessing && styles.buttonDisabled]} 
            onPress={takePicture}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.text}>Take Photo</Text>
            )}
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 15,
    paddingHorizontal: 30,
    alignSelf: 'flex-end',
    margin: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  text: {
    fontSize: 18,
    color: 'black',
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 1,
  },
}); 