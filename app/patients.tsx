import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { colors } from '@/constants/colors';

export default function PatientsScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <WebView 
        source={{ uri: process.env.EXPO_PUBLIC_PATIENTS_URL || 'https://1cell.ai' }} 
        style={styles.webview}
        startInLoadingState={true}
        allowsBackForwardNavigationGestures
        bounces={false}
        overScrollMode="never"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF5E6',
  },
  webview: {
    flex: 1,
  },
});
