// IconNavBar.js
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Home, LogOut } from 'lucide-react-native';
import { useLogout } from '@/context/AuthContext';

export default function IconNavBar() {
  const router = useRouter();
  const logout = useLogout();

  const goHome = () => {
    router.push('/landing');
  };

  const goLogout = () => {
    logout();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={goHome} style={styles.iconButton}>
        <View style={styles.iconContainer}>
          <Home pointerEvents="none" size={25} strokeWidth={1} color={'dodgerblue'} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={goLogout} style={styles.iconButton}>
        <View style={styles.iconContainer}>
          <LogOut pointerEvents="none" size={25} strokeWidth={1} color={'salmon'} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    // padding: 10,
  },
  iconButton: {
    // padding: 12,
  },
  iconContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: '50%',
    padding: 8,
    // marginBottom: 12,
  },
});
