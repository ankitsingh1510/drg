import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { apiFetch } from '@/services/fetchClient';
import type { Question, RecommendationResponse } from './index';
import { QuestionCard } from './QuestionCard';
import { ResultScreen } from './ResultScreen';

const STATIC_QUESTIONS: Question[] = [
  {
    id: 'patientGender',
    text: "What is the patient's gender?",
    type: 'single_choice',
    options: ['Male', 'Female', 'Other'],
    category: 'demographics',
    dependsOn: null,
  },
  {
    id: 'patientAge',
    text: "What is the patient's age group?",
    type: 'single_choice',
    options: ['<50', '>50'],
    category: 'demographics',
    dependsOn: null,
  },
  {
    id: 'familyHistory',
    text: 'Does the patient have a family history of cancer?',
    type: 'single_choice',
    options: ['Yes', 'No', 'Unknown'],
    category: 'demographics',
    dependsOn: null,
  },
  {
    id: 'familyHistoryRelation',
    text: 'Which family members have a history of cancer?',
    type: 'multi_choice',
    options: ['Parents', 'Grandparents', 'Siblings'],
    category: 'demographics',
    dependsOn: { questionId: 'familyHistory', value: ['Yes'] },
  },
  {
    id: 'initialDiagnosis',
    text: 'What is the initial diagnosis?',
    type: 'text',
    options: [],
    category: 'disease_info',
    dependsOn: null,
  },
  {
    id: 'stage',
    text: 'What is the cancer stage?',
    type: 'single_choice',
    options: ['I', 'II', 'III', 'IV'],
    category: 'disease_info',
    dependsOn: null,
  },
  {
    id: 'priorLinesOfTreatment',
    text: 'What are the prior lines of treatment?',
    type: 'single_choice',
    options: ['1L', '2L+'],
    category: 'disease_info',
    dependsOn: null,
  },
  {
    id: 'caseOf',
    text: 'Is this a case of Dual Primary, Recurrence, or Relapse?',
    type: 'single_choice',
    options: ['Dual Primary', 'Recurrence', 'Relapse', 'None'],
    category: 'disease_info',
    dependsOn: null,
  },
  {
    id: 'conflictInOrigin',
    text: 'Is there a conflict in origin?',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'disease_info',
    dependsOn: null,
  },
  {
    id: 'firstLineTreatmentResistance',
    text: 'Was 1st line treatment resistance encountered?',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'disease_info',
    dependsOn: null,
  },
  {
    id: 'surgicalTreatmentDone',
    text: 'Was surgical treatment done?',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'disease_info',
    dependsOn: null,
  },
  {
    id: 'naCtRtTt',
    text: 'Is NA CT/RT/TT being administered?',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'disease_info',
    dependsOn: null,
  },
  {
    id: 'multipleLinesTreatmentFailure',
    text: 'Was multiple lines treatment failure encountered?',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'disease_info',
    dependsOn: null,
  },
  {
    id: 'specimenAvailable',
    text: 'What specimen is available for testing?',
    type: 'multi_choice',
    options: ['Tissue', 'Blood', 'Urine', 'Pleural fluid', 'CSF', 'Ascitic fluid'],
    category: 'medical_challenge',
    dependsOn: null,
  },
  {
    id: 'lookingForNeoadjuvant',
    text: 'Looking for neoadjuvant options for treatment initiation?',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'medical_challenge',
    dependsOn: null,
  },
  {
    id: 'lookingForPostSurgicalSurveillance',
    text: 'Looking for post-surgical surveillance?',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'medical_challenge',
    dependsOn: null,
  },
  {
    id: 'lookingForTherapeuticSurveillance',
    text: 'Looking for therapeutic surveillance?',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'medical_challenge',
    dependsOn: null,
  },
  {
    id: 'lookingForHistopathologicalClarity',
    text: 'Looking for conflicting histopathological clarity?',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'medical_challenge',
    dependsOn: null,
  },
  {
    id: 'lookingForImmunotherapy',
    text: 'Looking for therapeutic feasibility to use Immunotherapy?',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'medical_challenge',
    dependsOn: null,
  },
  {
    id: 'lookingForPARPi',
    text: 'Looking for therapeutic feasibility to use PARPi?',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'medical_challenge',
    dependsOn: null,
  },
  {
    id: 'lookingForHRDScore',
    text: 'Looking for HRD score?',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'medical_challenge',
    dependsOn: null,
  },
  {
    id: 'lookingForGermline',
    text: 'Looking for germline testing?',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'medical_challenge',
    dependsOn: null,
  },
  {
    id: 'lookingForMolecularSolution',
    text: 'Looking for molecular solution for recurrent/aggressive disease?',
    type: 'single_choice',
    options: ['Yes', 'No'],
    category: 'medical_challenge',
    dependsOn: { questionId: 'multipleLinesTreatmentFailure', value: ['Yes'] },
  },
];

interface OrderWizardProps {
  visible: boolean;
  onClose: () => void;
}

export default function OrderWizard({ visible, onClose }: OrderWizardProps) {
  const [questions, setQuestions] = useState<Question[]>(STATIC_QUESTIONS);
  const [currentIdx, setCurrentIdx] = useState(0);
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

  const currentQ = visibleQuestions[currentIdx];
  const isLastQuestion = currentIdx >= visibleQuestions.length - 1;

  // Handle answer selection
  const onAnswer = (answer: string | string[]) => {
    const newAnswers = { ...answers, [currentQ.id]: answer };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      submitAnswers(newAnswers);
    } else {
      setCurrentIdx(i => i + 1);
    }
  };

  // Handle going back to previous question
  const onBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx(i => i - 1);
    }
  };

  // Submit all answers and get recommendation
  const submitAnswers = async (allAnswers: Record<string, string | string[]>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/v1/drg/order-wizard/recommend`, {
        method: 'POST',
        body: JSON.stringify({ answers: allAnswers }),
      });
      setResult(response.data.data);
    } catch (err) {
      console.error('Error getting recommendation:', err);
      setError('Failed to get recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset wizard state
  const resetWizard = () => {
    setCurrentIdx(0);
    setAnswers({});
    setResult(null);
    setError(null);
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <SafeAreaView className="flex-1 bg-[#FDF5E6] dark:bg-gray-900">
        {/* Header */}
        <View className="border-b border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-800">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-slate-900 dark:text-gray-100">Order Wizard</Text>
            <TouchableOpacity
              onPress={handleClose}
              className="h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"
            >
              <Text className="text-lg font-semibold text-slate-900 dark:text-gray-100">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          {!result && visibleQuestions.length > 0 && (
            <View className="mt-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  Question {currentIdx + 1} of {visibleQuestions.length}
                </Text>
                <Text className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {Math.round(((currentIdx + 1) / visibleQuestions.length) * 100)}%
                </Text>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <View
                  className="h-full bg-blue-500 dark:bg-blue-400"
                  style={{
                    width: `${((currentIdx + 1) / visibleQuestions.length) * 100}%`,
                  }}
                />
              </View>
            </View>
          )}
        </View>

        {/* Content */}
        {loading && !result ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.common.primary} />
            <Text className="mt-4 text-gray-600 dark:text-gray-400">
              {questions.length === 0 ? 'Loading questions...' : 'Getting recommendation...'}
            </Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="mb-4 text-center text-base text-red-600 dark:text-red-400">{error}</Text>
            <TouchableOpacity
              onPress={() => {
                setError(null);
                // fetchQuestions();
              }}
              className="rounded-lg bg-blue-500 px-6 py-3"
            >
              <Text className="font-semibold text-white">Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : result ? (
          <ResultScreen
            recommendation={result.recommendation}
            scores={result.scores}
            onClose={handleClose}
            onRestart={resetWizard}
          />
        ) : currentQ ? (
          <QuestionCard
            question={currentQ}
            currentAnswer={answers[currentQ.id]}
            onAnswer={onAnswer}
            onBack={onBack}
            showBack={currentIdx > 0}
          />
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}
