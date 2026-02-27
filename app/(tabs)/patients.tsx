import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, RefreshControl, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useAtomValue, useSetAtom } from 'jotai';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, LoadingIndicator, PatientHeader, PatientRow } from '@/components/patient';
import { colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { type Patient, patientsAPI } from '@/services/patients';
import { storageAPI } from '@/services/storage';
import { addIngestionIdAtom, getIngestionIdsAtom, removeIngestionIdAtom } from '@/stores/ingestion';
import { IngestionStatus } from '@/types/types';

export default function Patients() {
  const { user } = useAuth();
  const router = useRouter();
  const removeIngestionId = useSetAtom(removeIngestionIdAtom);
  const addIngestionId = useSetAtom(addIngestionIdAtom);
  const ingestionIds = useAtomValue(getIngestionIdsAtom);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const insets = useSafeAreaInsets();

  const fetchPatients = useCallback(
    async (pageNum: number, searchQuery: string, append = false) => {
      try {
        const response = await patientsAPI.fetchTestsDetails({
          page: pageNum,
          count: 10,
          searchQuery: searchQuery,
        });
        setTotalCount(response.totalCount);

        // Process ingestion status for each patient
        (response.data || []).forEach((patient: Patient) => {
          const assayResultId = patient.assayResultIds;
          const ingestionStatus = patient.drg_ingestion_status as IngestionStatus;

          // If status is ingesting, add to tracker
          if (ingestionStatus === 'ingesting') {
            addIngestionId(assayResultId);
          }

          // If assay_result_id exists in atom and status is ingested or failed, remove from atom
          if (ingestionIds.has(assayResultId) && (ingestionStatus === 'ingested' || ingestionStatus === 'failed')) {
            removeIngestionId(assayResultId);
          }
        });

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
    },
    [addIngestionId, ingestionIds, removeIngestionId]
  );

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
        if (!patient.full_report_path) {
          Alert.alert('Error', 'Report path not available for this patient.');
          return;
        }
        const blobPath = patient.full_report_path;
        const documentId = patient.hasOwnProperty('documentId') ? patient.documentId : null;
        const signedUrl = await storageAPI.getSignedUrl(blobPath);
        const ingested_file_path = patient.hasOwnProperty('ingested_file_path') ? patient.ingested_file_path : null;
        let ingestionStatus = null;

        const reportIngestionStatus: IngestionStatus = patient.hasOwnProperty('drg_ingestion_status')
          ? (patient.drg_ingestion_status as IngestionStatus)
          : null;

        const samePath = ingested_file_path === patient.full_report_path;
        if (samePath) {
          if (reportIngestionStatus === 'ingested') {
            ingestionStatus = 'ingested';
            removeIngestionId(patient.assayResultIds);
          } else if (reportIngestionStatus === 'ingesting') {
            ingestionStatus = 'ingesting';
          } else if (reportIngestionStatus === 'failed') {
            removeIngestionId(patient.assayResultIds);
          }
        } else if (!samePath && reportIngestionStatus === 'ingesting') {
          ingestionStatus = 'ingesting';
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
    return <EmptyState type="no-patients" />;
  }, [loading]);

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
    <SafeAreaView edges={[]} style={{ flex: 1 }} className="bg-[#FDF5E6] dark:bg-gray-900">
      <PatientHeader totalCount={totalCount} query={query} onSearch={handleSearch} />

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
            <Text className="mt-4 text-base font-bold tracking-tight text-gray-500 dark:text-gray-400">
              Loading Orders...
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
