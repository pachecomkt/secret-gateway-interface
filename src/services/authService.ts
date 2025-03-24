
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'super_user' | 'regular_user' | 'none';

export interface AuthUser {
  id: string;
  email?: string;
  role: UserRole;
  isAuthenticated: boolean;
}

/**
 * Verifica se uma senha está associada a um tipo específico de usuário
 */
export const checkUserRole = async (password: string): Promise<UserRole> => {
  // Primeiro, verificar super usuários
  const { data: superUserData } = await supabase
    .from('super_users')
    .select()
    .eq('senha', password)
    .maybeSingle();
  
  if (superUserData) {
    return 'super_user';
  }
  
  // Verificar administradores
  const { data: adminData } = await supabase
    .from('admins')
    .select()
    .eq('senha', password)
    .maybeSingle();
  
  if (adminData) {
    return 'admin';
  }
  
  // Verificar usuários comuns
  const { data: userData } = await supabase
    .from('usuarios')
    .select()
    .eq('senha', password)
    .maybeSingle();
  
  if (userData) {
    return 'regular_user';
  }
  
  // Verificar senhas temporárias (consideradas como usuários comuns)
  const { data: tempPasswordData } = await supabase
    .from('temporary_passwords')
    .select()
    .eq('password', password)
    .gte('expires_at', new Date().toISOString())
    .maybeSingle();
  
  if (tempPasswordData) {
    return 'regular_user';
  }
  
  return 'none';
};

/**
 * Verifica se um usuário tem determinada permissão baseado no papel
 */
export const hasPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy = {
    'super_user': 3,
    'admin': 2,
    'regular_user': 1,
    'none': 0
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

/**
 * Registra o acesso do usuário no sistema
 */
export const logUserAccess = async (role: UserRole, password: string): Promise<void> => {
  try {
    // Registra o acesso em uma tabela de logs (se necessário implementar)
    console.log(`User with role ${role} accessed the system`);
  } catch (error) {
    console.error('Error logging user access:', error);
  }
};

/**
 * Faz logout no Supabase (se estiver usando autenticação do Supabase)
 */
export const logout = async (): Promise<void> => {
  await supabase.auth.signOut();
};
