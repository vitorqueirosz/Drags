import Router from 'next/router';
import axios from 'axios';
import { useCallback } from 'react';

export type User = {
  name: string;
  email: string;
};

const useGetUser = () =>
  useCallback(async (email: string) => {
    const user = await axios.get(`/api/user/${email}`);
    return user;
  }, []);

const useCreateUser = () => {
  const handleUserExists = useGetUser();

  return useCallback(
    async ({ name, email }: User) => {
      const hasUser = await handleUserExists(email);

      if (!hasUser.data) {
        await axios.post('/api/user', { name, email });
      }
      Router.push('/characters');
    },
    [handleUserExists],
  );
};
export default useCreateUser;
