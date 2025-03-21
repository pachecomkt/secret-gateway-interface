
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiscordScraper } from './DiscordScraper';
import { PasswordManager } from './PasswordManager';
import { GroupManager } from './GroupManager';
import { Users } from 'lucide-react';

interface MainLayoutProps {
  isSuperUser: boolean;
  isAdmin?: boolean;
  isRegularUser?: boolean;
}

export const MainLayout = ({ isSuperUser, isAdmin, isRegularUser }: MainLayoutProps) => {
  const [activeTab, setActiveTab] = useState("scraper");

  // Determine the number of columns for the tabs list
  const getTabsGridCols = () => {
    if (isSuperUser) return 'grid-cols-3';
    if (isRegularUser) return 'grid-cols-2';
    return 'grid-cols-1';
  };

  return (
    <div className="container mx-auto p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${getTabsGridCols()}`}>
          <TabsTrigger value="scraper">Discord Scraper</TabsTrigger>
          {(isSuperUser || isRegularUser) && (
            <TabsTrigger value="groups">
              <Users className="h-4 w-4 mr-2" />
              Gerenciar Grupos
            </TabsTrigger>
          )}
          {isSuperUser && (
            <TabsTrigger value="passwords">Gerenciar Senhas</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="scraper">
          <DiscordScraper />
        </TabsContent>
        
        {(isSuperUser || isRegularUser) && (
          <TabsContent value="groups">
            <GroupManager />
          </TabsContent>
        )}
        
        {isSuperUser && (
          <TabsContent value="passwords">
            <PasswordManager isSuperUser={true} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
