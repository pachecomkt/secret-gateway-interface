
import { supabase } from "@/integrations/supabase/client";
import { UserFilter, DiscordUser } from "@/types/discord.types";

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
  users?: DiscordUser[];
}> => {
  try {
    console.log('Extracting users with filters:', filters);
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
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from API:', errorData);
      throw new Error(errorData.error || `Error extracting users: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Extraction result:', result);
    
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
    if (!userIds.length) {
      throw new Error('No users selected to send messages');
    }
    
    if (!message.trim()) {
      throw new Error('Message cannot be empty');
    }
    
    if (!tokenId) {
      throw new Error('Bot token is required');
    }
    
    console.log(`Sending message to ${userIds.length} users`);
    
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
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from API:', errorData);
      throw new Error(errorData.error || `Error sending messages: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Message sending result:', result);
    
    return result;
  } catch (error) {
    console.error('Error calling send-discord-messages function:', error);
    return {
      success: false,
      message: error.message || 'Error sending messages to Discord users'
    };
  }
};
