
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiscordScraper } from './DiscordScraper';
import { PasswordManager } from './PasswordManager';

interface MainLayoutProps {
  isSuperUser: boolean;
  isAdmin?: boolean;
  isRegularUser?: boolean;
}

export const MainLayout = ({ isSuperUser, isAdmin, isRegularUser }: MainLayoutProps) => {
  const [activeTab, setActiveTab] = useState("scraper");

  return (
    <div className="container mx-auto p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${isSuperUser ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <TabsTrigger value="scraper">Discord Scraper</TabsTrigger>
          {isSuperUser && (
            <TabsTrigger value="passwords">Gerenciar Senhas</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="scraper">
          <DiscordScraper />
        </TabsContent>
        
        {isSuperUser && (
          <TabsContent value="passwords">
            <PasswordManager isSuperUser={true} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
