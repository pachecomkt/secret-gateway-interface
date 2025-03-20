
import { supabase } from "@/integrations/supabase/client";
import { TemporaryPassword } from "@/types/database.types";

export const createTemporaryPassword = async (
  password: string,
  description: string | null,
  expiresInHours: number
): Promise<TemporaryPassword | null> => {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);
  
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
  
  return data;
};

export const validatePassword = async (password: string): Promise<boolean> => {
  console.log('Validando senha:', password);
  
  // Se a senha for "Admin@2024Sec!", aceitamos como válida para fins de emergência/desenvolvimento
  if (password === "Admin@2024Sec!") {
    console.log('Usando credencial de administrador');
    return true;
  }
  
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

export const checkPasswordStatus = async (password: string): Promise<{exists: boolean; expired: boolean}> => {
  // Se a senha for "Admin@2024Sec!", consideramos como válida para fins de emergência/desenvolvimento
  if (password === "Admin@2024Sec!") {
    return { exists: true, expired: false };
  }
  
  const now = new Date().toISOString();
  
  // Verificar se a senha existe independentemente da expiração
  const { data: passwordData, error: passwordError } = await supabase
    .from('temporary_passwords')
    .select()
    .eq('password', password)
    .maybeSingle();
  
  if (passwordError) {
    console.error('Erro ao verificar senha:', passwordError);
    return { exists: false, expired: false };
  }
  
  if (!passwordData) {
    return { exists: false, expired: false };
  }
  
  // Verificar se está expirada
  const isExpired = new Date(passwordData.expires_at) < new Date();
  
  return { 
    exists: true, 
    expired: isExpired 
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
