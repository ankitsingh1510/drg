import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StatusBar, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '@/components/ui/AppText';
import { colors as themeColors } from '@/constants/colors';
import { ordersAPI } from '@/services/orders';
import { mapApiDataToPatients, type OrderDisplayStatus, type PatientWithOrders } from '@/util/orders';

const PAGE_SIZE = 20;
const DATE_FROM = '2025-01-01';

const STATUS_BADGE: Record<OrderDisplayStatus, { bg: string; text: string; darkBg: string; darkText: string }> = {
  'Order Placed': {
    bg: '#fdf8e3',
    text: themeColors.common.warning,
    darkBg: '#332f1e',
    darkText: '#f79f07',
  },
  'Sample Accession': {
    bg: '#EEF2FF',
    text: '#4F46E5',
    darkBg: '#1E3A5F',
    darkText: themeColors.common.info,
  },
  'Report Released': {
    bg: '#ECFDF5',
    text: themeColors.common.success,
    darkBg: '#064E3B',
    darkText: themeColors.common.success,
  },
};

const StatusBadge = React.memo(({ status, isDark }: { status: OrderDisplayStatus; isDark: boolean }) => {
  const style = STATUS_BADGE[status];
  return (
    <View
      className="mt-1 w-full items-center justify-center rounded-full px-2.5 py-1"
      style={{ backgroundColor: isDark ? style.darkBg : style.bg }}
    >
      <AppText className="text-xs" style={{ color: isDark ? style.darkText : style.text }}>
        {status}
      </AppText>
    </View>
  );
});

const PatientOrderCard = React.memo(({ patient, isDark }: { patient: PatientWithOrders; isDark: boolean }) => {
  const chevronColor = isDark ? '#8BA5C0' : '#9CA3AF';

  const handlePress = useCallback(() => {
    router.push({
      pathname: '/Orders/orderDetails',
      params: {
        patientId: patient.id,
        patientName: patient.patientName,
        age: patient.age,
        gender: patient.gender,
        orders: JSON.stringify(patient.orders),
      },
    });
  }, [patient]);

  return (
    <TouchableOpacity
      className="mb-4 rounded-[16px] border border-gray-200 bg-white p-5 dark:border-[#374151] dark:bg-[#1f2937]"
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <View className="mb-1 flex-row items-center justify-between">
        <AppText weight="semibold" className="flex-1 text-lg text-gray-900 dark:text-white">
          {patient.patientName}
        </AppText>
        <ChevronRight size={20} color={chevronColor} />
      </View>
      <AppText className="mb-2 text-xs text-gray-500 dark:text-[#8BA5C0]">
        {patient.age}Y • {patient.gender}
      </AppText>

      <View className="flex-row flex-wrap gap-4">
        {patient.orders.map((order, idx) => (
          <View key={idx} className="min-w-[30%] items-center justify-center">
            <AppText weight="medium" className="text-sm text-gray-700 dark:text-gray-300">
              {order.testName}
            </AppText>
            <StatusBadge status={order.status} isDark={isDark} />
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
});

export default function AllOrders() {
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState<PatientWithOrders[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studyIds, setStudyIds] = useState<number[]>([]);
  const [studyIdsReady, setStudyIdsReady] = useState(false);

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const textColor = isDark ? '#FFFFFF' : '#1F2937';
  const indicatorColor = isDark ? '#8BA5C0' : (themeColors.common.info ?? '#4F46E5');

  const fetchOrders = useCallback(
    async (patientName = '', pageToLoad = 1, isLoadMore = false, ids?: number[]) => {
      isLoadMore ? setLoadingMore(true) : setLoading(true);
      setError(null);

      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await ordersAPI.getAssayWiseOrderStatus({
          dateFrom: DATE_FROM,
          dateTo: today,
          patientName,
          count: PAGE_SIZE,
          page: pageToLoad,
          restrictByRole: 'true',
          studyId: ids ?? studyIds,
        });
        setTotalCount(response?.totalCount);
        const mappedPatients = mapApiDataToPatients(response.data);
        setPatients(prev => (isLoadMore ? [...prev, ...mappedPatients] : mappedPatients));
        setPage(pageToLoad);
        setHasMore(pageToLoad * PAGE_SIZE < (response.totalCount ?? 0));
      } catch (err: any) {
        console.error('[AllOrders] fetch error:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        isLoadMore ? setLoadingMore(false) : setLoading(false);
      }
    },
    [studyIds]
  );

  useEffect(() => {
    ordersAPI
      .getStudyList()
      .then(ids => {
        setStudyIds(ids);
        setStudyIdsReady(true);
        fetchOrders('', 1, false, ids);
      })
      .catch(err => {
        console.error('[AllOrders] getStudyList error:', err);
        setStudyIdsReady(true);
        fetchOrders('', 1, false, []);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!studyIdsReady) return;
    const timer = setTimeout(() => {
      fetchOrders(search.trim(), 1, false);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, fetchOrders, studyIdsReady]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    fetchOrders(search.trim(), page + 1, true);
  }, [fetchOrders, hasMore, loading, loadingMore, page, search]);

  const onRefresh = useCallback(async () => {
    if (loadingMore) return;
    setRefreshing(true);
    try {
      await fetchOrders(search.trim(), 1, false);
    } finally {
      setRefreshing(false);
    }
  }, [fetchOrders, loadingMore, search]);

  const renderItem = useCallback(
    ({ item }: { item: PatientWithOrders }) => <PatientOrderCard patient={item} isDark={isDark} />,
    [isDark]
  );

  const keyExtractor = useCallback((item: PatientWithOrders) => item.id, []);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return <View className="h-8" />;
    return (
      <View className="h-16 items-center justify-center">
        <ActivityIndicator size="small" color={indicatorColor} />
      </View>
    );
  }, [loadingMore, indicatorColor]);

  const ListEmptyComponent = useMemo(
    () => (
      <View className="mt-16 items-center justify-center">
        <AppText className="text-sm text-gray-500 dark:text-[#8BA5C0]">No orders found.</AppText>
      </View>
    ),
    []
  );

  const showSpinner = loading && patients.length === 0;
  const showError = !loading && !!error && patients.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-[#FDF5E6] dark:bg-[#111827]">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#111827' : '#FDF5E6'}
      />

      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity className="h-8 w-8 items-center justify-center" onPress={() => router.back()}>
          <ChevronLeft size={24} color={textColor} strokeWidth={2.5} />
        </TouchableOpacity>
        <AppText weight="semibold" className="text-xl text-[#0F2D37] dark:text-white">
          Order Details
        </AppText>
        <View className="w-8" />
      </View>

      <View className="mb-3 px-4">
        <View className="h-12 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 dark:border-[#374151] dark:bg-[#1f2937]">
          <Search size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput
            className="flex-1 font-outfit text-sm text-gray-800 dark:text-white"
            placeholder="Search Patient"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        {totalCount > 0 && (
          <AppText className="mt-2 text-xs uppercase tracking-widest text-gray-500 dark:text-[#8BA5C0]">
            {totalCount} {totalCount === 1 ? 'order' : 'orders'}
          </AppText>
        )}
      </View>

      {showSpinner ? (
        <View className="mt-16 items-center justify-center">
          <ActivityIndicator size="large" color={indicatorColor} />
          <AppText className="mt-3 text-sm text-gray-500 dark:text-[#8BA5C0]">Loading orders...</AppText>
        </View>
      ) : showError ? (
        <View className="mt-16 items-center justify-center px-4">
          <AppText className="text-center text-sm text-red-500">{error}</AppText>
          <TouchableOpacity
            className="mt-4 rounded-xl bg-blue-600 px-6 py-2"
            onPress={() => fetchOrders(search.trim(), 1)}
          >
            <AppText className="text-sm text-white">Retry</AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={patients}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={ListEmptyComponent}
          removeClippedSubviews
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={PAGE_SIZE}
        />
      )}
    </SafeAreaView>
  );
}
