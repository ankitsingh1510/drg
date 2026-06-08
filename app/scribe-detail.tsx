import React, { useMemo } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import { Calendar, FileText, Mic, Pause, Phone, Play, Trash2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { persistentScribeSessionsAtom } from '@/stores/scribe';

export default function ScribeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [sessions, setSessions] = useAtom(persistentScribeSessionsAtom);

  const session = useMemo(() => {
    return sessions.find(s => s.id === id);
  }, [sessions, id]);

  const player = useAudioPlayer(session?.audioUri || null);
  const status = useAudioPlayerStatus(player);

  const handleDelete = () => {
    Alert.alert('Delete Session', 'Are you sure you want to delete this session? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (session) {
            player.pause();
            try {
              await FileSystem.deleteAsync(session.audioUri, { idempotent: true });
            } catch (err) {
              console.error('Failed to delete audio file', err);
            }
            setSessions(sessions.filter(s => s.id !== id));
            router.back();
          }
        },
      },
    ]);
  };

  if (!session) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FDF5E6] dark:bg-gray-900">
        <Text className="text-gray-500">Session not found.</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="font-outfit-bold text-[#daa521]">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const duration = status.duration || 1;
  const currentTime = status.currentTime || 0;
  const progress = (currentTime / duration) * 100;

  return (
    <SafeAreaView className="flex-1 bg-[#FDF5E6] dark:bg-gray-900">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View className="mb-10 items-center">
          <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-[#daa521]/10">
            <Mic size={48} color="#daa521" />
          </View>
          <Text className="text-center text-3xl font-outfit-bold text-gray-900 dark:text-white">
            {session.patientName || 'Untitled Session'}
          </Text>
        </View>

        <View className="space-y-6 rounded-3xl bg-white/50 p-6 dark:bg-gray-800/50">
          <View className="flex-row items-center">
            <View className="mr-4 h-10 w-10 items-center justify-center rounded-xl bg-[#daa521]/10">
              <Phone size={20} color="#daa521" />
            </View>
            <View>
              <Text className="text-xs font-outfit-medium text-gray-400">Phone Number</Text>
              <Text className="text-lg font-outfit-bold text-gray-900 dark:text-white">
                {session.phoneNumber || 'Not provided'}
              </Text>
            </View>
          </View>

          <View className="mt-6 flex-row items-center">
            <View className="mr-4 h-10 w-10 items-center justify-center rounded-xl bg-[#daa521]/10">
              <Calendar size={20} color="#daa521" />
            </View>
            <View>
              <Text className="text-xs font-outfit-medium text-gray-400">Session Date</Text>
              <Text className="text-lg font-outfit-bold text-gray-900 dark:text-white">
                {new Date(session.timestamp).toLocaleDateString()} at{' '}
                {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-12 items-center">
          <View className="mb-8 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <View className="h-full bg-[#daa521]" style={{ width: `${progress}%` }} />
          </View>

          <View className="flex-row items-center justify-center">
            <Pressable
              onPress={() => {
                if (status.playing) {
                  player.pause();
                } else {
                  player.play();
                }
              }}
              className="h-20 w-20 items-center justify-center rounded-full bg-[#daa521] active:opacity-90"
            >
              {status.playing ? <Pause size={32} color="white" /> : <Play size={32} color="white" className="ml-1" />}
            </Pressable>
          </View>

          <Text className="mt-4 font-outfit-medium text-gray-500 dark:text-gray-400">
            {Math.floor(currentTime)}s / {Math.floor(duration)}s
          </Text>
        </View>

        {/* Transcribe Button */}
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/scribe-transcription' as any,
              params: {
                id: session.id,
                audioUri: session.audioUri,
                patientName: session.patientName || 'Untitled Session',
              },
            })
          }
          style={{
            marginTop: 36,
            borderRadius: 20,
            overflow: 'hidden',
            shadowColor: '#daa521',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <View
            style={{
              backgroundColor: '#daa521',
              paddingVertical: 18,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={20} color="white" />
            <Text
              style={{
                marginLeft: 10,
                fontSize: 16,
                fontWeight: '700',
                color: '#ffffff',
                letterSpacing: 0.3,
              }}
            >
              Transcribe Recording
            </Text>
          </View>
        </Pressable>

        {/* Delete Button */}
        <Pressable
          onPress={handleDelete}
          className="mt-6 flex-row items-center justify-center rounded-2xl border border-red-100 bg-red-50/50 py-4 active:opacity-80 dark:border-red-900/30 dark:bg-red-900/20"
        >
          <Trash2 size={20} color="#ef4444" />
          <Text className="ml-2 font-outfit-bold text-red-500">Delete Session</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
