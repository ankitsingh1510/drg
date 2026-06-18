import React, { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ArrowRight, Calendar, User } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { colors } from '@/constants/colors';
import { type Patient } from '@/services/patients';

interface PatientRowProps {
  patient: Patient;
  onViewReport: (patient: Patient) => Promise<void>;
}

export const PatientRow = React.memo(({ patient, onViewReport }: PatientRowProps) => {
  const [loadingReport, setLoadingReport] = useState(false);
  const [diseaseNameExpanded, setDiseaseNameExpanded] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const dateInfo = useMemo(() => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const date = new Date(patient.reportReleaseDate);
      date.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const daysAgo = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;

      return {
        formatted: date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        daysAgo,
      };
    } catch {
      return { formatted: patient.reportReleaseDate, daysAgo: '' };
    }
  }, [patient.reportReleaseDate]);

  // Backend only returns Released tests; badge is always RELEASED
  const statusConfig = { color: colors.common.success, label: 'RELEASED' };

  const handleViewReport = async () => {
    setLoadingReport(true);
    try {
      await onViewReport(patient);
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <View className="mx-4 mb-4 rounded-2xl border border-gray-300 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="flex-1 font-outfit-bold text-2xl text-gray-900 dark:text-white" numberOfLines={1}>
          {patient.patientName}
        </Text>
        <View className="ml-3 rounded-full border px-3 py-1" style={{ borderColor: statusConfig.color }}>
          <Text className="font-outfit-bold text-sm tracking-widest" style={{ color: statusConfig.color }}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      <View className="my-2.5 flex-row items-center justify-between">
        <Text className="flex-1 font-outfit-semibold text-base" style={{ color: colors.common.info }}>
          {patient.assayName}
        </Text>
        <View className="flex-row items-center gap-1">
          <Calendar size={14} color={colors.dark.textTertiary} />
          <Text className="text-sm text-gray-400 dark:text-gray-500">{dateInfo.formatted}</Text>
        </View>
      </View>

      <View className="mb-4 h-px bg-gray-300 dark:bg-gray-700" />

      <View className="mb-4 flex-row">
        <View className="flex-1 gap-4">
          <View>
            <Text className="mb-0.5 text-sm text-gray-400 dark:text-gray-500">Accession</Text>
            <Text className="font-outfit-bold text-base text-gray-900 dark:text-white">{patient.accession_number}</Text>
          </View>
          <View>
            <Text className="mb-0.5 text-sm text-gray-400 dark:text-gray-500">Gender</Text>
            <Text className="font-outfit-bold text-base text-gray-900 dark:text-white">{patient.gender}</Text>
          </View>
        </View>
        <View className="flex-1 gap-4">
          <View>
            <Text className="mb-0.5 text-sm text-gray-400 dark:text-gray-500">Age</Text>
            <Text className="font-outfit-bold text-base text-gray-900 dark:text-white">{patient.age} Years</Text>
          </View>
          <View>
            <Text className="mb-0.5 text-sm text-gray-400 dark:text-gray-500">Cancer Type</Text>
            <TouchableOpacity onPress={() => setDiseaseNameExpanded(!diseaseNameExpanded)} activeOpacity={0.7}>
              <Text
                numberOfLines={diseaseNameExpanded ? undefined : 1}
                className="font-outfit-bold text-base text-gray-900 dark:text-white"
              >
                {patient.diseaseName || 'N/A'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="mb-4 flex-row items-center gap-3 rounded-xl bg-[#F5F8FF] p-3 dark:bg-gray-700/50">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <User size={20} color={colors.common.info} />
        </View>
        <View className="flex-1">
          <Text className="font-outfit-bold text-base text-gray-800 dark:text-gray-100">{patient.physicianName}</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">{patient.facility}</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleViewReport}
        disabled={loadingReport}
        activeOpacity={0.85}
        className="flex-row items-center justify-center gap-2 rounded-xl py-3.5"
        style={{ backgroundColor: colors.common.accent }}
      >
        <Text className="font-outfit-semibold text-base text-white">
          {loadingReport ? 'Opening...' : 'View Full Report'}
        </Text>
        {!loadingReport && <ArrowRight size={18} color="white" />}
      </TouchableOpacity>
    </View>
  );
});
