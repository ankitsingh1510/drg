import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useColorScheme } from 'nativewind';
import { colors } from '@/constants/colors';
import { ragAPI } from '@/services/rag';

interface Message {
  id: string;
  type: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

interface ElevenLabsChatProps {
  signedUrl: string;
  documentId: string;
  token: string;
  onClose: () => void;
}

export default function ElevenLabsChat({ signedUrl, documentId, token, onClose }: ElevenLabsChatProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const flashListRef = useRef<any>(null);
  const reportContextRef = useRef<string | null>(null);

  useEffect(() => {
    initializeChat();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [signedUrl]);

  const initializeChat = async () => {
    try {
      setIsConnecting(true);

      // First, fetch the report result
      if (documentId && token) {
        console.log('Fetching report result before connecting...');
        const res = await ragAPI.fetchReportResult({
          documentId,
          authorization: decodeURIComponent(token),
        });
        console.log('Fetched report result:', res.answer?.text);
        reportContextRef.current = res.answer?.text || null;
      }

      // Then, connect to WebSocket
      connectWebSocket();
    } catch (error) {
      console.error('Error fetching report result:', error);
      // Still attempt to connect even if fetch fails
      connectWebSocket();
    }
  };

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket(signedUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);

        const initData = {
          type: 'conversation_initiation_client_data',
          conversation_config_override: {
            conversation: {
              text_only: true,
            },
          },
        };
        ws.send(JSON.stringify(initData));

        // Send the pre-fetched report context
        if (reportContextRef.current && ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: 'contextual_update',
              text: reportContextRef.current,
            })
          );
          console.log('Sent contextual update to WebSocket');
        }
      };

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received:', data.type);
          // if (data.type === 'agent_chat_response_part') {
          //   const agentTextPart = data;
          //   console.log('Agent text part received:', agentTextPart);
          // } TODO: Handle streaming parts if needed in future
          if (data.type === 'agent_response') {
            const agentText = data.agent_response_event?.agent_response;
            if (agentText) {
              addMessage('agent', agentText);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = error => {
        console.error('WebSocket error:', error);
        setIsConnecting(false);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setIsConnecting(false);
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
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
    if (!inputText.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const messageToSend = inputText.trim();
    addMessage('user', messageToSend);

    // Send user message to WebSocket
    const userMessage = {
      type: 'user_message',
      text: messageToSend,
    };

    wsRef.current.send(JSON.stringify(userMessage));
    setInputText('');
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
                  Connecting to Dr.G...
                </Text>
              </View>
            ) : null
          }
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
          editable={isConnected}
          onSubmitEditing={sendMessage}
        />
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
