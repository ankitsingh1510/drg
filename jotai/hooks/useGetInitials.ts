import { useAtomValue } from 'jotai';
import { userAtom } from '@/jotai/state/authAtoms';

export const useGetInitials = () => {
  const user = useAtomValue(userAtom);

  if (!user) return 'IA';
  return `${user.name?.[0]?.toUpperCase() || ''}${user.lname?.[0]?.toUpperCase() || ''}`;
};
