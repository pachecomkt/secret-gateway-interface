
import { useState } from 'react';
import { PasswordProtection } from '@/components/PasswordProtection';
import { MainLayout } from '@/components/MainLayout';
import { PasswordManager } from '@/components/PasswordManager';

const Index = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [isRegularUser, setIsRegularUser] = useState(false);

  const handleUnlock = (admin: boolean, superUser: boolean, regularUser: boolean) => {
    setIsUnlocked(true);
    setIsAdmin(admin);
    setIsSuperUser(superUser);
    setIsRegularUser(regularUser);
  };

  if (!isUnlocked) {
    return <PasswordProtection onUnlock={handleUnlock} />;
  }

  // Super usuários e administradores têm acesso ao Gerenciador de Senhas
  if (isSuperUser || isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">
          <PasswordManager />
        </div>
      </div>
    );
  }

  // Usuários regulares veem apenas o layout principal
  return <MainLayout />;
};

export default Index;
