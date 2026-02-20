import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { Question } from './index';

interface QuestionCardProps {
  question: Question;
  currentAnswer?: string | string[];
  onAnswer: (answer: string | string[]) => void;
  onBack: () => void;
  showBack: boolean;
}

export function QuestionCard({ question, currentAnswer, onAnswer, onBack, showBack }: QuestionCardProps) {
  const [textValue, setTextValue] = useState(typeof currentAnswer === 'string' ? currentAnswer : '');
  const [selectedOptions, setSelectedOptions] = useState<string[]>(Array.isArray(currentAnswer) ? currentAnswer : []);

  const handleSingleChoice = (option: string) => {
    onAnswer(option);
  };

  const handleMultiChoice = (option: string) => {
    const newSelection = selectedOptions.includes(option)
      ? selectedOptions.filter(o => o !== option)
      : [...selectedOptions, option];
    setSelectedOptions(newSelection);
  };

  const handleTextSubmit = () => {
    if (textValue.trim()) {
      onAnswer(textValue.trim());
    }
  };

  const isMultiChoiceValid = selectedOptions.length > 0;

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 px-5 py-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Category Badge */}
        <View className="mb-4">
          <View className="self-start rounded-full bg-blue-100 px-3 py-1 dark:bg-blue-900">
            <Text className="text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">
              {question.category}
            </Text>
          </View>
        </View>

        {/* Question Text */}
        <Text className="mb-6 text-2xl font-bold leading-tight text-slate-900 dark:text-gray-100">{question.text}</Text>

        {/* Options */}
        {question.type === 'single_choice' && (
          <View className="gap-3">
            {question.options.map(option => (
              <TouchableOpacity
                key={option}
                onPress={() => handleSingleChoice(option)}
                className={`rounded-xl border-2 p-4 ${
                  currentAnswer === option
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                }`}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`text-base font-medium ${
                      currentAnswer === option
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-slate-900 dark:text-gray-100'
                    }`}
                  >
                    {option}
                  </Text>
                  {currentAnswer === option && (
                    <View className="h-6 w-6 items-center justify-center rounded-full bg-blue-500 dark:bg-blue-400">
                      <Text className="text-xs font-bold text-white">✓</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {question.type === 'multi_choice' && (
          <View className="gap-3">
            {question.options.map(option => {
              const isSelected = selectedOptions.includes(option);
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => handleMultiChoice(option)}
                  className={`rounded-xl border-2 p-4 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30'
                      : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                  }`}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-between">
                    <Text
                      className={`flex-1 text-base font-medium ${
                        isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-gray-100'
                      }`}
                    >
                      {option}
                    </Text>
                    <View
                      className={`h-6 w-6 items-center justify-center rounded ${
                        isSelected ? 'bg-blue-500 dark:bg-blue-400' : 'border-2 border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {isSelected && <Text className="text-xs font-bold text-white">✓</Text>}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {question.type === 'text' && (
          <View>
            <TextInput
              value={textValue}
              onChangeText={setTextValue}
              placeholder="Type your answer here..."
              placeholderTextColor="#9CA3AF"
              className="rounded-xl border-2 border-gray-200 bg-white p-4 text-base text-slate-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              autoFocus
            />
          </View>
        )}
      </ScrollView>

      {/* Footer Buttons */}
      <View className="border-t border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-800">
        <View className="flex-row gap-3">
          {showBack && (
            <TouchableOpacity
              onPress={onBack}
              className="flex-1 justify-center rounded-xl border-2 border-gray-300 bg-white py-4 dark:border-gray-600 dark:bg-gray-700"
              activeOpacity={0.7}
            >
              <Text className="text-center text-base font-semibold text-gray-700 dark:text-gray-200">Back</Text>
            </TouchableOpacity>
          )}

          {question.type === 'multi_choice' && (
            <TouchableOpacity
              onPress={() => onAnswer(selectedOptions)}
              disabled={!isMultiChoiceValid}
              className={`flex-1 justify-center rounded-xl  py-4 ${
                isMultiChoiceValid ? 'bg-blue-500 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-700'
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-center text-base font-semibold ${
                  isMultiChoiceValid ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Continue
              </Text>
            </TouchableOpacity>
          )}

          {question.type === 'text' && (
            <TouchableOpacity
              onPress={handleTextSubmit}
              disabled={!textValue.trim()}
              className={`flex-1 rounded-xl py-4 ${
                textValue.trim() ? 'bg-blue-500 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-700'
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-center text-base font-semibold ${
                  textValue.trim() ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Continue
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
