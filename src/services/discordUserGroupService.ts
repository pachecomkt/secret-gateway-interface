
import { supabase } from '@/integrations/supabase/client';
import { DiscordUserGroup, GroupMember } from '@/types/discord.types';

/**
 * Creates a new Discord user group
 */
export const createDiscordUserGroup = async (
  name: string,
  description?: string
): Promise<DiscordUserGroup> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData || !userData.user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('discord_user_groups')
      .insert({
        name,
        description,
        leader_id: userData.user.id
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating group:', error);
      throw new Error(error.message);
    }
    
    // Add the creator as the first member automatically
    await supabase
      .from('discord_group_members')
      .insert({
        group_id: data.id,
        user_id: userData.user.id,
        display_name: 'Group Leader' // Default name for the leader
      });
    
    return data;
  } catch (error) {
    console.error('Error in createDiscordUserGroup:', error);
    throw error;
  }
};

/**
 * Gets all Discord user groups for the current user
 */
export const getDiscordUserGroups = async (): Promise<DiscordUserGroup[]> => {
  try {
    const { data, error } = await supabase
      .from('discord_user_groups')
      .select('*');
      
    if (error) {
      console.error('Error fetching groups:', error);
      throw new Error(error.message);
    }
    
    // Enhance with member count
    const enhancedGroups = await Promise.all(data.map(async (group) => {
      const { count } = await supabase
        .from('discord_group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id);
        
      return {
        ...group,
        member_count: count || 0
      };
    }));
    
    return enhancedGroups;
  } catch (error) {
    console.error('Error in getDiscordUserGroups:', error);
    throw error;
  }
};

/**
 * Checks if the current user is the leader of a group
 */
export const isGroupLeader = async (groupId: string): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData || !userData.user) {
      return false;
    }
    
    const { data, error } = await supabase
      .from('discord_user_groups')
      .select('*')
      .eq('id', groupId)
      .eq('leader_id', userData.user.id)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking group leadership:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in isGroupLeader:', error);
    return false;
  }
};

/**
 * Gets members of a Discord user group
 */
export const getGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
  try {
    const { data: membersData, error: membersError } = await supabase
      .from('discord_group_members')
      .select('*')
      .eq('group_id', groupId);
      
    if (membersError) {
      console.error('Error fetching group members:', membersError);
      throw new Error(membersError.message);
    }
    
    const enrichedMembers: GroupMember[] = await Promise.all(
      membersData.map(async (member) => {
        try {
          // Get user info from auth.users via RPC function
          const { data: userData } = await supabase.rpc(
            'get_user_info_from_id',
            { user_id: member.user_id }
          );
          
          if (userData) {
            return {
              ...member,
              user_email: userData.email,
              user_name: userData.name
            };
          }
          
          return member;
        } catch (userError) {
          console.error('Error fetching user details:', userError);
          return member;
        }
      })
    );
    
    return enrichedMembers;
  } catch (error) {
    console.error('Error in getGroupMembers:', error);
    throw error;
  }
};

/**
 * Invites a user to a Discord group using their email
 */
export const inviteUserToGroup = async (
  groupId: string,
  userEmail: string,
  displayName?: string
): Promise<GroupMember> => {
  try {
    // Check if user is group leader
    const isLeader = await isGroupLeader(groupId);
    if (!isLeader) {
      throw new Error('Only group leaders can invite members');
    }
    
    // Get user ID from email using the RPC function
    const { data: userId, error: userIdError } = await supabase.rpc(
      'get_user_id_from_email',
      { email: userEmail }
    );
    
    if (userIdError || !userId) {
      console.error('Error finding user by email:', userIdError);
      throw new Error('User not found with this email');
    }
    
    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('discord_group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (existingMember) {
      throw new Error('User is already a member of this group');
    }
    
    // Add user to group
    const { data: memberData, error: memberError } = await supabase
      .from('discord_group_members')
      .insert({
        group_id: groupId,
        user_id: userId,
        display_name: displayName
      })
      .select()
      .single();
      
    if (memberError) {
      console.error('Error adding user to group:', memberError);
      throw new Error(memberError.message);
    }
    
    return memberData;
  } catch (error) {
    console.error('Error in inviteUserToGroup:', error);
    throw error;
  }
};

/**
 * Updates a group member's display name
 */
export const updateMemberDisplayName = async (
  memberId: string,
  displayName: string
): Promise<GroupMember> => {
  try {
    // Get the group ID for this member to check leadership
    const { data: memberData } = await supabase
      .from('discord_group_members')
      .select('group_id')
      .eq('id', memberId)
      .single();
      
    if (!memberData) {
      throw new Error('Member not found');
    }
    
    // Check if user is group leader
    const isLeader = await isGroupLeader(memberData.group_id);
    if (!isLeader) {
      throw new Error('Only group leaders can update member names');
    }
    
    // Update the display name
    const { data: updatedMember, error: updateError } = await supabase
      .from('discord_group_members')
      .update({ display_name: displayName })
      .eq('id', memberId)
      .select()
      .single();
      
    if (updateError) {
      console.error('Error updating member display name:', updateError);
      throw new Error(updateError.message);
    }
    
    return updatedMember;
  } catch (error) {
    console.error('Error in updateMemberDisplayName:', error);
    throw error;
  }
};

/**
 * Removes a member from a group
 */
export const removeGroupMember = async (memberId: string): Promise<void> => {
  try {
    // Get the group ID for this member to check leadership
    const { data: memberData } = await supabase
      .from('discord_group_members')
      .select('group_id, user_id')
      .eq('id', memberId)
      .single();
      
    if (!memberData) {
      throw new Error('Member not found');
    }
    
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData || !userData.user) {
      throw new Error('User not authenticated');
    }
    
    // Check if user is the group leader or the member removing themselves
    const isLeader = await isGroupLeader(memberData.group_id);
    const isSelf = memberData.user_id === userData.user.id;
    
    if (!isLeader && !isSelf) {
      throw new Error('Only group leaders can remove members, or members can remove themselves');
    }
    
    // Remove the member
    const { error: deleteError } = await supabase
      .from('discord_group_members')
      .delete()
      .eq('id', memberId);
      
    if (deleteError) {
      console.error('Error removing group member:', deleteError);
      throw new Error(deleteError.message);
    }
  } catch (error) {
    console.error('Error in removeGroupMember:', error);
    throw error;
  }
};

/**
 * Generates an invite link for a group
 */
export const generateGroupInviteLink = (groupId: string): string => {
  // This is a simple implementation - in a production app you might
  // want to generate a secure token or use a shorter ID
  return `${window.location.origin}/invite/${groupId}`;
};

/**
 * Joins a group using an invite link (groupId)
 */
export const joinGroupByInvite = async (
  groupId: string, 
  displayName?: string
): Promise<GroupMember> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData || !userData.user) {
      throw new Error('User not authenticated');
    }
    
    // Check if the group exists
    const { data: groupData } = await supabase
      .from('discord_user_groups')
      .select('*')
      .eq('id', groupId)
      .single();
      
    if (!groupData) {
      throw new Error('Group not found');
    }
    
    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('discord_group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', userData.user.id)
      .maybeSingle();
      
    if (existingMember) {
      throw new Error('You are already a member of this group');
    }
    
    // Add user to group
    const { data: memberData, error: memberError } = await supabase
      .from('discord_group_members')
      .insert({
        group_id: groupId,
        user_id: userData.user.id,
        display_name: displayName || 'Member'
      })
      .select()
      .single();
      
    if (memberError) {
      console.error('Error joining group:', memberError);
      throw new Error(memberError.message);
    }
    
    return memberData;
  } catch (error) {
    console.error('Error in joinGroupByInvite:', error);
    throw error;
  }
};
