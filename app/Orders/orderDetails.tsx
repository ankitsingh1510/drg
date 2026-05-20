import React, { useCallback } from 'react';
import { Alert, ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, FileText } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '@/components/ui/AppText';
import { colors } from '@/constants/colors';
import { patientsAPI } from '@/services/patients';
import { storageAPI } from '@/services/storage';
import { IngestionStatus } from '@/types/types';

type OrderStatus = 'PLACED' | 'ACCESSION' | 'RELEASED';

interface OrderDetail {
  id: string;
  testName: string;
  sampleType: string;
  status: OrderStatus;
  dates: {
    placed?: string | null;
    accession?: string | null;
    released?: string | null;
  };
  fullReportPath?: string | number | null;
  documentId?: string | null;
  assayResultIds?: string;
  ingestionStatus?: IngestionStatus;
}

type PatientOrderParam = {
  testName?: string;
  status?: string;
  sampleType?: string;
  orderPlacedTimestamp?: string | null;
  sampleAccessionTimestamp?: string | null;
  releasedDate?: string | null;
  fullReportPath?: string | number | null;
  documentId?: string | null;
  assayResultIds?: string;
  ingestionStatus?: string | null;
  dates?: {
    placed?: string | null;
    accession?: string | null;
    released?: string | null;
  };
};

const normalizeIngestionStatus = (status?: string | null): IngestionStatus => {
  if (status === 'ingested') return 'ingested';
  if (status === 'ingesting') return 'ingesting';
  if (status === 'failed') return 'failed';
  return '';
};

const normalizeStatus = (status?: string): OrderStatus => {
  const value = (status ?? '').toLowerCase();

  if (value.includes('release') || value.includes('report')) {
    return 'RELEASED';
  }
  if (value.includes('accession')) {
    return 'ACCESSION';
  }
  return 'PLACED';
};

const formatTimestamp = (value?: string | null): string => {
  if (!value) return '--';
  try {
    const date = new Date(value);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
  } catch {
    return value;
  }
};

const getProgressWidth = (status: OrderStatus): `${number}%` => {
  switch (status) {
    case 'PLACED':
      return '12%';
    case 'ACCESSION':
      return '55%';
    case 'RELEASED':
      return '100%';
    default:
      return '0%';
  }
};

const getProgressColor = (status: OrderStatus): string => {
  switch (status) {
    case 'PLACED':
      return colors.common.primary;
    case 'ACCESSION':
      return colors.common.info;
    case 'RELEASED':
      return colors.common.success;
    default:
      return colors.common.primary;
  }
};

const OrderDetailCard = ({
  order,
  isDark,
  patientName,
}: {
  order: OrderDetail;
  isDark: boolean;
  patientName: string;
}) => {
  const isReleased = order.status === 'RELEASED';

  const handleViewReport = useCallback(async () => {
    try {
      
      const fullReportPath = order.fullReportPath;

      if (!fullReportPath) {
        Alert.alert('Report unavailable', 'No full report path found for this sample.');
        return;
      }
      const signedUrl = await storageAPI.getSignedUrl(fullReportPath);

      router.push({
        pathname: '/reports' as any,
        params: {
          pdfUrl: encodeURIComponent(signedUrl),
          patientName,
          documentId: order.documentId ?? null,
          assayResultIds: order.assayResultIds ?? '',
          ingestionStatus: order.ingestionStatus ?? '',
        },
      });
    } catch (error) {
      console.error('Error viewing report:', error);
      Alert.alert('Error', 'Failed to load report. Please try again.');
    }
  }, [order.assayResultIds, order.documentId, order.fullReportPath, order.ingestionStatus, patientName]);

  return (
    <View className="mb-4 rounded-[16px] border border-gray-200 bg-white p-5 dark:border-[#374151] dark:bg-[#1f2937]">
      <AppText weight="semibold" className="text-base text-gray-900 dark:text-white">
        {order.testName}
      </AppText>
      <AppText className="mb-4 text-xs text-gray-500 dark:text-[#8BA5C0]">{order.sampleType}</AppText>

      <View className="mb-2 flex-row justify-between px-0.5">
        <AppText className="text-[10px] text-gray-600 dark:text-gray-400">Ordered Placed</AppText>
        <AppText className="text-[10px] text-gray-600 dark:text-gray-400">Sample Accession</AppText>
        <AppText className="text-[10px] text-gray-600 dark:text-gray-400">Report Released</AppText>
      </View>

      <View className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <View
          className="h-full rounded-full"
          style={{ width: getProgressWidth(order.status), backgroundColor: getProgressColor(order.status) }}
        />
      </View>

      <View className="mb-4 flex-row justify-between px-0.5">
        <AppText className="text-[10px] text-blue-500">{formatTimestamp(order.dates.placed)}</AppText>
        <AppText className="text-[10px] text-blue-500">{formatTimestamp(order.dates.accession)}</AppText>
        <AppText className="text-[10px] text-blue-500">{formatTimestamp(order.dates.released)}</AppText>
      </View>

      {isReleased && (
        <TouchableOpacity
          className="ml-auto flex-row items-center gap-2 rounded-2xl bg-[#1A365D] px-5 py-3"
          activeOpacity={0.8}
          onPress={handleViewReport}
        >
          <FileText size={16} color="#ffffff" />
          <AppText className="text-sm text-white">View Report</AppText>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function OrderDetails() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams<{
    patientId: string;
    patientName: string;
    age: string;
    gender: string;
    orders?: string;
  }>();

  const patientId = params.patientId ?? '1';
  const patientName = params.patientName ?? 'Patient';
  const age = params.age ?? '';
  const gender = params.gender ?? '';
  const parsedOrders: PatientOrderParam[] = (() => {
    try {
      const value = params.orders ? JSON.parse(params.orders) : [];
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  })();

  const orders: OrderDetail[] = parsedOrders.map((order, idx) => ({
    id: `${patientId}-${idx}`,
    testName: order.testName ?? 'Unknown',
    sampleType: order.sampleType ?? 'Tumor Tissue Sample',
    status: normalizeStatus(order.status),
    dates: {
      placed: order.orderPlacedTimestamp ?? order.dates?.placed ?? null,
      accession: order.sampleAccessionTimestamp ?? order.dates?.accession ?? null,
      released: order.releasedDate ?? order.dates?.released ?? null,
    },
    fullReportPath: order.fullReportPath ?? null,
    documentId: order.documentId ?? null,
    assayResultIds: order.assayResultIds ?? '',
    ingestionStatus: normalizeIngestionStatus(order.ingestionStatus),
  }));

  const colors = {
    text: isDark ? '#FFFFFF' : '#1F2937',
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
          Orders Details
        </AppText>
        <View className="w-8" />
      </View>

      <View className="mx-4 flex-row items-center justify-between px-5 py-4">
        <View>
          <AppText className="text-lgs text-gray-900 dark:text-white">{patientName}</AppText>
          <AppText className="mt-0.5 text-sm dark:text-[#8BA5C0]">
            {age ? `${age}Y` : ''}
            {age && gender ? ' • ' : ''}
            {gender}
          </AppText>
        </View>
        <View className="items-end">
          <AppText className="text-xl dark:text-white">{String(orders.length).padStart(2, '0')}</AppText>
          <AppText className="mt-0.5 text-sm dark:text-[#8BA5C0]">Clinical Tests Ordered</AppText>
        </View>
      </View>

      <ScrollView className="px-4 pt-2" showsVerticalScrollIndicator={false}>
        {orders.map(order => (
          <OrderDetailCard key={order.id} order={order} isDark={isDark} patientName={patientName} />
        ))}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
