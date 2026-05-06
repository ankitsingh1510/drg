import React, { useState } from 'react';
import { ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowUpDown, Calendar, ChevronLeft, Search } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '@/components/ui/AppText';

interface OrderItemProps {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  testName: string;
  status: 'PLACED' | 'COLLECTED' | 'RELEASED';
  dates: {
    placed?: string;
    collected?: string;
    released?: string;
  };
}

const orders: OrderItemProps[] = [
  {
    id: '1',
    patientName: 'Patient Name',
    age: 52,
    gender: 'Male',
    testName: 'OncoIndx LBx',
    status: 'COLLECTED',
    dates: { placed: '23 Mar, 22', collected: '23 Mar, 22' },
  },
  {
    id: '2',
    patientName: 'Patient Name',
    age: 30,
    gender: 'Male',
    testName: 'OncoIndx LBx',
    status: 'PLACED',
    dates: { placed: '23 Mar, 22', collected: '23 Mar, 22' },
  },
  {
    id: '3',
    patientName: 'Patient Name',
    age: 33,
    gender: 'Female',
    testName: 'OncoIndx LBx',
    status: 'RELEASED',
    dates: { placed: '20 Mar, 22', collected: '21 Mar, 22', released: '22 Mar, 22' },
  },
  {
    id: '4',
    patientName: 'Patient Name',
    age: 70,
    gender: 'Male',
    testName: 'OncoIndx LBx',
    status: 'COLLECTED',
    dates: { placed: '23 Mar, 22', collected: '23 Mar, 22' },
  },
  {
    id: '5',
    patientName: 'Patient Name',
    age: 99,
    gender: 'Male',
    testName: 'OncoIndx LBx',
    status: 'PLACED',
    dates: { placed: '23 Mar, 22', collected: '23 Mar, 22' },
  },
];

const OrderCard = ({ order }: { order: OrderItemProps }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getProgressWidth = () => {
    switch (order.status) {
      case 'PLACED':
        return '12%';
      case 'COLLECTED':
        return '55%';
      case 'RELEASED':
        return '100%';
      default:
        return '0%';
    }
  };

  return (
    <TouchableOpacity
      className="mb-4 rounded-[20px] border border-gray-200 bg-white p-5 shadow-sm dark:border-[#1A3050] dark:bg-[#0F2235]"
      activeOpacity={0.8}
      onPress={() => {}}
    >
      <View className="mb-1 flex-row items-center justify-between">
        <AppText className="text-xl text-gray-900 dark:text-white">{order.patientName}</AppText>
        <AppText className="text-sm text-blue-500">{order.testName}</AppText>
      </View>

      <AppText className="mb-4 text-xs text-gray-500 dark:text-[#8BA5C0]">
        Age: {order.age} | {order.gender}
      </AppText>

      <View className="mb-2 flex-row justify-between px-0.5">
        <AppText className="text-[10px] text-gray-600 dark:text-gray-400">Ordered Placed</AppText>
        <AppText className="text-[10px] text-gray-600 dark:text-gray-400">Sample Collected</AppText>
        <AppText className="text-[10px] text-gray-600 dark:text-gray-400">Report Released</AppText>
      </View>

      <View className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <View className="h-full rounded-full bg-[#27AE60]" style={{ width: getProgressWidth() }} />
      </View>

      <View className="flex-row justify-between px-0.5">
        <AppText className="text-[9px] text-gray-400">{order.dates.placed}</AppText>
        <AppText className="text-[9px] text-gray-400">{order.dates.collected}</AppText>
        <AppText className="text-[9px] text-gray-400">{order.dates.released || '          '}</AppText>
      </View>
    </TouchableOpacity>
  );
};

export default function OrderList() {
  const [search, setSearch] = useState('');
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    text: isDark ? '#FFFFFF' : '#1F2937',
    textSecondary: isDark ? '#8BA5C0' : '#6B7280',
    border: isDark ? '#1A3050' : '#E5E7EB',
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDF5E6] dark:bg-[#0B1929]">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0B1929' : '#FFFFFF'}
      />

      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity className="h-8 w-8 items-center justify-center" onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <AppText className="text-xl text-[#0F2D37] dark:text-white">Orders List</AppText>
        <View className="w-8" />
      </View>

      <View className="mb-6 px-4">
        <View className="h-12 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 dark:border-[#1A3050] dark:bg-[#0F2235]">
          <Search size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput
            className="flex-1 font-outfit text-sm text-gray-800 dark:text-white"
            placeholder="Search Patient"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
          <View className="mx-3 h-6 w-[1px] bg-gray-200 dark:bg-gray-700" />
          <View className="flex-row items-center gap-3">
            <TouchableOpacity>
              <ArrowUpDown size={18} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Calendar size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
        {orders.map(order => (
          <OrderCard key={order.id} order={order} />
        ))}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
