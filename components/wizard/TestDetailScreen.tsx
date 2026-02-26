import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SuggestedTest } from './index';

interface TestDetailScreenProps {
  test: SuggestedTest;
  onBack: () => void;
}

const getConfidenceInfo = (confidence: number) => {
  if (confidence >= 0.8) {
    return {
      label: 'High Confidence',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-700 dark:text-green-300',
      iconColor: '#10b981',
    };
  }
  if (confidence >= 0.4) {
    return {
      label: 'Moderate Confidence',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      iconColor: '#eab308',
    };
  }
  return {
    label: 'Low Confidence',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    textColor: 'text-gray-600 dark:text-gray-400',
    iconColor: '#9ca3af',
  };
};

export function TestDetailScreen({ test, onBack }: TestDetailScreenProps) {
  const conf = getConfidenceInfo(test.confidence);

  // Parse reasoning into key points
  const parseKeyPoints = (reasoning: string): string[] => {
    if (!reasoning) return [];
    const sentences = reasoning.split(/\.\s+/).filter(s => s.trim().length > 0);
    return sentences.map(s => s.replace(/\.$/, '').trim());
  };

  const keyPoints = parseKeyPoints(test.reasoning);

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Hero Header */}
      <View className="px-5 pb-6 pt-5" style={{ backgroundColor: '#1e3a5f' }}>
        {/* Variant Badge + Confidence */}
        <View className="mb-3 flex-row items-center justify-between">
          {test.testVariant ? (
            <View className="rounded-full bg-green-500/80 px-3 py-1">
              <Text className="text-xs font-bold text-white">{test.testVariant}</Text>
            </View>
          ) : (
            <View />
          )}
          <View className={`flex-row items-center rounded-full px-3 py-1.5 ${conf.bgColor}`}>
            <Ionicons name="checkmark-circle" size={14} color={conf.iconColor} style={{ marginRight: 4 }} />
            <Text className={`text-xs font-bold ${conf.textColor}`}>{conf.label}</Text>
          </View>
        </View>

        {/* Test Name */}
        <Text className="text-2xl font-bold text-white">{test.testName}</Text>
        <Text className="mt-1 text-sm" style={{ color: '#93c5fd' }}>
          Confidence Score: {Math.round(test.confidence * 100)}%
        </Text>
      </View>

      <View className="px-5 py-6">
        {/* Section: Why this is recommended */}
        <Text className="mb-1 text-base text-gray-500 dark:text-gray-400">Why {test.testName} is Recommended</Text>
        <View className="mb-6 h-0.5 bg-gray-200 dark:bg-gray-700" />

        {/* Clinical Match Summary */}
        <Text className="mb-4 text-lg font-bold uppercase tracking-wide text-slate-800 dark:text-gray-200">
          Clinical Match Summary
        </Text>
        <View className="mb-6">
          {keyPoints.slice(0, 4).map((point, index) => (
            <View key={index} className="mb-2.5 flex-row">
              <Text className="mr-2 text-gray-500 dark:text-gray-400">•</Text>
              <Text className="flex-1 text-sm leading-5 text-gray-700 dark:text-gray-300">{point}</Text>
            </View>
          ))}
        </View>

        {/* How it supports this case */}
        <Text className="mb-4 text-lg font-bold uppercase tracking-wide text-slate-800 dark:text-gray-200">
          How It Supports This Case
        </Text>
        <View className="mb-8 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
          <Text className="text-sm leading-6 text-gray-700 dark:text-gray-300">{test.reasoning}</Text>
        </View>

        {/* Back to Recommendations Button */}
        <TouchableOpacity
          onPress={onBack}
          className="items-center rounded-xl border-2 border-gray-300 py-4 dark:border-gray-600"
          activeOpacity={0.7}
        >
          <Text className="text-base font-semibold text-gray-700 dark:text-gray-300">Back to Recommendations</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
