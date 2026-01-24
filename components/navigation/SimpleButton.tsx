import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { colors } from '@/constants/colors';

interface SimpleButtonProps {
  icon: LucideIcon;
  heading: string;
  subheading: string;
  onPress: () => void;
  iconColor?: string;
  iconSize?: number;
  containerColor?: string;
  iconContainerColor?: string;
}

export const SimpleButton = React.memo(
  ({
    icon: Icon,
    heading,
    subheading,
    onPress,
    iconColor = 'white',
    iconSize = 40,
    containerColor = colors.light.cardBackground,
    iconContainerColor = colors.common.accent,
  }: SimpleButtonProps) => {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
      <TouchableOpacity
        activeOpacity={1}
        style={[styles.container, { backgroundColor: isDark ? colors.dark.cardBackground : containerColor }]}
        onPress={onPress}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconContainerColor }]}>
          <Icon color={iconColor} size={iconSize} strokeWidth={1.7} />
        </View>

        <Text style={[styles.heading, { color: isDark ? colors.dark.text : colors.light.text }]}>{heading}</Text>
        <Text style={[styles.subheading, { color: isDark ? colors.dark.textSecondary : colors.light.textTertiary }]}>
          {subheading}
        </Text>
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    borderRadius: 50, // RN can't use '50%'
    padding: 12,
    marginBottom: 12,
  },
  heading: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 12,
    textAlign: 'center',
  },
});
