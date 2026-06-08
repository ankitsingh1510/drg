import React from 'react';
import { Image, ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Dna, FileText, Microscope, ScanLine } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '@/components/ui/AppText';
import { colors } from '@/constants/colors';

interface Report {
  id: string;
  name: string;
}

interface ReportCategory {
  id: string;
  category: string;
  color: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  reports: Report[];
}

const reportCategories: ReportCategory[] = [
  {
    id: 'hisopath',
    category: 'Hisopath Reports',
    color: '#E07B54',
    Icon: Microscope,
    reports: [
      { id: 'h1', name: 'Histopathology Report' },
      { id: 'h2', name: 'Cytology Report' },
    ],
  },
  {
    id: 'genomic',
    category: 'Genomic Reports',
    color: '#5C7AC6',
    Icon: Dna,
    reports: [
      { id: 'g1', name: 'Liquid Biopsy Report' },
      { id: 'g2', name: 'Mutation Analysis Report' },
      { id: 'g3', name: 'HRD  Status Reports' },
      { id: 'g4', name: 'MSI Status Reports' },
    ],
  },
  {
    id: 'imaging',
    category: 'Imaging Reports',
    color: '#3AAFA9',
    Icon: ScanLine,
    reports: [
      { id: 'i1', name: 'CT Scan Reports' },
      { id: 'i2', name: 'PET Scan Reports' },
    ],
  },
];

function ReportCard({
  report,
  isDark,
  Icon,
  color,
}: {
  report: Report;
  isDark: boolean;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  color: string;
}) {
  return (
    <TouchableOpacity
      className="w-[48%] overflow-hidden rounded-xl border bg-white dark:bg-[#0F2235]"
      style={{ borderColor: color + '55' }}
      activeOpacity={0.8}
      onPress={() => router.push({ pathname: '/Patients/eventDetails', params: { eventId: report.id } })}
    >
      <View className="h-32 items-center justify-center" style={{ backgroundColor: color + '18' }}>
        <Icon size={44} color={color} strokeWidth={1.2} />
      </View>
      <View className="px-2 py-2">
        <AppText className="text-center text-[12px] text-gray-700 dark:text-white" numberOfLines={2}>
          {report.name}
        </AppText>
      </View>
    </TouchableOpacity>
  );
}

export default function AllReports() {
  const { patientId } = useLocalSearchParams();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const localColors = {
    text: isDark ? colors.dark.text : colors.light.text,
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDF5E6] dark:bg-[#0B1929]">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0B1929' : '#FDF5E6'}
      />
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity className="h-8 w-8 justify-center" onPress={() => router.back()}>
          <ChevronLeft size={24} color={localColors.text} strokeWidth={2} />
        </TouchableOpacity>
        <AppText weight="semibold" className="text-lg text-gray-800 dark:text-white">
          Patient Reports
        </AppText>
        <View className="h-8 w-8" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {reportCategories.map(cat => (
          <View key={cat.id} className="mb-6 px-4">
            <View className="mb-3 flex-row items-center gap-2">
              <FileText size={16} color={cat.color} strokeWidth={1.8} />
              <AppText weight="semibold" className="text-base" style={{ color: cat.color }}>
                {cat.category}
              </AppText>
            </View>

            {/* Reports Grid */}
            <View className="flex-row flex-wrap gap-3">
              {cat.reports.map(report => (
                <ReportCard key={report.id} report={report} isDark={isDark} Icon={cat.Icon} color={cat.color} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
