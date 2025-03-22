
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
  
  // After creating the group, add the leader as a member automatically
  try {
    await supabase
      .from('discord_group_members')
      .insert({
        group_id: data.id,
        user_id: user.id
      });
  } catch (memberError) {
    console.error('Error adding leader as member:', memberError);
    // Continue despite this error, as the group was created successfully
  }
  
  return data;
};

export const getUserGroups = async (): Promise<DiscordUserGroup[]> => {
  // Fetch groups that the user leads or is a member of
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // First get the IDs of groups the user is a member of
  const { data: memberGroups, error: memberError } = await supabase
    .from('discord_group_members')
    .select('group_id')
    .eq('user_id', user.id);
    
  if (memberError) {
    console.error('Error fetching member groups:', memberError);
    throw memberError;
  }
  
  const memberGroupIds = memberGroups ? memberGroups.map(group => group.group_id) : [];
  
  // Then fetch all groups where the user is either a leader or a member
  const { data: groups, error } = await supabase
    .from('discord_user_groups')
    .select('*')
    .or(`leader_id.eq.${user.id}${memberGroupIds.length > 0 ? `,id.in.(${memberGroupIds.join(',')})` : ''}`)
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
  // Fetch group members with additional user information
  const { data: members, error } = await supabase
    .from('discord_group_members')
    .select(`
      id,
      group_id,
      user_id,
      joined_at,
      display_name
    `)
    .eq('group_id', groupId);
    
  if (error) {
    console.error('Error fetching group members:', error);
    throw error;
  }
  
  // Enhance the members data with user information if available
  const enhancedMembers: GroupMember[] = await Promise.all(
    (members || []).map(async (member) => {
      try {
        // Attempt to get user email/name from auth.users (via RPC function to avoid RLS issues)
        const { data: userData, error: userError } = await supabase
          .rpc('get_user_info_from_id', { user_id: member.user_id });
          
        if (userError) {
          console.error(`Error fetching user info for ${member.user_id}:`, userError);
          return {
            ...member,
            user_name: member.display_name || `User ${member.user_id.substring(0, 8)}...`,
            user_email: undefined
          };
        }
        
        return {
          ...member,
          user_email: userData?.email || undefined,
          user_name: member.display_name || userData?.name || `User ${member.user_id.substring(0, 8)}...`
        };
      } catch (err) {
        console.error(`Error fetching user info for ${member.user_id}:`, err);
        return {
          ...member,
          user_name: member.display_name || `User ${member.user_id.substring(0, 8)}...`
        };
      }
    })
  );
  
  return enhancedMembers;
};

export const inviteUserToGroup = async (groupId: string, userEmail: string): Promise<{success: boolean, message: string}> => {
  try {
    // First, get the user ID from the email using our RPC function
    const { data: userId, error: userError } = await supabase
      .rpc('get_user_id_from_email', { email: userEmail });
      
    if (userError) {
      console.error('Error finding user:', userError);
      return { success: false, message: 'Error locating user with the provided email.' };
    }
    
    // The RPC function returns null if no user is found
    if (userId === null) {
      console.error('User not found with email:', userEmail);
      return { success: false, message: 'No user found with this email address.' };
    }
    
    // Check if user is already a member of the group
    const { data: existingMember, error: checkError } = await supabase
      .from('discord_group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId as string)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking existing membership:', checkError);
      return { success: false, message: 'Error checking if user is already a member.' };
    }
    
    if (existingMember) {
      console.log('User is already a member of this group');
      return { success: false, message: 'User is already a member of this group.' };
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
      return { success: false, message: 'Error adding member to the group.' };
    }
    
    return { success: true, message: 'User successfully invited to the group!' };
  } catch (error) {
    console.error('Unexpected error in inviteUserToGroup:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
};

export const updateMemberDisplayName = async (memberId: string, displayName: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('discord_group_members')
      .update({ display_name: displayName })
      .eq('id', memberId);
      
    if (error) {
      console.error('Error updating member display name:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateMemberDisplayName:', error);
    return false;
  }
};

export const removeUserFromGroup = async (memberId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('discord_group_members')
    .delete()
    .eq('id', memberId);
    
  if (error) {
    console.error('Error removing member from group:', error);
    return false;
  }
  
  return true;
};

export const deleteUserGroup = async (groupId: string): Promise<boolean> => {
  try {
    // First remove all members from the group
    const { error: membersError } = await supabase
      .from('discord_group_members')
      .delete()
      .eq('group_id', groupId);
      
    if (membersError) {
      console.error('Error removing group members:', membersError);
      throw membersError;
    }
    
    // Then delete the group itself
    const { error } = await supabase
      .from('discord_user_groups')
      .delete()
      .eq('id', groupId);
      
    if (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteUserGroup:', error);
    return false;
  }
};

// Function to check if user is a group leader
export const isGroupLeader = async (groupId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return false;
  }
  
  const { data, error } = await supabase
    .from('discord_user_groups')
    .select('id')
    .eq('id', groupId)
    .eq('leader_id', user.id)
    .maybeSingle();
    
  if (error || !data) {
    return false;
  }
  
  return true;
};

// Get invitation link for a group
export const getGroupInviteLink = async (groupId: string): Promise<string> => {
  // Generate a frontend link for sharing
  const baseUrl = window.location.origin;
  return `${baseUrl}/group-invite/${groupId}`;
};
