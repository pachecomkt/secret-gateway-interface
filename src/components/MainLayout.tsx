
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiscordScraper } from './DiscordScraper';
import { PasswordManager } from './PasswordManager';

export const MainLayout = () => {
  const [activeTab, setActiveTab] = useState("scraper");

  return (
    <div className="container mx-auto p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scraper">Discord Scraper</TabsTrigger>
          <TabsTrigger value="passwords">Gerenciar Senhas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scraper">
          <DiscordScraper />
        </TabsContent>
        
        <TabsContent value="passwords">
          <PasswordManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
