import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import RNBlobUtil from 'react-native-blob-util';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { extractFromDocumentByS3Key, getRecommendation } from '@/services/orderWizard';
import { storageAPI } from '@/services/storage';
import { pickDocument, pickImage } from '@/util/documentPicker';
import { calculateCRC32C } from '@/util/helpers';
import { type Question, type RecommendationResponse, STATIC_QUESTIONS, type SuggestedTest } from './index';
import { ResultScreen } from './ResultScreen';
import { UploadOptionsModal } from './UploadOptionsModal';

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
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const visibleQuestions = questions.filter(q => {
    if (!q.dependsOn) return true;
    const parentAnswer = answers[q.dependsOn.questionId];
    if (!parentAnswer) return false;
    if (Array.isArray(parentAnswer)) {
      return parentAnswer.some(a => q.dependsOn!.value.includes(a));
    }
    return q.dependsOn.value.includes(parentAnswer);
  });

  const sections = visibleQuestions.reduce(
    (acc, q) => {
      const section = q.section || 'Other';
      if (!acc[section]) acc[section] = [];
      acc[section].push(q);
      return acc;
    },
    {} as Record<string, Question[]>
  );

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const toggleSingleChoice = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

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

  const clearAll = () => {
    setAnswers({});
  };

  const submitAnswers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecommendation(answers);
      // console.log('AI recommendation=->', data);
      if (data?.statusCode === 200 && Array.isArray(data?.suggestedTests)) {
        setResult(data);
      } else {
        setError(data?.message || 'Failed to get recommendation. Please try again.');
      }
    } catch (err) {
      console.error('Error getting recommendation:', err);
      setError('Failed to get recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (uri: string, fileName: string, mimeType: string) => {
    // Inject timestamp before the file extension
    const timestamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
    const dotIndex = fileName.lastIndexOf('.');
    fileName =
      dotIndex !== -1
        ? `${fileName.slice(0, dotIndex)}_${timestamp}${fileName.slice(dotIndex)}`
        : `${fileName}_${timestamp}`;
    try {
      setUploading(true);
      setError(null);

      try {
        const configResp = await storageAPI.getUploadConfig();
        const config = configResp?.data ?? configResp;
        const targetLocation = config?.targetLocation;
        // console.log('heree1111', targetLocation);

        if (targetLocation) {
          // Build orderwizard-specific target location
          let finalTargetLocation = String(targetLocation).replace(/\/+$/, '');
          if (!finalTargetLocation.toLowerCase().endsWith('/orderwizard')) {
            finalTargetLocation = `${finalTargetLocation}/orderwizard/`;
          }

          // Read file via RNBlobUtil (blob.arrayBuffer not supported in React Native)
          const cleanUri = uri.replace('file://', '');
          const base64 = await RNBlobUtil.fs.readFile(cleanUri, 'base64');
          const binaryStr = atob(base64);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          const fileSize = bytes.length;
          const crc32cHash = calculateCRC32C(bytes);
          // S3 requires base64-encoded CRC32C; server signs the URL with base64 value
          const crc32cBase64 = btoa(
            crc32cHash
              .match(/.{2}/g)!
              .map((byte: string) => String.fromCharCode(parseInt(byte, 16)))
              .join('')
          );
          // console.log('hereee2222', crc32cHash, crc32cBase64, fileSize, mimeType, finalTargetLocation);
          // Get pre-signed S3 URL(s) via GraphQL
          const signedUrlResult = await storageAPI.createUploadSignedUrls({
            files: [
              {
                filename: fileName,
                contentType: mimeType,
                fileSize,
                targetLocation: finalTargetLocation,
                crc32cHash: crc32cBase64,
              },
            ],
          });
          // console.log('createUploadSignedUrls result:', signedUrlResult);

          // Upload directly to S3 using the signed URL
          if (signedUrlResult?.statusCode === 200 && signedUrlResult?.data?.length > 0) {
            const { key, uploadSignedUrl } = signedUrlResult.data[0];

            console.log('Uploading directly to S3...');
            const uploadResponse = await RNBlobUtil.fetch(
              'PUT',
              uploadSignedUrl,
              {
                'Content-Type': mimeType || 'application/octet-stream',
                'x-amz-checksum-crc32c': crc32cBase64,
              },
              RNBlobUtil.wrap(cleanUri)
            );

            if (uploadResponse.info().status >= 200 && uploadResponse.info().status < 300) {
              console.log('S3 upload successful, registering upload...');

              // Register the uploaded file
              const registerResult = await storageAPI.registerSignedURLUpload({
                paths: [{ path: key }],
                isPostSignedUrlUploadCall: true,
              });

              // console.log('Registration result:', registerResult);
              setUploadedFileName(fileName);
              // console.log('s3key', key);

              // Extract answers from the uploaded document via S3 key (drg → icore_bl → icore-rag)
              try {
                const extractedData = await extractFromDocumentByS3Key(key, fileName, mimeType);
                // console.log('Extracted document data:', extractedData);

                const answersData =
                  (extractedData as any)?.data?.extractedAnswers ??
                  (extractedData as any)?.extractedAnswers ??
                  extractedData;

                if (answersData && typeof answersData === 'object' && !Array.isArray(answersData)) {
                  const mappedAnswers: Record<string, string | string[]> = {};
                  Object.entries(answersData).forEach(([key, value]) => {
                    const question = questions.find(
                      q => q.id.toLowerCase() === key.toLowerCase() || q.title.toLowerCase().includes(key.toLowerCase())
                    );
                    if (question && value) {
                      if (question.type === 'multi_choice' && Array.isArray(value)) {
                        mappedAnswers[question.id] = value as string[];
                      } else if (question.type === 'single_choice' && typeof value === 'string') {
                        mappedAnswers[question.id] = value;
                      } else if (question.type === 'text' && typeof value === 'string') {
                        mappedAnswers[question.id] = value;
                      }
                    }
                  });

                  // Replace all answers with newly extracted data
                  setAnswers(mappedAnswers);
                  const filledCount = Object.keys(mappedAnswers).length;
                  Alert.alert(
                    'Document Processed',
                    filledCount > 0
                      ? `Uploaded & auto-filled ${filledCount} answer${filledCount !== 1 ? 's' : ''} from your document.`
                      : 'Document uploaded. No answers could be extracted automatically.',
                    [{ text: 'OK' }]
                  );
                } else {
                  Alert.alert('Upload Successful', 'Document has been uploaded to the system.', [{ text: 'OK' }]);
                }
              } catch (extractErr) {
                console.warn('Document extraction failed after upload:', extractErr);
                Alert.alert(
                  'Upload Successful',
                  'Document uploaded, but automatic extraction failed — please fill answers manually.',
                  [{ text: 'OK' }]
                );
              }
            } else {
              throw new Error(`S3 upload failed with status ${uploadResponse.info().status}`);
            }
          } else {
            throw new Error(signedUrlResult?.message || 'Failed to get signed URL');
          }
        }
      } catch (err) {
        console.warn('GQL signed-URL upload skipped/failed, continuing local processing', err);
        throw err;
      }
    } catch (err: any) {
      console.error('Error extracting document:', err);
      const msg = err?.data?.message ?? err?.message ?? 'Something went wrong. Please try again.';
      Alert.alert('Upload Failed', msg, [{ text: 'OK' }]);
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentPick = async () => {
    const file = await pickDocument();
    if (file) {
      await uploadDocument(file.uri, file.name, file.mimeType);
    }
  };

  const handleImagePick = async () => {
    const image = await pickImage();
    if (image) {
      await uploadDocument(image.uri, image.name, image.mimeType);
    }
  };

  const showUploadOptions = () => {
    setShowUploadModal(true);
  };

  const resetWizard = () => {
    setAnswers({});
    setResult(null);
    setError(null);
    setUploadedFileName(null);
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
          <ResultScreen
            suggestedTests={result.suggestedTests}
            answeredQuestionsCount={answeredQuestions}
            onClose={handleClose}
            onRestart={resetWizard}
          />
        ) : (
          <>
            <ScrollView className="flex-1 px-3" showsVerticalScrollIndicator={false}>
              <View className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
                <View className="mb-3 flex-row items-center justify-between">
                  <Text className="text-s font-bold uppercase tracking-wide text-gray-700 dark:text-gray-500">
                    Upload Records
                  </Text>
                  <Text className="text-sm text-blue-600 dark:text-blue-400">upload files</Text>
                </View>

                <Text className="mb-4 text-base text-gray-700 dark:text-gray-300">
                  Upload records for automatic analysis
                </Text>

                <TouchableOpacity
                  onPress={showUploadOptions}
                  disabled={uploading}
                  className="items-center justify-center rounded-2xl border-2 border-dashed border-gray-400 bg-transparent py-6 dark:border-gray-500"
                  style={{ opacity: uploading ? 0.5 : 1 }}
                  activeOpacity={0.7}
                >
                  {uploading ? (
                    <View className="items-center">
                      <ActivityIndicator size="large" color={'#2563eb'} className="mb-3" />
                      <Text className="text-base font-semibold text-gray-700 dark:text-gray-300">Processing...</Text>
                    </View>
                  ) : uploadedFileName ? (
                    <View className="items-center px-4">
                      <Ionicons name="checkmark-circle" size={48} color="#10b981" className="mb-3" />
                      <Text className="text-center text-base font-semibold text-gray-700 dark:text-gray-300">
                        Uploaded: {uploadedFileName}
                      </Text>
                      <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400">Tap to upload another</Text>
                    </View>
                  ) : (
                    <View className="items-center">
                      <Ionicons name="cloud-upload-outline" size={64} color={isDark ? '#9ca3af' : '#6b7280'} />
                      <Text className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
                        Tap to upload documents
                      </Text>
                      <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        PDF, images, or text files supported
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View className="my-4 flex-row items-center">
                <View className="h-[1px] flex-1 bg-gray-300 dark:bg-gray-600" />
                <Text className="mx-4 text-sm font-semibold text-gray-500 dark:text-gray-400">OR</Text>
                <View className="h-[1px] flex-1 bg-gray-300 dark:bg-gray-600" />
              </View>

              <View>
                {Object.entries(sections).map(([sectionName, sectionQuestions]) => (
                  <View
                    key={sectionName}
                    className="mb-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
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
                  className={`flex-[6] flex-row items-center justify-center rounded-xl py-3.5 ${
                    uploading ? 'bg-gray-400 dark:bg-gray-600' : 'bg-yellow-500'
                  }`}
                  style={{ opacity: uploading ? 0.6 : 1 }}
                  activeOpacity={0.7}
                  disabled={uploading}
                >
                  <Ionicons name="sparkles" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text className={`text-base font-semibold text-white`}>Get Suggestions</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </SafeAreaView>
      <UploadOptionsModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSelectGallery={handleImagePick}
        onSelectFiles={handleDocumentPick}
      />
    </Modal>
  );
}
