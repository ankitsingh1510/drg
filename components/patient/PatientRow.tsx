import React, { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Activity, AlertCircle, Calendar, CheckCircle2, Clock, Dna, Hash, User } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

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
      const date = new Date(patient.analysisCompletionDate);
      date.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const daysAgo = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;

      return {
        formatted: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        daysAgo,
      };
    } catch {
      return { formatted: patient.analysisCompletionDate, daysAgo: '' };
    }
  }, [patient.analysisCompletionDate]);

  const statusConfig = useMemo(() => {
    const status = patient.workflowStatus.toLowerCase();
    switch (status) {
      case 'released':
        return {
          text: '#10b981',
          bg: isDark ? '#064e3b' : '#ecfdf5',
          icon: <CheckCircle2 size={14} color="#10b981" />,
        };
      case 'failed':
        return {
          text: '#ef4444',
          bg: isDark ? '#450a0a' : '#fef2f2',
          icon: <AlertCircle size={14} color="#ef4444" />,
        };
      case 'success':
        return {
          text: '#3b82f6',
          bg: isDark ? '#172554' : '#eff6ff',
          icon: <Activity size={14} color="#3b82f6" />,
        };
      case 'in queue':
        return {
          text: '#f59e0b',
          bg: isDark ? '#451a03' : '#fffbeb',
          icon: <Clock size={14} color="#f59e0b" />,
        };
      default:
        return {
          text: '#6b7280',
          bg: isDark ? '#1f2937' : '#f3f4f6',
          icon: <Activity size={14} color="#6b7280" />,
        };
    }
  }, [patient.workflowStatus, isDark]);

  const handleViewReport = async () => {
    setLoadingReport(true);
    try {
      await onViewReport(patient);
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <View
      className="relative mx-4 mb-2 mt-8 rounded-[32px] bg-white dark:bg-gray-800"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      {/* Floating Centered Status Badge */}
      <View className="absolute -top-3 left-0 right-0 z-10 items-center">
        <View
          style={{
            backgroundColor: statusConfig.bg,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
          }}
          className="flex-row items-center gap-2 rounded-full px-4 py-1.5 shadow-sm shadow-black/10"
        >
          {statusConfig.icon}
          <Text
            style={{ color: statusConfig.text }}
            className="text-center text-[10px] font-bold uppercase tracking-widest"
          >
            {patient.workflowStatus}
          </Text>
        </View>
      </View>

      <View className="p-6 pt-8">
        {/* Patient Identity Section */}
        <View className="mb-5">
          <Text className="text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {patient.patientName}
          </Text>
          <View className="mt-1 items-center">
            <Text className="text-xs font-bold uppercase tracking-widest text-blue-500">{patient.assayName}</Text>
            <Text className="mt-1 text-xs font-semibold text-gray-400">
              {dateInfo.formatted} • {dateInfo.daysAgo}
            </Text>
          </View>
        </View>

        {/* Info Grid 2x2 - Tightened Scale */}
        <View className="mb-6 flex-row flex-wrap justify-between gap-y-6 rounded-2xl bg-gray-50/50 p-4 dark:bg-gray-900/30">
          {/* Accession - Left */}
          <View className="w-[48%]">
            <View className="mb-1.5 flex-row items-center gap-2">
              <Hash size={14} color="#9ca3af" strokeWidth={2.5} />
              <Text className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Accession</Text>
            </View>
            <Text className="text-base font-extrabold text-gray-800 dark:text-gray-200">
              #{patient.accession_number}
            </Text>
          </View>

          {/* Age - Right */}
          <View className="w-[48%] items-end">
            <View className="mb-1.5 flex-row items-center gap-2">
              <Calendar size={14} color="#9ca3af" strokeWidth={2.5} />
              <Text className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Age</Text>
            </View>
            <Text className="text-base font-extrabold text-gray-800 dark:text-gray-200">{patient.age} Years</Text>
          </View>

          {/* Gender - Left */}
          <View className="w-[48%]">
            <View className="mb-1.5 flex-row items-center gap-2">
              <User size={14} color="#9ca3af" strokeWidth={2.5} />
              <Text className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Gender</Text>
            </View>
            <Text className="text-base font-extrabold text-gray-800 dark:text-gray-200">{patient.gender}</Text>
          </View>

          {/* Type - Right */}
          <View className="w-[48%] items-end">
            <View className="mb-1.5 flex-row items-center gap-2">
              <Dna size={14} color="#9ca3af" strokeWidth={2.5} />
              <Text className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Type</Text>
            </View>
            <TouchableOpacity onPress={() => setDiseaseNameExpanded(!diseaseNameExpanded)} activeOpacity={0.7}>
              <Text
                numberOfLines={diseaseNameExpanded ? undefined : 1}
                className="text-right text-base font-extrabold text-gray-800 dark:text-gray-200"
              >
                {patient.diseaseName || 'N/A'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Secondary Info */}
        <View className="mb-6 flex-row items-center gap-3 px-1">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20">
            <User size={20} color="#3b82f6" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-gray-800 dark:text-gray-100">{patient.physicianName}</Text>
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">{patient.facility}</Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleViewReport}
          disabled={loadingReport}
          activeOpacity={0.8}
          className="h-14 flex-row items-center justify-center gap-3 rounded-full bg-blue-600 shadow-lg shadow-blue-300 dark:shadow-none"
        >
          <Text className="text-base font-bold text-white">{loadingReport ? 'Opening...' : 'View Full Report'}</Text>
          {!loadingReport && <Activity size={18} color="white" />}
        </TouchableOpacity>
      </View>
    </View>
  );
});
PatientRow.displayName = 'PatientRow';
