import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Pdf from 'react-native-pdf';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import InteractionBox from '@/components/interaction/Interactions';
import { useAuth } from '@/context/AuthContext';
import { ragAPI } from '@/services/rag';

export default function Reports() {
  const { token } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  let { pdfUrl, patientName, documentId, accession_id, showIngestOption } = useLocalSearchParams<{
    pdfUrl: string;
    patientName: string;
    documentId: string;
    accession_id: string;
    showIngestOption: string;
  }>();
  const [docId, setDocId] = useState(documentId);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [showInteraction, setShowInteraction] = useState<{ isVisible: boolean; mode: 'video' | 'chat' }>({
    isVisible: false,
    mode: 'video',
  });

  const handleChatWithDrG = () => {
    setShowInteraction({ isVisible: true, mode: 'chat' });
  };

  const handleTalkToDrG = () => {
    setShowInteraction({ isVisible: true, mode: 'video' });
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
    } catch (error) {
      console.error('Failed to ingest the file');
    } finally {
      setIngesting(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleOnInteractionClose = () => {
    setShowInteraction({ isVisible: false, mode: 'video' });
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="relative flex-row items-center border-b border-gray-200 bg-white px-4 py-3">
        <TouchableOpacity onPress={handleGoBack} className="z-10 p-2">
          <Text className="text-base font-semibold text-[#daa521]">←</Text>
        </TouchableOpacity>
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-lg font-bold text-gray-800" numberOfLines={1} ellipsizeMode="tail">
            {patientName}
          </Text>
        </View>
      </View>

      {/* PDF Viewer */}
      <View className="relative flex-1">
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
            Toast.show({
              type: 'error',
              text1: 'Failed to load PDF',
              text2: 'Please try again',
              visibilityTime: 3000,
            });
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
          <View className="absolute inset-0 items-center justify-center bg-white">
            <ActivityIndicator size="large" color="#daa521" />
            <Text className="mt-3 text-base text-slate-600">Loading PDF...</Text>
          </View>
        )}
      </View>

      {/* Talk to Dr.G / Analyze Report Button */}
      {!showInteraction.isVisible && (showIngestOption === 'true' || docId) && (
        <View className="items-center border-t border-gray-200 bg-white px-4 py-5">
          {docId ? (
            <View className="flex-row items-center justify-center gap-4">
              <TouchableOpacity
                className="flex-row items-center justify-center rounded-lg bg-[#daa521] px-4 py-4 shadow-md active:opacity-80"
                onPress={handleTalkToDrG}
              >
                <Feather name="video" size={22} color="white" />
                <Text className="ml-2 text-lg font-bold text-white">Talk With Dr.G</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity
                className="flex-row items-center justify-center rounded-lg bg-[#daa521] px-4 py-4 shadow-md active:opacity-80"
                onPress={handleChatWithDrG}
              >
                <Ionicons name="chatbubbles-outline" size={22} color="white" />
                <Text className="ml-2 text-lg font-bold text-white">Chat With Dr.G</Text>
              </TouchableOpacity> */}
            </View>
          ) : (
            <TouchableOpacity
              className="min-w-[200px] flex-row items-center justify-center rounded-lg bg-[#daa521] px-6 py-4 shadow-md active:opacity-80"
              onPress={handleIngestReport}
            >
              <MaterialIcons name="analytics" size={22} color="white" />
              <Text className="ml-2 text-lg font-bold text-white">Ingest Report</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Ingesting Overlay */}
      <Modal transparent visible={ingesting} animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="w-3/4 max-w-sm items-center rounded-lg bg-white p-6 shadow-lg">
            <ActivityIndicator size="large" color="#daa521" />
            <Text className="mt-4 text-lg font-semibold text-gray-700">Ingesting...</Text>
          </View>
        </View>
      </Modal>
      {/* Floating Interaction Box */}
      {showInteraction.isVisible && (
        <InteractionBox
          documentId={String(docId)}
          token={token}
          onClose={handleOnInteractionClose}
          mode={showInteraction.mode}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f5f5f5',
  },
});
