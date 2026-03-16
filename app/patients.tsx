import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function PatientsScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const webViewRef = useRef<WebView>(null);

  const handleLoadEnd = () => {
    if (token) {
      const data = JSON.stringify({ token, patients: [] });
      const jsCode = `if (window.initPatientWebApp) { window.initPatientWebApp(${data}); }`;
      webViewRef.current?.injectJavaScript(jsCode);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: process.env.EXPO_PUBLIC_PATIENTS_URL || 'https://1cell.ai' }}
        style={styles.webview}
        onLoadEnd={handleLoadEnd}
        startInLoadingState={true}
        allowsBackForwardNavigationGestures
        bounces={false}
        overScrollMode="never"
        javaScriptEnabled={true}
        domStorageEnabled={true}
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
