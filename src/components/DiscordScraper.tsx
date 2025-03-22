
import { useState } from 'react';
import { DiscordUser } from '@/types/discord.types';
import { DiscordTokenPanel } from './DiscordTokenPanel';
import { DiscordExtractPanel } from './DiscordExtractPanel';
import { DiscordUserListPanel } from './DiscordUserListPanel';
import { DiscordMessagingPanel } from './DiscordMessagingPanel';
import { GroupManager } from './GroupManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, MessageSquare, List, Server, Puzzle } from "lucide-react";

interface BotToken {
  id: string;
  token: string;
  visible: boolean;
}

export const DiscordScraper = () => {
  const [tokens, setTokens] = useState<BotToken[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<DiscordUser[]>([]);
  const [activeTab, setActiveTab] = useState('extract');
  
  const handleTokensChange = (updatedTokens: BotToken[]) => {
    setTokens(updatedTokens);
  };
  
  const handleUsersExtracted = (listId: string, users: DiscordUser[]) => {
    setSelectedListId(listId);
    setSelectedUsers(users);
    setActiveTab('message');
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
          <Server className="h-6 w-6 text-primary" />
          Discord User Scraper
        </h2>
        <p className="text-muted-foreground">
          Gerencie tokens de bot e extraia usuários de servidores do Discord
        </p>
      </div>

      {/* Step 1: Token Management */}
      <DiscordTokenPanel onTokensChange={handleTokensChange} />

      {/* Tabs for different features */}
      <Tabs defaultValue="extract" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="extract" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Extrair</span>
          </TabsTrigger>
          <TabsTrigger value="lists" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Listas</span>
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Grupos</span>
          </TabsTrigger>
          <TabsTrigger value="message" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Mensagens</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="extract" className="mt-6">
          <DiscordExtractPanel 
            tokenId={firstTokenId} 
            onUsersExtracted={handleUsersExtracted} 
          />
        </TabsContent>

        <TabsContent value="lists" className="mt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <List className="h-5 w-5" />
              Listas de Usuários
            </h3>
            <DiscordUserListPanel onListSelect={handleListSelect} />
          </div>
        </TabsContent>

        <TabsContent value="groups" className="mt-6">
          <GroupManager />
        </TabsContent>

        <TabsContent value="message" className="mt-6">
          <DiscordMessagingPanel 
            users={selectedUsers} 
            tokenId={firstTokenId} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
