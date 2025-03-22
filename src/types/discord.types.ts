
// Common types for Discord-related functionality

export interface DiscordBotToken {
  id: string;
  token: string;
  description?: string;
  created_at: string;
}

export interface DiscordUserList {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  user_count?: number;
}

export interface DiscordUser {
  id: string;
  discord_id: string;
  username: string;
  role?: string;
  role_id?: string;
  last_active?: string;
  is_online: boolean;
  list_id: string;
  created_at: string;
}

export interface UserFilter {
  role: string | null;
  roleId: string | null;
  activeWithin24h: boolean;
  activeWithin72h: boolean;
  onlineOnly: boolean;
}

export interface DiscordUserGroup {
  id: string;
  name: string;
  description?: string;
  leader_id: string;
  created_at: string;
  member_count?: number;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
  user_email?: string;
  user_name?: string;
}

export interface MessageStatus {
  userId: string;
  username: string;
  status: 'pending' | 'sending' | 'success' | 'failed';
  timestamp: string;
  error?: string;
}
