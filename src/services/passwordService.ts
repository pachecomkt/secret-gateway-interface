
import { supabase } from "@/integrations/supabase/client";
import { TemporaryPassword } from "@/types/database.types";

export const createTemporaryPassword = async (
  password: string,
  description: string | null,
  expiresInHours: number
): Promise<TemporaryPassword | null> => {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);
  
  console.log('Criando senha temporária:', {
    password,
    description,
    expires_at: expiresAt.toISOString()
  });
  
  const { data, error } = await supabase
    .from('temporary_passwords')
    .insert({
      password,
      description,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao criar senha temporária:', error);
    return null;
  }
  
  console.log('Senha temporária criada com sucesso:', data);
  return data;
};

export const validatePassword = async (password: string): Promise<boolean> => {
  console.log('Validando senha:', password);
  
  // Se a senha for "Admin@2024Sec!", aceitamos como válida para fins de administração
  if (password === "Admin@2024Sec!") {
    console.log('Usando credencial de administrador');
    return true;
  }
  
  // Verificar na tabela de super_users
  const { data: superUserData } = await supabase
    .from('super_users')
    .select()
    .eq('senha', password)
    .maybeSingle();
  
  if (superUserData) {
    console.log('Validado como super usuário');
    return true;
  }
  
  // Verificar na tabela de admins
  const { data: adminData } = await supabase
    .from('admins')
    .select()
    .eq('senha', password)
    .maybeSingle();
  
  if (adminData) {
    console.log('Validado como administrador');
    return true;
  }
  
  // Verificar na tabela de usuarios
  const { data: userData } = await supabase
    .from('usuarios')
    .select()
    .eq('senha', password)
    .maybeSingle();
  
  if (userData) {
    console.log('Validado como usuário regular');
    return true;
  }
  
  // Por fim, verificar na tabela de senhas temporárias
  const { data, error } = await supabase
    .from('temporary_passwords')
    .select()
    .eq('password', password)
    .gte('expires_at', new Date().toISOString())
    .maybeSingle();
  
  if (error) {
    console.error('Erro ao validar senha:', error);
    return false;
  }
  
  console.log('Resultado da validação:', !!data, data);
  return !!data;
};

export const checkPasswordStatus = async (password: string): Promise<{
  exists: boolean; 
  expired: boolean; 
  isAdmin: boolean;
  isSuperUser: boolean;
  isRegularUser: boolean;
}> => {
  // Se a senha for "Admin@2024Sec!", consideramos como administrador hardcoded
  if (password === "Admin@2024Sec!") {
    return {
      exists: true,
      expired: false,
      isAdmin: true,
      isSuperUser: true,
      isRegularUser: false
    };
  }
  
  // Verificar na tabela de super_users
  const { data: superUserData } = await supabase
    .from('super_users')
    .select()
    .eq('senha', password)
    .maybeSingle();
  
  if (superUserData) {
    return {
      exists: true,
      expired: false,
      isAdmin: false,
      isSuperUser: true,
      isRegularUser: false
    };
  }
  
  // Verificar na tabela de admins
  const { data: adminData } = await supabase
    .from('admins')
    .select()
    .eq('senha', password)
    .maybeSingle();
  
  if (adminData) {
    return {
      exists: true,
      expired: false,
      isAdmin: true,
      isSuperUser: false,
      isRegularUser: false
    };
  }
  
  // Verificar na tabela de usuarios
  const { data: userData } = await supabase
    .from('usuarios')
    .select()
    .eq('senha', password)
    .maybeSingle();
  
  if (userData) {
    return {
      exists: true,
      expired: false,
      isAdmin: false,
      isSuperUser: false,
      isRegularUser: true
    };
  }
  
  // Por fim, verificar na tabela de senhas temporárias
  const { data: passwordData, error: passwordError } = await supabase
    .from('temporary_passwords')
    .select()
    .eq('password', password)
    .maybeSingle();
  
  if (passwordError) {
    console.error('Erro ao verificar senha:', passwordError);
    return {
      exists: false,
      expired: false,
      isAdmin: false,
      isSuperUser: false,
      isRegularUser: false
    };
  }
  
  if (!passwordData) {
    return {
      exists: false,
      expired: false,
      isAdmin: false,
      isSuperUser: false,
      isRegularUser: false
    };
  }
  
  // Verificar se está expirada
  const isExpired = new Date(passwordData.expires_at) < new Date();
  
  return { 
    exists: true, 
    expired: isExpired,
    isAdmin: false,
    isSuperUser: false,
    isRegularUser: true
  };
};

export const getTemporaryPasswords = async (): Promise<TemporaryPassword[]> => {
  const { data, error } = await supabase
    .from('temporary_passwords')
    .select('*')
    .order('expires_at', { ascending: true });
  
  if (error) {
    console.error('Erro ao buscar senhas temporárias:', error);
    return [];
  }
  
  return data || [];
};

export const deleteTemporaryPassword = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('temporary_passwords')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao excluir senha temporária:', error);
    return false;
  }
  
  return true;
};
