import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const HeadingDivider = ({ iconName, title, hideRightIcon, onRightButton }: any) => {
  return (
    <View className="mx-[15px] mb-3.5 flex-row items-center justify-between border-b border-gray-300 pb-2">
      <View className="flex-1 flex-row items-center gap-2">
        <Ionicons name={iconName} size={24} color="dodgerblue" />
        <Text className="font-poppins-semibold text-lg font-bold text-gray-600">{title}</Text>
      </View>
      {!hideRightIcon && (
        <TouchableOpacity onPress={onRightButton}>
          <Ionicons name="arrow-forward-outline" size={24} color="dodgerblue" />
        </TouchableOpacity>
      )}
    </View>
  );
};
