
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
  last_active?: string;
  is_online: boolean;
  list_id: string;
  created_at: string;
}

export interface UserFilter {
  role: string | null;
  activeWithin24h: boolean;
  onlineOnly: boolean;
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
