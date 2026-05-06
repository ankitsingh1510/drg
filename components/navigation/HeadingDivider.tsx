import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

type HDProps = {
  iconName?: string | any;
  title?: string;
  hideRightIcon?: boolean;
  onRightButton?: () => void;
};

export const HeadingDivider = ({ iconName, title, hideRightIcon, onRightButton }: HDProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="mx-[15px] mb-3 mt-2 flex-row items-center justify-between border-b border-gray-300 pb-2 dark:border-gray-600">
      <View className="flex-1 flex-row items-center gap-2">
        <Ionicons name={iconName} size={24} color={isDark ? '#60a5fa' : 'dodgerblue'} />
        <Text className="font-outfit-semibold flex-1 text-lg font-bold text-gray-900 dark:text-gray-100">{title}</Text>
      </View>
      {!hideRightIcon && (
        <TouchableOpacity onPress={onRightButton}>
          <Ionicons name="arrow-forward-outline" size={24} color={isDark ? '#60a5fa' : 'dodgerblue'} />
        </TouchableOpacity>
      )}
    </View>
  );
};
