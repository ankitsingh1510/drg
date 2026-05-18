import React, { useState } from 'react';
import { ScrollView, StatusBar, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '@/components/ui/AppText';










export default function PatientList() {
  const [search, setSearch] = useState('');
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  interface PatientProps {
    id: string;
    name: string;
    test: string;
    ai_summary: string;
  }

  const colors = {
    text: isDark ? '#FFFFFF' : '#1F2937',
    textSecondary: isDark ? '#8BA5C0' : '#6B7280',
    gold: '#D4AF37',
  };

  const patients = [
    {
      id: '1',
      name: 'Patient Name',
      test: 'OncoIndx LBx',
      ai_summary:
        '38-year-old Mumbai patient with locally advanced breast cancer; multiple genomic tests requested using liquid...',
    },
    {
      id: '2',
      name: 'Patient Name',
      test: 'OncoIndx LBx',
      ai_summary:
        '41-year-old Pune patient with locally advanced breast cancer; multiple genomic tests requested using liquid and tissue samples.',
    },
    {
      id: '3',
      name: 'Patient Name',
      test: 'OncoIndx LBx',
      ai_summary:
        '45-year-old Delhi patient; samples collected for genomic profiling including liquid biopsy and FFPE tissue block.',
    },
    {
      id: '4',
      name: 'Patient Name',
      test: 'OncoIndx LBx',
      ai_summary:
        '38-year-old Mumbai patient with locally advanced breast cancer; multiple genomic tests requested using liquid...',
    },
    {
      id: '5',
      name: 'Patient Name',
      test: 'OncoIndx LBx',
      ai_summary:
        '38-year-old Mumbai patient with locally advanced breast cancer; multiple genomic tests requested using liquid...',
    },
  ];

  const renderSinglePatient = (p: PatientProps) => {
    return (
      <TouchableOpacity
        key={p.id}
        className="mb-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-[#1A3050] dark:bg-[#0F2235]"
        onPress={() => router.push({ pathname: '/Patients/patientTimeline', params: { patientId: p.id } })}
        activeOpacity={0.8}
      >
        <View className="flex-row items-center justify-between">
          <AppText className="text-lg text-gray-800 dark:text-white">{p.name}</AppText>
          <ChevronRight size={22} color={colors.gold} strokeWidth={2} />
        </View>
        <AppText className="mb-1 text-sm text-blue-500">{p.test}</AppText>

        <AppText className="text-base font-outfit-semibold text-gray-500 dark:text-[#8BA5C0]">Ai Summary</AppText>
        <AppText className="text-sm text-[#1E3A5F] dark:text-gray-200" numberOfLines={2}>
          {p.ai_summary}
        </AppText>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDF5E6] dark:bg-[#0B1929]">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0B1929' : '#FFFFFF'}
      />
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity className="h-8 w-8 justify-center" onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <AppText className="text-lg text-gray-800 dark:text-white">Patient List</AppText>
        <View className="w-8" />
      </View>

      <View className="mb-4 px-4">
        <View className="h-12 flex-row items-center rounded-full border border-gray-200 bg-gray-50 px-4 dark:border-[#1A3050] dark:bg-[#0F2235]">
          <Search size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            className="flex-1 font-outfit text-[15px] text-gray-800 dark:text-white"
            placeholder="Search Patient"
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity>
            <SlidersHorizontal size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
        {patients.map(p => renderSinglePatient(p))}
        <View className="h-5" />
      </ScrollView>
    </SafeAreaView>
  );
}
