
import { supabase } from "@/integrations/supabase/client";
import { DiscordBotToken } from "@/types/discord.types";

// Functions for managing bot tokens
export const getDiscordBotTokens = async (): Promise<DiscordBotToken[]> => {
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
  const { data, error } = await supabase
    .from('discord_bot_tokens')
    .insert({
      token,
      description
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
  const { error } = await supabase
    .from('discord_bot_tokens')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting token:', error);
    throw error;
  }
};
