
import { supabase } from "@/integrations/supabase/client";
import { DiscordUserGroup, GroupMember } from "@/types/discord.types";

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
export const getDiscordGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
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
          // Call the RPC function without type parameters but using 'as any'
          const { data: userData, error: userError } = await supabase.rpc(
            'get_user_info_from_id' as any,
            { user_id: member.user_id }
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
    console.error('Error in getDiscordGroupMembers:', error);
    throw error;
  }
};

// Add a member to a Discord user group by email
export const addDiscordGroupMemberByEmail = async (
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
    
    // Call RPC function without type parameters but using 'as any'
    const { data: userIdData, error: userIdError } = await supabase.rpc(
      'get_user_id_from_email' as any,
      { email: userEmail }
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
    console.error('Error in addDiscordGroupMemberByEmail:', error);
    throw error;
  }
};

// Remove a member from a Discord user group
export const removeDiscordGroupMember = async (
  groupId: string,
  memberId: string
): Promise<void> => {
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
      throw new Error('Only group leaders can remove members');
    }
    
    // Remove the member
    const { error } = await supabase
      .from('discord_group_members')
      .delete()
      .eq('id', memberId)
      .eq('group_id', groupId);
      
    if (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in removeDiscordGroupMember:', error);
    throw error;
  }
};
