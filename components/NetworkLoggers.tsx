import React, { useCallback, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import NetworkLogger from 'react-native-network-logger';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const NetworkLoggers = () => {
  const [visible, setVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const openLogger = useCallback(() => setVisible(true), []);
  const closeLogger = useCallback(() => setVisible(false), []);

  return (
    <>
      {!visible && (
        <Pressable
          onPress={openLogger}
          style={{
            bottom: insets.bottom + 24,
            right: 24,
          }}
          className="absolute z-50 rounded-full bg-red-600 px-4 py-2"
        >
          <Text className="font-semibold text-white">LOGS</Text>
        </Pressable>
      )}

      <Modal animationType="slide" visible={visible} presentationStyle="fullScreen" onRequestClose={closeLogger}>
        <View className="flex-1 bg-white">
          <View
            style={{
              paddingTop: insets.top + 8,
            }}
            className="flex-row items-center justify-between border-b border-gray-200 px-5 pb-3"
          >
            <Text className="text-base font-semibold">Network Logs</Text>
            <Pressable onPress={closeLogger}>
              <Text className="font-semibold text-red-600">Close</Text>
            </Pressable>
          </View>

          <View className="flex-1">
            <NetworkLogger />
          </View>

          <SafeAreaView edges={['bottom']} />
        </View>
      </Modal>
    </>
  );
};

export default NetworkLoggers;
