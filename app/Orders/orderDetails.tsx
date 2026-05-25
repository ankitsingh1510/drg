import React, { memo, useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, FileText } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '@/components/ui/AppText';
import { colors as themeColors } from '@/constants/colors';
import { storageAPI } from '@/services/storage';
import { type IngestionStatus } from '@/types/types';
import { type OrderStepStatus } from '@/util/orders';

interface OrderDetail {
  id: string;
  testName: string;
  sampleType: string;
  status: OrderStepStatus;
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

// Raw shape coming in via navigation params
interface PatientOrderParam {
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
}

const INGESTION_STATUS_MAP: Record<string, IngestionStatus> = {
  ingested: 'ingested',
  ingesting: 'ingesting',
  failed: 'failed',
};

function normalizeIngestionStatus(status?: string | null): IngestionStatus {
  return INGESTION_STATUS_MAP[status ?? ''] ?? '';
}

function normalizeStatus(status?: string): OrderStepStatus {
  if (!status) return 'PLACED';
  const value = status.toLowerCase();
  if (value.includes('release') || value.includes('report')) return 'RELEASED';
  if (value.includes('accession')) return 'ACCESSION';
  return 'PLACED';
}

/**
 * Reuse a single Intl.DateTimeFormat instance across all calls.
 * Creating a new formatter per call is expensive on mobile JS engines.
 */
const DATE_FORMATTER = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: '2-digit',
});

function formatTimestamp(value?: string | null): string {
  if (!value) return '                     ';
  try {
    return DATE_FORMATTER.format(new Date(value));
  } catch {
    return value;
  }
}

const PROGRESS_WIDTH: Record<OrderStepStatus, `${number}%`> = {
  PLACED: '12%',
  ACCESSION: '55%',
  RELEASED: '100%',
};

const PROGRESS_COLOR: Record<OrderStepStatus, string> = {
  PLACED: themeColors.common.primary,
  ACCESSION: themeColors.common.info,
  RELEASED: themeColors.common.success,
};

const OrderDetailCard = memo(function OrderDetailCard({
  order,
  isDark,
  patientName,
}: {
  order: OrderDetail;
  isDark: boolean;
  patientName: string;
}) {
  const isReleased = order.status === 'RELEASED';
  const [loading, setLoading] = useState(false);

  const handleViewReport = useCallback(async () => {
    if (!order.fullReportPath) {
      Alert.alert('Report unavailable', 'No full report path found for this sample.');
      return;
    }

    try {
      setLoading(true);
      const signedUrl = await storageAPI.getSignedUrl(order.fullReportPath);
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
    } finally {
      setLoading(false);
    }
  }, [order.fullReportPath, order.documentId, order.assayResultIds, order.ingestionStatus, patientName]);

  return (
    <View className="mb-4 rounded-[16px] border border-gray-200 bg-white p-5 dark:border-[#374151] dark:bg-[#1f2937]">
      <AppText weight="semibold" className="text-base text-gray-900 dark:text-white">
        {order.testName}
      </AppText>
      <AppText className="mb-4 text-xs text-gray-500 dark:text-[#8BA5C0]">{order.sampleType}</AppText>

      {/* Step labels */}
      <View className="mb-2 flex-row justify-between px-0.5">
        <AppText className="text-[10px] text-gray-600 dark:text-gray-400">Ordered Placed</AppText>
        <AppText className="text-[10px] text-gray-600 dark:text-gray-400">Sample Accession</AppText>
        <AppText className="text-[10px] text-gray-600 dark:text-gray-400">Report Released</AppText>
      </View>

      {/* Progress bar */}
      <View className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <View
          className="h-full rounded-full"
          style={{
            width: PROGRESS_WIDTH[order.status],
            backgroundColor: PROGRESS_COLOR[order.status],
          }}
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
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? <ActivityIndicator size="small" color="#ffffff" /> : <FileText size={16} color="#ffffff" />}
          <AppText className="text-sm text-white">{loading ? 'Opening...' : 'View Report'}</AppText>
        </TouchableOpacity>
      )}
    </View>
  );
});

export default function OrderDetails() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#1F2937';

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

  /**
   * Parse + map only when `params.orders` changes (i.e. on navigation).
   * Prevents re-running JSON.parse + the full map on every re-render
   * triggered by loading state changes inside child cards.
   */
  const orders: OrderDetail[] = useMemo(() => {
    let parsed: PatientOrderParam[] = [];
    try {
      const value = params.orders ? JSON.parse(params.orders) : [];
      parsed = Array.isArray(value) ? value : [];
    } catch {
      parsed = [];
    }
    return parsed.map((order, idx) => ({
      id: `${patientId}-${idx}`,
      testName: order.testName ?? 'Unknown',
      sampleType: order.sampleType ?? 'Tumor Tissue Sample',
      status: normalizeStatus(order.status),
      dates: {
        placed: order.orderPlacedTimestamp ?? null,
        accession: order.sampleAccessionTimestamp ?? null,
        released: order.releasedDate ?? null,
      },
      fullReportPath: order.fullReportPath ?? null,
      documentId: order.documentId ?? null,
      assayResultIds: order.assayResultIds ?? '',
      ingestionStatus: normalizeIngestionStatus(order.ingestionStatus),
    }));
  }, [params.orders, patientId]);

  const ordersCount = String(orders.length).padStart(2, '0');
  const demographicLine = [age ? `${age}Y` : '', gender].filter(Boolean).join(' • ');

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
          Orders Details
        </AppText>
        <View className="w-8" />
      </View>

      <View className="mx-4 gap-1 px-5 py-4">
        <View className="flex-row items-center justify-between">
          <AppText weight="semibold" className="mr-2 flex-1 text-lg text-gray-900 dark:text-white" numberOfLines={1}>
            {patientName}
          </AppText>
          <AppText weight="semibold" className="text-lg text-gray-900 dark:text-white" numberOfLines={1}>
            {ordersCount}
          </AppText>
        </View>
        <View className="flex-row items-center justify-between">
          <AppText className="text-sm text-gray-600 dark:text-[#8BA5C0]">{demographicLine}</AppText>
          <AppText className="text-sm text-gray-600 dark:text-[#8BA5C0]">1Cell.Ai Tests Ordered</AppText>
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
