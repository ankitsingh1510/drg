import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, StatusBar, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, LoadingIndicator } from '@/components/patient';
import AppText from '@/components/ui/AppText';
import { ordersAPI } from '@/services/orders';
import { patientsAPI, type SubjectPatient } from '@/services/patients';

const PAGE_SIZE = 10;

export default function PatientList() {
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState<SubjectPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [studyIds, setStudyIds] = useState<string[]>([]);
  const [studyIdsReady, setStudyIdsReady] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousSearchRef = useRef(search);

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const textColor = isDark ? '#FFFFFF' : '#1F2937';
  const textSecondary = isDark ? '#8BA5C0' : '#6B7280';
  const gold = '#D4AF37';

  const fetchPatients = useCallback(async (pageNum: number, searchQuery: string, reset = false, ids?: string[]) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      const response = await patientsAPI.fetchSubjectsDetails({
        page: pageNum,
        count: PAGE_SIZE,
        search: searchQuery,
        studyIds: ids ?? studyIds,
      });

      const incoming = response?.data ?? [];
      setTotalCount(incoming[0]?._totalCount ?? 0);

      if (reset || pageNum === 1) {
        setPatients(incoming);
      } else {
        setPatients(prev => [...prev, ...incoming]);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [studyIds]);

  useEffect(() => {
    ordersAPI
      .getStudyList()
      .then(ids => {
        const strIds = ids.map(String);
        setStudyIds(strIds);
        setStudyIdsReady(true);
        fetchPatients(1, '', false, strIds);
      })
      .catch(err => {
        console.error('[PatientList] getStudyList error:', err);
        setStudyIdsReady(true);
        fetchPatients(1, '', false, []);
      });
  }, []);

  // Debounced search
  useEffect(() => {
    if (!studyIdsReady) return;
    if (search === previousSearchRef.current) return;
    previousSearchRef.current = search;

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setPage(1);
      fetchPatients(1, search, true);
    }, 400);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [search, fetchPatients, studyIdsReady]);

  const handleLoadMore = () => {
    if (loadingMore || loading) return;
    if (patients.length >= totalCount) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPatients(nextPage, search);
  };

  const renderItem = ({ item: p }: { item: SubjectPatient }) => (
    <TouchableOpacity
      className="mb-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-[#1A3050] dark:bg-[#0F2235]"
      onPress={() =>
        router.push({ pathname: '/Patients/patientTimeline', params: { patientId: p.subjectId.toString() } })
      }
      activeOpacity={0.8}
    >
      <View className="flex-row items-center justify-between">
        <AppText className="flex-1 text-lg text-gray-800 dark:text-white" numberOfLines={1}>
          {p.patient_name}
        </AppText>
        <ChevronRight size={22} color={gold} strokeWidth={2} />
      </View>

      <AppText className="mb-1 text-sm text-blue-500">{p.assay}</AppText>

      <View className="mb-1 flex-row flex-wrap gap-x-1">
        <AppText className="text-xs text-gray-500 dark:text-[#8BA5C0]">
          {p.gender} · {p.age} yrs
        </AppText>
        {p.disease_name ? (
          <AppText className="text-xs text-gray-500 dark:text-[#8BA5C0]">· {p.disease_name}</AppText>
        ) : null}
        {p.sample_analyte ? (
          <AppText className="text-xs text-gray-500 dark:text-[#8BA5C0]">· {p.sample_analyte}</AppText>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FDF5E6] dark:bg-[#0B1929]">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0B1929' : '#FFFFFF'}
      />

      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity className="h-8 w-8 justify-center" onPress={() => router.back()}>
          <ChevronLeft size={24} color={textColor} strokeWidth={2} />
        </TouchableOpacity>
        <AppText weight="semibold" className="text-lg text-gray-800 dark:text-white">
          Patient List {totalCount > 0 ? `(${totalCount})` : ''}
        </AppText>
        <View className="w-8" />
      </View>

      <View className="mb-4 px-4">
        <View className="h-12 flex-row items-center rounded-full border border-gray-200 bg-gray-50 px-4 dark:border-[#1A3050] dark:bg-[#0F2235]">
          <Search size={20} color={textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            className="flex-1 font-outfit text-base text-gray-800 dark:text-white"
            placeholder="Search Patient"
            placeholderTextColor={textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity>
            <SlidersHorizontal size={20} color={textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <LoadingIndicator type="list-center" message="Loading patients..." />
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <AppText className="mb-4 text-center text-red-500">{error}</AppText>
          <TouchableOpacity className="rounded-xl bg-blue-500 px-6 py-3" onPress={() => fetchPatients(1, search, true)}>
            <AppText className="text-white">Retry</AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={patients}
          keyExtractor={item => `${item.subjectId}-${item.case_sample_id}`}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={<EmptyState type="no-patients" />}
          ListFooterComponent={loadingMore ? <LoadingIndicator type="footer" /> : null}
        />
      )}
    </SafeAreaView>
  );
}
