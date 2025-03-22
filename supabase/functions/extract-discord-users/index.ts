
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
      serverId, 
      tokenId,
      filters,
      listName,
      listDescription 
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
        JSON.stringify({ error: 'Permissão negada' }),
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
        JSON.stringify({ error: 'Token de bot não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Discord API to get server information first
    const serverApiUrl = `https://discord.com/api/v10/guilds/${serverId}`;
    const serverResponse = await fetch(serverApiUrl, {
      headers: {
        'Authorization': `Bot ${botToken.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    let serverInfo = null;
    if (serverResponse.ok) {
      serverInfo = await serverResponse.json();
      console.log(`Servidor encontrado: ${serverInfo.name}`);
    } else {
      const errorData = await serverResponse.json();
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao obter informações do servidor Discord', 
          details: errorData,
          status: serverResponse.status
        }),
        { status: serverResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Discord API to fetch users
    console.log(`Extraindo usuários do servidor ${serverId} com token ${tokenId}...`);
    
    // Construa a URL da API com base no servidor solicitado
    const discordApiUrl = `https://discord.com/api/v10/guilds/${serverId}/members?limit=1000`;
    
    // Chamar a API do Discord com o token do bot
    const discordResponse = await fetch(discordApiUrl, {
      headers: {
        'Authorization': `Bot ${botToken.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!discordResponse.ok) {
      const errorData = await discordResponse.json();
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao extrair usuários do Discord', 
          details: errorData,
          status: discordResponse.status
        }),
        { status: discordResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse the response
    const members = await discordResponse.json();
    console.log(`Extraídos ${members.length} membros do servidor`);

    // Also fetch roles from the server to get role names
    const rolesApiUrl = `https://discord.com/api/v10/guilds/${serverId}/roles`;
    const rolesResponse = await fetch(rolesApiUrl, {
      headers: {
        'Authorization': `Bot ${botToken.token}`,
        'Content-Type': 'application/json'
      }
    });

    let roles = [];
    if (rolesResponse.ok) {
      roles = await rolesResponse.json();
      console.log(`Extraídos ${roles.length} cargos do servidor`);
    } else {
      console.error('Erro ao buscar cargos do servidor');
    }
    
    // Process and filter members
    let filteredMembers = members.map((member: any) => {
      // Converter timestamp de presence.last_activity para Date
      const lastActive = member.presence?.last_activity 
        ? new Date(member.presence.last_activity) 
        : null;
        
      // Detectar se o usuário está online
      const isOnline = member.presence?.status === 'online' || 
                      member.presence?.status === 'idle' || 
                      member.presence?.status === 'dnd';
      
      // Obter o cargo mais alto do usuário (pelo ID)
      let highestRoleId = null;
      let highestRoleName = 'Member';
      
      if (member.roles && member.roles.length > 0) {
        // Filtrar apenas os cargos que existem no membro
        const memberRoles = roles.filter((role: any) => 
          member.roles.includes(role.id)
        );
        
        // Ordenar por posição (maior posição é mais importante)
        if (memberRoles.length > 0) {
          const sortedRoles = memberRoles.sort((a: any, b: any) => b.position - a.position);
          highestRoleId = sortedRoles[0].id;
          highestRoleName = sortedRoles[0].name;
        }
      }
                      
      return {
        discord_id: member.user.id,
        username: member.user.username || member.nick || `User_${member.user.id}`,
        role: highestRoleName,
        role_id: highestRoleId,
        last_active: lastActive,
        is_online: isOnline || false
      };
    });
    
    // Aplicar filtros
    if (filters) {
      // Filtrar por cargo (nome)
      if (filters.role) {
        filteredMembers = filteredMembers.filter((member: any) => 
          member.role === filters.role
        );
      }
      
      // Filtrar por cargo (ID)
      if (filters.roleId) {
        filteredMembers = filteredMembers.filter((member: any) => 
          member.role_id === filters.roleId
        );
      }
      
      // Filtrar por ativos nas últimas 24 horas
      if (filters.activeWithin24h) {
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);
        
        filteredMembers = filteredMembers.filter((member: any) => 
          member.last_active && new Date(member.last_active) > oneDayAgo
        );
      }
      
      // Filtrar por ativos nas últimas 72 horas (3 dias)
      if (filters.activeWithin72h) {
        const threeDaysAgo = new Date();
        threeDaysAgo.setHours(threeDaysAgo.getHours() - 72);
        
        filteredMembers = filteredMembers.filter((member: any) => 
          member.last_active && new Date(member.last_active) > threeDaysAgo
        );
      }
      
      // Filtrar por usuários online
      if (filters.onlineOnly) {
        filteredMembers = filteredMembers.filter((member: any) => 
          member.is_online
        );
      }
    }
    
    // Criar uma nova lista no Supabase
    const { data: newList, error: listError } = await supabase
      .from('discord_user_lists')
      .insert({
        name: listName || `Lista do servidor ${serverInfo?.name || serverId}`,
        description: listDescription || `Extraído em ${new Date().toISOString()}`,
        created_by: user.id
      })
      .select()
      .single();
      
    if (listError || !newList) {
      return new Response(
        JSON.stringify({ error: 'Erro ao criar lista de usuários', details: listError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Preparar os dados dos usuários para inserção
    const usersToInsert = filteredMembers.map((member: any) => ({
      ...member,
      list_id: newList.id
    }));
    
    // Inserir os usuários no Supabase
    const { data: insertedUsers, error: insertError } = await supabase
      .from('discord_users')
      .insert(usersToInsert);
      
    if (insertError) {
      // Se houver erro na inserção, remover a lista criada anteriormente
      await supabase.from('discord_user_lists').delete().eq('id', newList.id);
      
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar usuários', details: insertError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Return success response with server preview
    return new Response(
      JSON.stringify({
        success: true,
        message: `${filteredMembers.length} usuários extraídos com sucesso`,
        listId: newList.id,
        listName: newList.name,
        users: filteredMembers,
        serverInfo: {
          id: serverInfo.id,
          name: serverInfo.name,
          icon_url: serverInfo.icon 
            ? `https://cdn.discordapp.com/icons/${serverInfo.id}/${serverInfo.icon}.png` 
            : null,
          member_count: serverInfo.approximate_member_count || filteredMembers.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Erro na função extract-discord-users:", error.message);
    
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
