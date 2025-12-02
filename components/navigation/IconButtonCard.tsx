// IconButtonCard.js
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Home } from 'lucide-react-native';

// replace with any Lucide icon

export default function IconButtonCard({ onPress, Icon = Home, title, subtitle }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Icon size={32} strokeWidth={1.8} style={styles.icon} />

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 150,
    minHeight: 100,
  },
  icon: {
    color: '#333',
  },
  textContainer: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});
