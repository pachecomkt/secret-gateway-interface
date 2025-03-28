
import { useState } from 'react';
import { extractDiscordUsers } from '@/services/discordService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Users, Server, Filter } from "lucide-react";
import { ServerPreview } from './ServerPreview';
import { useToast } from "@/hooks/use-toast";
import { DiscordUser, UserFilter } from '@/types/discord.types';

interface DiscordExtractPanelProps {
  tokenId: string;
  onUsersExtracted: (listId: string, users: DiscordUser[]) => void;
}

export const DiscordExtractPanel = ({ tokenId, onUsersExtracted }: DiscordExtractPanelProps) => {
  const [serverId, setServerId] = useState('');
  const [listName, setListName] = useState('');
  const [roleIdFilter, setRoleIdFilter] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [filters, setFilters] = useState<UserFilter>({
    role: null,
    roleId: null,
    activeWithin24h: false,
    activeWithin72h: false,
    onlineOnly: false
  });
  
  const { toast } = useToast();
  
  const handleFilterChange = (key: keyof UserFilter, value: any) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };

  const handleExtract = async () => {
    if (!serverId) {
      toast({
        title: "Erro",
        description: "Por favor, insira o ID do servidor",
        variant: "destructive",
      });
      return;
    }

    if (!tokenId) {
      toast({
        title: "Erro",
        description: "Por favor, adicione um token de bot primeiro",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsExtracting(true);
      
      // Generate a default list name if not provided
      const extractListName = listName || `Lista do servidor ${serverId}`;
      
      // Apply role ID filter if provided
      const updatedFilters = {
        ...filters,
        roleId: roleIdFilter || null
      };
      
      console.log('Extracting with filters:', updatedFilters);
      
      const result = await extractDiscordUsers(
        serverId, 
        tokenId, 
        updatedFilters,
        extractListName
      );
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      toast({
        title: "Sucesso",
        description: `${result.users?.length || 0} usuários extraídos com sucesso!`,
      });
      
      if (result.users && result.listId) {
        onUsersExtracted(result.listId, result.users);
      }
      
      // Limpar campos após sucesso
      setListName('');
      
    } catch (error) {
      console.error('Error extracting users:', error);
      
      toast({
        title: "Erro",
        description: error.message || "Erro ao extrair usuários",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Server className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Extrair Usuários do Discord</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="server-id">ID do Servidor</Label>
          <Input
            id="server-id"
            placeholder="ID do servidor Discord"
            value={serverId}
            onChange={(e) => setServerId(e.target.value)}
            className="bg-secondary/50"
          />
          
          {/* Server Preview */}
          {serverId && tokenId && (
            <ServerPreview serverId={serverId} tokenId={tokenId} />
          )}
        </div>
        
        <div>
          <Label htmlFor="list-name">Nome da Lista (opcional)</Label>
          <Input
            id="list-name"
            placeholder="Nome para identificar esta lista"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            className="bg-secondary/50"
          />
        </div>
        
        <Card className="border-primary/20">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <h4 className="font-medium">Filtros</h4>
            </div>
            
            <div className="space-y-3">              
              <div>
                <Label htmlFor="role-id-filter">ID do Cargo</Label>
                <Input
                  id="role-id-filter"
                  placeholder="ID do cargo específico para filtrar membros"
                  value={roleIdFilter}
                  onChange={(e) => setRoleIdFilter(e.target.value)}
                  className="bg-secondary/50 mt-1"
                />
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="filter-online"
                    checked={filters.onlineOnly}
                    onCheckedChange={(checked) => 
                      handleFilterChange('onlineOnly', checked === true)
                    }
                  />
                  <Label htmlFor="filter-online">Apenas usuários online</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="filter-24h"
                    checked={filters.activeWithin24h}
                    onCheckedChange={(checked) => 
                      handleFilterChange('activeWithin24h', checked === true)
                    }
                  />
                  <Label htmlFor="filter-24h">Ativos nas últimas 24 horas</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="filter-72h"
                    checked={filters.activeWithin72h}
                    onCheckedChange={(checked) => 
                      handleFilterChange('activeWithin72h', checked === true)
                    }
                  />
                  <Label htmlFor="filter-72h">Ativos nas últimas 72 horas</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Button 
          onClick={handleExtract} 
          className="w-full" 
          disabled={isExtracting || !serverId || !tokenId}
        >
          {isExtracting ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Extraindo...
            </>
          ) : (
            <>
              <Users className="h-4 w-4 mr-2" />
              Extrair Usuários
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
