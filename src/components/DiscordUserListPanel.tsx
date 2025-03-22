
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Trash, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DiscordUserList, DiscordUser } from "@/types/discord.types";
import { getDiscordUserLists, getDiscordUsers, deleteDiscordUserList } from "@/services/discordService";

interface DiscordUserListPanelProps {
  onListSelect: (listId: string, users: DiscordUser[]) => void;
}

export const DiscordUserListPanel = ({ onListSelect }: DiscordUserListPanelProps) => {
  const [savedLists, setSavedLists] = useState<DiscordUserList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [scrapedUsers, setScrapedUsers] = useState<DiscordUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    loadSavedLists();
  }, []);

  const loadSavedLists = async () => {
    try {
      const lists = await getDiscordUserLists();
      setSavedLists(lists);
    } catch (error) {
      console.error('Error loading lists:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as listas salvas",
        variant: "destructive",
      });
    }
  };

  const loadList = async (listId: string) => {
    try {
      setIsLoading(true);
      
      // Fetch users from the list
      const users = await getDiscordUsers(listId);
      
      setScrapedUsers(users);
      setSelectedListId(listId);
      
      // Notify parent component about selection
      onListSelect(listId, users);
      
      const list = savedLists.find(list => list.id === listId);
      
      toast({
        title: "Lista carregada",
        description: `Lista "${list?.name}" com ${users.length} usuários`,
      });
    } catch (error) {
      console.error('Error loading list:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar a lista de usuários",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteList = async (listId: string) => {
    try {
      await deleteDiscordUserList(listId);
      
      setSavedLists(savedLists.filter(list => list.id !== listId));
      
      if (selectedListId === listId) {
        setSelectedListId(null);
        setScrapedUsers([]);
        onListSelect("", []);
      }
      
      toast({
        title: "Lista removida",
        description: "A lista foi removida com sucesso",
      });
    } catch (error) {
      console.error('Error removing list:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover a lista",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="md:w-1/2 space-y-2">
        <div className="font-medium text-sm">Listas Salvas</div>
        {savedLists.length === 0 ? (
          <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-md text-center">
            Nenhuma lista salva
          </div>
        ) : (
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
            {savedLists.map(list => (
              <div 
                key={list.id}
                className={`flex items-center justify-between p-3 rounded-md border ${
                  selectedListId === list.id ? 'bg-primary/10 border-primary/30' : 'bg-secondary/20'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{list.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {list.user_count} usuários • {new Date(list.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => loadList(list.id)}
                    disabled={isLoading}
                  >
                    {isLoading && selectedListId === list.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    ) : (
                      'Usar'
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteList(list.id)}
                    disabled={isLoading}
                  >
                    <Trash className="h-4 w-4 text-destructive-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="md:w-1/2 space-y-2">
        <div className="font-medium text-sm">Usuários da Lista Atual</div>
        <div className="p-4 border rounded-md bg-secondary/10 max-h-[200px] overflow-y-auto">
          {scrapedUsers.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm">
              Nenhum usuário extraído ainda
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Última Atividade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scrapedUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-xs">{user.discord_id.slice(0, 6)}...</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      {user.role && (
                        <Badge variant="outline" title={`ID: ${user.role_id || 'N/A'}`}>
                          {user.role}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.is_online ? (
                        <Badge className="bg-green-500">Online</Badge>
                      ) : (
                        <Badge variant="outline">Offline</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {user.last_active ? new Date(user.last_active).toLocaleString() : 'Desconhecido'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        {scrapedUsers.length > 0 && (
          <div className="text-sm text-right">
            {scrapedUsers.length} usuários disponíveis
          </div>
        )}
      </div>
    </div>
  );
};
