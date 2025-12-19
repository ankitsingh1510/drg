// IconButtonCard.js
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Home } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { colors } from '@/constants/colors';

// replace with any Lucide icon

export default function IconButtonCard({ onPress, Icon = Home, title, subtitle }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.dark.cardBackground : colors.light.cardBackground,
          borderColor: isDark ? colors.dark.border : '#ddd',
        },
      ]}
    >
      <Icon size={32} strokeWidth={1.8} color={isDark ? colors.dark.text : '#333'} />

      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: isDark ? colors.dark.text : '#111' }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: isDark ? colors.dark.textSecondary : '#666' }]}>{subtitle}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    minWidth: 150,
    minHeight: 100,
  },
  textContainer: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
