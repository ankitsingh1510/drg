import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import NetworkLogger from 'react-native-network-logger';

const NetworkLoggers = () => {
  const [visible, setVisible] = useState(false);

  return (
    <View className="flex-1">
      {!visible && (
        <Pressable
          onPress={() => setVisible(true)}
          className="absolute bottom-10 right-5 z-50 rounded-full bg-red-600 px-4 py-2"
        >
          <Text className="font-semibold text-white">LOGS</Text>
        </Pressable>
      )}

      {visible && (
        <View className="absolute inset-0 z-50 bg-white">
          {/* Close Button */}
          <Pressable onPress={() => setVisible(false)} className="border-b border-gray-300 bg-gray-200 p-3">
            <Text className="font-semibold">Close</Text>
          </Pressable>

          {/* Network Logger UI */}
          <NetworkLogger />
        </View>
      )}
    </View>
  );
};

export default NetworkLoggers;
