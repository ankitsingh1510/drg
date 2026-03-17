import React, { useRef } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from 'nativewind';

export default function PatientsScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const webViewRef = useRef<WebView>(null);

  // Sync theme changes dynamically
  React.useEffect(() => {
    if (colorScheme) {
      const themeCode = `if (window.setAppTheme) { window.setAppTheme('${colorScheme}'); }`;
      webViewRef.current?.injectJavaScript(themeCode);
    }
  }, [colorScheme]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'navigate' && data.target === 'home') {
        router.replace('/(tabs)');
      } else if (data.type === 'navigate' && data.target === 'back') {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (e) {
      console.error('Error parsing message from webview:', e);
    }
  };

  const handleLoadEnd = () => {
    // Inject auth token and setup global navigation bridge
    if (token) {
      const data = JSON.stringify({ token, patients: [] });
      const jsCode = `
        if (window.initPatientWebApp) { 
          window.initPatientWebApp(${data}); 
        }
        if (window.setAppTheme) {
          window.setAppTheme('${colorScheme}');
        }
        window.navigateBack = function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'navigate', target: 'back' }));
        };
        window.navigateHome = function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'navigate', target: 'home' }));
        };
      `;
      webViewRef.current?.injectJavaScript(jsCode);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#FDF5E6' }]}>
      <WebView
        ref={webViewRef}
        source={{ uri: process.env.EXPO_PUBLIC_PATIENTS_URL || 'https://1cell.ai' }}
        style={styles.webview}
        onLoadEnd={handleLoadEnd}
        onMessage={handleMessage}
        startInLoadingState={true}
        allowsBackForwardNavigationGestures
        bounces={false}
        overScrollMode="never"
        javaScriptEnabled={true}
        domStorageEnabled={true}
        containerStyle={{ backgroundColor: isDark ? '#111827' : '#FDF5E6' }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
