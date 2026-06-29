import React from 'react';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

const BackButton = () => {
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      activeOpacity={0.7}
      className="h-[48px] w-[48px] items-center justify-center rounded-[12px]"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.13)',
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 28,
        elevation: 50,
      }}
    >
      <ChevronLeft size={22} color="#FFFFFF" strokeWidth={2.5} />
    </TouchableOpacity>
  );
};

export default BackButton;
