import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LucideIcon } from 'lucide-react-native';

interface SimpleButtonProps {
  icon: LucideIcon;
  heading: string;
  subheading: string;
  onPress: () => void;
  iconColor?: string;
  iconSize?: number;
}

export default function SimpleButton({
  icon: Icon,
  heading,
  subheading,
  onPress,
  iconColor = 'orangered',
  iconSize = 40,
}: SimpleButtonProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Icon color={iconColor} size={iconSize} strokeWidth={1} />
      </View>
      <Text style={styles.heading}>{heading}</Text>
      <Text style={styles.subheading}>{subheading}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 150,
  },
  iconContainer: {
    // backgroundColor: '#EFF6FF',
    backgroundColor: 'lemonchiffon',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  heading: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 10,
    color: '#9CA3AF',
  },
});
