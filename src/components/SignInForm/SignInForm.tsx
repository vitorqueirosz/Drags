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
    <div className="flex flex-col bg-indigo-800 min-h-screen justify-center items-center gap-8">
      <div className="flex flex-col items-center bg-indigo-600 rounded-lg">
        <span>SignUp with Github</span>
        <Link href="/api/auth/signin">
          <a>SignUp</a>
        </Link>
      </div>
    </div>
  );
};
