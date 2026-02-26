import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useColorScheme } from 'nativewind';
import { io, Socket } from 'socket.io-client';
import { colors } from '@/constants/colors';

interface Message {
  id: string;
  type: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

interface ElevenLabsChatProps {
  documentId: string;
  token: string;
  userId?: string;
  onClose: () => void;
}

interface RagResponsePayload {
  text?: string;
  content?: string;
  answer?: {
    text?: string;
  };
}

export default function ElevenLabsChat({ documentId, token, userId, onClose }: ElevenLabsChatProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const sessionId = useRef<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const flashListRef = useRef<any>(null);
  const currentStreamingMessageIdRef = useRef<string | null>(null);
  const isListeningRef = useRef(false);

  useEffect(() => {
    connectSocket();
    return () => {
      console.log('Cleaning up ElevenLabsChat socket and voice on unmount');
      const socket = socketRef.current;
      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socketRef.current = null;
      }
      cleanupVoice();
    };
  }, [documentId, token, userId]);

  // Speech recognition event listeners
  useSpeechRecognitionEvent('start', () => {
    isListeningRef.current = true;
    setIsListening(true);
  });

  useSpeechRecognitionEvent('end', () => {
    isListeningRef.current = false;
    setIsListening(false);
  });

  useSpeechRecognitionEvent('result', event => {
    if (event.results && event.results.length > 0 && isListeningRef.current) {
      const transcript = event.results[0]?.transcript;
      if (transcript) {
        setInputText(transcript);
      }
    }
  });

  useSpeechRecognitionEvent('error', event => {
    console.error('Speech error:', event.error, event.message);
    isListeningRef.current = false;
    setIsListening(false);

    if (event.error !== 'no-speech' && event.error !== 'aborted') {
      Alert.alert('Voice Error', event.message || 'An error occurred during speech recognition.');
    }
  });

  const connectSocket = () => {
    try {
      setIsConnecting(true);
      const baseUrl = 'http://10.0.2.2:3020';

      if (!baseUrl) {
        throw new Error('Missing EXPO_PUBLIC_RAG_SOCKET_URL or EXPO_PUBLIC_API_BASE_URL');
      }

      const cleanToken = decodeURIComponent(token || '').replace(/^Bearer\s+/i, '');
      const authorizationHeader = `Bearer ${cleanToken}`;

      const socket = io(baseUrl, {
        path: '/api/v1/drg/rag/socket/',
        autoConnect: false,
        reconnectionAttempts: 5,
        timeout: 20000,
        query: { userId: userId || '', documentId },
        auth: {
          authorization: authorizationHeader,
          sessionId: sessionId.current,
        },
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('RAG socket connected');
        setIsConnected(true);
        setIsConnecting(false);
      });

      socket.on('disconnect', () => {
        console.log('RAG socket disconnected');
        setIsConnected(false);
        setIsConnecting(false);
        setIsWaitingForResponse(false);
      });

      socket.on('sessionCreated', data => {
        console.log('RAG socket session created:', data);
        const id = data?._id || data?.id;
        if (id) {
          console.log('RAG session ID set to:', id);
          sessionId.current = String(id);
          socket.auth = {
            authorization: authorizationHeader,
            sessionId: sessionId.current,
          };
        }
      });

      socket.on('inferencing', data => {
        if (data?.inferencing) {
          setIsWaitingForResponse(true);
        }
      });

      socket.on('streamChunk', data => {
        const chunk = data?.chunk || data?.text || data?.content || '';
        if (!chunk) {
          return;
        }

        setIsWaitingForResponse(false);

        const streamingId = currentStreamingMessageIdRef.current;
        if (!streamingId) {
          const newMessageId = `${Date.now()}-${Math.random()}`;
          currentStreamingMessageIdRef.current = newMessageId;
          setMessages(prev => [
            ...prev,
            {
              id: newMessageId,
              type: 'agent',
              text: chunk,
              timestamp: new Date(),
            },
          ]);
        } else {
          setMessages(prev =>
            prev.map(message =>
              message.id === streamingId
                ? {
                    ...message,
                    text: message.text + chunk,
                  }
                : message
            )
          );
        }

        setTimeout(() => flashListRef.current?.scrollToEnd({ animated: true }), 100);
      });

      socket.on('ragResponse', (data: RagResponsePayload) => {
        setIsWaitingForResponse(false);

        if (currentStreamingMessageIdRef.current) {
          currentStreamingMessageIdRef.current = null;
          return;
        }

        const responseText = data?.text || data?.answer?.text || data?.content;
        if (responseText) {
          addMessage('agent', responseText);
        }
      });

      socket.on('error', error => {
        console.error('RAG socket error:', error);
        setIsConnecting(false);
        setIsWaitingForResponse(false);
      });

      socket.on('connect_error', error => {
        console.error('RAG socket connection error:', error);
        setIsConnected(false);
        setIsConnecting(false);
        setIsWaitingForResponse(false);
        Alert.alert('Chat Error', 'Unable to connect to RAG chat. Please try again.');
      });

      // ✅ Connect only after ALL listeners are registered
      socket.connect();
    } catch (error) {
      console.error('Error connecting to RAG socket:', error);
      setIsConnecting(false);
    }
  };

  const addMessage = (type: 'user' | 'agent', text: string) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    setTimeout(() => flashListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendMessage = () => {
    if (!inputText.trim() || !socketRef.current || !isConnected) {
      return;
    }

    const messageToSend = inputText.trim();

    if (isListeningRef.current) {
      ExpoSpeechRecognitionModule.stop();
      isListeningRef.current = false;
      setIsListening(false);
    }

    setInputText('');

    addMessage('user', messageToSend);
    setIsWaitingForResponse(true);
    currentStreamingMessageIdRef.current = null;
    socketRef.current.emit('ragInference', { question: messageToSend });
  };

  const cleanupVoice = async () => {
    try {
      if (isListeningRef.current) {
        ExpoSpeechRecognitionModule.abort();
        isListeningRef.current = false;
        setIsListening(false);
      }
    } catch (e) {
      console.error('Error cleaning up voice:', e);
    }
  };

  const toggleVoiceRecognition = async () => {
    if (isListeningRef.current) {
      try {
        ExpoSpeechRecognitionModule.stop();
        isListeningRef.current = false;
        setIsListening(false);
      } catch (e) {
        console.error('Error stopping voice:', e);
      }
    } else {
      try {
        const isAvailable = ExpoSpeechRecognitionModule.isRecognitionAvailable();
        if (!isAvailable) {
          Alert.alert('Voice Not Available', 'Speech recognition is not available on this device.');
          return;
        }

        const permissionResult = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert('Permission Required', 'Microphone permission is required for voice recognition.');
          return;
        }

        ExpoSpeechRecognitionModule.start({
          lang: 'en-US',
          interimResults: true,
          continuous: false,
        });
      } catch (e) {
        console.error('Error starting voice:', e);
        Alert.alert('Voice Error', 'Could not start voice recognition. Please check your microphone permissions.');
      }
    }
  };

  const renderMessage = ({ item: message }: { item: Message }) => (
    <View className={`mb-3 ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${message.type === 'user' ? '' : isDark ? 'border' : 'border'}`}
        style={{
          backgroundColor:
            message.type === 'user' ? colors.common.primary : isDark ? colors.dark.cardBackground : '#f3f4f6',
          borderColor: message.type === 'agent' ? (isDark ? colors.dark.border : '#e5e7eb') : undefined,
        }}
      >
        <Text
          className="text-[15px] leading-5"
          style={{ color: message.type === 'user' ? '#ffffff' : isDark ? colors.dark.text : colors.light.text }}
        >
          {message.text}
        </Text>
      </View>
    </View>
  );

  const renderTypingIndicator = () => (
    <View className="mb-3 items-start">
      <View
        className="rounded-2xl border px-4 py-3"
        style={{
          backgroundColor: isDark ? colors.dark.cardBackground : '#f3f4f6',
          borderColor: isDark ? colors.dark.border : '#e5e7eb',
        }}
      >
        <View className="flex-row items-center">
          <View
            className="mr-1.5 h-2 w-2 rounded-full"
            style={{ backgroundColor: isDark ? '#6b7280' : '#9ca3af', opacity: 0.6 }}
          />
          <View
            className="mr-1.5 h-2 w-2 rounded-full"
            style={{ backgroundColor: isDark ? '#6b7280' : '#9ca3af', opacity: 0.8 }}
          />
          <View
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: isDark ? '#6b7280' : '#9ca3af', opacity: 1 }}
          />
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1">
      {/* Header */}
      <View
        className="border-b px-4 py-3"
        style={{
          backgroundColor: isDark ? colors.dark.cardBackground : colors.light.cardBackground,
          borderBottomColor: isDark ? colors.dark.border : colors.light.border,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View
              className="mr-2 h-2 w-2 rounded-full"
              style={{ backgroundColor: isConnected ? '#10b981' : isConnecting ? '#f59e0b' : '#ef4444' }}
            />
            <Text className="text-lg font-semibold" style={{ color: isDark ? colors.dark.text : colors.light.text }}>
              Chat with Dr.G
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} className="p-1">
            <Ionicons name="close" size={24} color={isDark ? colors.dark.text : colors.light.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <View className="flex-1">
        <FlashList
          ref={flashListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            isConnecting ? (
              <View className="items-center justify-center py-8">
                <ActivityIndicator size="large" color={colors.common.primary} />
                <Text className="mt-3 text-base" style={{ color: isDark ? colors.dark.text : colors.light.text }}>
                  Connecting to RAG chat...
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={isWaitingForResponse ? renderTypingIndicator() : null}
        />
      </View>

      {/* Input */}
      <View
        className="flex-row items-end border-t px-4 py-3"
        style={{
          backgroundColor: isDark ? colors.dark.cardBackground : colors.light.background,
          borderTopColor: isDark ? colors.dark.border : colors.light.border,
        }}
      >
        <TextInput
          className="mr-2 flex-1 rounded-[20px] border px-4 py-2.5 text-[15px]"
          style={{
            backgroundColor: isDark ? colors.dark.background : '#f9fafb',
            color: isDark ? colors.dark.text : colors.light.text,
            borderColor: isDark ? colors.dark.border : '#e5e7eb',
            maxHeight: 100,
          }}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
          multiline
          maxLength={500}
          editable={isConnected && !isListening}
          onSubmitEditing={sendMessage}
        />

        {/* Mic Button */}
        <TouchableOpacity
          className="mr-2 h-11 w-11 items-center justify-center rounded-full"
          style={{
            backgroundColor: isListening ? '#ef4444' : isDark ? colors.dark.border : '#e5e7eb',
            opacity: !isConnected ? 0.5 : 1,
          }}
          onPress={toggleVoiceRecognition}
          disabled={!isConnected}
        >
          {isListening ? (
            <View className="items-center justify-center">
              <Ionicons name="mic" size={24} color="#ffffff" />
              <View
                className="absolute h-11 w-11 rounded-full"
                style={{
                  backgroundColor: '#ef4444',
                  opacity: 0.3,
                }}
              />
            </View>
          ) : (
            <Ionicons name="mic-outline" size={24} color={isDark ? colors.dark.text : colors.light.text} />
          )}
        </TouchableOpacity>

        {/* Send Button */}
        <TouchableOpacity
          className="h-11 w-11 items-center justify-center rounded-full"
          style={{
            backgroundColor: colors.common.primary,
            opacity: !isConnected || !inputText.trim() ? 0.5 : 1,
          }}
          onPress={sendMessage}
          disabled={!isConnected || !inputText.trim()}
        >
          <Ionicons name="send" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
