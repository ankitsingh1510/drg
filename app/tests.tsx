import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconNavBar from '@/components/navigation/IconNavBar';
import { EmptyState } from '@/components/patient';
import OncoCard from '@/components/widgets/OncoCard';
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
      <Animated.View
        entering={FadeInUp.duration(600).springify()}
        className="mb-4 flex-row items-center justify-between px-5"
      >
        <View className="flex-1">
          <Text className="text-2xl font-bold text-slate-900 dark:text-gray-100">Tests</Text>
        </View>
        <IconNavBar />
      </Animated.View>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.common.primary} />
        </View>
      ) : (
        <FlatList
          className="px-4 pb-2"
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
    </SafeAreaView>
  );
}
