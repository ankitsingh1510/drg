import React, { useState } from 'react';
import { ActivityIndicator, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { usersAPI } from '@/services/users';
import { toast } from '@/util/toast';

type OtpVerificationModalProps = {
  visible: boolean;
  onClose: () => void;
  onVerifySuccess: (token: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

export default function OtpVerificationModal({
  visible,
  onClose,
  onVerifySuccess,
  isLoading,
  setIsLoading,
}: OtpVerificationModalProps) {
  const [otp, setOtp] = useState('');

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Invalid OTP', 'Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setIsLoading(true);

      const response = await usersAPI.verifyMfaOtp('email', otp);

      if (response && response.statusCode === 200) {
        if (response.token) {
          setOtp('');
          onVerifySuccess(response.token);
        } else {
          throw new Error('No token received from OTP verification');
        }
      } else {
        throw new Error(response?.message || 'OTP verification failed');
      }
    } catch (error: any) {
      setIsLoading(false);
      toast.error('Verification Failed', error.message || 'Invalid OTP');
    }
  };

  const handleResendOtp = async () => {
    try {
      await usersAPI.sendMfaOtp('email');
      toast.success('OTP Resent', 'Please check your email');
    } catch {
      toast.error('Error', 'Failed to resend OTP');
    }
  };

  const handleClose = () => {
    setOtp('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="mx-5 w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <Text className="mb-2 text-2xl font-semibold text-gray-800 dark:text-gray-100">Enter Verification Code</Text>
          <Text className="text-m mb-6 text-gray-600 dark:text-gray-400">
            We&apos;ve sent an OTP to your email. Please enter it below.
          </Text>

          <View className="mb-4">
            <TextInput
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              textAlignVertical="center"
              className="h-14 rounded-lg border border-gray-300 bg-white px-4 text-center text-2xl font-semibold tracking-widest dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </View>

          <View className="mb-4 flex-row items-center justify-center">
            <Text className="text-m text-gray-600 dark:text-gray-400">Didn&apos;t receive the code? </Text>
            <TouchableOpacity onPress={handleResendOtp}>
              <Text className="text-m font-semibold text-blue-500">Resend</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white py-3 dark:border-gray-600 dark:bg-gray-700"
            >
              <Text className="text-center font-semibold text-gray-700 dark:text-gray-200">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleVerifyOtp}
              disabled={isLoading || !otp}
              className={`flex-1 rounded-lg py-3 ${
                isLoading || !otp ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-500 dark:bg-blue-600'
              }`}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text
                  className={`text-center font-semibold ${!otp ? 'text-gray-500 dark:text-gray-400' : 'text-white'}`}
                >
                  Verify
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
