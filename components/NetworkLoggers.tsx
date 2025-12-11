import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import NetworkLogger from 'react-native-network-logger';

const NetworkLoggers = () => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {/* Floating LOGS Button */}
      {!visible && (
        <Pressable
          onPress={() => setVisible(true)}
          style={{
            position: 'absolute',
            bottom: 40,
            right: 20,
            backgroundColor: 'red',
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 30,
            zIndex: 999,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>LOGS</Text>
        </Pressable>
      )}

      {/* Logger Overlay */}
      {visible && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#fff',
            zIndex: 1000,
          }}
        >
          {/* Close Button */}
          <Pressable
            onPress={() => setVisible(false)}
            style={{
              padding: 12,
              backgroundColor: '#eee',
              borderBottomWidth: 1,
              borderColor: '#ccc',
            }}
          >
            <Text style={{ fontWeight: '600' }}>Close</Text>
          </Pressable>

          {/* Actual Network Logger UI */}
          <NetworkLogger />
        </View>
      )}
    </View>
  );
};

export default NetworkLoggers;
