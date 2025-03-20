
import { supabase } from "@/integrations/supabase/client";

export interface TemporaryPassword {
  id: string;
  password: string;
  description: string | null;
  created_at: string;
  expires_at: string;
  created_by: string | null;
}

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
  
  return !!data;
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
