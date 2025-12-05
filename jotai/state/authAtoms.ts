import { atom } from 'jotai';

export interface User {
  name: string;
  lname: string;
  email: string;
  sub: string;
  username: string;
  role_id: string;
}

// user: User | null;
// token: string | null;
// isLoading: boolean;
// targetLocation: string | null;
// studyIdentifier: string;
// usersStudyList: number[];
// isAuthenticated: boolean;

export const userAtom = atom<User | null, [User | null], void>(null, (_get, _set, v) => v);
export const tokenAtom = atom<string | null, [string | null], void>(null, (_get, _set, newValue) => newValue);
export const isLoadingAtom = atom<boolean, [boolean], void>(false, (_get, _set, v) => v);
export const targetLocationAtom = atom<string | null, [string | null], void>(null, (_get, _set, v) => v);
export const studyIdentifierAtom = atom<string, [string], void>('', (_get, _set, v) => v);
export const usersStudyListAtom = atom<number[], [number[]], void>([], (_get, _set, v) => v);
export const isAuthenticatedAtom = atom(get => {
  return !!get(userAtom) && !!get(tokenAtom);
});
