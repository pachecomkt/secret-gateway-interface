
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

  // Super usuários têm acesso ao MainLayout com todas as opções
  if (isSuperUser) {
    return <MainLayout isSuperUser={true} isAdmin={false} isRegularUser={false} />;
  }
  
  // Administradores têm acesso somente ao Gerenciador de Senhas
  if (isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">
          <PasswordManager isSuperUser={false} />
        </div>
      </div>
    );
  }

  // Usuários regulares veem apenas o layout principal sem acesso ao gerenciador de senhas
  return <MainLayout isSuperUser={false} isAdmin={false} isRegularUser={true} />;
};

export default Index;
