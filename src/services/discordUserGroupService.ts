
import { supabase } from "@/integrations/supabase/client";
import { DiscordUserGroup, GroupMember } from "@/types/discord.types";

// Functions for managing user groups
export const createUserGroup = async (name: string, description?: string): Promise<DiscordUserGroup> => {
  // Get the ID of the currently authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('discord_user_groups')
    .insert({
      name,
      description,
      leader_id: user.id // Use the authenticated user's ID as leader_id
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating group:', error);
    throw error;
  }
  
  return data;
};

export const getUserGroups = async (): Promise<DiscordUserGroup[]> => {
  // Fetch groups that the user leads or is a member of
  const { data: groups, error } = await supabase
    .from('discord_user_groups')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching groups:', error);
    throw error;
  }
  
  if (!groups || groups.length === 0) {
    return [];
  }
  
  // Fetch the member count for each group
  const groupsWithCount = await Promise.all(
    groups.map(async (group) => {
      const { count, error: countError } = await supabase
        .from('discord_group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id);
        
      if (countError) {
        console.error(`Error counting members for group ${group.id}:`, countError);
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
    console.error('Error fetching group members:', error);
    throw error;
  }
  
  return data || [];
};

export const inviteUserToGroup = async (groupId: string, userEmail: string): Promise<boolean> => {
  // First, get the user ID from the email using our RPC function
  const { data: userId, error: userError } = await supabase
    .rpc('get_user_id_from_email', { email: userEmail });
    
  if (userError || userId === null) {
    console.error('User not found:', userError);
    return false;
  }
  
  // Now add the user to the group
  const { error } = await supabase
    .from('discord_group_members')
    .insert({
      group_id: groupId,
      user_id: userId as string
    });
    
  if (error) {
    console.error('Error adding member to group:', error);
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
    console.error('Error removing member from group:', error);
    throw error;
  }
};

export const deleteUserGroup = async (groupId: string): Promise<void> => {
  const { error } = await supabase
    .from('discord_user_groups')
    .delete()
    .eq('id', groupId);
    
  if (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};
