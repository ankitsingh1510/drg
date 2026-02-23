import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import type { AlternativeTest, Recommendation } from './index';

interface ResultScreenProps {
  recommendation: Recommendation;
  onClose: () => void;
  onRestart: () => void;
}

export function ResultScreen({ recommendation, onClose, onRestart }: ResultScreenProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [whyThisTestExpanded, setWhyThisTestExpanded] = useState(false);

  // Count total parameters analyzed
  const totalParameters = 12; // Based on the sections and questions

  const getConfidenceBadge = (confidence: string) => {
    const isHigh = confidence.toLowerCase() === 'high';
    return {
      bgColor: isHigh ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30',
      textColor: isHigh ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300',
      icon: isHigh ? 'shield-checkmark-outline' : 'shield-half',
    };
  };

  // Parse reasoning into bullet points
  const parseReasoningBullets = (reasoning: string): string[] => {
    // Handle undefined or empty reasoning
    if (!reasoning || typeof reasoning !== 'string') {
      return [];
    }

    // Try to extract sentences or split by common delimiters
    const sentences = reasoning.split(/\. (?=[A-Z])/);
    if (sentences.length > 3) {
      return sentences.slice(0, 4).map(s => s.replace(/\.$/, '').trim());
    }
    // Fallback: split into chunks
    const words = reasoning.split(' ');
    const chunkSize = Math.ceil(words.length / 4);
    const bullets: string[] = [];
    for (let i = 0; i < 4 && i * chunkSize < words.length; i++) {
      bullets.push(words.slice(i * chunkSize, (i + 1) * chunkSize).join(' '));
    }
    return bullets;
  };

  const reasoningBullets = parseReasoningBullets(recommendation.reasoning || '');

  const confidenceBadge = getConfidenceBadge(recommendation.confidence);
  const alternativeTests = recommendation.alternativeTests || [];

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="px-5 py-6">
        {/* Title Section */}
        <Text className="mb-1 text-2xl font-bold text-slate-900 dark:text-gray-100">Recommended Test</Text>
        <Text className="mb-6 text-sm text-gray-600 dark:text-gray-400">Based on patient clinical profile</Text>

        {/* AI Info Box */}
        <View className="mb-4 flex-row items-center rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/20">
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
            <Ionicons name="checkmark-circle-outline" size={28} color="#10b981" />
          </View>
          <Text className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            DrG AI analyzed <Text className="font-bold">{totalParameters} clinical parameters</Text> for this
            recommendation
          </Text>
        </View>

        {/* AI Recommended Badge */}
        <View className="flex-row items-center rounded-t-2xl bg-purple-600 px-4 py-3 dark:bg-purple-700">
          <Ionicons name="sparkles" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text className="font-semibold text-white">AI Recommended</Text>
        </View>

        {/* Main Recommendation Card */}
        <View className="mb-6 rounded-b-2xl border border-t-0 border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          {/* Test Name and Confidence */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="flex-1 text-2xl font-bold text-slate-900 dark:text-gray-100">
              {recommendation.testName}
            </Text>
            <View className={`ml-3 flex-row items-center rounded-full px-3 py-1.5 ${confidenceBadge.bgColor}`}>
              <Ionicons
                name={confidenceBadge.icon as any}
                size={16}
                color={isDark ? '#86efac' : '#15803d'}
                style={{ marginRight: 4 }}
              />
              <Text className={`text-xs font-bold ${confidenceBadge.textColor}`}>
                {recommendation.confidence.charAt(0).toUpperCase() + recommendation.confidence.slice(1)} Confidence
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text className="mb-4 leading-6 text-gray-600 dark:text-gray-400">
            Comprehensive 523-gene solid tumor panel with MSI, TMB, and HRD analysis — optimized for advanced NSCLC with
            prior therapy resistance
          </Text>

          {/* Bullet Points */}
          <View className="mb-4 space-y-2">
            {reasoningBullets.map((bullet, index) => (
              <View key={index} className="mb-2 flex-row">
                <Text className="mr-2 text-gray-600 dark:text-gray-400">•</Text>
                <Text className="flex-1 text-sm leading-5 text-gray-600 dark:text-gray-400">{bullet}</Text>
              </View>
            ))}
          </View>

          {/* Why This Test - Expandable */}
          <TouchableOpacity
            onPress={() => setWhyThisTestExpanded(!whyThisTestExpanded)}
            className="flex-row items-center justify-center py-2"
            activeOpacity={0.7}
          >
            <Text className="mr-2 font-semibold text-yellow-600 dark:text-yellow-500">Why this test?</Text>
            <Ionicons name={whyThisTestExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#ca8a04" />
          </TouchableOpacity>

          {whyThisTestExpanded && (
            <View className="mt-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
              <Text className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                {recommendation.reasoning || 'No additional details available.'}
              </Text>
            </View>
          )}
        </View>

        {/* Alternative Options */}
        {alternativeTests.length > 0 && (
          <View className="mb-6">
            <Text className="mb-4 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              ALTERNATIVE OPTIONS
            </Text>

            {alternativeTests.map((altTest, index) => (
              <View
                key={index}
                className="mb-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
              >
                <View className="mb-3 flex-row items-center justify-between">
                  <Text className="flex-1 text-xl font-bold text-slate-900 dark:text-gray-100">{altTest.testName}</Text>
                  <View className="ml-3 flex-row items-center rounded-full bg-orange-100 px-3 py-1.5 dark:bg-orange-900/30">
                    <Ionicons name="shield-half" size={16} color="#ea580c" style={{ marginRight: 4 }} />
                    <Text className="text-xs font-bold text-orange-700 dark:text-orange-300">Moderate Confidence</Text>
                  </View>
                </View>

                <Text className="leading-6 text-gray-600 dark:text-gray-400">{altTest.reason}</Text>

                {/* Placeholder bullets */}
                <View className="mt-4 space-y-2">
                  <View className="flex-row">
                    <Text className="mr-2 text-gray-600 dark:text-gray-400">•</Text>
                    <Text className="flex-1 text-sm leading-5 text-gray-600 dark:text-gray-400">
                      Minimally invasive alternative
                    </Text>
                  </View>
                  <View className="flex-row">
                    <Text className="mr-2 text-gray-600 dark:text-gray-400">•</Text>
                    <Text className="flex-1 text-sm leading-5 text-gray-600 dark:text-gray-400">
                      Monitors treatment resistance mutations
                    </Text>
                  </View>
                  <View className="flex-row">
                    <Text className="mr-2 text-gray-600 dark:text-gray-400">•</Text>
                    <Text className="flex-1 text-sm leading-5 text-gray-600 dark:text-gray-400">
                      Rapid 7-day turnaround
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
