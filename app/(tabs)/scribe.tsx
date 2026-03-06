import React, { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import { FlashList } from '@shopify/flash-list';
import { useAtom } from 'jotai';
import { Calendar, Check, Mic, Pause, Phone, Search, Square, User, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { persistentScribeSessionsAtom } from '@/stores/scribe';
import { ScribeSession } from '@/types/scribe';

export default function ScribeScreen() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [hasConsented, setHasConsented] = useState(false);
  const [isTransitional, setIsTransitional] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [sessions, setSessions] = useAtom(persistentScribeSessionsAtom);

  const filteredSessions = sessions.filter(
    s =>
      s.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 100); // Faster updates for better UI reactivity

  // Derived states from recorderState
  const isRecording = recorderState.isRecording;
  const isPaused = !isRecording && recorderState.durationMillis > 0 && !isTransitional;

  const pulse = useSharedValue(1);

  useEffect(() => {
    if (isRecording && !isPaused) {
      pulse.value = withRepeat(
        withSequence(withTiming(1.2, { duration: 1000 }), withTiming(1, { duration: 1000 })),
        -1,
        false
      );
    } else {
      pulse.value = withTiming(1);
    }
  }, [isRecording, isPaused]);

  const handleStartRecording = async () => {
    if (!hasConsented) {
      Alert.alert('Consent Required', 'Please confirm consent before starting.');
      return;
    }

    setIsTransitional(true);
    try {
      const { status: pStatus } = await requestRecordingPermissionsAsync();
      if (pStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access microphone is required!');
        setIsTransitional(false);
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        allowsBackgroundRecording: true,
      });

      Keyboard.dismiss();

      // Explicitly prepare the recorder
      await recorder.prepareToRecordAsync(RecordingPresets.HIGH_QUALITY);

      // Start recording
      recorder.record();

      // Keep isTransitional true for a short moment so UI doesn't flicker back to form
      setTimeout(() => setIsTransitional(false), 300);
    } catch (err: any) {
      console.error('Failed to start recording', err);
      setIsTransitional(false);
      Alert.alert('Error', `Could not start recording: ${err.message || 'Unknown error'}`);
    }
  };

  const handlePauseResume = () => {
    if (recorder.isRecording) {
      recorder.pause();
    } else {
      recorder.record();
    }
  };

  const handleStopRecording = async () => {
    setIsTransitional(true);
    try {
      await recorder.stop();

      const uri = recorder.uri;
      console.log('Recording stopped. URI:', uri);

      if (uri) {
        // Move file to permanent location
        const fileName = `scribe_${Date.now()}.m4a`;

        // Use documentDirectory from legacy export
        const docDir = FileSystem.documentDirectory;
        if (!docDir) throw new Error('Document directory not available on this device');

        const permanentUri = `${docDir}${fileName}`;

        console.log('Moving file from', uri, 'to', permanentUri);

        // Ensure destination directory exists (though docDir usually does)
        // moveAsync is robust for file moves
        await FileSystem.moveAsync({
          from: uri,
          to: permanentUri,
        });

        const newSession: ScribeSession = {
          id: Date.now().toString(),
          patientName: name,
          phoneNumber: phone,
          audioUri: permanentUri,
          timestamp: Date.now(),
        };

        setSessions([newSession, ...sessions]);

        // Only close and reset if save succeeded
        setModalVisible(false);
        setName('');
        setPhone('');
        setHasConsented(false);
      } else {
        console.warn('No recording URI found after stop');
        Alert.alert('Error', 'No audio was recorded.');
      }
    } catch (err: any) {
      console.error('Failed to stop/save recording:', err);
      Alert.alert('Error', `Failed to save recording: ${err.message || 'Unknown error'}`);
    } finally {
      setIsTransitional(false);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: interpolate(pulse.value, [1, 1.2], [1, 0.6], Extrapolate.CLAMP),
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value + 0.5 }],
    opacity: interpolate(pulse.value, [1, 1.2], [0.4, 0], Extrapolate.CLAMP),
  }));

  // Show dashboard if recording, paused, or in training/stopped state
  const showDashboard = isRecording || isPaused || isTransitional;

  return (
    <SafeAreaView edges={[]} style={{ flex: 1, paddingTop: headerHeight }} className="bg-[#FDF5E6] dark:bg-gray-900">
      {/* Search Header */}
      <View
        className="bg-[#FDF5E6] px-5 pb-3 pt-3 dark:bg-gray-900"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: isDark ? '#1f2937' : '#f1f5f9',
        }}
      >
        <View className="flex-row items-center">
          <View className="h-12 flex-1 flex-row items-center rounded-full border border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800">
            <View className="items-center justify-center">
              <Search size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            </View>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="ml-2 flex-1 text-base font-medium text-gray-800 dark:text-gray-100"
              placeholder="Search sessions, patients, phone…"
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              style={{
                height: 48,
                paddingTop: 0,
                paddingBottom: Platform.OS === 'ios' ? 4 : 0,
                textAlignVertical: 'center',
                includeFontPadding: false,
              }}
            />
          </View>
        </View>
        <View className="mt-2 flex-row items-center justify-between px-1">
          <Text className="text-xs font-bold uppercase tracking-widest text-gray-400">
            {filteredSessions.length} Total Sessions
          </Text>
        </View>
      </View>

      <View className="flex-1">
        <FlashList
          data={filteredSessions}
          keyExtractor={(item: ScribeSession) => item.id}
          contentContainerStyle={{
            paddingTop: 10,
            paddingBottom: 100,
          }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/scribe-detail' as any,
                  params: { id: item.id },
                })
              }
              className="mx-4 mb-4 rounded-[32px] bg-white p-6 shadow-sm dark:bg-gray-800"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <User size={16} color="#daa521" />
                    <Text className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {item.patientName || 'Untitled Session'}
                    </Text>
                  </View>
                  <View className="mt-3 flex-row items-center gap-2">
                    <Phone size={14} color="#9ca3af" />
                    <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {item.phoneNumber || 'No phone'}
                    </Text>
                  </View>
                  <View className="mt-4 flex-row items-center gap-2 rounded-xl bg-gray-50 px-3 py-1.5 dark:bg-gray-900/50">
                    <Calendar size={12} color="#9ca3af" />
                    <Text className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                      {new Date(item.timestamp).toLocaleDateString()} at{' '}
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#daa521]/10">
                  <Mic size={24} color="#daa521" />
                </View>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View className="mt-20 items-center justify-center">
              <Mic size={48} color="#9ca3af" strokeWidth={1} />
              <Text className="mt-4 font-medium text-gray-400">No sessions found</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Floating Action Button */}
      <View className="absolute bottom-8 left-0 right-0 items-center">
        <Pressable
          onPress={() => setModalVisible(true)}
          className="flex-row items-center justify-center rounded-full bg-[#daa521] px-10 py-5 shadow-lg shadow-[#daa521]/30 active:scale-95 active:opacity-90"
        >
          <Mic size={24} color="white" />
          <Text className="ml-3 text-xl font-bold text-white">New Scribe</Text>
        </Pressable>
      </View>

      {/* Record Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          if (!isRecording) setModalVisible(false);
        }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <SafeAreaView className="flex-1 bg-[#FDF5E6] dark:bg-gray-900" edges={['bottom', 'left', 'right']}>
            <View
              style={{ paddingTop: Math.max(insets.top, 60) }}
              className="flex-row items-center justify-between bg-white/30 px-6 pb-6 dark:bg-gray-800/30"
            >
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">New Session</Text>
              {!showDashboard && (
                <Pressable
                  onPress={() => setModalVisible(false)}
                  className="rounded-full bg-gray-200 p-2 dark:bg-gray-800"
                >
                  <X size={24} color="#6b7280" />
                </Pressable>
              )}
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6">
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="flex-1 py-4">
                  {!showDashboard ? (
                    <View className="space-y-6">
                      <View>
                        <Text className="mb-2 ml-1 text-sm font-bold uppercase tracking-widest text-gray-400">
                          Patient Name
                        </Text>
                        <View className="h-16 flex-row items-center rounded-[24px] border border-gray-200 bg-white px-5 dark:border-gray-700 dark:bg-gray-800">
                          <User size={20} color="#daa521" />
                          <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter patient name"
                            placeholderTextColor="#9ca3af"
                            className="flex-1 p-4 text-lg font-medium text-gray-900 dark:text-white"
                          />
                        </View>
                      </View>

                      <View className="mt-4">
                        <Text className="mb-2 ml-1 text-sm font-bold uppercase tracking-widest text-gray-400">
                          Phone Number
                        </Text>
                        <View className="h-16 flex-row items-center rounded-[24px] border border-gray-200 bg-white px-5 dark:border-gray-700 dark:bg-gray-800">
                          <Phone size={20} color="#daa521" />
                          <TextInput
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Enter phone number"
                            placeholderTextColor="#9ca3af"
                            keyboardType="phone-pad"
                            className="flex-1 p-4 text-lg font-medium text-gray-900 dark:text-white"
                          />
                        </View>
                      </View>

                      <View className="mt-8">
                        <Pressable
                          onPress={() => setHasConsented(!hasConsented)}
                          className="flex-row items-center space-x-4 px-1"
                        >
                          <View
                            className={`h-7 w-7 items-center justify-center rounded-xl border-2 ${hasConsented ? 'border-[#daa521] bg-[#daa521]' : 'border-gray-300 dark:border-gray-600'}`}
                          >
                            {hasConsented && <Check size={18} color="white" />}
                          </View>
                          <Text className="ml-3 text-base font-semibold text-gray-700 dark:text-gray-300">
                            User has consented recording
                          </Text>
                        </Pressable>
                      </View>

                      <View className="mt-12 items-center">
                        <Pressable
                          onPress={handleStartRecording}
                          disabled={!hasConsented}
                          style={
                            hasConsented
                              ? {
                                  shadowColor: '#daa521',
                                  shadowOffset: { width: 0, height: 10 },
                                  shadowOpacity: 0.3,
                                  shadowRadius: 20,
                                  elevation: 10,
                                }
                              : {}
                          }
                          className={`h-16 w-full flex-row items-center justify-center rounded-full py-5 active:scale-95 ${hasConsented ? 'bg-[#daa521]' : 'bg-gray-300 dark:bg-gray-700'}`}
                        >
                          <Mic size={24} color="white" />
                          <Text className="ml-3 text-xl font-bold text-white">Start Recording</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <View className="flex-1 items-center justify-center">
                      <View className="mb-14 items-center justify-center">
                        <Animated.View
                          style={ringStyle}
                          className="absolute h-40 w-40 rounded-full border-4 border-[#daa521]"
                        />
                        <Animated.View
                          style={animatedStyle}
                          className="h-40 w-40 items-center justify-center rounded-full bg-[#daa521]"
                        >
                          <Mic size={64} color="white" />
                        </Animated.View>
                      </View>

                      <Text className="text-3xl font-bold text-gray-900 dark:text-white">
                        {isPaused ? 'Recording Paused' : isTransitional ? 'Processing...' : 'Recording...'}
                      </Text>
                      <Text className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                        Patient: {name || 'Unknown'}
                      </Text>

                      <View className="mt-24 w-full px-6">
                        <View className="flex-row justify-between space-x-4">
                          <Pressable
                            onPress={handlePauseResume}
                            disabled={isTransitional}
                            className={`h-16 flex-1 flex-row items-center justify-center rounded-full active:opacity-80 ${isPaused ? 'bg-[#daa521]' : 'bg-white dark:bg-gray-800'}`}
                          >
                            {isPaused ? (
                              <>
                                <Mic size={20} color="white" />
                                <Text className="ml-2 text-lg font-bold text-white">Resume Recording</Text>
                              </>
                            ) : (
                              <>
                                <Pause size={20} color="#6b7280" />
                                <Text className="ml-2 text-lg font-bold text-gray-600 dark:text-gray-300">
                                  Pause Recording
                                </Text>
                              </>
                            )}
                          </Pressable>
                        </View>

                        <View className="mt-4">
                          <Pressable
                            onPress={handleStopRecording}
                            disabled={isTransitional}
                            className="h-16 flex-row items-center justify-center rounded-full bg-red-500 active:opacity-80"
                          >
                            <Square size={20} color="white" />
                            <Text className="ml-2 text-lg font-bold text-white">Stop and Save</Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
