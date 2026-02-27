import React, { useEffect, useState } from 'react';
import { ActivityIndicator,Text, FlatList, TouchableOpacity, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView edges={[]} style={{ flex: 1 }} className="bg-[#FDF5E6] dark:bg-gray-900">

      <Animated.View entering={FadeInUp.duration(600).springify()} className="mx-4 mb-6">
        <View className="overflow-hidden rounded-2xl" style={{ backgroundColor: '#6B5CE7' }}>
          <View className="flex-row items-center justify-between px-5 py-6">
            <View className="flex-1">
              <View className="mb-2 self-start rounded-full border border-white/30 bg-white/20 px-4 py-0.5">
                <Text className="text-xs font-semibold text-white">AI-POWERED</Text>
              </View>
              <Text className="text-2xl font-bold text-white">Find the Right Test</Text>
              <Text className="text-m mb-1 mb-4 text-white">Get AI-based test recommendations.</Text>
              <TouchableOpacity
                className="flex-row items-center gap-1 self-start rounded bg-white px-6 py-3"
                onPress={() => setWizardVisible(true)}
              >
                <Ionicons name="sparkles" size={18} color="#6B5CE7" />
                <Text className="px-1 font-bold" style={{ color: '#6B5CE7' }}>
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
        <Text className="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
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
