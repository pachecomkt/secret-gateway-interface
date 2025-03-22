
import { supabase } from "@/integrations/supabase/client";
import { UserFilter } from "@/types/discord.types";

// Function to extract users from Discord
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
      throw new Error(result.error || 'Error extracting users');
    }
    
    return result;
  } catch (error) {
    console.error('Error calling extract-discord-users function:', error);
    return {
      success: false,
      message: error.message || 'Error extracting users from Discord'
    };
  }
};

// Function to send direct messages to Discord users
export const sendDirectMessagesToUsers = async (
  userIds: string[],
  message: string,
  tokenId: string
): Promise<{
  success: boolean;
  message: string;
  results?: { userId: string; success: boolean; error?: string }[];
}> => {
  try {
    const response = await fetch('/api/send-discord-messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify({
        userIds,
        message,
        tokenId
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Error sending messages');
    }
    
    return result;
  } catch (error) {
    console.error('Error calling send-discord-messages function:', error);
    return {
      success: false,
      message: error.message || 'Error sending messages to Discord users'
    };
  }
};
