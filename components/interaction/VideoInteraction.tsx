import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, StyleSheet, Text, View } from 'react-native';
import { Audio } from 'expo-av';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { WebView } from 'react-native-webview';

export default function VideoInteraction({
  documentId,
  token,
  onClose,
}: {
  documentId: string;
  token: string;
  onClose?: () => void;
}) {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const screen = Dimensions.get('window');
  const BASE_WIDTH = screen.width * 0.5;
  const BASE_HEIGHT = screen.height * 0.3;
  // Minimum dimensions: 25% width, 15% height of screen
  const MIN_WIDTH = screen.width * 0.25;
  const MIN_HEIGHT = screen.height * 0.15;
  // Corresponding minimum scale (must satisfy both constraints)
  const MIN_SCALE = Math.max(MIN_WIDTH / BASE_WIDTH, MIN_HEIGHT / BASE_HEIGHT);

  // Shared values for dragging and pinch scaling
  const translateX = useSharedValue((screen.width - BASE_WIDTH) / 2);
  const translateY = useSharedValue((screen.height - BASE_HEIGHT) / 3);
  const scale = useSharedValue(1);
  const startTranslateX = useSharedValue(0);
  const startTranslateY = useSharedValue(0);
  const startScale = useSharedValue(1);

  // Pan (drag) gesture
  const panGesture = Gesture.Pan()
    .activeCursor('grab')
    .onStart(() => {
      startTranslateX.value = translateX.value;
      startTranslateY.value = translateY.value;
    })
    .onUpdate(e => {
      const nextX = startTranslateX.value + e.translationX;
      const nextY = startTranslateY.value + e.translationY;
      const boxW = BASE_WIDTH * scale.value;
      const boxH = BASE_HEIGHT * scale.value;
      const minX = -0.5 * boxW;
      const maxX = screen.width - 0.5 * boxW;
      const minY = -0.5 * boxH;
      const maxY = screen.height - 0.5 * boxH;
      translateX.value = Math.max(minX, Math.min(maxX, nextX));
      translateY.value = Math.max(minY, Math.min(maxY, nextY));
    });

  // Pinch gesture to resize width/height (using scale multiplier)
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onUpdate(e => {
      const next = startScale.value * e.scale;
      scale.value = next < MIN_SCALE ? MIN_SCALE : next;
      // Ensure after scaling, position remains within 50% overflow bounds
      const boxW = BASE_WIDTH * scale.value;
      const boxH = BASE_HEIGHT * scale.value;
      const minX = -0.5 * boxW;
      const maxX = screen.width - 0.5 * boxW;
      const minY = -0.5 * boxH;
      const maxY = screen.height - 0.5 * boxH;
      translateX.value = Math.max(minX, Math.min(maxX, translateX.value));
      translateY.value = Math.max(minY, Math.min(maxY, translateY.value));
    })
    .onEnd(() => {
      scale.value = withTiming(scale.value < MIN_SCALE ? MIN_SCALE : scale.value, { duration: 120 });
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  // Animated style applying translation and dynamic width/height via scale
  const boxStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      left: translateX.value,
      top: translateY.value,
      width: BASE_WIDTH * scale.value,
      height: BASE_HEIGHT * scale.value,
      zIndex: 999,
    };
  });

  useEffect(() => {
    requestMicrophonePermission();
  }, []);

  const requestMicrophonePermission = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status === 'granted') {
        // Configure audio session for recording
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      } else {
        Alert.alert('Microphone Permission Required', 'Please enable microphone access in settings to talk to Dr.G', [
          { text: 'OK' },
        ]);
      }
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
    }
  };

  const handleClose = () => {
    webViewRef.current?.postMessage(JSON.stringify({ type: 'END_CALL' }));
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none" className="bg-transparent">
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-lg"
          style={boxStyle}
        >
          {/* Close (X) button */}
          <View
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 20,
            }}
            pointerEvents="box-none"
          >
            <Text
              onPress={handleClose}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 12,
                color: '#6B7280',
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              ✕
            </Text>
          </View>

          {loading && (
            <View className="absolute inset-0 z-10 items-center justify-center bg-white/90">
              <ActivityIndicator size="large" color="#daa521" />
              <Text className="mt-3 text-base text-slate-600">Loading Dr.G...</Text>
            </View>
          )}
          <WebView
            ref={webViewRef}
            source={{
              uri:
                process.env.EXPO_PUBLIC_CHAT_URL +
                `?documentId=${documentId}&authorization=${encodeURIComponent(token)}`,
            }}
            style={{ flex: 1, backgroundColor: 'white' }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={err => {
              console.error('WebView error:', err.nativeEvent);
              setLoading(false);
            }}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            scalesPageToFit
            allowsInlineMediaPlayback
            allowsAirPlayForMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            allowFileAccess
            mixedContentMode="always"
            setSupportMultipleWindows={false}
            sharedCookiesEnabled
            injectedJavaScript={`
                (function () {
                  function stopAllMedia() {
                    // Stop camera & mic
                    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                      navigator.mediaDevices.getUserMedia({ audio: true, video: true })
                        .then(stream => {
                          stream.getTracks().forEach(track => track.stop());
                        })
                        .catch(() => {});
                    }

                    document.querySelectorAll('video').forEach(v => {
                      v.pause();
                      v.srcObject = null;
                      v.removeAttribute('src');
                      v.load();
                    });

                    if (window.pc) {
                      window.pc.close();
                    }

                    if (window.endCall) {
                      window.endCall();
                    }
                  }

                  document.addEventListener('message', function (event) {
                    try {
                      const data = JSON.parse(event.data);
                      if (data.type === 'END_CALL') {
                        stopAllMedia();
                      }
                    } catch (e) {}
                  });

                  document.addEventListener('click', function (e) {
                    const el = e.target.closest('button');
                    if (!el) return;

                    const label =
                      el.getAttribute('aria-label') ||
                      el.getAttribute('title') ||
                      '';

                    if (label === 'Stop Interaction') {
                      stopAllMedia();
                      window.ReactNativeWebView.postMessage(
                        JSON.stringify({ type: 'STOP_INTERACTION' })
                      );
                    }
                  });

                  const meta = document.createElement('meta');
                  meta.setAttribute('name', 'viewport');
                  meta.setAttribute(
                    'content',
                    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
                  );
                  document.head.appendChild(meta);
                })();
                true;
            `}
            onMessage={event => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === 'STOP_INTERACTION') {
                  handleClose();
                }
              } catch (e) {}
            }}
            scrollEnabled={false}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
