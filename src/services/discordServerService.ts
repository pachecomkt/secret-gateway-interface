
import { supabase } from '@/integrations/supabase/client';
import { ServerPreview } from '@/types/discord.types';

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

    const { data, error } = await supabase.rpc(
      'get_discord_server_preview',
      {
        server_id: serverId,
        bot_token_id: tokenId
      }
    );

    if (error) {
      console.error('Error fetching server preview:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('No server information found');
    }

    return data as ServerPreview;
  } catch (error) {
    console.error('Error in getDiscordServerPreview:', error);
    throw error;
  }
};
