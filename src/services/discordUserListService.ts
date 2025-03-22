
import { supabase } from "@/integrations/supabase/client";
import { DiscordUserList, DiscordUser } from "@/types/discord.types";

// Functions for managing user lists
export const getDiscordUserLists = async (): Promise<DiscordUserList[]> => {
  // First fetch the lists
  const { data: lists, error } = await supabase
    .from('discord_user_lists')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching lists:', error);
    throw error;
  }
  
  if (!lists || lists.length === 0) {
    return [];
  }
  
  // Now fetch the user count for each list
  const listsWithCount = await Promise.all(
    lists.map(async (list) => {
      const { count, error: countError } = await supabase
        .from('discord_users')
        .select('*', { count: 'exact', head: true })
        .eq('list_id', list.id);
        
      if (countError) {
        console.error(`Error counting users for list ${list.id}:`, countError);
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
    console.error('Error fetching list:', error);
    throw error;
  }
  
  return data;
};

export const deleteDiscordUserList = async (id: string): Promise<void> => {
  // The discord_users table has a CASCADE foreign key constraint,
  // so deleting the list will automatically delete all users.
  const { error } = await supabase
    .from('discord_user_lists')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting list:', error);
    throw error;
  }
};

export const updateDiscordUserListName = async (listId: string, newName: string): Promise<void> => {
  const { error } = await supabase
    .from('discord_user_lists')
    .update({ name: newName })
    .eq('id', listId);
    
  if (error) {
    console.error('Error updating list name:', error);
    throw error;
  }
};

// Functions for managing users in lists
export const getDiscordUsers = async (listId: string): Promise<DiscordUser[]> => {
  const { data, error } = await supabase
    .from('discord_users')
    .select('*')
    .eq('list_id', listId);
    
  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
  
  return data || [];
};
