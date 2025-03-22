
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { 
      userIds, 
      message,
      tokenId
    } = await req.json();

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract the JWT token from the authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the user is authenticated and get their ID
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the user is a super user or admin
    const { data: superUser } = await supabase
      .from('super_users')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
      
    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
      
    if (!superUser && !admin) {
      return new Response(
        JSON.stringify({ error: 'Permission denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the Discord bot token
    const { data: botToken, error: tokenError } = await supabase
      .from('discord_bot_tokens')
      .select('token')
      .eq('id', tokenId)
      .maybeSingle();
      
    if (tokenError || !botToken) {
      return new Response(
        JSON.stringify({ error: 'Bot token not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send messages to each user
    console.log(`Sending message to ${userIds.length} users`);
    
    const results = [];
    for (const userId of userIds) {
      try {
        // Create a DM channel with the user
        const dmChannelResponse = await fetch(`https://discord.com/api/v10/users/@me/channels`, {
          method: 'POST',
          headers: {
            'Authorization': `Bot ${botToken.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ recipient_id: userId })
        });

        if (!dmChannelResponse.ok) {
          const errorData = await dmChannelResponse.json();
          console.error(`Error creating DM channel for user ${userId}:`, errorData);
          
          results.push({
            userId,
            success: false,
            error: `Failed to create DM channel: ${errorData.message || 'Unknown error'}`
          });
          
          continue;
        }

        const dmChannel = await dmChannelResponse.json();
        
        // Send message to the DM channel
        const messageResponse = await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bot ${botToken.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content: message })
        });

        if (!messageResponse.ok) {
          const errorData = await messageResponse.json();
          console.error(`Error sending message to user ${userId}:`, errorData);
          
          results.push({
            userId,
            success: false,
            error: `Failed to send message: ${errorData.message || 'Unknown error'}`
          });
          
          continue;
        }

        // Message sent successfully
        results.push({
          userId,
          success: true
        });
        
        // Sleep for a short time to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error sending message to user ${userId}:`, error);
        
        results.push({
          userId,
          success: false,
          error: error.message || 'Unknown error'
        });
      }
    }
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Message sending process completed`,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in send-discord-messages function:", error.message);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
