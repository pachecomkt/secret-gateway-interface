
import { supabase } from '@/integrations/supabase/client';
import { ServerPreview } from '@/types/discord.types';

// Define the shape of the data returned by the RPC function
interface ServerPreviewRpcResponse {
  id: string;
  name: string;
  icon_url: string;
  member_count: number;
}

// Define the input parameters for the RPC function
interface GetServerPreviewParams {
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

    // Specify both input and output generic types for the RPC call
    const { data, error } = await supabase.rpc<
      ServerPreviewRpcResponse,
      GetServerPreviewParams
    >('get_discord_server_preview', {
      server_id: serverId,
      bot_token_id: tokenId
    });

    if (error) {
      console.error('Error fetching server preview:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('No server information found');
    }

    // Cast and validate the data to ensure it matches ServerPreview type
    const serverPreview: ServerPreview = {
      id: data.id || '',
      name: data.name || '',
      icon_url: data.icon_url || '',
      member_count: data.member_count || 0
    };

    return serverPreview;
  } catch (error) {
    console.error('Error in getDiscordServerPreview:', error);
    throw error;
  }
};
