import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { type Patient } from '@/services/patients';

interface PatientRowProps {
  patient: Patient;
  onViewReport: (patient: Patient) => Promise<void>;
}

export function PatientRow({ patient, onViewReport }: PatientRowProps) {
  const [open, setOpen] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  const handleViewReport = async () => {
    setLoadingReport(true);
    try {
      await onViewReport(patient);
    } finally {
      setLoadingReport(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'released':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'success':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'in queue':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'curation completed':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <View
      className="mb-3 bg-white "
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
            <Text className="text-lg font-semibold text-slate-900">{patient.patientName}</Text>
            <Text className="mt-1 text-sm text-slate-500">Sample: {patient.sampleBarcode}</Text>
            <Text className="text-sm text-slate-500">Assay: {patient.assayName}</Text>
            <Text className="text-sm text-slate-500">Date: {patient.reportFinalizedDate}</Text>
          </View>
          <View
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${getStatusColor(patient.workflowStatus)}`}
          >
            <Text className={`text-xs font-medium ${getStatusColor(patient.workflowStatus).split(' ')[0]}`}>
              {patient.workflowStatus}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="flex-1 text-sm text-slate-600" numberOfLines={1} ellipsizeMode="tail">
            {patient.physicianName} • {patient.facility}
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="rounded-lg px-3 py-1.5"
              style={{ backgroundColor: '#daa521' }}
              onPress={() => setOpen(!open)}
            >
              <Text className="text-sm font-medium text-white">{open ? 'Close' : 'Details'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="rounded-lg px-3 py-1.5"
              style={{ backgroundColor: '#1a355d' }}
              onPress={handleViewReport}
              disabled={loadingReport}
            >
              <Text className="text-sm font-medium text-white">{loadingReport ? 'Loading...' : 'View Report'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {open && (
          <View className="mt-3 border-t border-blue-50 pt-3">
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-xs text-slate-500">Accession #</Text>
                <Text className="text-sm text-slate-700">{patient.accession_number}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-slate-500">Age</Text>
                <Text className="text-sm text-slate-700">{patient.age}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-slate-500">Gender</Text>
                <Text className="text-sm text-slate-700">{patient.gender}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-slate-500">Disease</Text>
                <Text className="ml-2 flex-1 text-right text-sm text-slate-700" numberOfLines={2}>
                  {patient.diseaseName}
                </Text>
              </View>
              {patient.additionalPhysician && (
                <View className="flex-row justify-between">
                  <Text className="text-xs text-slate-500">Additional Physician</Text>
                  <Text className="text-sm text-slate-700">{patient.additionalPhysician}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
