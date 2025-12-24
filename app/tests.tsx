import React from 'react';
import { FlatList, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconNavBar from '@/components/navigation/IconNavBar';
import OncoCard from '@/components/widgets/OncoCard';
import { useAuth } from '@/context/AuthContext';

export default function TestsScreen() {
  const { user } = useAuth();
  const { colorScheme } = useColorScheme();

  return (
    <SafeAreaView className="flex-1 bg-[#FDF5E6] dark:bg-gray-900">
      <View className="mb-4 flex-row items-center justify-between px-5">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-slate-900 dark:text-gray-100">Tests</Text>
        </View>
        <IconNavBar />
      </View>
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}
        data={data}
        keyExtractor={item => item.fileName}
        renderItem={({ item }) => <OncoCard item={item} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const data = [
  {
    fileName: 'OncoHRD new brochure.pdf',
    title: 'OncoHRD – Homologous Recombination Deficiency Test',
    summary:
      'An NGS-based assay designed to detect homologous recombination deficiency and related genomic signatures to guide targeted therapy and treatment selection in solid tumors.',
  },
  {
    fileName: 'OncoIndx new brochure.pdf',
    title: 'OncoIndx – Comprehensive Tumor Genomic Profiling',
    summary:
      'A broad genomic profiling test that analyzes multiple cancer-related genes to identify actionable mutations and support personalized oncology treatment decisions.',
  },
  {
    fileName: 'OncoIndx prime+ new brochure.pdf',
    title: 'OncoIndx Prime+ – Enhanced Precision Oncology Panel',
    summary:
      'An advanced version of OncoIndx offering expanded gene coverage and deeper insights for complex cancer cases requiring high-confidence, precision-guided therapy.',
  },
  {
    fileName: 'OncoIndx tbx new brochure.pdf',
    title: 'OncoIndx TBx – Integrated DNA & RNA NGS Test',
    summary:
      'An integrated genomic and transcriptomic profiling assay covering 1000+ genes, fusions, TMB, MSI, and HRD to enable evidence-based, AI-assisted clinical decisions in advanced and refractory solid tumors.',
  },
  {
    fileName: 'OncoMonitor new brochure.pdf',
    title: 'OncoMonitor – Longitudinal Cancer Monitoring',
    summary:
      'A monitoring solution designed to track cancer progression, treatment response, and emerging resistance markers over time using molecular insights.',
  },
  {
    fileName: 'OncoRisk new brochure.pdf',
    title: 'OncoRisk – Cancer Risk Assessment',
    summary:
      'A genomic test focused on identifying inherited and acquired cancer risk markers to support early detection, prevention strategies, and informed clinical management.',
  },
  {
    fileName: 'OncoTarget new brochure.pdf',
    title: 'OncoTarget – Actionable Mutation Identification',
    summary:
      'A targeted NGS panel aimed at detecting clinically actionable genetic alterations to match patients with the most effective targeted and immunotherapy options.',
  },
];
