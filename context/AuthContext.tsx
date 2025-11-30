import React, { createContext, useContext, useEffect, useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storageAPI } from '@/services/storage';
import { studyAPI } from '@/services/study';
import { usersAPI } from '@/services/users';
import { decryptToken } from '@/util/helpers';

interface User {
  name: string;
  lname: string;
  email: string;
  sub: string;
  username: string;
  role_id: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  targetLocation: string | null;
  studyIdentifier: string;
  usersStudyList: number[];
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setTargetLocation: (location: string | null) => void;
  setStudyIdentifier: (identifier: string) => void;
  setUsersStudyList: (list: number[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [targetLocation, setTargetLocation] = useState<string | null>(null);
  const [studyIdentifier, setStudyIdentifier] = useState<string>('');
  const [usersStudyList, setUsersStudyList] = useState<number[]>([]);

  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    const initAuth = async () => {
      try {
        const tokenValue = await AsyncStorage.getItem('token');

        if (!tokenValue) {
          console.log('No token found. Please log in.');
          setIsLoading(false);
          await AsyncStorage.clear();
          router.replace('/' as any);
          return;
        }

        const payload = decryptToken(tokenValue);
        if (!payload) {
          console.log('Invalid or expired token. Please log in again.');
          await AsyncStorage.removeItem('token');
          setIsLoading(false);
          return;
        }

        setToken(tokenValue);

        // Fetch user details
        const userDetails = await usersAPI.getUserDetail({ userMasterId: payload.sub });
        const userFields = userDetails.data.userMasterModel.fields;

        const nameField = userFields.find((x: any) => x.name === 'name')?.value;
        const lnameField = userFields.find((x: any) => x.name === 'lname')?.value;
        const emailField = userFields.find((x: any) => x.name === 'email')?.value;

        const userData: User = {
          name: nameField,
          lname: lnameField,
          email: emailField,
          sub: payload.sub,
          username: payload.username,
          role_id: payload.role_id,
        };

        const studyList = await studyAPI.getStudyList();
        const studyIds = studyList?.data?.map((x: any) => x.studyId) || [];
        setUsersStudyList(studyIds);

        setUser(userData);

        const config = await storageAPI.getUploadConfig();
        setTargetLocation(config?.data?.targetLocation || null);

        // Redirect to patients page if already authenticated
        router.replace('/patients' as any);
      } catch (error) {
        console.error('Error initializing auth:', error);
        await AsyncStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    targetLocation,
    studyIdentifier,
    usersStudyList,
    isAuthenticated,
    setUser,
    setToken,
    setIsLoading,
    setTargetLocation,
    setStudyIdentifier,
    setUsersStudyList,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hooks for authentication operations
export const useLogin = () => {
  const { setUser, setToken, setIsLoading, setUsersStudyList, setTargetLocation } = useAuth();

  return async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await usersAPI.authenticateUser({ username: email, password });
      if (response && response.token) {
        const tokenValue = response.token;
        const payload = decryptToken(tokenValue);
        if (!payload) {
          throw new Error('Invalid token received');
        }

        // Store token
        await AsyncStorage.setItem('token', tokenValue);
        setToken(tokenValue);

        // Fetch user details
        const userDetails = await usersAPI.getUserDetail({ userMasterId: payload.sub });
        const userFields = userDetails.data.userMasterModel.fields;

        const nameField = userFields.find((x: any) => x.name === 'name')?.value;
        const lnameField = userFields.find((x: any) => x.name === 'lname')?.value;
        const emailField = userFields.find((x: any) => x.name === 'email')?.value;

        const userData: User = {
          name: nameField,
          lname: lnameField,
          email: emailField,
          sub: payload.sub,
          username: payload.username,
          role_id: payload.role_id,
        };

        setUser(userData);

        // Fetch study list
        const studyList = await studyAPI.getStudyList();
        const studyIds = studyList?.data?.map((x: any) => x.studyId) || [];
        setUsersStudyList(studyIds);

        const config = await storageAPI.getUploadConfig();
        setTargetLocation(config?.data?.targetLocation || null);

        // Navigate to patients page
        router.replace('/patients' as any);
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
};

export const useLogout = () => {
  const { setUser, setToken, setUsersStudyList } = useAuth();

  return async () => {
    console.log('Logging out');
    await AsyncStorage.clear();
    setUser(null);
    setToken(null);
    setUsersStudyList([]);
    router.replace('/' as any);
  };
};

export const useGetInitials = () => {
  const { user } = useAuth();

  return (): string => {
    if (!user) return 'IA';
    const firstInitial = user.name?.charAt(0)?.toUpperCase() || '';
    const lastInitial = user.lname?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}` || 'IA';
  };
};
