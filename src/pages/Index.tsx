
import { useState } from 'react';
import { PasswordProtection } from '@/components/PasswordProtection';
import { MainLayout } from '@/components/MainLayout';
import { PasswordManager } from '@/components/PasswordManager';

const Index = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleUnlock = (admin: boolean) => {
    setIsUnlocked(true);
    setIsAdmin(admin);
  };

  if (!isUnlocked) {
    return <PasswordProtection onUnlock={handleUnlock} />;
  }

  if (isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">
          <PasswordManager />
        </div>
      </div>
    );
  }

  return <MainLayout />;
};

export default Index;
