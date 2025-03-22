
import { supabase } from "@/integrations/supabase/client";
import { DiscordBotToken } from "@/types/discord.types";

// Functions for managing bot tokens
export const getDiscordBotTokens = async (): Promise<DiscordBotToken[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('discord_bot_tokens')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching tokens:', error);
    throw error;
  }
  
  return data || [];
};

export const saveDiscordBotToken = async (token: string, description?: string): Promise<DiscordBotToken> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('discord_bot_tokens')
    .insert({
      token,
      description,
      created_by: user.id
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error saving token:', error);
    throw error;
  }
  
  return data;
};

export const deleteDiscordBotToken = async (id: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('discord_bot_tokens')
    .delete()
    .eq('id', id)
    .eq('created_by', user.id);
    
  if (error) {
    console.error('Error deleting token:', error);
    throw error;
  }
};
