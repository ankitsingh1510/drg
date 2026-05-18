import React, { useState } from 'react';
import { ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Copy, UserRound } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '@/components/ui/AppText';

// Shared data type
export type BadgeType = 'LAB_REPORT' | 'IMAGING_REPORT' | 'GENOMIC_TESTING';

export interface TimelineEntry {
  id: string;
  date: string;
  badgeType: BadgeType;
  title: string;
  provider: string;
  aiSummary: string;
  itemColor?: string;
}

const dummyTimeline: TimelineEntry[] = [
  {
    id: '1',
    date: '03, APRIL 2026',
    badgeType: 'LAB_REPORT',
    title: 'ICARE REPORT',
    provider: 'Dr. Vijay Solanki',
    aiSummary:
      '38-year-old Mumbai patient with locally advanced breast cancer; multiple genomic tests requested using liquid and tissue samples by Dr. Vijay Solanki.',
    itemColor: '#DAA520',
  },
  {
    id: '2',
    date: '03, APRIL 2026',
    badgeType: 'IMAGING_REPORT',
    title: 'PET REPORT',
    provider: 'Dr. Vijay Solanki',
    aiSummary:
      '38-year-old Mumbai patient with locally advanced breast cancer; multiple genomic tests requested using liquid and tissue samples by Dr. Vijay Solanki.',
    itemColor: '#5C7AC6',
  },
  {
    id: '3',
    date: '03, APRIL 2026',
    badgeType: 'IMAGING_REPORT',
    title: 'PET REPORT',
    provider: 'Dr. Vijay Solanki',
    aiSummary:
      '38-year-old Mumbai patient with locally advanced breast cancer; multiple genomic tests requested using liquid and tissue samples by Dr. Vijay Solanki.',
    itemColor: '#5C7AC6',
  },
  {
    id: '4',
    date: '03, APRIL 2026',
    badgeType: 'LAB_REPORT',
    title: 'ICARE REPORT',
    provider: 'Dr. Vijay Solanki',
    aiSummary:
      '38-year-old Mumbai patient with locally advanced breast cancer; multiple genomic tests requested using liquid and tissue samples by Dr. Vijay Solanki.',
    itemColor: '#DAA520',
  },
  {
    id: '5',
    date: '03, APRIL 2026',
    badgeType: 'IMAGING_REPORT',
    title: 'PET REPORT',
    provider: 'Dr. Vijay Solanki',
    aiSummary:
      '38-year-old Mumbai patient with locally advanced breast cancer; multiple genomic tests requested using liquid and tissue samples by Dr. Vijay Solanki.',
    itemColor: '#5C7AC6',
  },
];

export default function PatientTimeline() {
  const { patientId } = useLocalSearchParams();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    text: isDark ? '#FFFFFF' : '#1F2937',
    textSecondary: isDark ? '#8BA5C0' : '#6B7280',
    border: isDark ? '#1A3050' : '#E5E7EB',
    gold: '#D4AF37',
    gray: '#9CA3AF',
  };

  const getBadgeLabel = (type: BadgeType) => {
    return type.replace('_', ' ');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDF5E6] dark:bg-[#0B1929]">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0B1929' : '#FFFFFF'}
      />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity className="h-8 w-8 justify-center" onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <AppText className="text-lg font-outfit-semibold text-gray-800 dark:text-white">Patient Timeline</AppText>
        <TouchableOpacity
          className="h-8 w-8 items-center justify-center"
          onPress={() => router.push({ pathname: '/Patients/allReports', params: { patientId } })}
        >
          <Copy size={20} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Patient Info */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <AppText className="text-base font-outfit-semibold text-gray-800 dark:text-white">Patient Name</AppText>
          <AppText className="text-[13px] font-outfit-medium text-gray-500 dark:text-[#8BA5C0]">Age: 52 | Male</AppText>
        </View>

        {/* Filters */}
        <View className="mb-6 flex-row gap-2 px-5">
          <TouchableOpacity className="flex-row items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 dark:border-[#1A3050]">
            <Calendar size={14} color={colors.gold} />
            <AppText className="text-[13px] font-outfit-medium text-gray-500 dark:text-[#8BA5C0]">Date</AppText>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 dark:border-[#1A3050]">
            <AppText className="text-[13px] font-outfit-medium text-gray-500 dark:text-[#8BA5C0]">Sort by</AppText>
            <ChevronDown size={14} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 dark:border-[#1A3050]">
            <AppText className="text-[13px] font-outfit-medium text-gray-500 dark:text-[#8BA5C0]">Report type</AppText>
            <ChevronDown size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Timeline */}
        <View className="px-4">
          {dummyTimeline.map((item, index) => {
            const isLast = index === dummyTimeline.length - 1;

            return (
              <View key={item.id} className="flex-row">
                {/* Left Spine */}
                <View className="mt-0.5 w-8 items-center">
                  <View
                    className="z-10 h-6 w-6 items-center justify-center rounded-full border"
                    style={{ borderColor: item.itemColor, backgroundColor: item.itemColor + '30' }}
                  >
                    <View className="h-3 w-3 rounded-full" style={{ backgroundColor: item.itemColor }} />
                  </View>
                  {!isLast && (
                    <View className="mt-1 min-h-[40px] w-[2px] flex-1" style={{ backgroundColor: colors.border }} />
                  )}
                </View>

                {/* Content */}
                <View className="flex-1 pl-2">
                  <View className="mb-2.5 flex-row items-center gap-2.5">
                    <AppText className="text-[13px] font-outfit-semibold text-gray-800 dark:text-white">{item.date}</AppText>
                    <View className="rounded bg-blue-100 px-2 py-0.5">
                      <AppText className="text-[10px] font-outfit-bold text-blue-600">{getBadgeLabel(item.badgeType)}</AppText>
                    </View>
                  </View>

                  <TouchableOpacity
                    className="overflow-hidden rounded-xl border bg-white dark:bg-[#0F2235]"
                    style={{ borderColor: item.itemColor }}
                    onPress={() => router.push({ pathname: '/Patients/eventDetails', params: { eventId: item.id } })}
                    activeOpacity={0.8}
                  >
                    <View className="flex-row items-center justify-between p-3.5">
                      <AppText className="flex-1 text-sm font-outfit-bold text-gray-800 dark:text-white">{item.title}</AppText>
                      <ChevronRight size={20} color={item.itemColor} strokeWidth={2.2} />
                    </View>

                    <View className="flex-row items-center gap-2.5 bg-gray-50 p-3 dark:bg-[#1A3050]">
                      <View className="h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                        <UserRound size={16} color={colors.textSecondary} />
                      </View>
                      <View>
                        <AppText className="text-[10px] font-outfit-bold tracking-widest text-[#9CA3AF]">PROVIDER</AppText>
                        <AppText className="mt-0.5 text-[13px] font-outfit-medium text-gray-800 dark:text-white">
                          {item.provider}
                        </AppText>
                      </View>
                    </View>

                    <View className="p-3.5">
                      <AppText className="mb-1.5 text-[10px] font-outfit-bold tracking-widest text-[#9CA3AF]">
                        AI SUMMARY
                      </AppText>
                      <AppText className="text-[13px] leading-5 text-gray-500 dark:text-[#8BA5C0]" numberOfLines={4}>
                        {item.aiSummary}
                      </AppText>
                    </View>
                  </TouchableOpacity>
                  <View className="h-6" />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
