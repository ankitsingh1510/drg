import React, { useState } from 'react';
import { ScrollView, StatusBar, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '@/components/ui/AppText';
import { colors as themeColors } from '@/constants/colors';

type OrderStatus = 'Ordered Placed' | 'Sample Accession' | 'Report Released';

interface PatientOrder {
  testName: string;
  status: OrderStatus;
}

interface PatientWithOrders {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  orders: PatientOrder[];
}

const patients: PatientWithOrders[] = [
  {
    id: '1',
    patientName: 'Rahul Sharma',
    age: 52,
    gender: 'Male',
    orders: [
      { testName: 'OncoIndx LBx', status: 'Ordered Placed' },
      { testName: 'OncoIndx TBx', status: 'Sample Accession' },
      { testName: 'OncoRisk', status: 'Report Released' },
    ],
  },
  {
    id: '2',
    patientName: 'Vaishali Kumari',
    age: 44,
    gender: 'Female',
    orders: [
      { testName: 'OncoIndx LBx', status: 'Report Released' },
      { testName: 'OncoIndx TBx', status: 'Sample Accession' },
      { testName: 'OncoRisk', status: 'Report Released' },
    ],
  },
  {
    id: '3',
    patientName: 'Shreyas Gupte',
    age: 38,
    gender: 'Male',
    orders: [
      { testName: 'OncoIndx LBx', status: 'Ordered Placed' },
      { testName: 'OncoIndx TBx', status: 'Sample Accession' },
      { testName: 'OncoRisk', status: 'Report Released' },
    ],
  },
  {
    id: '4',
    patientName: 'Bhushan Verma',
    age: 64,
    gender: 'Male',
    orders: [
      { testName: 'OncoIndx LBx', status: 'Ordered Placed' },
      { testName: 'OncoIndx TBx', status: 'Sample Accession' },
      { testName: 'OncoRisk', status: 'Ordered Placed' },
      { testName: 'OncoRisk', status: 'Report Released' },
    ],
  },
];

const statusBadgeStyle: Record<OrderStatus, { bg: string; text: string; darkBg: string; darkText: string }> = {
  'Ordered Placed': {
    bg: '#FEF3C7',
    text: themeColors.common.warning,
    darkBg: '#efeee9',
    darkText: '#a46901',
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
          params: { patientId: patient.id, patientName: patient.patientName, age: patient.age, gender: patient.gender },
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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    text: isDark ? '#FFFFFF' : '#1F2937',
  };

  const filtered = patients.filter(p => p.patientName.toLowerCase().includes(search.toLowerCase()));

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

      <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
        {filtered.map(patient => (
          <PatientOrderCard key={patient.id} patient={patient} isDark={isDark} />
        ))}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
