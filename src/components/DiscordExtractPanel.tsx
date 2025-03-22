
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Server, Filter, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UserFilter, DiscordUser } from "@/types/discord.types";
import { extractDiscordUsers } from "@/services/discordExtractService";

interface DiscordExtractPanelProps {
  tokenId: string;
  onUsersExtracted: (listId: string, users: DiscordUser[]) => void;
}

export const DiscordExtractPanel = ({ tokenId, onUsersExtracted }: DiscordExtractPanelProps) => {
  const [serverId, setServerId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  
  // User filtering
  const [userFilter, setUserFilter] = useState<UserFilter>({
    role: null,
    roleId: null,
    activeWithin24h: false,
    activeWithin72h: false,
    onlineOnly: false
  });
  const [availableRoles] = useState<string[]>([
    "Admin", "Moderator", "VIP", "Member", "New User"
  ]);
  const [roleIdInput, setRoleIdInput] = useState("");
  
  const { toast } = useToast();

  const scrapeUsers = async () => {
    if (!serverId) {
      toast({
        title: "Erro",
        description: "Por favor, insira um ID de servidor",
        variant: "destructive",
      });
      return;
    }
    if (!tokenId) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um token de bot",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Iniciando",
      description: "Iniciando extração de usuários...",
    });
    
    setIsLoading(true);
    
    try {
      const result = await extractDiscordUsers(
        serverId,
        tokenId,
        userFilter,
        `Lista do servidor ${serverId}`,
        `Extraído em ${new Date().toLocaleString()}`
      );
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Transform extracted users to the expected format
      const extractedUsers: DiscordUser[] = (result.users || []);
      
      // If a list was created, notify parent component
      if (result.listId) {
        onUsersExtracted(result.listId, extractedUsers);
      }
      
      toast({
        title: "Sucesso",
        description: `${extractedUsers.length} usuários extraídos com sucesso`,
      });
    } catch (error) {
      console.error('Error extracting users:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao extrair usuários do Discord",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add role ID filter
  const addRoleIdFilter = () => {
    if (roleIdInput) {
      setUserFilter({
        ...userFilter,
        roleId: roleIdInput
      });
      setRoleIdInput("");
    }
  };

  // Function to apply filters
  const applyFilters = () => {
    setFilterDialogOpen(false);
    
    toast({
      title: "Filtros aplicados",
      description: "Os filtros serão aplicados na próxima extração de usuários",
    });
  };

  const resetFilters = () => {
    setUserFilter({
      role: null,
      roleId: null,
      activeWithin24h: false,
      activeWithin72h: false,
      onlineOnly: false
    });
    setRoleIdInput("");
    
    setFilterDialogOpen(false);
    
    toast({
      title: "Filtros resetados",
      description: "Todos os filtros foram removidos",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Server className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Extrair Usuários do Discord</h3>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="ID do Servidor Discord"
            value={serverId}
            onChange={(e) => setServerId(e.target.value)}
            className="bg-secondary/50"
          />
        </div>
        <Button 
          variant="outline" 
          onClick={() => setFilterDialogOpen(true)}
          className="flex items-center gap-1"
        >
          <Filter className="h-3.5 w-3.5" />
          Filtros
        </Button>
      </div>
      
      {/* Show filter info if any filter is active */}
      {(userFilter.role || userFilter.roleId || userFilter.activeWithin24h || userFilter.activeWithin72h || userFilter.onlineOnly) && (
        <div className="flex flex-wrap gap-2 mt-2">
          {userFilter.role && (
            <Badge variant="outline" className="bg-primary/10">
              Cargo: {userFilter.role}
            </Badge>
          )}
          {userFilter.roleId && (
            <Badge variant="outline" className="bg-primary/10">
              ID do Cargo: {userFilter.roleId}
            </Badge>
          )}
          {userFilter.activeWithin24h && (
            <Badge variant="outline" className="bg-primary/10">
              Ativos em 24h
            </Badge>
          )}
          {userFilter.activeWithin72h && (
            <Badge variant="outline" className="bg-primary/10">
              Ativos em 3 dias
            </Badge>
          )}
          {userFilter.onlineOnly && (
            <Badge variant="outline" className="bg-primary/10">
              Apenas online
            </Badge>
          )}
        </div>
      )}
      
      <Button 
        onClick={scrapeUsers} 
        variant="default" 
        className="bg-blue-600 hover:bg-blue-700 w-full"
        disabled={isLoading || !tokenId}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            <span>Extraindo...</span>
          </div>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Extrair Usuários do Discord
          </>
        )}
      </Button>

      {/* Dialog for filtering users */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtrar Usuários para Extração</DialogTitle>
            <DialogDescription>
              Defina critérios para filtrar os usuários que serão extraídos.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Filtrar por Cargo</label>
              <Select 
                value={userFilter.role || ""} 
                onValueChange={(value) => setUserFilter({...userFilter, role: value || null})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os cargos</SelectItem>
                  {availableRoles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Filtrar por ID de Cargo</label>
              <div className="flex gap-2">
                <Input 
                  placeholder="ID do cargo no Discord" 
                  value={roleIdInput}
                  onChange={(e) => setRoleIdInput(e.target.value)}
                />
                <Button variant="outline" onClick={addRoleIdFilter} disabled={!roleIdInput}>
                  Adicionar
                </Button>
              </div>
              
              {userFilter.roleId && (
                <div className="mt-2">
                  <Badge className="bg-primary/10 p-1.5">
                    ID do Cargo: {userFilter.roleId}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-2 hover:bg-destructive/20"
                      onClick={() => setUserFilter({...userFilter, roleId: null})}
                    >
                      ×
                    </Button>
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Filtros de Atividade</label>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="activeWithin24h" 
                  checked={userFilter.activeWithin24h}
                  onCheckedChange={(checked) => 
                    setUserFilter({...userFilter, activeWithin24h: checked as boolean})
                  }
                />
                <label 
                  htmlFor="activeWithin24h" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Extrair apenas usuários ativos nas últimas 24 horas
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="activeWithin72h" 
                  checked={userFilter.activeWithin72h}
                  onCheckedChange={(checked) => 
                    setUserFilter({...userFilter, activeWithin72h: checked as boolean})
                  }
                />
                <label 
                  htmlFor="activeWithin72h" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Extrair apenas usuários ativos nos últimos 3 dias
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="onlineOnly" 
                  checked={userFilter.onlineOnly}
                  onCheckedChange={(checked) => 
                    setUserFilter({...userFilter, onlineOnly: checked as boolean})
                  }
                />
                <label 
                  htmlFor="onlineOnly" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Extrair apenas usuários online
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetFilters}>
              Limpar Filtros
            </Button>
            <Button onClick={applyFilters}>
              Aplicar Filtros
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
