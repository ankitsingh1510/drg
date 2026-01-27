import { ActivityIndicator, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAtom } from 'jotai';
import { colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { hasSeenOnboardingAtom } from '@/stores/onboarding';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const [hasSeenOnboarding] = useAtom(hasSeenOnboardingAtom);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0f172a]">
        <ActivityIndicator size="large" color={colors.common.primary} />
        <Text className="mt-2 text-lg text-slate-400">Loading</Text>
      </View>
    );
  }

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href={isAuthenticated ? '/landing' : '/login'} />;
}
