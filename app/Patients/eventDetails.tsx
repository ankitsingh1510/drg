import React from 'react';
import { ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Eye, FileText } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '@/components/ui/AppText';

export default function EventDetails() {
  const { eventId } = useLocalSearchParams();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    text: isDark ? '#FFFFFF' : '#1F2937',
    textSecondary: isDark ? '#8BA5C0' : '#6B7280',
    border: isDark ? '#1A3050' : '#E5E7EB',
  };

  const item = {
    title: 'ICARE REPORT',
    fileName: 'Report.pdf',
    fileSubtitle: 'Report Document',
    aiSummary:
      '38-year-old Mumbai patient with locally advanced breast cancer; multiple genomic tests requested using liquid and tissue samples by Dr. Vijay Solanki.',
    diagnosis: ['Locally advanced left breast cancer', 'Prior history of chemotherapy'],
    requestedTests: [
      'OncoIndx L8X | OncoIndx TBX | OncoMonitor | OncoTarget | OncoPredikt | HRD (Homologous Recombination Deficiency)',
    ],
    sampleTypes: ['Liquid biopsy (blood sample)', 'Tissue biopsy', 'FFPE tissue block (archival sample)'],
    requestingPhysician: 'Dr. Vijay Solanki\nFacility: Indx',
    specimen: 'Specimen retrieval details included\nFacility address provided for sample handling and',
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
        <AppText weight="semibold" className="text-lg text-gray-800 dark:text-white">
          Event Details
        </AppText>
        <View className="w-8" />
      </View>

      <ScrollView className="px-5 pt-2.5" showsVerticalScrollIndicator={false}>
        {/* Patient Info */}
        <AppText weight="bold" className="mb-3 text-[13px] tracking-widest text-gray-500 dark:text-[#8BA5C0]">
          PATIENT INFO
        </AppText>
        <View className="mb-6 flex-row justify-between">
          <View className="flex-1 gap-2">
            <AppText weight="medium" className="text-xs text-[#6B7280]">
              Sample ID:{' '}
              <AppText weight="semibold" className="text-xs text-gray-800 dark:text-white">
                21002
              </AppText>
            </AppText>
            <AppText weight="medium" className="text-xs text-[#6B7280]">
              Assay:{' '}
              <AppText weight="semibold" className="text-xs text-gray-800 dark:text-white">
                OncoIndx L8X
              </AppText>
            </AppText>
            <AppText weight="medium" className="text-xs text-[#6B7280]">
              Date:{' '}
              <AppText weight="semibold" className="text-xs text-gray-800 dark:text-white">
                12 Nov 2025
              </AppText>
            </AppText>
          </View>
          <View className="flex-1 gap-2">
            <AppText weight="medium" className="text-xs text-[#6B7280]">
              Accession:{' '}
              <AppText weight="semibold" className="text-xs text-gray-800 dark:text-white">
                25-A04409
              </AppText>
            </AppText>
            <AppText weight="medium" className="text-xs text-[#6B7280]">
              Age & Gen.:{' '}
              <AppText weight="semibold" className="text-xs text-gray-800 dark:text-white">
                38 | Female
              </AppText>
            </AppText>
            <AppText weight="medium" className="text-xs text-[#6B7280]">
              Disease:{' '}
              <AppText weight="semibold" className="text-xs text-[#4A90D9]">
                Breast cancer
              </AppText>
            </AppText>
          </View>
        </View>

        <View className="mb-4 flex-row items-center justify-between">
          <AppText weight="bold" className="text-lg tracking-widest text-gray-800 dark:text-white">
            {item.title}
          </AppText>
          <View className="rounded bg-blue-100 px-2 py-1">
            <AppText weight="bold" className="text-[10px] text-blue-600">
              LAB REPORT
            </AppText>
          </View>
        </View>

        {/* File Attachment */}
        <View className="mb-4 flex-row items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-[#1A3050] dark:bg-[#0F2235]">
          <View className="h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
            <FileText size={18} color={'#0284C7'} strokeWidth={2} />
          </View>
          <View className="flex-1">
            <AppText weight="semibold" className="text-sm text-gray-800 dark:text-white">
              {item.fileName}
            </AppText>
            <AppText className="mt-0.5 text-xs text-[#6B7280]">{item.fileSubtitle}</AppText>
          </View>
          <TouchableOpacity
            className="flex-row items-center gap-1.5 rounded-md border border-gray-400 px-3 py-1.5"
            // onPress={() => router.push('/reports')} // Need to add report screen and its props
          >
            <Eye size={14} color={colors.textSecondary} strokeWidth={2} />
            <AppText weight="semibold" className="text-xs text-gray-500 dark:text-[#8BA5C0]">
              View
            </AppText>
          </TouchableOpacity>
        </View>

        {/* AI Summary */}
        <AppText weight="bold" className="mb-3 mt-4 text-[13px] tracking-widest text-gray-500 dark:text-[#8BA5C0]">
          AI SUMMARY
        </AppText>
        <AppText className="text-sm leading-[22px] text-gray-800 dark:text-white">{item.aiSummary}</AppText>

        {/* Patient & Test Summary */}
        <AppText weight="bold" className="mb-3 mt-6 text-[13px] tracking-widest text-gray-500 dark:text-[#8BA5C0]">
          PATIENT & TEST SUMMARY
        </AppText>

        <AppText weight="semibold" className="mb-2 mt-4 text-sm text-gray-800 dark:text-white">
          Diagnosis
        </AppText>
        {item.diagnosis.map((d, i) => (
          <AppText key={i} className="mb-1 pl-2 text-sm leading-[22px] text-gray-800 dark:text-white">
            • {d}
          </AppText>
        ))}

        <AppText weight="semibold" className="mb-2 mt-4 text-sm text-gray-800 dark:text-white">
          Requested Tests
        </AppText>
        {item.requestedTests.map((t, i) => (
          <AppText key={i} className="mb-1 pl-2 text-sm leading-[22px] text-gray-800 dark:text-white">
            • {t}
          </AppText>
        ))}

        <AppText weight="semibold" className="mb-2 mt-4 text-sm text-gray-800 dark:text-white">
          Sample Types
        </AppText>
        {item.sampleTypes.map((s, i) => (
          <AppText key={i} className="mb-1 pl-2 text-sm leading-[22px] text-gray-800 dark:text-white">
            • {s}
          </AppText>
        ))}

        <AppText weight="semibold" className="mb-2 mt-4 text-sm text-gray-800 dark:text-white">
          Requesting Physician
        </AppText>
        <AppText className="mb-1 pl-2 text-sm leading-[22px] text-gray-800 dark:text-white">
          • {item.requestingPhysician}
        </AppText>

        <AppText weight="semibold" className="mb-2 mt-4 text-sm text-gray-800 dark:text-white">
          Specimen & Logistics
        </AppText>
        <AppText className="mb-1 pl-2 text-sm leading-[22px] text-gray-800 dark:text-white">• {item.specimen}</AppText>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
