import React, { useCallback, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import NetworkLogger from 'react-native-network-logger';
import { SafeAreaView } from 'react-native-safe-area-context';

const NetworkLoggers = () => {
  const [visible, setVisible] = useState(false);

  const openLogger = useCallback(() => setVisible(true), []);
  const closeLogger = useCallback(() => setVisible(false), []);

  return (
    <>
      {!visible && (
        <Pressable
          onPress={openLogger}
          style={{
            position: 'absolute',
            bottom: 100,
            right: 40,
            zIndex: 999,
          }}
          className="rounded-full bg-red-600 px-4 py-2"
        >
          <Text className="font-semibold text-white">LOGS</Text>
        </Pressable>
      )}

      <Modal animationType="slide" visible={visible} presentationStyle="fullScreen" onRequestClose={closeLogger}>
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between border-b border-gray-200 px-5 py-5">
            <Text className="text-base font-semibold">Network Logs</Text>
            <Pressable onPress={closeLogger}>
              <Text className="font-semibold text-red-600">Close</Text>
            </Pressable>
          </View>
          <View className="flex-1">
            <NetworkLogger />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

export default NetworkLoggers;
