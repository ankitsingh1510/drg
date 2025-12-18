import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import tips from './tips';

export default function TipOfTheDay() {
  const getRandomTip = () => tips[Math.floor(Math.random() * tips.length)];

  const [currentTip, setCurrentTip] = useState(getRandomTip());

  return (
    <View style={styles.container}>
      {/* <View className="h-20 w-20 items-center justify-center self-center rounded-full border border-gray-300 bg-white"> */}
      <Text className="self-center p-2 text-center text-3xl">{currentTip.emoji}</Text>
      {/* </View> */}

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

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: 'white',
    margin: 16,
  },
});
