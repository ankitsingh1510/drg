import React, { useEffect } from 'react';
import { Appearance, Platform, Text, View } from 'react-native';
import * as Device from 'expo-device';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { getApp, initializeApp } from '@react-native-firebase/app';
import messaging, { onMessage, onTokenRefresh } from '@react-native-firebase/messaging';
import { useSetAtom } from 'jotai';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { startNetworkLogging } from 'react-native-network-logger';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import NetworkLoggers from '@/components/NetworkLoggers';
import { AuthProvider } from '@/context/AuthContext';
import NetworkChecker from '@/hooks/NetworkChecker';
import { useThemeSync } from '@/hooks/useThemeSync';
import { storageAPI } from '@/services/storage';
import { removeIngestionIdAtom } from '@/stores/ingestion';
import { setFcmToken } from '@/stores/mmkv';
import '../global.css';

const firebaseConfig =
  Platform.OS === 'ios'
    ? {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_IOS_API_KEY,
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        appId: process.env.EXPO_PUBLIC_FIREBASE_IOS_APP_ID,
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_IOS_MESSAGING_SENDER_ID,
        databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
      }
    : {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_ANDROID_API_KEY,
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        appId: process.env.EXPO_PUBLIC_FIREBASE_ANDROID_APP_ID,
        databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
      };

const isFirebaseEnabled = process.env.EXPO_PUBLIC_ENABLE_FIREBASE === 'true' || false;

if (isFirebaseEnabled) {
  try {
    getApp();
  } catch (e) {
    if (Device.isDevice) {
      initializeApp(firebaseConfig);
    }
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  startNetworkLogging();
  const removeIngestionId = useSetAtom(removeIngestionIdAtom);

  useEffect(() => {
    if (!Device.isDevice || !isFirebaseEnabled) {
      console.log('Push notifications skipped (emulator or Firebase disabled)');
      return;
    }

    const responseListener = Notifications.addNotificationResponseReceivedListener(async response => {
      const notificationPayload: any = JSON.parse(response.notification.request.content.data.payload as any);
      if (notificationPayload && notificationPayload?.type == 'ingestion' && notificationPayload?.status == 'success') {
        const { accession_id, documentId, full_report_path, patientName } = notificationPayload;
        const signedUrl = await storageAPI.getSignedUrl(full_report_path);
        router.push({
          pathname: '/reports' as any,
          params: {
            pdfUrl: encodeURIComponent(signedUrl),
            patientName: patientName,
            documentId: documentId,
            accession_id: accession_id,
            ingestionStatus: 'ingested',
          },
        });
      }
    });

    const unsubscribe = onMessage(messaging(), async remoteMessage => {
      const notificationPayload: any = JSON.parse(remoteMessage.data.payload as any);
      if (notificationPayload && notificationPayload?.type == 'ingestion') {
        const { accession_id } = notificationPayload;
        removeIngestionId(Number(accession_id));
      }
      await Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.notification?.title,
          body: remoteMessage.notification?.body,
          data: remoteMessage.data || {},
          sound: 'default',
        },
        trigger: null,
      });
    });

    return () => {
      unsubscribe();
      responseListener.remove();
    };
  }, []);

  useEffect(() => {
    if (!Device.isDevice || !isFirebaseEnabled) {
      console.log('Push notifications skipped (emulator or Firebase disabled)');
      return;
    }
    return onTokenRefresh(messaging(), newToken => {
      console.log('FCM token refreshed:', newToken);
      setFcmToken(newToken);
    });
  }, []);

  const { theme, colorScheme, setColorScheme } = useThemeSync();

  useEffect(() => {
    if (theme !== colorScheme) {
      const timer = setTimeout(() => {
        setColorScheme(theme);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [theme, colorScheme, setColorScheme]);

  const [loaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <GestureHandlerRootView className="flex-1">
          <View className={`flex-1 ${theme === 'dark' ? 'dark' : ''} bg-[#FDF5E6] dark:bg-gray-900`}>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
            <Stack screenOptions={STACK_OPTIONS} />
            <Toast position="bottom" />
            <NetworkChecker />
            {__DEV__ && <NetworkLoggers />}
          </View>
        </GestureHandlerRootView>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const STACK_OPTIONS = {
  headerShown: false,
};
