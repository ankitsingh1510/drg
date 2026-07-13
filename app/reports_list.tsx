import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { addScreenshotListener, allowScreenCaptureAsync, preventScreenCaptureAsync } from 'expo-screen-capture';
import { useHeaderHeight } from '@react-navigation/elements';
import { FlashList } from '@shopify/flash-list';
import { ChevronLeft } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, LoadingIndicator, PatientHeader, PatientRow } from '@/components/patient';
import AppText from '@/components/ui/AppText';
import { colors } from '@/constants/colors';
import { useAuth, useLogout } from '@/context/AuthContext';
import { type Patient, patientsAPI } from '@/services/patients';
import { storageAPI } from '@/services/storage';
import { IngestionStatus } from '@/types/types';
import { toast } from '@/util/toast';

export default function ReportsList() {
  const { user } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const isDarkMode = useColorScheme() === 'dark';

  const fetchPatients = useCallback(async (pageNum: number, searchQuery: string, append = false) => {
    try {
      const response = await patientsAPI.fetchTestsDetails({
        page: pageNum,
        count: 10,
        searchQuery: searchQuery,
      });
      setTotalCount(response.totalCount);

      if (append) {
        setPatients(prev => [...prev, ...(response.data || [])]);
        setPage(pageNum);
      } else {
        setPatients(response.data || []);
        setPage(pageNum);
      }

      setHasMore((response.data || []).length === 10);
    } catch (error: any) {
      if (!append) {
        setPatients([]);
      }
      console.error('Error fetching patients:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch patient data. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPatients(1, query);
  }, [query, fetchPatients]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading && !refreshing) {
      setLoadingMore(true);
      fetchPatients(page + 1, query, true);
    }
  }, [page, query, loadingMore, hasMore, loading, refreshing, fetchPatients]);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading(true);
      fetchPatients(1, query);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]); // Runs on mount and when query changes

  const handleViewReport = useCallback(
    async (patient: Patient) => {
      try {
        const assayResultAttributes = await patientsAPI.getAssayResultAttributes(patient.assayResultId);
        const fullReportPath =
          assayResultAttributes?.manual_full_report_storage_id ??
          assayResultAttributes?.released_full_report_path ??
          assayResultAttributes?.full_report_finalized_path;

        if (!fullReportPath) {
          Alert.alert('Report unavailable', 'No full report path found for this sample.');
          return;
        }
        const documentId = assayResultAttributes.hasOwnProperty('documentId') ? assayResultAttributes.documentId : null;
        const signedUrl = await storageAPI.getSignedUrl(fullReportPath);

        let ingestionStatus: IngestionStatus = assayResultAttributes.hasOwnProperty('drg_ingestion_status')
          ? (assayResultAttributes.drg_ingestion_status as IngestionStatus)
          : '';
        if (ingestionStatus === 'ingested') {
          ingestionStatus = 'ingested';
        } else if (ingestionStatus === 'ingesting') {
          ingestionStatus = 'ingesting';
        } else if (ingestionStatus === 'failed') {
          ingestionStatus = 'failed';
        }

        router.push({
          pathname: '/reports' as any,
          params: {
            pdfUrl: encodeURIComponent(signedUrl),
            patientName: patient.patientName,
            documentId: documentId,
            assayResultIds: patient.assayResultIds,
            ingestionStatus,
          },
        });
      } catch (error) {
        console.error('Error viewing report:', error);
        Alert.alert('Error', 'Failed to load report. Please try again.');
      }
    },
    [router]
  );

  // Render functions
  const renderPatient = useCallback(
    ({ item }: { item: Patient }) => <PatientRow patient={item} onViewReport={handleViewReport} />,
    [handleViewReport]
  );

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return <LoadingIndicator type="footer" />;
  }, [loadingMore]);

  const renderEmptyComponent = useCallback(() => {
    if (loading) return null;
    return <EmptyState type="no-released-tests" />;
  }, [loading]);

  // Prevent screenshots/screen recording; re-applies on every focus (handles back-navigation edge case)
  useFocusEffect(
    useCallback(() => {
      preventScreenCaptureAsync('reports-list');
      const screenshotSub = addScreenshotListener(() => {
        toast.info('Screenshots are disabled on this page', undefined, 3000);
      });
      return () => {
        allowScreenCaptureAsync('reports-list');
        screenshotSub.remove();
      };
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.back();
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => sub.remove();
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FDF5E6] dark:bg-gray-900">
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#0B1929' : '#FDF5E6'}
      />

      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity className="h-8 w-8 items-center justify-center" onPress={() => router.back()}>
          <ChevronLeft size={24} color={isDarkMode ? '#FDF5E6' : '#0B1929'} strokeWidth={2.5} />
        </TouchableOpacity>
        <AppText className="font-outfit-semibold text-xl text-[#0F2D37] dark:text-white">Patient Reports</AppText>
        <View className="w-8" />
      </View>

      <PatientHeader totalCount={totalCount} query={query} onSearch={handleSearch} loading={loading} />

      <View className="flex-1">
        <FlashList
          data={patients}
          renderItem={renderPatient}
          keyExtractor={(item: Patient, index: number) => `${item.sampleBarcode}-${index}`}
          contentContainerStyle={{
            paddingTop: 10,
            paddingBottom: 40,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.common.primary}
              colors={[colors.common.primary]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
        />

        {loading && !refreshing && (
          <View className="absolute inset-0 items-center justify-center bg-[#FDF5E6]/90 dark:bg-gray-900/90">
            <ActivityIndicator size="large" color={colors.common.primary} />
            <Text className="mt-4 font-outfit-bold text-base tracking-tight text-gray-500 dark:text-gray-400">
              Loading Reports...
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
