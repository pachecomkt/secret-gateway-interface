
import { useState } from 'react';
import { DiscordUser } from '@/types/discord.types';
import { DiscordTokenPanel } from './DiscordTokenPanel';
import { DiscordExtractPanel } from './DiscordExtractPanel';
import { DiscordUserListPanel } from './DiscordUserListPanel';
import { DiscordMessagingPanel } from './DiscordMessagingPanel';

interface BotToken {
  id: string;
  token: string;
  visible: boolean;
}

export const DiscordScraper = () => {
  const [tokens, setTokens] = useState<BotToken[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<DiscordUser[]>([]);
  
  const handleTokensChange = (updatedTokens: BotToken[]) => {
    setTokens(updatedTokens);
  };
  
  const handleUsersExtracted = (listId: string, users: DiscordUser[]) => {
    setSelectedListId(listId);
    setSelectedUsers(users);
  };
  
  const handleListSelect = (listId: string, users: DiscordUser[]) => {
    setSelectedListId(listId);
    setSelectedUsers(users);
  };
  
  // Get the first token id for use in components
  const firstTokenId = tokens.length > 0 ? tokens[0].id : '';

  return (
    <div className="glass rounded-lg p-6 space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Discord User Scraper
        </h2>
        <p className="text-muted-foreground">
          Gerencie tokens de bot e extraia usuários de servidores do Discord
        </p>
      </div>

      {/* Step 1: Token Management */}
      <DiscordTokenPanel onTokensChange={handleTokensChange} />

      {/* Step 2: User Extraction */}
      <DiscordExtractPanel 
        tokenId={firstTokenId} 
        onUsersExtracted={handleUsersExtracted} 
      />

      {/* Step 3: User List Management */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Gerenciar Listas de Usuários</h3>
        <DiscordUserListPanel onListSelect={handleListSelect} />
      </div>

      {/* Step 4: Messaging */}
      <DiscordMessagingPanel 
        users={selectedUsers} 
        tokenId={firstTokenId} 
      />
    </div>
  );
};
