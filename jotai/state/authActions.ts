import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { atom } from 'jotai';
import { storageAPI } from '@/services/storage';
import { studyAPI } from '@/services/study';
import { usersAPI } from '@/services/users';
import { decryptToken } from '@/util/helpers';
import { isLoadingAtom, targetLocationAtom, tokenAtom, userAtom, usersStudyListAtom } from './authAtoms';

export const initAuthAtom = atom(null, async (_get, set) => {
  try {
    set(isLoadingAtom, true);

    const tokenValue = await AsyncStorage.getItem('token');

    if (!tokenValue) {
      await AsyncStorage.clear();
      set(isLoadingAtom, false);
      router.replace('/');
      return;
    }

    const payload = decryptToken(tokenValue);
    if (!payload) {
      await AsyncStorage.removeItem('token');
      set(isLoadingAtom, false);
      return;
    }

    set(tokenAtom, tokenValue);

    // Fetch user info
    const userDetails = await usersAPI.getUserDetail({ userMasterId: payload.sub });
    const fields = userDetails.data.userMasterModel.fields;

    const userData = {
      name: fields.find((x: any) => x.name === 'name')?.value,
      lname: fields.find((x: any) => x.name === 'lname')?.value,
      email: fields.find((x: any) => x.name === 'email')?.value,
      sub: payload.sub,
      username: payload.username,
      role_id: payload.role_id,
    };

    set(userAtom, userData);

    const studyList = await studyAPI.getStudyList();
    set(usersStudyListAtom, studyList?.data?.map((x: any) => x.studyId) || []);

    const config = await storageAPI.getUploadConfig();
    set(targetLocationAtom, config?.data?.targetLocation || null);

    router.replace('/landing');
  } catch (e) {
    console.error('INIT AUTH ERROR', e);
    await AsyncStorage.removeItem('token');
  } finally {
    set(isLoadingAtom, false);
  }
});

export const loginActionAtom = atom(
  null,
  async (
    _get,
    set,
    params: { email: string; password: string } // <- REQUIRED TYPE
  ) => {
    const { email, password } = params;

    try {
      set(isLoadingAtom, true);

      const response = await usersAPI.authenticateUser({ username: email, password });

      if (!response?.token) throw new Error('Authentication failed');

      const tokenValue = response.token;
      const payload = decryptToken(tokenValue);
      if (!payload) throw new Error('Invalid token');

      await AsyncStorage.setItem('token', tokenValue);
      set(tokenAtom, tokenValue);

      // Fetch user info
      const userDetails = await usersAPI.getUserDetail({ userMasterId: payload.sub });
      const fields = userDetails.data.userMasterModel.fields;

      const userData = {
        name: fields.find((x: any) => x.name === 'name')?.value,
        lname: fields.find((x: any) => x.name === 'lname')?.value,
        email: fields.find((x: any) => x.name === 'email')?.value,
        sub: payload.sub,
        username: payload.username,
        role_id: payload.role_id,
      };

      set(userAtom, userData);

      const studyList = await studyAPI.getStudyList();
      set(usersStudyListAtom, studyList?.data?.map((x: any) => x.studyId) || []);

      const config = await storageAPI.getUploadConfig();
      set(targetLocationAtom, config?.data?.targetLocation || null);

      router.replace('/landing');
    } finally {
      set(isLoadingAtom, false);
    }
  }
);

export const logoutActionAtom = atom(null, async (_get, set) => {
  await AsyncStorage.clear();
  set(userAtom, null);
  set(tokenAtom, null);
  set(usersStudyListAtom, []);
  router.replace('/');
});
