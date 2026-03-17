import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

export interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
}

export async function pickDocument(): Promise<PickedFile | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'text/plain', 'image/*'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      const mimeType = file.mimeType || 'application/pdf';

      // Validate file type
      const allowedTypes = ['application/pdf', 'text/plain'];
      const isImageType = mimeType.startsWith('image/');

      if (!allowedTypes.includes(mimeType) && !isImageType) {
        Alert.alert(
          'Unsupported File Type',
          'Please upload only PDF, text files, or images. Other file types are not supported.',
          [{ text: 'OK' }]
        );
        return null;
      }

      return {
        uri: file.uri,
        name: file.name,
        mimeType: mimeType,
      };
    }

    return null;
  } catch (err) {
    console.error('Error picking document:', err);
    Alert.alert('Error', 'Failed to pick document. Please try again.');
    return null;
  }
}

export async function pickImage(): Promise<PickedFile | null> {
  try {
    // Request permission first
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload images.', [
        { text: 'OK' },
      ]);
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const image = result.assets[0];
      const fileName = image.uri.split('/').pop() || 'image.jpg';
      return {
        uri: image.uri,
        name: fileName,
        mimeType: 'image/jpeg',
      };
    }

    return null;
  } catch (err) {
    console.error('Error picking image:', err);
    Alert.alert('Error', 'Failed to pick image. Please try again.');
    return null;
  }
}
