/**
 * Camera/library photo picker with permission handling.
 */

import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export type PhotoPickResult =
  | { ok: true; uri: string }
  | { ok: false; message: string };

async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

async function requestLibraryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

async function launchCamera(): Promise<PhotoPickResult> {
  const granted = await requestCameraPermission();
  if (!granted) {
    return {
      ok: false,
      message: 'Camera access was denied. Enable it in Settings to take photos.',
    };
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsEditing: true,
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return { ok: false, message: '' };
  }

  return { ok: true, uri: result.assets[0].uri };
}

async function launchLibrary(): Promise<PhotoPickResult> {
  const granted = await requestLibraryPermission();
  if (!granted) {
    return {
      ok: false,
      message: 'Photo library access was denied. Enable it in Settings to choose photos.',
    };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsEditing: true,
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return { ok: false, message: '' };
  }

  return { ok: true, uri: result.assets[0].uri };
}

export function pickPhoto(onResult: (result: PhotoPickResult) => void) {
  if (Platform.OS === 'web') {
    launchLibrary().then(onResult);
    return;
  }

  Alert.alert('Add photo', 'Choose a source', [
    { text: 'Take photo', onPress: () => launchCamera().then(onResult) },
    { text: 'Choose from library', onPress: () => launchLibrary().then(onResult) },
    { text: 'Cancel', style: 'cancel' },
  ]);
}
