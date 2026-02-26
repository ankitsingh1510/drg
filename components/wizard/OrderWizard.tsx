import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { apiFetch } from '@/services/fetchClient';
import { type Question, type RecommendationResponse, STATIC_QUESTIONS, type SuggestedTest } from './index';
import { ResultScreen } from './ResultScreen';

interface OrderWizardProps {
  visible: boolean;
  onClose: () => void;
}

export default function OrderWizard({ visible, onClose }: OrderWizardProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [questions] = useState<Question[]>(STATIC_QUESTIONS);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch questions on mount
  //   useEffect(() => {
  //     if (visible) {
  //       fetchQuestions();
  //     }
  //   }, [visible]);

  //   const fetchQuestions = async () => {
  //     try {
  //       setLoading(true);
  //       setError(null);
  //       const response = await apiFetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/v1/drg/order-wizard/questions`);
  //       setQuestions(response.data.data.questions);
  //     } catch (err) {
  //       console.error('Error fetching questions:', err);
  //       setError('Failed to load questions. Please try again.');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  // Filter visible questions based on dependsOn logic
  const visibleQuestions = questions.filter(q => {
    if (!q.dependsOn) return true;
    const parentAnswer = answers[q.dependsOn.questionId];
    if (!parentAnswer) return false;
    if (Array.isArray(parentAnswer)) {
      return parentAnswer.some(a => q.dependsOn!.value.includes(a));
    }
    return q.dependsOn.value.includes(parentAnswer);
  });

  // Group questions by section
  const sections = visibleQuestions.reduce(
    (acc, q) => {
      const section = q.section || 'Other';
      if (!acc[section]) acc[section] = [];
      acc[section].push(q);
      return acc;
    },
    {} as Record<string, Question[]>
  );

  // Handle answer selection
  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  // Toggle selection for single choice
  const toggleSingleChoice = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  // Toggle selection for multi choice
  const toggleMultiChoice = (questionId: string, option: string) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      const currentArray = Array.isArray(current) ? current : [];
      const newValue = currentArray.includes(option)
        ? currentArray.filter(o => o !== option)
        : [...currentArray, option];
      return { ...prev, [questionId]: newValue };
    });
  };

  // Clear all answers
  const clearAll = () => {
    setAnswers({});
  };

  // Submit all answers and get recommendation
  const submitAnswers = async () => {
    try {
      setLoading(true);
      setError(null);
      // const response = await apiFetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/v1/drg/order-wizard/recommend`, {
      //   method: 'POST',
      //   body: JSON.stringify({ answers: answers }),
      // });
      // console.log('AI recommendation=->', response.data.data);
      // setResult(response.data.data);
      setResult({
        suggestedTests: [
          {
            testName: 'OncoRisk',
            testVariant: null,
            confidence: 0.2,
            reasoning:
              'The patient is >50 years with unknown family history, which satisfies demographic criteria. However, the clinical objectives do not include Germline testing, which is mandatory for this test. Therefore, despite eligibility by age and history, the lack of germline intent significantly limits relevance.',
          },
          {
            testName: 'OncoTarget',
            testVariant: 'LBx',
            confidence: 0.6,
            reasoning:
              "The patient is >50 years with Stage II disease and a clinical objective of Neoadjuvant options for treatment initiation, which aligns with this test’s purpose. However, surgical treatment has already been performed and treatment resistance status is not explicitly confirmed as 'No,' creating partial uncertainty. Blood is available, so the LBx variant is appropriate, but timing may reduce ideal applicability.",
          },
          {
            testName: 'OncoIndx',
            testVariant: 'LBx',
            confidence: 0.1,
            reasoning:
              'Although the patient is >50 years and Stage II fits the stage criteria, there is no evidence of 1st line treatment resistance, which is mandatory. Additionally, the clinical objectives do not include Immunotherapy feasibility, PARPi, or HRD Score. Therefore, this test has minimal relevance in the current setting.',
          },
          {
            testName: 'OncoIndx Prime Plus',
            testVariant: 'LBx',
            confidence: 0.0,
            reasoning:
              'This test requires Stage III/IV disease, recurrence or relapse, prior treatment lines, and at least one resistance or tumor conflict condition. The patient has Stage II disease without documented recurrence or treatment failure, and the clinical objectives do not align with advanced profiling needs. Hence, this test is not applicable.',
          },
          {
            testName: 'OncoMonitor TRM',
            testVariant: null,
            confidence: 0.0,
            reasoning:
              'This test is designed for non-surgical patients under active systemic therapy with therapeutic surveillance intent. The patient has undergone surgery and there is no indication of active CT/RT/TT administration or therapeutic surveillance objective. Therefore, this test is not appropriate.',
          },
          {
            testName: 'OncoMonitor MRD',
            testVariant: null,
            confidence: 0.9,
            reasoning:
              'The patient is >50 years with Stage II disease, has undergone surgical treatment, and the clinical objective includes Post-surgical surveillance. Blood specimen is available, fulfilling all required criteria. This test is highly appropriate for minimal residual disease monitoring in the current clinical context.',
          },
        ],
      });
    } catch (err) {
      console.error('Error getting recommendation:', err);
      setError('Failed to get recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset wizard state
  const resetWizard = () => {
    setAnswers({});
    setResult(null);
    setError(null);
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  // Calculate progress
  const totalQuestions = visibleQuestions.length;
  const answeredQuestions = visibleQuestions.filter(q => answers[q.id] !== undefined).length;

  const renderQuestion = (question: Question) => {
    const currentAnswer = answers[question.id];
    const isMultiChoice = question.type === 'multi_choice';
    const isTextInput = question.type === 'text';
    const selectedOptions = Array.isArray(currentAnswer) ? currentAnswer : [];
    const isClinicalObjectives = question.section === 'CLINICAL OBJECTIVES';

    return (
      <View key={question.id} className="mb-6">
        {/* Question Title */}
        <View className="mb-3 flex-row items-start justify-between">
          <Text className="flex-1 text-base font-semibold text-slate-900 dark:text-gray-100">{question.title}</Text>
          {question.subtitle && (
            <Text className="ml-2 text-sm text-blue-500 dark:text-blue-400">{question.subtitle}</Text>
          )}
        </View>

        {/* Text Input [kept for future use] */}
        {isTextInput ? (
          <TextInput
            value={typeof currentAnswer === 'string' ? currentAnswer : ''}
            onChangeText={text => handleAnswer(question.id, text)}
            placeholder="Type your answer here..."
            placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
            className="rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-base text-slate-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        ) : isClinicalObjectives ? (
          <View className="gap-3">
            {question.options.map(option => {
              const isSelected = selectedOptions.includes(option);

              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => toggleMultiChoice(question.id, option)}
                  className={`flex-row items-center rounded-xl border-2 px-4 py-3.5 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30'
                      : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
                  }`}
                  activeOpacity={0.7}
                >
                  {/* Checkbox */}
                  <View
                    className={`mr-3 h-6 w-6 items-center justify-center rounded border-2 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400'
                        : 'border-gray-400 bg-white dark:border-gray-500 dark:bg-gray-700'
                    }`}
                  >
                    {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </View>

                  {/* Option Text */}
                  <Text
                    className={`flex-1 text-base ${
                      isSelected ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {question.options.map(option => {
              const isSelected = isMultiChoice ? selectedOptions.includes(option) : currentAnswer === option;

              return (
                <TouchableOpacity
                  key={option}
                  onPress={() =>
                    isMultiChoice ? toggleMultiChoice(question.id, option) : toggleSingleChoice(question.id, option)
                  }
                  className={`rounded-full border px-4 py-2.5 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30'
                      : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <SafeAreaView className="flex-1 bg-[#FDF5E6] dark:bg-gray-900">
        {/* Header */}
        <View className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={handleClose}
              className="mr-3 h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-gray-100 dark:bg-gray-700"
            >
              <Ionicons name="chevron-back" size={24} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
            <Text className="flex-1 text-center text-xl font-bold text-slate-900 dark:text-gray-100">Order Wizard</Text>

            <TouchableOpacity
              onPress={handleClose}
              className="ml-3 h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-gray-100 dark:bg-gray-700"
            >
              <Ionicons name="close" size={24} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          {!result && (
            <View className="mt-4 flex-row items-center">
              <View className="mr-3 h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <View
                  className="h-full bg-blue-600 dark:bg-blue-500"
                  style={{
                    width: totalQuestions > 0 ? `${(answeredQuestions / totalQuestions) * 100}%` : '0%',
                  }}
                />
              </View>
              <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                {answeredQuestions} / {totalQuestions}
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.common.primary} />
            <Text className="mt-4 text-gray-600 dark:text-gray-400">Getting recommendation...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="mb-4 text-center text-base text-red-600 dark:text-red-400">{error}</Text>
            <TouchableOpacity onPress={() => setError(null)} className="rounded-lg bg-blue-500 px-6 py-3">
              <Text className="font-semibold text-white">Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : result ? (
          <ResultScreen suggestedTests={result.suggestedTests} onClose={handleClose} onRestart={resetWizard} />
        ) : (
          <>
            <ScrollView className="flex-1 px-3" showsVerticalScrollIndicator={false}>
              <View className="py-4">
                {Object.entries(sections).map(([sectionName, sectionQuestions]) => (
                  <View
                    key={sectionName}
                    className="mb-3 rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800"
                  >
                    {/* Section Header */}
                    <Text className="text-s mb-4 font-bold uppercase tracking-wide text-gray-700 dark:text-gray-500">
                      {sectionName}
                    </Text>

                    {/* Questions in this section */}
                    {sectionQuestions.map(question => renderQuestion(question))}
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View className="border-t border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-800">
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={clearAll}
                  className="flex-[4] justify-center rounded-xl border-2 border-gray-300 bg-white py-3.5 dark:border-gray-600 dark:bg-gray-700"
                  activeOpacity={0.7}
                >
                  <Text className="text-center text-base font-semibold text-gray-700 dark:text-gray-200">
                    Clear All
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={submitAnswers}
                  // disabled={answeredQuestions / totalQuestions < 0.3} // As of now I am enabling button after 30% of questions are answered
                  // className={`flex-[6] flex-row items-center justify-center rounded-xl py-3.5 ${
                  //   answeredQuestions / totalQuestions >= 0.3 ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-600'
                  // }`}
                  className={`flex-[6] flex-row items-center justify-center rounded-xl bg-yellow-500 bg-yellow-500 py-3.5`}
                  activeOpacity={0.7}
                >
                  <Ionicons name="sparkles" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text
                    // className={`text-base font-semibold ${
                    //   answeredQuestions / totalQuestions >= 0.3 ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                    // }`}
                    className={`text-base font-semibold text-gray-500 text-white`}
                  >
                    Get Suggestions
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}
