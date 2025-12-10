import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import tips from './tips';

export default function TipOfTheDay() {
  const getRandomTip = () => tips[Math.floor(Math.random() * tips.length)];

  const [currentTip, setCurrentTip] = useState(getRandomTip());

  return (
    <View className="mb-6 rounded-lg border border-gray-100 px-4">
      <View className="h-20 w-20 items-center justify-center self-center rounded-full border border-gray-300 bg-white">
        <Text className="self-center p-2 text-center text-3xl">{currentTip.emoji}</Text>
      </View>

      <Text className="mb-3 text-center text-lg">{currentTip.tip}</Text>
      <TouchableOpacity
        className="w-[100px] self-center rounded-full bg-gray-200 px-4 py-2"
        onPress={() => setCurrentTip(getRandomTip())}
      >
        <Text className="rounded-full text-center text-sm">Next tip</Text>
      </TouchableOpacity>
    </View>
  );
}
