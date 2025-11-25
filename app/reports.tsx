import React, { useState } from 'react';
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { WebView } from 'react-native-webview';
import { ragAPI } from '@/services/rag';

export default function Reports() {
  const router = useRouter();
  let { pdfUrl, patientName, documentId, accession_id } = useLocalSearchParams<{
    pdfUrl: string;
    patientName: string;
    documentId: string;
    accession_id: string;
  }>();

  const [docId, setDocId] = useState(documentId);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);

  const handleTalkToDrG = () => {
    console.log('Hello');
  };

  const handleIngestReport = async () => {
    try {
      setIngesting(true);
      const res = await ragAPI.ingestReport(accession_id);
      setDocId(res.data.documentId);
      Toast.show({
        type: 'success',
        text1: res.message,
        visibilityTime: 3000,
      });
      console.log(res);
    } catch (error) {
      console.error('Failed to ingest the file');
    } finally {
      setIngesting(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <TouchableOpacity onPress={handleGoBack} className="p-2">
          <Text className="text-base font-semibold text-[#daa521]">← Back</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-gray-800" numberOfLines={1} ellipsizeMode="tail">
          {patientName}
        </Text>
        <View className="w-[60px]" />
      </View>

      {/* PDF WebView */}
      <View className="relative flex-1">
        {loading && (
          <View className="absolute inset-0 z-10 items-center justify-center bg-white/90">
            <ActivityIndicator size="large" color="#daa521" />
            <Text className="mt-3 text-base text-slate-600">Loading report...</Text>
          </View>
        )}
        <WebView
          source={{ uri: pdfUrl }}
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
        />
      </View>

      {/* Talk to Dr.G / Analyze Report Button */}
      <View className="items-center border-t border-gray-200 bg-white px-4 py-5">
        {docId ? (
          <TouchableOpacity
            className="min-w-[200px] flex-row items-center justify-center rounded-xl bg-[#daa521] px-6 py-4 shadow-md active:opacity-80"
            onPress={handleTalkToDrG}
          >
            <Entypo name="chat" size={22} color="white" />
            <Text className="ml-2 text-lg font-bold text-white">Talk to Dr.G</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="min-w-[200px] flex-row items-center justify-center rounded-xl bg-[#daa521] px-6 py-4 shadow-md active:opacity-80"
            onPress={handleIngestReport}
          >
            <MaterialIcons name="analytics" size={24} color="white" />
            <Text className="ml-2 text-lg font-bold text-white">Ingest Report</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Ingesting Overlay */}
      <Modal transparent visible={ingesting} animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="w-3/4 max-w-sm items-center rounded-2xl bg-white p-6 shadow-lg">
            <ActivityIndicator size="large" color="#daa521" />
            <Text className="mt-4 text-lg font-semibold text-gray-700">Ingesting...</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
