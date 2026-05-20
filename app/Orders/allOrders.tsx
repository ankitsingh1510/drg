import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StatusBar, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '@/components/ui/AppText';
import { colors as themeColors } from '@/constants/colors';
import { ordersAPI } from '@/services/orders';

const PAGE_SIZE = 20;

type OrderStatus = 'Ordered Placed' | 'Sample Accession' | 'Report Released';

interface PatientOrder {
  testName: string;
  status: OrderStatus;
  sampleType?: string;
  orderPlacedTimestamp?: string | null;
  sampleAccessionTimestamp?: string | null;
  releasedDate?: string | null;
  fullReportPath?: string | number | null;
  documentId?: string | null;
  assayResultIds?: string;
  ingestionStatus?: string | null;
}

interface PatientWithOrders {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  orders: PatientOrder[];
}

function normalizeOrderStatus(rawStatus?: string): OrderStatus {
  const value = (rawStatus ?? '').toLowerCase();

  if (value.includes('release') || value.includes('report')) {
    return 'Report Released';
  }

  if (value.includes('accession')) {
    return 'Sample Accession';
  }

  return 'Ordered Placed';
}

function mapApiDataToPatients(apiData: any[]): PatientWithOrders[] {
  if (!Array.isArray(apiData)) {
    return [];
  }

  const map = new Map<string, PatientWithOrders>();

  apiData.forEach((item: any, index: number) => {
    const key = String(item.accessionId ?? item.accessionNumber ?? item.patientName ?? index);
    if (!map.has(key)) {
      map.set(key, {
        id: key,
        patientName: item.patientName ?? 'Unknown',
        age: parseInt(item.age) || 0,
        gender: item.gender ?? '',
        orders: [],
      });
    }

    const assays = Array.isArray(item.assays) ? item.assays : [];

    if (assays.length > 0) {
      assays.forEach((assay: any) => {
        // Derive status from boolean flags; fall back to workflowStatuses string
        let status: OrderStatus = 'Ordered Placed';
        if (assay?.released === true) {
          status = 'Report Released';
        } else if (assay?.sampleAccessioned === true) {
          status = 'Sample Accession';
        } else if (assay?.orderPlaced === true) {
          status = 'Ordered Placed';
        } else {
          const rawStatus = Array.isArray(assay?.workflowStatuses)
            ? assay.workflowStatuses[0]
            : (assay?.status ?? assay?.workflowStatus ?? assay?.orderStatus ?? assay?.oncoindx_sub_pipeline);
          status = normalizeOrderStatus(rawStatus);
        }

        map.get(key)!.orders.push({
          testName: assay?.assayName ?? assay?.assay ?? assay?.testName ?? 'Unknown',
          status,
          sampleType:
            Array.isArray(assay?.sampleTypes) && assay.sampleTypes.length > 0
              ? assay.sampleTypes.join(' | ')
              : (assay?.sampleType ?? undefined),
          orderPlacedTimestamp: assay?.orderPlacedTimestamp ?? null,
          sampleAccessionTimestamp: assay?.sampleAccessionTimestamp ?? null,
          releasedDate: assay?.releasedDate ?? null,
          fullReportPath: assay?.fullReportPath,
          documentId: assay?.documentId ?? null,
          assayResultIds: Array.isArray(assay?.assayResultIds)
            ? assay.assayResultIds.join(',')
            : (assay?.assayResultIds?.toString?.() ?? ''),
          ingestionStatus: assay?.drg_ingestion_status ?? assay?.drgIngestionStatus ?? null,
        });
      });
      return;
    }

    map.get(key)!.orders.push({
      testName: item.assay ?? item.testName ?? 'Unknown',
      status: normalizeOrderStatus(item.status ?? item.workflowStatus),
    });
  });

  return Array.from(map.values());
}

const statusBadgeStyle: Record<OrderStatus, { bg: string; text: string; darkBg: string; darkText: string }> = {
  'Ordered Placed': {
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

const StatusBadge = ({ status, isDark }: { status: OrderStatus; isDark: boolean }) => {
  const style = statusBadgeStyle[status];
  return (
    <View
      className="mt-1 w-full items-center justify-center rounded-full px-2.5 py-1"
      style={{ backgroundColor: isDark ? style.darkBg : style.bg }}
    >
      <AppText className="text-[10px]" style={{ color: isDark ? style.darkText : style.text }}>
        {status}
      </AppText>
    </View>
  );
};

const PatientOrderCard = ({ patient, isDark }: { patient: PatientWithOrders; isDark: boolean }) => {
  return (
    <TouchableOpacity
      className="mb-4 rounded-[16px] border border-gray-200 bg-white p-5 dark:border-[#374151] dark:bg-[#1f2937]"
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: '/Orders/orderDetails',
          params: {
            patientId: patient.id,
            patientName: patient.patientName,
            age: patient.age,
            gender: patient.gender,
            orders: JSON.stringify(patient.orders),
          },
        })
      }
    >
      <View className="mb-1 flex-row items-center justify-between">
        <AppText weight="semibold" className="text-lg text-gray-900 dark:text-white">
          {patient.patientName}
        </AppText>
        <ChevronRight size={20} color={isDark ? '#8BA5C0' : '#9CA3AF'} />
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
};

export default function AllOrders() {
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState<PatientWithOrders[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    text: isDark ? '#FFFFFF' : '#1F2937',
  };

  const fetchOrders = useCallback(async (patientName = '', pageToLoad = 1, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError(null);
      const today = new Date().toISOString().split('T')[0];
      const response = await ordersAPI.getAssayWiseOrderStatus({
        dateFrom: '2025-01-01',
        dateTo: today,
        patientName,
        count: PAGE_SIZE,
        page: pageToLoad,
        restrictByRole: 'true',
        studyId: [10],
      });

      const mappedPatients = mapApiDataToPatients(response.data);

      setPatients(prev => (isLoadMore ? [...prev, ...mappedPatients] : mappedPatients));
      setPage(pageToLoad);
      setHasMore(pageToLoad * PAGE_SIZE < (response.totalCount ?? 0));
    } catch (err: any) {
      console.error('[AllOrders] fetch error:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders(search.trim(), 1, false);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, fetchOrders]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) {
      return;
    }

    fetchOrders(search.trim(), page + 1, true);
  }, [fetchOrders, hasMore, loading, loadingMore, page, search]);

  const renderFooter = () => {
    if (!loadingMore) {
      return <View className="h-8" />;
    }

    return (
      <View className="h-16 items-center justify-center">
        <ActivityIndicator size="small" color={isDark ? '#8BA5C0' : (themeColors.common.info ?? '#4F46E5')} />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDF5E6] dark:bg-[#111827]">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#111827' : '#FDF5E6'}
      />

      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity className="h-8 w-8 items-center justify-center" onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <AppText weight="semibold" className="text-xl text-[#0F2D37] dark:text-white">
          Orders List
        </AppText>
        <View className="w-8" />
      </View>

      <View className="mb-6 px-4">
        <View className="h-12 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 dark:border-[#374151] dark:bg-[#1f2937]">
          <Search size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput
            className="flex-1 font-outfit text-sm text-gray-800 dark:text-white"
            placeholder="Search Patient"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
          {/* <View className="mx-3 h-6 w-[1px] bg-gray-200 dark:bg-gray-700" />
          <View className="flex-row items-center gap-3">
            <TouchableOpacity>
              <ArrowUpDown size={18} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Calendar size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View> */}
        </View>
      </View>

      {loading && patients.length === 0 ? (
        <View className="mt-16 items-center justify-center">
          <ActivityIndicator size="large" color={isDark ? '#8BA5C0' : (themeColors.common.info ?? '#4F46E5')} />
          <AppText className="mt-3 text-sm text-gray-500 dark:text-[#8BA5C0]">Loading orders...</AppText>
        </View>
      ) : error && patients.length === 0 ? (
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
          keyExtractor={item => item.id}
          renderItem={({ item }) => <PatientOrderCard patient={item} isDark={isDark} />}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View className="mt-16 items-center justify-center">
              <AppText className="text-sm text-gray-500 dark:text-[#8BA5C0]">No orders found.</AppText>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
