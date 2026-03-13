import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { Home, LogOut } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useLogout } from '@/context/AuthContext';

export default function IconNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useLogout();

  const isHome = pathname === '/home';

  const goHome = () => {
    router.push('/home');
  };

  const goLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {!isHome && (
        <TouchableOpacity onPress={goHome} style={styles.iconButton}>
          <View style={[styles.iconContainer, { backgroundColor: colors.common.accent }]}>
            <Home pointerEvents="none" size={25} strokeWidth={1} color={'white'} />
          </View>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={goLogout} style={styles.iconButton}>
        <View style={[styles.iconContainer, { backgroundColor: colors.common.accent }]}>
          <LogOut pointerEvents="none" size={25} strokeWidth={1} color={'white'} />
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
  },
  iconButton: {},
  iconContainer: {
    borderRadius: 50,
    padding: 8,
  },
});
