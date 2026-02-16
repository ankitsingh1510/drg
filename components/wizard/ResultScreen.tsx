import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { Recommendation, Score } from './index';

interface ResultScreenProps {
  recommendation: Recommendation;
  scores: Score[];
  onClose: () => void;
  onRestart: () => void;
}

export function ResultScreen({ recommendation, scores, onClose, onRestart }: ResultScreenProps) {
  const getConfidenceColor = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case 'high':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
    >
      {/* Success Icon */}
      <View className="mb-6 items-center">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <Text className="text-4xl">✓</Text>
        </View>
        <Text className="mt-4 text-2xl font-bold text-slate-900 dark:text-gray-100">Recommendation Ready</Text>
      </View>

      {/* Main Recommendation Card */}
      <View className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">Recommended Test</Text>
          <View className={`rounded-full px-3 py-1 ${getConfidenceColor(recommendation.confidence)}`}>
            <Text className="text-xs font-bold uppercase">{recommendation.confidence} Confidence</Text>
          </View>
        </View>

        <Text className="mb-2 text-2xl font-bold text-slate-900 dark:text-gray-100">{recommendation.testName}</Text>

        {recommendation.testVariant && (
          <View className="mb-4 self-start rounded-lg bg-blue-50 px-3 py-1 dark:bg-blue-900/30">
            <Text className="text-sm font-semibold text-blue-700 dark:text-blue-300">{recommendation.testVariant}</Text>
          </View>
        )}

        <View className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
          <Text className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Reasoning</Text>
          <Text className="leading-6 text-gray-600 dark:text-gray-400">{recommendation.reasoning}</Text>
        </View>
      </View>

      {/* Alternative Scores */}
      {scores && scores.length > 0 && (
        <View className="mb-6">
          <Text className="mb-4 text-lg font-bold text-slate-900 dark:text-gray-100">All Test Matches</Text>

          {scores.map((score, index) => (
            <View
              key={`${score.testName}-${score.variant || index}`}
              className="mb-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-slate-900 dark:text-gray-100">{score.testName}</Text>
                  {score.variant && (
                    <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">{score.variant}</Text>
                  )}
                </View>
                <View className="items-end">
                  <Text className={`text-2xl font-bold ${getScoreColor(score.score)}`}>{score.score}</Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">Match Score</Text>
                </View>
              </View>

              {/* Score Bar */}
              <View className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                <View
                  className={`h-full ${
                    score.score >= 80
                      ? 'bg-green-500 dark:bg-green-400'
                      : score.score >= 60
                        ? 'bg-yellow-500 dark:bg-yellow-400'
                        : 'bg-orange-500 dark:bg-orange-400'
                  }`}
                  style={{ width: `${score.score}%` }}
                />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View className="mt-4 gap-3">
        <TouchableOpacity
          onPress={onClose}
          className="rounded-xl bg-blue-500 py-4 dark:bg-blue-400"
          activeOpacity={0.7}
        >
          <Text className="text-center text-base font-semibold text-white">Place Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onRestart}
          className="rounded-xl border-2 border-gray-300 bg-white py-4 dark:border-gray-600 dark:bg-gray-700"
          activeOpacity={0.7}
        >
          <Text className="text-center text-base font-semibold text-gray-700 dark:text-gray-200">Start Over</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
