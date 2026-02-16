import React, { createContext, useContext, useEffect, useState } from 'react';
import { router } from 'expo-router';
import { storageAPI } from '@/services/storage';
import { usersAPI } from '@/services/users';
import { storage } from '@/stores/mmkv';
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
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setTargetLocation: (location: string | null) => void;
  setStudyIdentifier: (identifier: string) => void;
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
  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    const initAuth = async () => {
      try {
        // const tokenValue = await AsyncStorage.getItem('token');
        const tokenValue = storage.getString('token') ?? null;
        if (!tokenValue) {
          console.log('No token found. Please log in.');
          setIsLoading(false);
          storage.clearAll();
          router.replace('/' as any);
          return;
        }

        const payload = decryptToken(tokenValue);
        if (!payload) {
          console.log('Invalid or expired token. Please log in again.');
          // await AsyncStorage.removeItem('token');
          storage.remove('token');
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

        setUser(userData);

        const config = await storageAPI.getUploadConfig();
        setTargetLocation(config?.data?.targetLocation || null);

        // Redirect to patients page if already authenticated
        // router.replace('/patients' as any);
        router.replace('/landing' as any);
      } catch (error) {
        console.error('Error initializing auth:', error);
        // await AsyncStorage.removeItem('token');
        storage.remove('token');
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
    isAuthenticated,
    setUser,
    setToken,
    setIsLoading,
    setTargetLocation,
    setStudyIdentifier,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hooks for authentication operations
export const useLogin = () => {
  const { setUser, setToken, setIsLoading, setTargetLocation } = useAuth();

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
        // await AsyncStorage.setItem('token', tokenValue);
        if (tokenValue) {
          storage.set('token', tokenValue);
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

        setUser(userData);

        const config = await storageAPI.getUploadConfig();
        setTargetLocation(config?.data?.targetLocation || null);

        // Navigate to patients page
        // router.replace('/patients' as any);
        router.replace('/landing' as any);
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
  return async () => {
    console.log('Logging out');

    const currentToken = storage.getString('token') ?? null;
    if (currentToken) {
      usersAPI.revokeToken(currentToken).catch(err => console.warn('Token revocation failed:', err));
    }

    // The login page will handle clearing storage and contexts
    router.replace('/login?logout=true' as any);
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
