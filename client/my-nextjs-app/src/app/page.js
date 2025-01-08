'use client';

import { useRouter } from 'next/navigation';
import Header from './components/Header';

export default function Home() {
  const router = useRouter();

  const navigateToSignUp = () => {
    router.push('/pages/signup'); // Navigate to the Sign Up page
  };

  const navigateToLogIn = () => {
    router.push('/pages/login'); // Navigate to the Log In page
  };

  return (
    <div>
      <button onClick={navigateToSignUp}>Sign Up</button>
      <button onClick={navigateToLogIn}>Log In</button>
    </div>
  );
}
