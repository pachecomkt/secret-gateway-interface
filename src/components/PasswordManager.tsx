
import { useState, useEffect } from 'react';
import { PasswordCreationForm } from './PasswordCreationForm';
import { PasswordTable } from './PasswordTable';
import { getTemporaryPasswords } from "@/services/passwordService";
import { TemporaryPassword } from "@/types/database.types";

interface PasswordManagerProps {
  isSuperUser: boolean;
}

export const PasswordManager = ({ isSuperUser }: PasswordManagerProps) => {
  const [passwords, setPasswords] = useState<TemporaryPassword[]>([]);

  const loadPasswords = async () => {
    const data = await getTemporaryPasswords();
    setPasswords(data);
  };

  useEffect(() => {
    loadPasswords();
    
    // Recarregar a cada 60 segundos para atualizar status de expiração
    const interval = setInterval(() => {
      loadPasswords();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <PasswordCreationForm onPasswordCreated={loadPasswords} />
      <PasswordTable passwords={passwords} onDelete={loadPasswords} isSuperUser={isSuperUser} />
    </div>
  );
};
