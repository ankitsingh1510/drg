import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconNavBar from '@/components/navigation/IconNavBar';
import { EmptyState } from '@/components/patient';
import OncoCard from '@/components/widgets/OncoCard';
import { OrderWizard } from '@/components/wizard';
import { colors } from '@/constants/colors';
import { apiFetch } from '@/services/fetchClient';

type TestData = {
  fileName: string;
  title: string;
  summary: string;
  image: string;
};

export default function TestsScreen() {
  const [data, setData] = useState<TestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [wizardVisible, setWizardVisible] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getAllTests = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('https://nandiraju.github.io/lab_tests/tests.json');
      setData(response?.data);
    } catch (err) {
      console.error('Error fetching tests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllTests();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#FDF5E6] dark:bg-gray-900">
      {/* <Animated.View
        entering={FadeInUp.duration(600).springify()}
        className="mb-4 flex-row items-center justify-between px-5"
      >
        <View className="flex-1">
          <Text className="text-2xl font-outfit-bold text-slate-900 dark:text-gray-100">Tests</Text>
        </View>
        <IconNavBar />
      </Animated.View> */}

      <Animated.View entering={FadeInUp.duration(600).springify()} className="mx-4 -mt-12 mb-6">
        <View className="rounded-2xl" style={{ backgroundColor: '#2958C2' }}>
          <View className="flex-row items-center justify-between px-5 py-6">
            <View className="flex-1">
              <View className="mb-2 items-center justify-center self-start rounded-full border border-white/30 bg-white/20 px-5 py-1">
                <Text className="text-xs font-outfit-semibold text-white">AI-POWERED</Text>
              </View>
              <Text className="text-xl font-outfit-bold text-white">Find the Right Test</Text>
              <Text className="text-m mb-1 mb-4 text-white">Get AI-based test recommendations.</Text>
              <TouchableOpacity
                className="flex-row items-center gap-1 self-start rounded-xl bg-white px-6 py-3"
                onPress={() => setWizardVisible(true)}
              >
                <Ionicons name="sparkles" size={18} color="#2958C2" />
                <Text className="px-1 font-outfit-bold" style={{ color: '#2958C2' }}>
                  Test Suggestion Wizard
                </Text>
              </TouchableOpacity>
            </View>
            <View className="h-34 absolute right-4 top-11 w-36">
              <ExpoImage
                source={require('@/assets/ai_tests.webp')}
                contentFit="cover"
                style={{ width: 139, height: 110 }}
              />
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Browse Tests */}
      <View className="mb-3 px-4">
        <Text className="text-sm font-outfit-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
          BROWSE DIAGNOSTIC TESTS
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.common.primary} />
        </View>
      ) : (
        <FlatList
          className="px-4 pb-1"
          data={data}
          keyExtractor={item => item.fileName}
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInUp.delay(index * 100)
                .duration(600)
                .springify()}
            >
              <OncoCard item={item} />
            </Animated.View>
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => <EmptyState type="no-tests" />}
        />
      )}

      <OrderWizard visible={wizardVisible} onClose={() => setWizardVisible(false)} />
    </SafeAreaView>
  );
}
