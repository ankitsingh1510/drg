import React, { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { colors } from '@/constants/colors';
import { type Patient } from '@/services/patients';

interface PatientRowProps {
  patient: Patient;
  onViewReport: (patient: Patient) => Promise<void>;
}

export const PatientRow = React.memo(({ patient, onViewReport }: PatientRowProps) => {
  const [open, setOpen] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const formattedDate = useMemo(() => {
    try {
      const date = new Date(patient.analysisCompletionDate);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return patient.analysisCompletionDate;
    }
  }, [patient.analysisCompletionDate]);

  const statusStyles = useMemo(() => {
    const status = patient.workflowStatus.toLowerCase();
    switch (status) {
      case 'released':
        return { text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' };
      case 'failed':
        return { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' };
      case 'success':
        return { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' };
      case 'in queue':
        return { text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' };
      case 'curation completed':
        return { text: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' };
      default:
        return { text: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  }, [patient.workflowStatus]);

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
      className="mb-3 bg-white dark:bg-gray-800"
      style={{
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View className="p-4">
        <View className="mb-3 flex-row items-start justify-between">
          <View className="mr-3 flex-1">
            <Text className="text-lg font-semibold text-slate-900 dark:text-gray-100">{patient.patientName}</Text>
            <Text className="mt-1 text-sm text-slate-500 dark:text-gray-400">Sample: {patient.sampleBarcode}</Text>
            <Text className="text-sm text-slate-500 dark:text-gray-400">Assay: {patient.assayName}</Text>
            <Text className="text-sm text-slate-500 dark:text-gray-400">Date: {formattedDate}</Text>
          </View>
          <View className={`rounded-lg border px-3 py-1.5 ${statusStyles.bg} ${statusStyles.border}`}>
            <Text className={`text-xs font-medium ${statusStyles.text}`}>{patient.workflowStatus}</Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="flex-1 text-sm text-slate-600 dark:text-gray-400" numberOfLines={1} ellipsizeMode="tail">
            {patient.physicianName} • {patient.facility}
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="rounded-lg px-3 py-1.5"
              style={{ backgroundColor: colors.common.primary }}
              onPress={() => setOpen(!open)}
            >
              <Text className="text-sm font-medium text-white">{open ? 'Close' : 'Details'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="rounded-lg px-3 py-1.5"
              style={{ backgroundColor: colors.common.accent }}
              onPress={handleViewReport}
              disabled={loadingReport}
            >
              <Text className="text-sm font-medium text-white">{loadingReport ? 'Loading...' : 'View Report'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {open && (
          <View className="mt-3 border-t border-blue-50 pt-3 dark:border-gray-700">
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-xs text-slate-500 dark:text-gray-400">Accession #</Text>
                <Text className="text-sm text-slate-700 dark:text-gray-300">{patient.accession_number}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-slate-500 dark:text-gray-400">Age</Text>
                <Text className="text-sm text-slate-700 dark:text-gray-300">{patient.age}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-slate-500 dark:text-gray-400">Gender</Text>
                <Text className="text-sm text-slate-700 dark:text-gray-300">{patient.gender}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-slate-500 dark:text-gray-400">Disease</Text>
                <Text className="ml-2 flex-1 text-right text-sm text-slate-700 dark:text-gray-300" numberOfLines={2}>
                  {patient.diseaseName}
                </Text>
              </View>
              {patient.additionalPhysician && (
                <View className="flex-row justify-between">
                  <Text className="text-xs text-slate-500 dark:text-gray-400">Additional Physician</Text>
                  <Text className="text-sm text-slate-700 dark:text-gray-300">{patient.additionalPhysician}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
});
