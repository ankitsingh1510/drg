import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function Chat() {
  const router = useRouter();
  const { patientName, documentId } = useLocalSearchParams<{
    patientName: string;
    documentId: string;
  }>();

  const [loading, setLoading] = useState(true);

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="relative flex-row items-center border-b border-gray-200 bg-white px-4 py-3">
        <TouchableOpacity onPress={handleGoBack} className="z-10 p-2">
          <Text className="text-base font-semibold text-[#daa521]">←</Text>
        </TouchableOpacity>
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-lg font-bold text-gray-800" numberOfLines={1} ellipsizeMode="tail">
            Dr.G - {patientName}
          </Text>
        </View>
      </View>

      {/* Chat WebView */}
      <View className="relative flex-1">
        {loading && (
          <View className="absolute inset-0 z-10 items-center justify-center bg-white/90">
            <ActivityIndicator size="large" color="#daa521" />
            <Text className="mt-3 text-base text-slate-600">Loading Dr.G...</Text>
          </View>
        )}
        <WebView
          source={{ uri: 'http://localhost:3002/' }}
          className="flex-1 bg-white"
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={syntheticEvent => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error: ', nativeEvent);
            setLoading(false);
          }}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          allowsInlineMediaPlayback={true}
          allowsAirPlayForMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
      </View>
    </SafeAreaView>
  );
}
