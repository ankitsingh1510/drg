import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Clipboard, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useAtom } from 'jotai';
import { Check, ChevronLeft, Copy, FileText, RefreshCw, Share2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { persistentScribeSessionsAtom } from '@/stores/scribe';

type TranscriptionState = 'cached' | 'requesting' | 'transcribing' | 'done' | 'error';

export default function ScribeTranscriptionScreen() {
  const router = useRouter();
  const { id, audioUri, patientName } = useLocalSearchParams<{
    id: string;
    audioUri: string;
    patientName: string;
  }>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [sessions, setSessions] = useAtom(persistentScribeSessionsAtom);

  // Find the current session to check for existing transcript
  const session = sessions.find(s => s.id === id);
  const cachedTranscript = session?.transcript ?? null;

  const [state, setState] = useState<TranscriptionState>(cachedTranscript ? 'cached' : 'requesting');
  const [transcript, setTranscript] = useState(cachedTranscript ?? '');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const transcriptParts = useRef<string[]>([]);
  const isTranscribing = useRef(false);

  // ─── Persist transcript to MMKV via Jotai atom ───────────────────────────
  const saveTranscript = useCallback(
    (text: string) => {
      // Strip any undefined values so MMKV JSON.stringify doesn't fail
      const updated = sessions.map(s =>
        s.id === id ? { ...s, transcript: text } : { ...s, transcript: s.transcript ?? '' }
      );
      setSessions(updated);
    },
    [id, sessions, setSessions]
  );

  // ─── Speech Recognition Events ───────────────────────────────────────────
  useSpeechRecognitionEvent('result', event => {
    if (!isTranscribing.current) return;
    if (event.results?.[0]) {
      const partial = event.results[0].transcript;
      if (event.isFinal) {
        transcriptParts.current.push(partial);
        setTranscript(transcriptParts.current.join(' '));
      } else {
        const existing = transcriptParts.current.join(' ');
        setTranscript(existing ? `${existing} ${partial}` : partial);
      }
    }
  });

  useSpeechRecognitionEvent('end', () => {
    if (!isTranscribing.current) return;
    isTranscribing.current = false;
    const finalText =
      transcriptParts.current.length > 0
        ? transcriptParts.current.join(' ')
        : 'No speech was detected in this recording.';
    setTranscript(finalText);
    saveTranscript(finalText);
    setState('done');
  });

  useSpeechRecognitionEvent('error', event => {
    // Ignore abort triggered by cleanup on unmount
    if (event.error === 'aborted') return;
    if (!isTranscribing.current) return;
    isTranscribing.current = false;
    console.error('Speech recognition error:', event.error, event.message);
    setErrorMessage(event.message || event.error || 'Transcription failed.');
    setState('error');
  });

  // ─── Start Transcription ─────────────────────────────────────────────────
  const startTranscription = useCallback(async () => {
    if (!audioUri) {
      Alert.alert('Error', 'No audio file found for this session.');
      return;
    }

    transcriptParts.current = [];
    setTranscript('');
    setErrorMessage('');
    isTranscribing.current = true;

    try {
      setState('requesting');
      const { status } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (status !== 'granted') {
        isTranscribing.current = false;
        setErrorMessage('Speech recognition permission was denied. Please enable it in Settings.');
        setState('error');
        return;
      }

      setState('transcribing');
      await ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: true,
        audioSource: { uri: audioUri },
      });
    } catch (err: any) {
      isTranscribing.current = false;
      console.error('Transcription error:', err);
      setErrorMessage(err?.message || 'An unexpected error occurred during transcription.');
      setState('error');
    }
  }, [audioUri]);

  // Auto-start only if no cached transcript
  useEffect(() => {
    if (!cachedTranscript) {
      startTranscription();
    }
    return () => {
      ExpoSpeechRecognitionModule.abort();
      isTranscribing.current = false;
    };
  }, []); // deliberately empty - only run once on mount

  // ─── Re-transcribe ────────────────────────────────────────────────────────
  const handleReTranscribe = () => {
    Alert.alert('Re-transcribe Recording', 'This will discard the existing transcription and start fresh. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Re-transcribe',
        style: 'destructive',
        onPress: startTranscription,
      },
    ]);
  };

  // ─── Copy & Share ─────────────────────────────────────────────────────────
  const handleCopy = () => {
    Clipboard.setString(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Transcription for ${patientName || 'Session'}:\n\n${transcript}`,
        title: `${patientName || 'Session'} – Transcription`,
      });
    } catch {
      // user cancelled
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const isTranscriptReady = state === 'cached' || state === 'done';
  const isLoading = state === 'requesting' || state === 'transcribing';

  // ─── Render ───────────────────────────────────────────────────────────────
  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: 'rgba(218,165,33,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 28,
            }}
          >
            <ActivityIndicator size="large" color="#daa521" />
          </View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: isDark ? '#f9fafb' : '#111827',
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            {state === 'requesting' ? 'Requesting Permission…' : 'Transcribing Audio…'}
          </Text>
          <Text style={{ fontSize: 14, color: isDark ? '#9ca3af' : '#6b7280', textAlign: 'center', lineHeight: 22 }}>
            {state === 'requesting'
              ? 'Checking speech recognition access'
              : 'Processing your recording. This may take a moment.'}
          </Text>
          {state === 'transcribing' && transcript.length > 0 && (
            <View
              style={{
                marginTop: 24,
                width: '100%',
                borderRadius: 12,
                padding: 16,
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              }}
            >
              <Text
                style={{ fontSize: 13, color: isDark ? '#9ca3af' : '#6b7280', lineHeight: 20, fontStyle: 'italic' }}
                numberOfLines={4}
              >
                {transcript}
              </Text>
            </View>
          )}
        </View>
      );
    }

    if (state === 'error') {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: 'rgba(239,68,68,0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 28,
            }}
          >
            <FileText size={40} color="#ef4444" />
          </View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: isDark ? '#f9fafb' : '#111827',
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            Transcription Failed
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: isDark ? '#9ca3af' : '#6b7280',
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: 32,
            }}
          >
            {errorMessage}
          </Text>
          <Pressable
            onPress={startTranscription}
            style={{ backgroundColor: '#daa521', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 100 }}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    if (isTranscriptReady) {
      return (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
          {/* Badges row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8, flexWrap: 'wrap' }}>
            {state === 'cached' && (
              <View
                style={{
                  backgroundColor: 'rgba(34,197,94,0.12)',
                  borderRadius: 100,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#16a34a', letterSpacing: 0.4 }}>CACHED</Text>
              </View>
            )}
            <View
              style={{
                backgroundColor: 'rgba(218,165,33,0.12)',
                borderRadius: 100,
                paddingHorizontal: 14,
                paddingVertical: 5,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#daa521', letterSpacing: 0.5 }}>
                {transcript.trim().split(/\s+/).filter(Boolean).length} words
              </Text>
            </View>
            <View
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                borderRadius: 100,
                paddingHorizontal: 14,
                paddingVertical: 5,
              }}
            >
              <Text style={{ fontSize: 12, color: isDark ? '#9ca3af' : '#6b7280' }}>{transcript.length} chars</Text>
            </View>
          </View>

          {/* Transcript card */}
          <View
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0 : 0.06,
              shadowRadius: 8,
              marginBottom: 20,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 14,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: 'rgba(218,165,33,0.12)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <FileText size={16} color="#daa521" />
              </View>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: isDark ? '#9ca3af' : '#6b7280',
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                }}
              >
                Full Transcript
              </Text>
            </View>

            <Text style={{ fontSize: 15, lineHeight: 26, color: isDark ? '#e5e7eb' : '#1f2937' }} selectable>
              {transcript}
            </Text>
          </View>

          {/* Re-transcribe button */}
          <Pressable
            onPress={handleReTranscribe}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 16,
              paddingVertical: 14,
              borderWidth: 1.5,
              borderColor: isDark ? 'rgba(218,165,33,0.3)' : 'rgba(218,165,33,0.4)',
              backgroundColor: isDark ? 'rgba(218,165,33,0.08)' : 'rgba(218,165,33,0.06)',
            }}
          >
            <RefreshCw size={16} color="#daa521" />
            <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: '600', color: '#daa521' }}>Re-transcribe</Text>
          </Pressable>
        </ScrollView>
      );
    }

    return null;
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#FDF5E6' }}
      edges={['top', 'left', 'right', 'bottom']}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={22} color={isDark ? '#f9fafb' : '#111827'} />
        </Pressable>

        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: isDark ? '#f9fafb' : '#111827' }} numberOfLines={1}>
            Transcription
          </Text>
          {!!patientName && (
            <Text style={{ fontSize: 12, color: '#daa521', marginTop: -2 }} numberOfLines={1}>
              {patientName}
            </Text>
          )}
        </View>

        {isTranscriptReady && transcript && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={handleCopy}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: isDark ? 'rgba(218,165,33,0.12)' : 'rgba(218,165,33,0.10)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {copied ? <Check size={18} color="#daa521" /> : <Copy size={18} color="#daa521" />}
            </Pressable>
            <Pressable
              onPress={handleShare}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: isDark ? 'rgba(218,165,33,0.12)' : 'rgba(218,165,33,0.10)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Share2 size={18} color="#daa521" />
            </Pressable>
          </View>
        )}
      </View>

      {/* Body */}
      <View style={{ flex: 1 }}>{renderBody()}</View>
    </SafeAreaView>
  );
}
