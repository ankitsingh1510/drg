import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Device from 'expo-device';
import { isDevice } from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import messaging, { onMessage } from '@react-native-firebase/messaging';
import { useSetAtom } from 'jotai';
import { useColorScheme } from 'nativewind';
import Pdf from 'react-native-pdf';
import ReAnimated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ElevenLabsChat from '@/components/chat/ElevenLabsChat';
import InteractionBox from '@/components/interaction/Interactions';
import { NotificationPermissionModal } from '@/components/patient';
import { colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { configAPI } from '@/services/config';
import { elevenLabsAPI } from '@/services/elevenlabs';
import { ragAPI } from '@/services/rag';
import { addIngestionIdAtom, removeIngestionIdAtom } from '@/stores/ingestion';
import { setFcmToken } from '@/stores/mmkv';
import { IngestionStatus } from '@/types/types';
import { toast } from '@/util/toast';

async function getFcmToken() {
  try {
    const isFirebaseEnabled = process.env.EXPO_PUBLIC_ENABLE_FIREBASE === 'true' || false;
    if (!isFirebaseEnabled) {
      console.log('Firebase is not enabled');
      return null;
    }

    const messagingInstance = messaging();

    if (Platform.OS === 'ios') {
      const authStatus = await messagingInstance.requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('Push notification permission not granted');
        return null;
      }

      await messagingInstance.registerDeviceForRemoteMessages();
      let apnsToken = await messagingInstance.getAPNSToken();
      let retries = 0;
      while (!apnsToken && retries < 5) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        apnsToken = await messagingInstance.getAPNSToken();
        retries++;
      }

      if (!apnsToken) {
        console.error('Failed to get APNs token after retries');
        return null;
      }
    }

    const token = await messagingInstance.getToken();
    setFcmToken(token);
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error fetching FCM token:', error);
    return null;
  }
}
async function registerForPushNotificationsAsync() {
  const isFirebaseEnabled = process.env.EXPO_PUBLIC_ENABLE_FIREBASE === 'true';

  if (!Device.isDevice || !isFirebaseEnabled) {
    console.log('Push notifications skipped (emulator or Firebase disabled)');
    return;
  }

  const permission = await Notifications.getPermissionsAsync();
  const { status, canAskAgain } = permission;
  console.log('Current notification permission status:', status);
  if (status === 'granted') {
    console.log('Notification permission already granted');
    return;
  }

  if (status === 'undetermined' && canAskAgain) {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus === 'granted') {
      await getFcmToken();
    }
    return;
  }

  if (status === 'denied' && !canAskAgain) {
    toast.info('Notifications blocked — open settings');
    return;
  }

  return;
}

export default function Reports() {
  const { token } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isFirebaseEnabled = process.env.EXPO_PUBLIC_ENABLE_FIREBASE === 'true' || false;
  let { pdfUrl, patientName, documentId, accession_id, ingestionStatus } = useLocalSearchParams<{
    pdfUrl: string;
    patientName: string;
    documentId: string;
    accession_id: string;
    ingestionStatus: IngestionStatus;
  }>();
  const addIngestionId = useSetAtom(addIngestionIdAtom);
  const removeIngestionId = useSetAtom(removeIngestionIdAtom);
  const [docId, setDocId] = useState(documentId);
  const [loading, setLoading] = useState(true);
  const [currentIngestionStatus, setCurrentIngestionStatus] = useState<IngestionStatus | undefined>(ingestionStatus);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [showInteraction, setShowInteraction] = useState<{ isVisible: boolean; mode: 'video' | 'chat' }>({
    isVisible: false,
    mode: 'video',
  });
  const [chatSignedUrl, setChatSignedUrl] = useState<string | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [pdfHeight, setPdfHeight] = useState(50); // Percentage of total height for PDF
  const [showVideoAvatar, setShowVideoAvatar] = useState(true);
  const containerHeight = useRef(0);
  const panY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Notifications.getPermissionsAsync().then(({ status }) => {
      console.log('Notification permission status on reports load:', status);
      if (isFirebaseEnabled && Device.isDevice && status === 'granted') {
        getFcmToken();
      }
    });
  }, []);

  useEffect(() => {
    configAPI.getConfig().then(config => {
      setShowVideoAvatar(config.showVideoAvatar);
    });
  }, []);

  useEffect(() => {
    if (!Device.isDevice || !isFirebaseEnabled) {
      console.log('Push notifications skipped (emulator or Firebase disabled)');
      return;
    }
    const unsubscribe = onMessage(messaging(), async remoteMessage => {
      try {
        const notificationPayload: any = JSON.parse(remoteMessage.data?.payload as any);

        if (notificationPayload && notificationPayload?.type === 'ingestion') {
          const { accession_id: msgAccessionId, status, documentId } = notificationPayload;

          if (msgAccessionId && String(msgAccessionId) === String(accession_id)) {
            if (status === 'success') {
              setCurrentIngestionStatus('ingested');
              setDocId(documentId);
            } else if (status === 'failed') {
              setCurrentIngestionStatus('failed');
            }
          }
        }
      } catch (error) {
        console.error('Error handling FCM message in reports screen:', error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [accession_id, removeIngestionId, setDocId]);
  const handleChatWithDrG = async () => {
    if (loadingChat) return;
    try {
      setLoadingChat(true);
      const signedUrl = await elevenLabsAPI.getSignedUrl();
      setChatSignedUrl(signedUrl);
      setShowInteraction({ isVisible: true, mode: 'chat' });
    } catch (error) {
      console.error('Error getting signed URL:', error);
      toast.error('Failed to connect to chat', 'Please try again', 3000);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleTalkToDrG = () => {
    setShowInteraction({ isVisible: true, mode: 'video' });
  };

  const handleIngestReport = async () => {
    // Check notification permissions and show modal if not granted
    if (Device.isDevice) {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permission not granted');
        setShowNotificationModal(true);
        return;
      }
    }
    await proceedWithIngestion();
  };

  const proceedWithIngestion = async () => {
    toast.success('Analyzing Report. This may take some time...', undefined, 2000);
    addIngestionId(Number(accession_id));
    setCurrentIngestionStatus('ingesting');

    try {
      const res = await ragAPI.ingestReport(accession_id);
      toast.success(res.message, undefined, 3000);
    } catch (error) {
      console.log('Error while analyzing report:', error);
      removeIngestionId(Number(accession_id));
      setCurrentIngestionStatus('failed');
    }
  };

  const handleCloseNotificationModal = async (performAction: boolean) => {
    setShowNotificationModal(false);

    if (performAction) {
      await registerForPushNotificationsAsync();
      await proceedWithIngestion();
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleOnInteractionClose = () => {
    setShowInteraction({ isVisible: false, mode: 'video' });
  };

  const handleCloseChatSplit = () => {
    setChatSignedUrl(null);
    setShowInteraction({ isVisible: false, mode: 'chat' });
    setPdfHeight(50); // Reset to 50/50 split
  };

  // Create PanResponder for draggable splitter
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        panY.setOffset(0);
        panY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (containerHeight.current > 0) {
          const deltaPercentage = (gestureState.dy / containerHeight.current) * 100;
          const newPdfHeight = pdfHeight + deltaPercentage;

          // Enforce 10% minimum for both sections (25% to 75%)
          if (newPdfHeight >= 25 && newPdfHeight <= 75) {
            setPdfHeight(newPdfHeight);
            panY.setValue(0);
          }
        }
      },
      onPanResponderRelease: () => {
        panY.flattenOffset();
        panY.setValue(0);
      },
    })
  ).current;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? colors.dark.background : colors.light.background }}>
      {/* Header */}
      <ReAnimated.View
        entering={FadeInUp.duration(600).springify()}
        className="relative flex-row items-center border-b border-gray-200 bg-[#FDF5E6] px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
      >
        <TouchableOpacity onPress={handleGoBack} className="z-10 p-2">
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.dark.text : colors.common.accent} />
        </TouchableOpacity>
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-100" numberOfLines={1} ellipsizeMode="tail">
            {patientName}
          </Text>
        </View>
      </ReAnimated.View>

      {/* Main Content Area - Split or Full */}
      <KeyboardAvoidingView
        className="flex-1"
        style={{ flexDirection: 'column' }}
        behavior="padding"
        onLayout={event => {
          containerHeight.current = event.nativeEvent.layout.height;
        }}
      >
        {/* PDF Viewer */}
        <ReAnimated.View
          entering={FadeInUp.delay(200).duration(600).springify()}
          className="relative flex-1"
          style={styles.pdfView}
        >
          <Pdf
            trustAllCerts={false}
            source={{ uri: pdfUrl, cache: true, expiration: 60 }}
            style={styles.pdf}
            onLoadComplete={(numberOfPages, filePath) => {
              setNumPages(numberOfPages);
              setLoading(false);
            }}
            onPageChanged={(page, numberOfPages) => {
              setCurrentPage(page);
            }}
            onError={error => {
              console.error('PDF error:', error);
              setLoading(false);
              toast.error('Failed to load PDF.', 'Please try again.', 3000);
            }}
            onLoadProgress={percent => {}}
            enablePaging={true}
            horizontal={false}
            spacing={10}
            fitPolicy={0}
            maxScale={3}
            minScale={0.5}
          />

          {/* Page indicator */}
          {!loading && numPages > 0 && (
            <View className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-2">
              <Text className="text-sm font-semibold text-white">
                {currentPage} / {numPages}
              </Text>
            </View>
          )}

          {/* Loading overlay */}
          {loading && (
            <View className="absolute inset-0 items-center justify-center bg-white dark:bg-gray-900">
              <ActivityIndicator size="large" color={colors.common.primary} />
              <Text className="mt-3 text-base text-slate-600 dark:text-gray-300">Loading PDF...</Text>
            </View>
          )}
        </ReAnimated.View>

        {/* Draggable Splitter */}
        {showInteraction.isVisible && showInteraction.mode === 'chat' && chatSignedUrl && (
          <View
            {...panResponder.panHandlers}
            style={{
              height: 16,
              backgroundColor: isDark ? '#374151' : '#e5e7eb',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 60,
                height: 5,
                backgroundColor: isDark ? '#6b7280' : '#9ca3af',
                borderRadius: 3,
              }}
            />
          </View>
        )}

        {/* ElevenLabs Chat Split Screen */}
        {showInteraction.isVisible && showInteraction.mode === 'chat' && chatSignedUrl && (
          <View
            style={{
              height: `${100 - pdfHeight}%`,
              borderTopWidth: 0,
            }}
          >
            <ElevenLabsChat
              signedUrl={chatSignedUrl}
              documentId={String(docId)}
              token={token || ''}
              onClose={handleCloseChatSplit}
            />
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Talk to Dr.G / Analyze Report Button */}
      {!showInteraction.isVisible && (
        <ReAnimated.View
          entering={FadeInUp.delay(400).duration(600).springify()}
          className="items-center border-t border-gray-200 px-4 py-2 dark:border-gray-700"
          style={{ backgroundColor: isDark ? colors.dark.cardBackground : colors.light.background }}
        >
          {currentIngestionStatus === 'ingested' && (
            <View className="flex-row items-center justify-center gap-4 py-2">
              {showVideoAvatar && (
                <ReAnimated.View entering={FadeInUp.delay(500).duration(800).springify()}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    className="flex-row items-center justify-center rounded-full bg-blue-600 px-6 py-4 shadow-lg shadow-blue-300 dark:shadow-none"
                    onPress={handleTalkToDrG}
                  >
                    <Feather name="video" size={20} color="white" strokeWidth={2.5} />
                    <Text className="ml-2 text-base font-extrabold uppercase tracking-tight text-white">Talk</Text>
                  </TouchableOpacity>
                </ReAnimated.View>
              )}

              <ReAnimated.View entering={FadeInUp.delay(650).duration(800).springify()}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={loadingChat}
                  className="flex-row items-center justify-center rounded-full bg-indigo-600 px-6 py-4 shadow-lg shadow-indigo-300 dark:shadow-none"
                  onPress={handleChatWithDrG}
                >
                  <Ionicons name="chatbubbles" size={20} color="white" />
                  <Text className="ml-2 text-base font-extrabold uppercase tracking-tight text-white">Chat</Text>
                </TouchableOpacity>
              </ReAnimated.View>
            </View>
          )}

          {currentIngestionStatus === 'ingesting' && (
            <ReAnimated.View entering={FadeInUp.duration(600).springify()} className="py-2">
              <TouchableOpacity
                disabled={true}
                className="flex-row items-center justify-center rounded-full bg-slate-100 px-10 py-4 dark:bg-slate-800"
              >
                <ActivityIndicator size="small" color={isDark ? '#fff' : colors.common.primary} />
                <Text className="ml-3 text-base font-extrabold uppercase tracking-tight text-slate-500 dark:text-slate-400">
                  Analyzing Report
                </Text>
              </TouchableOpacity>
            </ReAnimated.View>
          )}

          {(currentIngestionStatus === 'failed' || !currentIngestionStatus) && (
            <ReAnimated.View entering={FadeInUp.delay(400).duration(600).springify()} className="py-2">
              <TouchableOpacity
                activeOpacity={0.8}
                className="flex-row items-center justify-center rounded-full bg-blue-600 px-10 py-4 shadow-lg shadow-blue-300 dark:shadow-none"
                onPress={handleIngestReport}
              >
                <MaterialIcons name="analytics" size={22} color="white" />
                <Text className="ml-2 text-base font-extrabold uppercase tracking-tight text-white">
                  Analyze Report
                </Text>
              </TouchableOpacity>
            </ReAnimated.View>
          )}
        </ReAnimated.View>
      )}

      {/* Floating Interaction Box */}
      {showInteraction.isVisible && (
        <InteractionBox
          documentId={String(docId)}
          token={token}
          onClose={handleOnInteractionClose}
          mode={showInteraction.mode}
        />
      )}

      <NotificationPermissionModal visible={showNotificationModal} onClose={handleCloseNotificationModal} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f5f5f5',
  },
  pdfView: {
    backgroundColor: 'gray',
    marginHorizontal: 5,
    borderRadius: 5,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
