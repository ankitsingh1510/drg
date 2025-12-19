import { ActivityIndicator, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <View className="absolute inset-0 items-center justify-center bg-gray-50/80 dark:bg-gray-800/80">
          <ActivityIndicator size="large" color={colors.common.primary} />
          <Text className="mt-2 text-lg text-slate-600 dark:text-gray-300">Loading</Text>
        </View>
      </View>
    );
  }
  return <Redirect href={isAuthenticated ? '/landing' : '/login'} />;
  // return <Redirect href={isAuthenticated ? '/patients' : '/login'} />;
}
