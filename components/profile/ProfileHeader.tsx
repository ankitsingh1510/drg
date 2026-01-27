import { StyleSheet, Text, View } from 'react-native';

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  organizationName: string;
}

export default function ProfileHeader({ firstName, lastName, organizationName }: ProfileHeaderProps) {
  const firstInitial = firstName?.charAt(0).toUpperCase() || 'U';
  const lastInitial = lastName?.charAt(0).toUpperCase() || '';

  return (
    <View
      style={styles.card}
      className="justify-left mb-8 mt-2 flex-row items-center gap-6 rounded-3xl bg-white p-7 dark:bg-gray-800"
    >
      <View className="h-16 w-16 items-center justify-center rounded-full bg-blue-500 shadow-sm shadow-blue-400">
        <Text className="text-2xl font-bold tracking-tighter text-white">
          {firstInitial}
          {lastInitial}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100" numberOfLines={1}>
          {firstName} {lastName}
        </Text>
        <Text className="text-base font-medium text-gray-500 dark:text-gray-400">
          {organizationName || 'User Account'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
