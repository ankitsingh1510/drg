import React from 'react';
import { ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SuggestedTest } from './index';

interface TestDetailScreenProps {
  test: SuggestedTest;
  testImage: string;
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

export function TestDetailScreen({ test, testImage, onBack }: TestDetailScreenProps) {
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
      <View className="h-[240px] w-full overflow-hidden">
        <ImageBackground source={{ uri: testImage }} resizeMode="cover" className="flex-1">
          <View className="absolute inset-0 bg-black/30" />
          <View className="flex-1 justify-between px-5 pb-6 pt-5">
            <View className="flex-row items-center justify-between">
              {test.testVariant ? (
                <View className="rounded-full bg-white/90 px-3 py-1">
                  <Text className="text-xs font-outfit-bold text-blue-600">{test.testVariant}</Text>
                </View>
              ) : (
                <View className="rounded-full bg-white/20 px-3 py-1">
                  <Text className="text-xs font-outfit-bold text-white">NA</Text>
                </View>
              )}
              <View className="flex-row items-center rounded-full bg-white/90 px-3 py-1.5">
                <Ionicons name="checkmark-circle" size={14} color={conf.iconColor} style={{ marginRight: 4 }} />
                <Text className="text-xs font-outfit-bold" style={{ color: conf.iconColor }}>
                  {conf.label}
                </Text>
              </View>
            </View>
            <View>
              <Text className="text-3xl font-outfit-extrabold text-white shadow">{test.testName}</Text>
              <Text className="mt-2 text-sm font-outfit-semibold text-white/90">
                Confidence Score: {Math.round(test.confidence * 100)}%
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      <View className="px-5 py-6">
        <Text className="mb-1 text-base text-gray-500 dark:text-gray-400">Why {test.testName} is Recommended</Text>
        <View className="mb-6 h-0.5 bg-gray-200 dark:bg-gray-700" />
        <Text className="mb-4 text-lg font-outfit-bold uppercase tracking-wide text-slate-800 dark:text-gray-200">
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

        <Text className="mb-4 text-lg font-outfit-bold uppercase tracking-wide text-slate-800 dark:text-gray-200">
          How It Supports This Case
        </Text>
        <View className="mb-8 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
          <Text className="text-sm leading-6 text-gray-700 dark:text-gray-300">{test.reasoning}</Text>
        </View>
        <TouchableOpacity
          onPress={onBack}
          className="items-center rounded-xl border border-gray-600 py-4 dark:border-gray-600"
          activeOpacity={0.7}
        >
          <Text className="text-base font-outfit-semibold text-gray-700 dark:text-gray-300">Back to Recommendations</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
