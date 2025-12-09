import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface SimpleButtonProps {
  icon: LucideIcon;
  heading: string;
  subheading: string;
  onPress: () => void;
  iconColor?: string;
  iconSize?: number;
  containerColor?: string;
  iconContainerColor?: string; // 👈 added
}

export default function SimpleButton({
  icon: Icon,
  heading,
  subheading,
  onPress,
  iconColor = 'white',
  iconSize = 40,
  containerColor = '#FFFFFF',
  iconContainerColor = '#003366', // 👈 default
}: SimpleButtonProps) {
  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: containerColor }]} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: iconContainerColor }]}>
        <Icon color={iconColor} size={iconSize} strokeWidth={1.7} />
      </View>

      <Text style={styles.heading}>{heading}</Text>
      <Text style={styles.subheading}>{subheading}</Text>
    </TouchableOpacity>
  );
}

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
    width: '46%',
  },
  iconContainer: {
    borderRadius: 50, // RN can't use '50%'
    padding: 12,
    marginBottom: 12,
  },
  heading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
