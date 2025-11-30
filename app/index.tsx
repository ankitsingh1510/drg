import { ActivityIndicator, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <View className="absolute inset-0 items-center justify-center bg-gray-50/80">
          <ActivityIndicator size="large" color="#daa521" />
          <Text className="mt-2 text-lg text-slate-600">Loading</Text>
        </View>
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? '/patients' : '/login'} />;
}
