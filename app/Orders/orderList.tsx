import React from 'react';
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, FileText } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '@/components/ui/AppText';

type OrderStatus = 'PLACED' | 'ACCESSION' | 'RELEASED';

interface OrderDetail {
  id: string;
  testName: string;
  sampleType: string;
  status: OrderStatus;
  dates: {
    placed?: string;
    accession?: string;
    released?: string;
  };
}

// Mocked data per patient — replace with real API data
const patientOrdersMap: Record<string, OrderDetail[]> = {
  '1': [
    {
      id: 'o1',
      testName: 'OncoIndx LBx',
      sampleType: 'Tumor Tissue Sample',
      status: 'ACCESSION',
      dates: { placed: '23 Mar, 22', accession: '23 Mar, 22' },
    },
    {
      id: 'o2',
      testName: 'OncoIndx TBx',
      sampleType: 'Tumor Tissue Sample',
      status: 'PLACED',
      dates: { placed: '23 Mar, 22' },
    },
    {
      id: 'o3',
      testName: 'OncoRisk',
      sampleType: 'Tumor Tissue Sample',
      status: 'RELEASED',
      dates: { placed: '23 Mar, 22', accession: '23 Mar, 22', released: '13 May, 26' },
    },
  ],
  '2': [
    {
      id: 'o1',
      testName: 'OncoIndx LBx',
      sampleType: 'Tumor Tissue Sample',
      status: 'RELEASED',
      dates: { placed: '20 Mar, 22', accession: '21 Mar, 22', released: '22 Mar, 22' },
    },
    {
      id: 'o2',
      testName: 'OncoIndx TBx',
      sampleType: 'Tumor Tissue Sample',
      status: 'ACCESSION',
      dates: { placed: '20 Mar, 22', accession: '21 Mar, 22' },
    },
    {
      id: 'o3',
      testName: 'OncoRisk',
      sampleType: 'Tumor Tissue Sample',
      status: 'RELEASED',
      dates: { placed: '20 Mar, 22', accession: '21 Mar, 22', released: '22 Mar, 22' },
    },
  ],
  '3': [
    {
      id: 'o1',
      testName: 'OncoIndx LBx',
      sampleType: 'Tumor Tissue Sample',
      status: 'PLACED',
      dates: { placed: '23 Mar, 22' },
    },
    {
      id: 'o2',
      testName: 'OncoIndx TBx',
      sampleType: 'Tumor Tissue Sample',
      status: 'ACCESSION',
      dates: { placed: '23 Mar, 22', accession: '23 Mar, 22' },
    },
    {
      id: 'o3',
      testName: 'OncoRisk',
      sampleType: 'Tumor Tissue Sample',
      status: 'RELEASED',
      dates: { placed: '23 Mar, 22', accession: '23 Mar, 22', released: '13 May, 26' },
    },
  ],
  '4': [
    {
      id: 'o1',
      testName: 'OncoIndx LBx',
      sampleType: 'Tumor Tissue Sample',
      status: 'PLACED',
      dates: { placed: '23 Mar, 22' },
    },
    {
      id: 'o2',
      testName: 'OncoIndx TBx',
      sampleType: 'Tumor Tissue Sample',
      status: 'ACCESSION',
      dates: { placed: '23 Mar, 22', accession: '23 Mar, 22' },
    },
    {
      id: 'o3',
      testName: 'OncoRisk',
      sampleType: 'Tumor Tissue Sample',
      status: 'PLACED',
      dates: { placed: '23 Mar, 22' },
    },
  ],
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

const OrderDetailCard = ({ order, isDark }: { order: OrderDetail; isDark: boolean }) => {
  const isReleased = order.status === 'RELEASED';

  return (
    <View className="mb-4 rounded-[16px] border border-gray-200 bg-white p-5 shadow-sm dark:border-[#1A3050] dark:bg-[#0F2235]">
      <AppText className="font-outfit-semibold text-base text-gray-900 dark:text-white">{order.testName}</AppText>
      <AppText className="mb-4 text-xs text-gray-500 dark:text-[#8BA5C0]">{order.sampleType}</AppText>

      <View className="mb-2 flex-row justify-between px-0.5">
        <AppText className="text-[10px] text-gray-600 dark:text-gray-400">Ordered Placed</AppText>
        <AppText className="text-[10px] text-gray-600 dark:text-gray-400">Sample Accession</AppText>
        <AppText className="text-[10px] text-gray-600 dark:text-gray-400">Report Released</AppText>
      </View>

      <View className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <View
          className="h-full rounded-full bg-[#1B2D4E] dark:bg-[#27AE60]"
          style={{ width: getProgressWidth(order.status) }}
        />
      </View>

      <View className="mb-4 flex-row justify-between px-0.5">
        <AppText className="text-[10px] text-blue-500">{order.dates.placed ?? '--'}</AppText>
        <AppText className="text-[10px] text-blue-500">{order.dates.accession ?? '--'}</AppText>
        <AppText className="text-[10px] text-blue-500">{order.dates.released ?? '--'}</AppText>
      </View>

      {isReleased && (
        <TouchableOpacity
          className="ml-auto flex-row items-center gap-2 rounded-2xl bg-[#1B2D4E] px-5 py-3"
          activeOpacity={0.8}
          onPress={() => {}}
        >
          <FileText size={16} color="#FFFFFF" />
          <AppText className="text-sm text-white">View Report</AppText>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function OrderList() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams<{ patientId: string; patientName: string; age: string; gender: string }>();

  const patientId = params.patientId ?? '1';
  const patientName = params.patientName ?? 'Patient';
  const age = params.age ?? '';
  const gender = params.gender ?? '';
  const orders = patientOrdersMap[patientId] ?? [];

  const colors = {
    text: isDark ? '#FFFFFF' : '#1F2937',
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDF5E6] dark:bg-[#0B1929]">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0B1929' : '#FDF5E6'}
      />

      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity className="h-8 w-8 items-center justify-center" onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <AppText className="font-outfit-semibold text-xl text-[#0F2D37] dark:text-white">Orders Details</AppText>
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
          <AppText className="text-2xl dark:text-white">{String(orders.length).padStart(2, '0')}</AppText>
          <AppText className="mt-0.5 text-sm dark:text-[#8BA5C0]">Clinical Tests Ordered</AppText>
        </View>
      </View>

      <ScrollView className="px-4 pt-2" showsVerticalScrollIndicator={false}>
        {orders.map(order => (
          <OrderDetailCard key={order.id} order={order} isDark={isDark} />
        ))}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
