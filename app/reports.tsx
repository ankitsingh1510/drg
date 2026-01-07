import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from 'nativewind';
import Pdf from 'react-native-pdf';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import InteractionBox from '@/components/interaction/Interactions';
import { colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { ragAPI } from '@/services/rag';
import { ingestionStore } from '@/stores/ingestionStore';
import { toast } from '@/util/toast';

export default function Reports() {
  const { token } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
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
  const [buttonTitle, setButtonTitle] = useState('');
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

  useEffect(() => {
    const saved = ingestionStore.get(accession_id);
    if (!saved) return;
    const MAX_INGEST_TIME = 5 * 60 * 1000; // Edge case handling: 5 minutes

    if (saved.status === 'INGESTING' && Date.now() - saved.startedAt > MAX_INGEST_TIME) {
      ingestionStore.clear(accession_id);
      setIngesting(false);
      setButtonTitle('');
      return;
    }
    if (saved.status === 'INGESTING') {
      setIngesting(true);
      setButtonTitle('Ingesting Report...');
    }
    if (saved.status === 'COMPLETED' && saved.documentId) {
      setDocId(saved.documentId);
      setIngesting(false);
      setButtonTitle('');
    }
  }, [accession_id]);

  const handleIngestReport = async () => {
    toast.success('Ingesting Report. This may take some time...', undefined, 2000);

    setIngesting(true);
    setButtonTitle('Ingesting Report...');

    ingestionStore.set(accession_id, {
      status: 'INGESTING',
      startedAt: Date.now(),
    });

    try {
      const res = await ragAPI.ingestReport(accession_id);

      ingestionStore.set(accession_id, {
        status: 'COMPLETED',
        documentId: res.data.documentId,
        startedAt: Date.now(),
      });
      setDocId(res.data.documentId);
      setIngesting(false);
      setButtonTitle('');
      toast.success(res.message, undefined, 3000);
    } catch (error) {
      console.log('Error while ingesting report:', error);
      ingestionStore.clear(accession_id);
      setIngesting(false);
      setButtonTitle('');
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleOnInteractionClose = () => {
    setShowInteraction({ isVisible: false, mode: 'video' });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? colors.dark.background : colors.light.background }}>
      {/* Header */}
      <View className="relative flex-row items-center border-b border-gray-200 bg-[#FDF5E6] px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <TouchableOpacity onPress={handleGoBack} className="z-10 p-2">
          {/* <Text className="text-base font-semibold text-[#daa521]">←</Text> */}
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.dark.text : colors.common.accent} />
        </TouchableOpacity>
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-100" numberOfLines={1} ellipsizeMode="tail">
            {patientName}
          </Text>
        </View>
      </View>

      {/* PDF Viewer */}
      <View
        className="relative flex-1"
        style={{
          backgroundColor: 'gray',
          marginHorizontal: 5,
          borderRadius: 5,
          padding: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
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
            toast.error('Failed to load PDF', 'Please try again', 3000);
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
      </View>

      {/* Talk to Dr.G / Analyze Report Button */}
      {!showInteraction.isVisible && (showIngestOption === 'true' || docId) && (
        <View
          className="items-center border-t border-gray-200 px-4 py-2 dark:border-gray-700"
          style={{ backgroundColor: isDark ? colors.dark.cardBackground : colors.light.background }}
        >
          {docId ? (
            <View className="flex-row items-center justify-center gap-4">
              <TouchableOpacity
                disabled={ingesting}
                className="xshadow-md flex-row items-center justify-center rounded-full px-6 py-3 active:opacity-80"
                style={{ backgroundColor: colors.common.primary }}
                onPress={handleTalkToDrG}
              >
                <Feather name="video" size={22} color="white" />
                <Text className="ml-2 text-lg font-bold text-white">{buttonTitle || 'Talk With Dr.G'}</Text>
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
              disabled={ingesting}
              className="xshadow-md min-w-[200px] flex-row items-center justify-center rounded-full px-6 py-3 active:opacity-80"
              style={{ backgroundColor: colors.common.primary }}
              onPress={handleIngestReport}
            >
              <MaterialIcons name="analytics" size={22} color="white" />
              <Text className="ml-2 text-lg font-bold text-white">{buttonTitle || 'Ingest Report'}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Ingesting Overlay */}
      {/* <Modal transparent visible={ingesting} animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="w-3/4 max-w-sm items-center rounded-lg bg-white p-6 shadow-lg">
            <ActivityIndicator size="large" color="#daa521" />
            <Text className="mt-4 text-lg font-semibold text-gray-700">Ingesting...</Text>
          </View>
        </View>
      </Modal> */}
      {/* Floating Interaction Box */}
      {showInteraction.isVisible && (
        <InteractionBox
          documentId={String(docId)}
          token={token}
          onClose={handleOnInteractionClose}
          mode={showInteraction.mode}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f5f5f5',
  },
});
