
import { supabase } from '@/integrations/supabase/client';
import { ServerPreview } from '@/types/discord.types';

// Define the shape of the data returned by the RPC function
interface ServerPreviewRpcResponse {
  id: string;
  name: string;
  icon_url: string;
  member_count: number;
}

// Define parameters for the RPC function
interface ServerPreviewParams {
  server_id: string;
  bot_token_id: string;
}

/**
 * Get preview information for a Discord server
 */
export const getDiscordServerPreview = async (
  serverId: string,
  tokenId: string
): Promise<ServerPreview> => {
  try {
    if (!serverId || !tokenId) {
      throw new Error('Server ID and token ID are required');
    }

    // Cast to the correct parameter type and use 'any' for the function name
    const { data, error } = await supabase.rpc(
      'get_discord_server_preview' as any,
      {
        server_id: serverId,
        bot_token_id: tokenId
      } as ServerPreviewParams
    );

    if (error) {
      console.error('Error fetching server preview:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('No server information found');
    }

    // Cast data to any to safely access properties
    const responseData = data as any;
    
    // Construct the properly typed ServerPreview object
    const serverPreview: ServerPreview = {
      id: responseData.id || '',
      name: responseData.name || '',
      icon_url: responseData.icon_url || '',
      member_count: responseData.member_count || 0
    };

    return serverPreview;
  } catch (error) {
    console.error('Error in getDiscordServerPreview:', error);
    throw error;
  }
};
