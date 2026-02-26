import React, { useEffect, useState } from 'react';
import { ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch } from '@/services/fetchClient';
import type { SuggestedTest } from './index';
import { TestDetailScreen } from './TestDetailScreen';

type TestData = {
  fileName: string;
  title: string;
  summary: string;
  image: string;
};

interface ResultScreenProps {
  suggestedTests: SuggestedTest[];
  onClose: () => void;
  onRestart: () => void;
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

// Card background colors based on confidence
const getCardHeaderBg = (confidence: number): string => {
  if (confidence >= 0.8) return '#1a365d';
  if (confidence >= 0.4) return '#3d2e1f';
  return '#2d2d3d';
};

export function ResultScreen({ suggestedTests, onClose, onRestart }: ResultScreenProps) {
  const [selectedTest, setSelectedTest] = useState<SuggestedTest | null>(null);
  const [selectedTestImage, setSelectedTestImage] = useState<string>('');
  const [testImages, setTestImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchTestImages = async () => {
      try {
        const response = await apiFetch('https://nandiraju.github.io/lab_tests/tests.json');
        const imageMap: Record<string, string> = {};
        response?.data?.forEach((test: TestData) => {
          const baseTitle = test.title.split('–')[0].trim().toLowerCase();
          imageMap[baseTitle] = test.image;
          imageMap[test.title.toLowerCase()] = test.image;
        });
        setTestImages(imageMap);
      } catch (err) {
        console.error('Error fetching test images:', err);
      }
    };
    fetchTestImages();
  }, []);

  const getTestImage = (testName: string): string => {
    const normalizedName = testName.toLowerCase();
    if (testImages[normalizedName]) {
      return testImages[normalizedName];
    }
    const baseName = testName.split(/\s+/)[0].toLowerCase();
    if (testImages[baseName]) {
      return testImages[baseName];
    }
    return 'https://nandiraju.github.io/lab_tests/card_images/indx.png';
  };

  // Sort tests by confidence descending
  const sortedTests = [...suggestedTests].sort((a, b) => b.confidence - a.confidence);

  // Count total parameters (based on the question count)
  const totalParameters = 14;

  // Parse reasoning into short bullet points (first 3 sentences)
  const getShortBullets = (reasoning: string): string[] => {
    if (!reasoning) return [];
    const sentences = reasoning.split(/\.\s+/).filter(s => s.trim().length > 0);
    return sentences.slice(0, 3).map(s => s.replace(/\.$/, '').trim());
  };

  // If a test is selected, show the detail screen
  if (selectedTest) {
    return <TestDetailScreen test={selectedTest} testImage={selectedTestImage} onBack={() => setSelectedTest(null)} />;
  }

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="px-5 py-6">
        {/* AI Analysis Banner */}
        <View className="mb-4 flex-row items-center rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/20">
          <View className="mr-3 h-6 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
            <Ionicons name="checkmark-circle-outline" size={20} color="#10b981" />
          </View>
          <Text className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Based on analysis of <Text className="font-bold">{totalParameters} clinical parameters.</Text>
          </Text>
        </View>

        {/* Recommendations Header */}
        <View className="mb-4 flex-row items-center">
          <Ionicons name="sparkles" size={22} color="#eab308" style={{ marginRight: 8 }} />
          <Text className="text-sm font-bold uppercase tracking-widest text-yellow-600 dark:text-yellow-500">
            Recommendations
          </Text>
        </View>

        {/* Test Cards */}
        {sortedTests.map((test, index) => {
          const conf = getConfidenceInfo(test.confidence);
          const bullets = getShortBullets(test.reasoning);
          const testImage = getTestImage(test.testName);

          return (
            <View
              key={`${test.testName}-${index}`}
              className="mb-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <View className="h-[100px] w-full overflow-hidden rounded-t-2xl">
                <ImageBackground source={{ uri: testImage }} resizeMode="cover" className="flex-1">
                  <View className="absolute inset-0 bg-black/30" />
                  <View className="flex-1 justify-between px-4 pb-4 pt-4">
                    <View className="flex-row items-center justify-between">
                      {test.testVariant ? (
                        <View className="rounded-full bg-white/90 px-3 py-1">
                          <Text className="text-xs font-bold text-blue-600">{test.testVariant}</Text>
                        </View>
                      ) : (
                        <View className="rounded-full bg-white/20 px-3 py-1">
                          <Text className="text-xs font-bold text-white">NA</Text>
                        </View>
                      )}
                      <View className="flex-row items-center rounded-full bg-white/90 px-3 py-1.5">
                        <Ionicons name="checkmark-circle" size={14} color={conf.iconColor} style={{ marginRight: 4 }} />
                        <Text className="text-xs font-bold" style={{ color: conf.iconColor }}>
                          {conf.label}
                        </Text>
                      </View>
                    </View>

                    {/* Test Name at bottom */}
                    <Text className="text-3xl font-extrabold text-white shadow">{test.testName}</Text>
                  </View>
                </ImageBackground>
              </View>

              {/* Card Body: bullet points + link */}
              <View className="px-4 pb-4 pt-3">
                {/* Reasoning Bullets */}
                {bullets.map((bullet, bIndex) => (
                  <View key={bIndex} className="mb-1 flex-row">
                    <Text className="mr-2 text-gray-400 dark:text-gray-500">•</Text>
                    <Text className="flex-1 text-sm leading-5 text-gray-600 dark:text-gray-400">{bullet}</Text>
                  </View>
                ))}

                {/* View Detailed Recommendation */}
                <TouchableOpacity
                  onPress={() => {
                    setSelectedTest(test);
                    setSelectedTestImage(testImage);
                  }}
                  className="mt-2 flex-row items-center"
                  activeOpacity={0.7}
                >
                  <Text className="mr-1 text-sm font-semibold text-yellow-600 dark:text-yellow-500">
                    View Detailed Recommendation
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#ca8a04" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
