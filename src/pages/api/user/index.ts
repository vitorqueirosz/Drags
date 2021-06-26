import { prisma } from 'services/prisma';
import Router from 'next/router';

export type User = {
  name: string;
  email: string;
};

const useGetUser = () => async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user;
};

const useCreateUser = () => {
  const handleUserExists = useGetUser();

  return async ({ name, email }: User) => {
    const hasUser = handleUserExists(email);

    if (!hasUser) {
      await prisma.user.create({
        data: {
          name,
        },
      });
    }
    Router.push('/characters');
  };
};

export default useCreateUser;
