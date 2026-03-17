import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from 'nativewind';

export default function ExtensionsScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const webViewRef = useRef<WebView>(null);
  const [extensionsUrl, setExtensionsUrl] = useState<string | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Fetch remote configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('https://nandiraju.github.io/drg-app-config/config.json');
        const config = await response.json();
        if (config.EXTENSIONS_URL) {
          setExtensionsUrl(config.EXTENSIONS_URL);
        } else {
          console.warn('EXTENSIONS_URL not found in remote config, falling back.');
          setExtensionsUrl('https://demos.doctorg.ai');
        }
      } catch (error) {
        console.error('Error fetching remote config:', error);
        setExtensionsUrl('https://demos.doctorg.ai');
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchConfig();
  }, []);

  // Sync theme changes dynamically
  useEffect(() => {
    if (colorScheme && extensionsUrl) {
      const themeCode = `if (window.setAppTheme) { window.setAppTheme('${colorScheme}'); }`;
      webViewRef.current?.injectJavaScript(themeCode);
    }
  }, [colorScheme, extensionsUrl]);

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
      const data = JSON.stringify({ token });
      const jsCode = `
        if (window.initExtensionsWebApp) { 
          window.initExtensionsWebApp(${data}); 
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

  if (loadingConfig) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#FDF5E6', justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={isDark ? '#FFFFFF' : '#daa521'} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#FDF5E6' }]}>
      <WebView
        ref={webViewRef}
        source={{ uri: extensionsUrl || 'https://demos.doctorg.ai' }}
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
