import React, { useEffect } from 'react';
import { Appearance, LogBox, Platform, Text, View } from 'react-native';

// Suppress SafeAreaView deprecation warning from react-native-css-interop (NativeWind).
// The warning is triggered at module load time by css-interop registering style interop
// on the built-in RN SafeAreaView. All project code uses react-native-safe-area-context.
LogBox.ignoreLogs(['SafeAreaView has been deprecated']);
import * as Device from 'expo-device';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { router, Stack, useLocalSearchParams, usePathname } from 'expo-router';
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
import { toast } from '@/util/toast';
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

if (isFirebaseEnabled && Device.isDevice) {
  try {
    getApp();
    console.log('Firebase app already initialized');
  } catch (e) {
    try {
      initializeApp(firebaseConfig);
      console.log('Firebase app initialized successfully');
    } catch (initError) {
      console.error('Failed to initialize Firebase:', initError);
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
  const removeIngestionId = useSetAtom(removeIngestionIdAtom);
  const pathname = usePathname();
  const localSearchParams = useLocalSearchParams();
  useEffect(() => {
    if (__DEV__) startNetworkLogging();
  }, []);

  useEffect(() => {
    if (!Device.isDevice || !isFirebaseEnabled) {
      console.log('Push notifications skipped (emulator or Firebase disabled)');
      return;
    }

    const responseListener = Notifications.addNotificationResponseReceivedListener(async response => {
      const notificationPayload: any = JSON.parse(response.notification.request.content.data.payload as any);
      if (notificationPayload && notificationPayload?.type == 'ingestion' && notificationPayload?.status == 'success') {
        const { assay_ids, documentId, full_report_path, patientName } = notificationPayload;
        if (assay_ids === localSearchParams.assayResultIds) {
          toast.info('Already viewing the report.');
        } else {
          const signedUrl = await storageAPI.getSignedUrl(full_report_path);
          router.push({
            pathname: '/reports' as any,
            params: {
              pdfUrl: encodeURIComponent(signedUrl),
              patientName: patientName,
              documentId: documentId,
              assayResultIds: assay_ids,
              ingestionStatus: 'ingested',
            },
          });
        }
      }
    });

    const unsubscribe = onMessage(messaging(), async remoteMessage => {
      const notificationPayload: any = JSON.parse(remoteMessage.data.payload as any);
      if (notificationPayload && notificationPayload?.type == 'ingestion') {
        const { assayIds } = notificationPayload;
        removeIngestionId(assayIds);
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
            <Stack screenOptions={STACK_OPTIONS}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="reports" options={{ headerShown: false }} />
              <Stack.Screen
                name="profile"
                options={{
                  headerShown: true,
                  title: 'My Profile',
                  headerBackTitle: '',
                  headerBackButtonDisplayMode: 'minimal',
                  headerShadowVisible: false,
                  headerStyle: {
                    backgroundColor: theme === 'dark' ? '#111827' : '#FDF5E6',
                  },
                  headerTintColor: theme === 'dark' ? '#f9fafb' : '#111827',
                  headerTitleStyle: {
                    fontFamily: 'Poppins_600SemiBold',
                    fontSize: 18,
                  },
                }}
              />
              <Stack.Screen
                name="reset-password"
                options={{
                  headerShown: true,
                  title: 'Change Password',
                  headerBackButtonDisplayMode: 'minimal',
                  headerBackTitle: '',
                  headerShadowVisible: false,
                  headerStyle: {
                    backgroundColor: theme === 'dark' ? '#111827' : '#FDF5E6',
                  },
                  headerTintColor: theme === 'dark' ? '#f9fafb' : '#111827',
                  headerTitleStyle: {
                    fontFamily: 'Poppins_600SemiBold',
                    fontSize: 18,
                  },
                }}
              />
              <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
              <Stack.Screen
                name="news"
                options={{
                  headerShown: true,
                  title: 'Trends',
                  headerBackButtonDisplayMode: 'minimal',
                  headerBackTitle: '',
                  headerShadowVisible: false,
                  headerStyle: {
                    backgroundColor: theme === 'dark' ? '#111827' : '#FDF5E6',
                  },
                  headerTintColor: theme === 'dark' ? '#f9fafb' : '#111827',
                  headerTitleStyle: {
                    fontFamily: 'Poppins_600SemiBold',
                    fontSize: 18,
                  },
                }}
              />
              <Stack.Screen
                name="tests"
                options={{
                  headerShown: true,
                  title: 'Order Tests',
                  headerBackButtonDisplayMode: 'minimal',
                  headerBackTitle: '',
                  headerShadowVisible: false,
                  headerStyle: {
                    backgroundColor: theme === 'dark' ? '#111827' : '#FDF5E6',
                  },
                  headerTintColor: theme === 'dark' ? '#f9fafb' : '#111827',
                  headerTitleStyle: {
                    fontFamily: 'Poppins_600SemiBold',
                    fontSize: 18,
                  },
                }}
              />
              <Stack.Screen
                name="scribe-detail"
                options={{
                  headerShown: true,
                  title: 'Scribe Detail',
                  headerBackButtonDisplayMode: 'minimal',
                  headerBackTitle: '',
                  headerShadowVisible: false,
                  headerStyle: {
                    backgroundColor: theme === 'dark' ? '#111827' : '#FDF5E6',
                  },
                  headerTintColor: theme === 'dark' ? '#f9fafb' : '#111827',
                  headerTitleStyle: {
                    fontFamily: 'Poppins_600SemiBold',
                    fontSize: 18,
                  },
                }}
              />
            </Stack>
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
