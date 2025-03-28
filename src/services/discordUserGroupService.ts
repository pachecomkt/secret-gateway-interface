
import { supabase } from "@/integrations/supabase/client";
import { DiscordUserGroup, GroupMember } from "@/types/discord.types";

// Parameters for RPC functions
interface UserIdFromEmailParams {
  email: string;
}

interface UserInfoFromIdParams {
  user_id: string;
}

// Get all discord user groups
export const getDiscordUserGroups = async (): Promise<DiscordUserGroup[]> => {
  try {
    // First fetch the groups
    const { data: groups, error } = await supabase
      .from('discord_user_groups')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
    
    if (!groups || groups.length === 0) {
      return [];
    }
    
    // Now fetch the member count for each group
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
  } catch (error) {
    console.error('Error in getDiscordUserGroups:', error);
    throw error;
  }
};

// Create a new Discord user group
export const createDiscordUserGroup = async (
  name: string, 
  description?: string
): Promise<DiscordUserGroup> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('discord_user_groups')
      .insert({
        name,
        description,
        leader_id: user.id
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating group:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createDiscordUserGroup:', error);
    throw error;
  }
};

// Delete a Discord user group
export const deleteDiscordUserGroup = async (groupId: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Check if the user is the leader of the group
    const { data: group } = await supabase
      .from('discord_user_groups')
      .select('*')
      .eq('id', groupId)
      .eq('leader_id', user.id)
      .single();
      
    if (!group) {
      throw new Error('You are not authorized to delete this group');
    }
    
    // Delete the group (members will be automatically deleted due to CASCADE)
    const { error } = await supabase
      .from('discord_user_groups')
      .delete()
      .eq('id', groupId);
      
    if (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteDiscordUserGroup:', error);
    throw error;
  }
};

// Get members of a Discord user group
export const getGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
  try {
    // First get the basic member data
    const { data: membersData, error } = await supabase
      .from('discord_group_members')
      .select('*')
      .eq('group_id', groupId);
      
    if (error) {
      console.error('Error fetching group members:', error);
      throw error;
    }
    
    if (!membersData || membersData.length === 0) {
      return [];
    }
    
    // Enrich with user information
    const enrichedMembers: GroupMember[] = await Promise.all(
      membersData.map(async (member) => {
        try {
          // Call the RPC function with proper type casting
          const { data: userData, error: userError } = await supabase.rpc(
            'get_user_info_from_id' as any,
            { user_id: member.user_id } as UserInfoFromIdParams
          );
          
          if (userError) {
            console.error(`Error getting user info for ${member.user_id}:`, userError);
            return member;
          }
          
          if (userData) {
            // Cast to any to safely access properties
            const userInfo = userData as any;
            return {
              ...member,
              user_email: userInfo.email,
              user_name: userInfo.name
            };
          }
          
          return member;
        } catch (error) {
          console.error(`Error enriching member ${member.id}:`, error);
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

// Add a member to a Discord user group by email
export const inviteUserToGroup = async (
  groupId: string,
  userEmail: string,
  displayName?: string
): Promise<GroupMember> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Check if the user is the leader of the group
    const { data: group } = await supabase
      .from('discord_user_groups')
      .select('*')
      .eq('id', groupId)
      .eq('leader_id', user.id)
      .single();
      
    if (!group) {
      throw new Error('Only group leaders can invite members');
    }
    
    // Call RPC function with proper type casting
    const { data: userIdData, error: userIdError } = await supabase.rpc(
      'get_user_id_from_email' as any,
      { email: userEmail } as UserIdFromEmailParams
    );
    
    if (userIdError || !userIdData) {
      console.error('Error finding user by email:', userIdError);
      throw new Error('User not found with this email');
    }
    
    // Cast to string to ensure correct type
    const userId = String(userIdData);
    
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
    
    // Add the member
    const { data: newMember, error: insertError } = await supabase
      .from('discord_group_members')
      .insert({
        group_id: groupId,
        user_id: userId,
        display_name: displayName
      })
      .select()
      .single();
      
    if (insertError) {
      console.error('Error adding member:', insertError);
      throw insertError;
    }
    
    return {
      ...newMember,
      user_email: userEmail
    };
  } catch (error) {
    console.error('Error in inviteUserToGroup:', error);
    throw error;
  }
};

// Remove a member from a Discord user group
export const removeGroupMember = async (
  memberId: string
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Get the member to get the group_id
    const { data: member } = await supabase
      .from('discord_group_members')
      .select('group_id')
      .eq('id', memberId)
      .single();
      
    if (!member) {
      throw new Error('Member not found');
    }
    
    // Check if the user is the leader of the group
    const { data: group } = await supabase
      .from('discord_user_groups')
      .select('*')
      .eq('id', member.group_id)
      .eq('leader_id', user.id)
      .single();
      
    if (!group) {
      throw new Error('Only group leaders can remove members');
    }
    
    // Remove the member
    const { error } = await supabase
      .from('discord_group_members')
      .delete()
      .eq('id', memberId);
      
    if (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in removeGroupMember:', error);
    throw error;
  }
};

// Check if current user is a group leader
export const isGroupLeader = async (groupId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }
    
    const { data } = await supabase
      .from('discord_user_groups')
      .select('*')
      .eq('id', groupId)
      .eq('leader_id', user.id)
      .single();
      
    return !!data;
  } catch (error) {
    console.error('Error checking if group leader:', error);
    return false;
  }
};

// Update member display name
export const updateMemberDisplayName = async (
  memberId: string,
  displayName: string
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Get the member to get the group_id
    const { data: member } = await supabase
      .from('discord_group_members')
      .select('group_id')
      .eq('id', memberId)
      .single();
      
    if (!member) {
      throw new Error('Member not found');
    }
    
    // Check if the user is the leader of the group
    const { data: isLeader } = await supabase
      .from('discord_user_groups')
      .select('*')
      .eq('id', member.group_id)
      .eq('leader_id', user.id)
      .single();
      
    if (!isLeader) {
      throw new Error('Only group leaders can update member names');
    }
    
    // Update the member
    const { error } = await supabase
      .from('discord_group_members')
      .update({ display_name: displayName })
      .eq('id', memberId);
      
    if (error) {
      console.error('Error updating member name:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateMemberDisplayName:', error);
    throw error;
  }
};

// Generate an invite link for a group
export const generateGroupInviteLink = (groupId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/groups/join?id=${groupId}`;
};
