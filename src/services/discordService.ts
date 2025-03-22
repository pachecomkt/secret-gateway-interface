
import { supabase } from "@/integrations/supabase/client";

// Tipos para as entidades
export interface DiscordBotToken {
  id: string;
  token: string;
  description?: string;
  created_at: string;
}

export interface DiscordUserList {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  user_count?: number;
}

export interface DiscordUser {
  id: string;
  discord_id: string;
  username: string;
  role?: string;
  role_id?: string;
  last_active?: string;
  is_online: boolean;
  list_id: string;
  created_at: string;
}

export interface UserFilter {
  role: string | null;
  roleId: string | null;
  activeWithin24h: boolean;
  activeWithin72h: boolean; // New 3-day activity filter
  onlineOnly: boolean;
}

export interface DiscordUserGroup {
  id: string;
  name: string;
  description?: string;
  leader_id: string;
  created_at: string;
  member_count?: number;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
  user_email?: string;
  user_name?: string;
}

// Funções para gerenciar tokens de bot
export const getDiscordBotTokens = async (): Promise<DiscordBotToken[]> => {
  const { data, error } = await supabase
    .from('discord_bot_tokens')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Erro ao buscar tokens:', error);
    throw error;
  }
  
  return data || [];
};

export const saveDiscordBotToken = async (token: string, description?: string): Promise<DiscordBotToken> => {
  const { data, error } = await supabase
    .from('discord_bot_tokens')
    .insert({
      token,
      description
    })
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao salvar token:', error);
    throw error;
  }
  
  return data;
};

export const deleteDiscordBotToken = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('discord_bot_tokens')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Erro ao excluir token:', error);
    throw error;
  }
};

// Funções para gerenciar listas de usuários
export const getDiscordUserLists = async (): Promise<DiscordUserList[]> => {
  // Primeiro busca as listas
  const { data: lists, error } = await supabase
    .from('discord_user_lists')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Erro ao buscar listas:', error);
    throw error;
  }
  
  if (!lists || lists.length === 0) {
    return [];
  }
  
  // Agora busca a contagem de usuários para cada lista
  const listsWithCount = await Promise.all(
    lists.map(async (list) => {
      const { count, error: countError } = await supabase
        .from('discord_users')
        .select('*', { count: 'exact', head: true })
        .eq('list_id', list.id);
        
      if (countError) {
        console.error(`Erro ao contar usuários da lista ${list.id}:`, countError);
        return { ...list, user_count: 0 };
      }
      
      return { ...list, user_count: count || 0 };
    })
  );
  
  return listsWithCount;
};

export const getDiscordUserList = async (id: string): Promise<DiscordUserList> => {
  const { data, error } = await supabase
    .from('discord_user_lists')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Erro ao buscar lista:', error);
    throw error;
  }
  
  return data;
};

export const deleteDiscordUserList = async (id: string): Promise<void> => {
  // A tabela discord_users tem uma restrição de chave estrangeira CASCADE,
  // então excluir a lista também excluirá automaticamente todos os usuários.
  const { error } = await supabase
    .from('discord_user_lists')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Erro ao excluir lista:', error);
    throw error;
  }
};

// Funções para gerenciar usuários
export const getDiscordUsers = async (listId: string): Promise<DiscordUser[]> => {
  const { data, error } = await supabase
    .from('discord_users')
    .select('*')
    .eq('list_id', listId);
    
  if (error) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  }
  
  return data || [];
};

// Função para extrair usuários do Discord
export const extractDiscordUsers = async (
  serverId: string,
  tokenId: string, 
  filters: UserFilter,
  listName?: string,
  listDescription?: string
): Promise<{
  success: boolean;
  message: string;
  listId?: string;
  listName?: string;
  users?: any[];
}> => {
  try {
    const response = await fetch('/api/extract-discord-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify({
        serverId,
        tokenId,
        filters,
        listName,
        listDescription
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Erro ao extrair usuários');
    }
    
    return result;
  } catch (error) {
    console.error('Erro ao chamar a função extract-discord-users:', error);
    return {
      success: false,
      message: error.message || 'Erro ao extrair usuários do Discord'
    };
  }
};

// Funções para gerenciar grupos de usuários
export const createUserGroup = async (name: string, description?: string): Promise<DiscordUserGroup> => {
  // Obter o ID do usuário atualmente autenticado
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const { data, error } = await supabase
    .from('discord_user_groups')
    .insert({
      name,
      description,
      leader_id: user.id // Usar o ID do usuário autenticado como leader_id
    })
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao criar grupo:', error);
    throw error;
  }
  
  return data;
};

export const getUserGroups = async (): Promise<DiscordUserGroup[]> => {
  // Busca grupos que o usuário lidera ou é membro
  const { data: groups, error } = await supabase
    .from('discord_user_groups')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Erro ao buscar grupos:', error);
    throw error;
  }
  
  if (!groups || groups.length === 0) {
    return [];
  }
  
  // Agora busca a contagem de membros para cada grupo
  const groupsWithCount = await Promise.all(
    groups.map(async (group) => {
      const { count, error: countError } = await supabase
        .from('discord_group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id);
        
      if (countError) {
        console.error(`Erro ao contar membros do grupo ${group.id}:`, countError);
        return { ...group, member_count: 0 };
      }
      
      return { ...group, member_count: count || 0 };
    })
  );
  
  return groupsWithCount;
};

export const getGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
  const { data, error } = await supabase
    .from('discord_group_members')
    .select('*')
    .eq('group_id', groupId);
    
  if (error) {
    console.error('Erro ao buscar membros do grupo:', error);
    throw error;
  }
  
  return data || [];
};

export const inviteUserToGroup = async (groupId: string, userEmail: string): Promise<boolean> => {
  // Primeiro, busca o ID do usuário a partir do e-mail
  const { data: user, error: userError } = await supabase
    .rpc('get_user_id_from_email', { email: userEmail });
    
  if (userError || !user) {
    console.error('Usuário não encontrado:', userError);
    return false;
  }
  
  // Agora, adiciona o usuário ao grupo
  const { error } = await supabase
    .from('discord_group_members')
    .insert({
      group_id: groupId,
      user_id: user
    });
    
  if (error) {
    console.error('Erro ao adicionar membro ao grupo:', error);
    return false;
  }
  
  return true;
};

export const removeUserFromGroup = async (memberId: string): Promise<void> => {
  const { error } = await supabase
    .from('discord_group_members')
    .delete()
    .eq('id', memberId);
    
  if (error) {
    console.error('Erro ao remover membro do grupo:', error);
    throw error;
  }
};

export const deleteUserGroup = async (groupId: string): Promise<void> => {
  const { error } = await supabase
    .from('discord_user_groups')
    .delete()
    .eq('id', groupId);
    
  if (error) {
    console.error('Erro ao excluir grupo:', error);
    throw error;
  }
};
