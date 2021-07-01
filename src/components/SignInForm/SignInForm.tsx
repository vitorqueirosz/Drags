import { useEffect } from 'react';
import Link from 'next/link';
import useCreateUser, { User } from 'useCases/user';
import { useSession } from 'next-auth/client';

export const SignInForm = () => {
  const [session] = useSession();
  const handleCreateUser = useCreateUser();

  useEffect(() => {
    if (session?.user) {
      handleCreateUser(session.user as User);
    }
  }, [session?.user, handleCreateUser]);

  return (
    <div className="flex flex-col bg-indigo-600 min-h-screen justify-center items-center gap-8">
      <div className="flex flex-col items-center bg-pink-500 rounded-lg p-4">
        <Link href="/api/auth/signin">
          <a className="text-white font-medium ">SignUp with Github</a>
        </Link>
      </div>
    </div>
  );
};
