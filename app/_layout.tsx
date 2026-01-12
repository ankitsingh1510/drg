import React from 'react';
import { useEffect, useState } from 'react';
import { Platform, Text } from 'react-native';
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
import messaging, { getAPNSToken, getToken, onMessage, onTokenRefresh } from '@react-native-firebase/messaging';
import { useSetAtom } from 'jotai';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
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

try {
  getApp();
} catch (e) {
  if (Device.isDevice) {
    initializeApp(firebaseConfig);
  }
}

async function getFcmToken() {
  try {
    const messagingInstance = messaging();

    if (Platform.OS === 'ios') {
      const apnsToken = await getAPNSToken(messagingInstance);
      if (!apnsToken) {
        // If APNs isn't ready, wait 2 seconds and try once more
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Get the actual FCM token
    const token = await getToken(messagingInstance);
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error fetching FCM token:', error);
    throw error;
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true, // for iOS 14+
    shouldShowList: true, // for iOS 14+
  }),
});

function handleRegistrationError(errorMessage: string) {
  Toast.show({
    type: 'error',
    text1: 'Notification Error',
    text2: errorMessage,
  });
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.log('Push notifications skipped (emulator)');
    return;
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }

    try {
      const pushTokenString = await getFcmToken();
      console.log('Push notification token:', pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

export default function RootLayout() {
  startNetworkLogging();
  const removeIngestionId = useSetAtom(removeIngestionIdAtom);

  useEffect(() => {
    if (!Device.isDevice) {
      console.log('Push notifications skipped (emulator)');
      return;
    }
    registerForPushNotificationsAsync()
      .then(token => {
        const tokenStr = token ?? '';
        setFcmToken(tokenStr);
      })
      .catch((error: any) => {
        const errorStr = `${error}`;
        console.error('Error during push notification registration:', errorStr);
      });

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
            showIngestOption: 'false',
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
    if (!Device.isDevice) {
      console.log('Push notifications skipped (emulator)');
      return;
    }
    return onTokenRefresh(messaging(), newToken => {
      console.log('FCM token refreshed:', newToken);
      setFcmToken(newToken);
    });
  }, []);

  const { theme } = useThemeSync();
  const [loaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  if (!loaded) return null;

  if ((Text as any).defaultProps == null) (Text as any).defaultProps = {};
  (Text as any).defaultProps.style = { fontFamily: 'Poppins_400Regular' };

  if ((TextInput as any).defaultProps == null) (TextInput as any).defaultProps = {};
  (TextInput as any).defaultProps.style = { fontFamily: 'Poppins_400Regular' };

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView className="flex-1 bg-white dark:bg-black">
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <Toast position="bottom" />
          <NetworkChecker />
          {__DEV__ && <NetworkLoggers />}
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
