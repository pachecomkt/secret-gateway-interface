
import { useState } from 'react';
import { PasswordProtection } from '@/components/PasswordProtection';
import { MainLayout } from '@/components/MainLayout';

const Index = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);

  if (!isUnlocked) {
    return <PasswordProtection onUnlock={() => setIsUnlocked(true)} />;
  }

  return <MainLayout />;
};

export default Index;
