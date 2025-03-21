
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash, Download, Server, Key, Eye, EyeOff, Send, Save, List, ArrowRight, Check, X, MessageCircle, Activity, Timer, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface BotToken {
  id: string;
  token: string;
  visible: boolean;
}

interface ScrapedUser {
  id: string;
  username: string;
  role?: string;
  lastActive?: Date;
  isOnline?: boolean;
}

interface SavedList {
  id: string;
  name: string;
  users: ScrapedUser[];
  createdAt: string;
}

interface MessageStatus {
  userId: string;
  username: string;
  status: 'pending' | 'sending' | 'success' | 'failed';
  timestamp: string;
  error?: string;
}

interface UserFilter {
  role: string | null;
  activeWithin24h: boolean;
  onlineOnly: boolean;
}

export const DiscordScraper = () => {
  const [tokens, setTokens] = useState<BotToken[]>([]);
  const [newToken, setNewToken] = useState('');
  const [serverId, setServerId] = useState('');
  const [showTokens, setShowTokens] = useState(false);
  const [scrapedUsers, setScrapedUsers] = useState<ScrapedUser[]>([]);
  const [message, setMessage] = useState('');
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [newListName, setNewListName] = useState('');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  
  // New state for user filtering
  const [userFilter, setUserFilter] = useState<UserFilter>({
    role: null,
    activeWithin24h: false,
    onlineOnly: false
  });
  const [availableRoles, setAvailableRoles] = useState<string[]>([
    "Admin", "Moderator", "VIP", "Member", "New User"
  ]);
  
  // New state for broadcast tracking
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastStartTime, setBroadcastStartTime] = useState<Date | null>(null);
  const [messageStatuses, setMessageStatuses] = useState<MessageStatus[]>([]);
  const [completedMessages, setCompletedMessages] = useState(0);
  const [broadcastDialogOpen, setBroadcastDialogOpen] = useState(false);
  
  const { toast } = useToast();

  const addToken = () => {
    if (!newToken) {
      toast({
        title: "Erro",
        description: "Por favor, insira um token válido",
        variant: "destructive",
      });
      return;
    }
    setTokens([...tokens, { id: Date.now().toString(), token: newToken, visible: false }]);
    setNewToken('');
    toast({
      title: "Sucesso",
      description: "Token adicionado com sucesso",
    });
  };

  const toggleTokenVisibility = (id: string) => {
    setTokens(tokens.map(token => 
      token.id === id ? { ...token, visible: !token.visible } : token
    ));
  };

  const removeToken = (id: string) => {
    setTokens(tokens.filter(token => token.id !== id));
    toast({
      title: "Sucesso",
      description: "Token removido com sucesso",
    });
  };

  const scrapeUsers = async () => {
    if (!serverId) {
      toast({
        title: "Erro",
        description: "Por favor, insira um ID de servidor",
        variant: "destructive",
      });
      return;
    }
    if (tokens.length === 0) {
      toast({
        title: "Erro",
        description: "Por favor, adicione pelo menos um token de bot",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Iniciando",
      description: "Iniciando extração de usuários...",
    });
    // Aqui você implementará a lógica de scraping

    // Mock data for now - enhanced with roles and last active info
    const mockUsers: ScrapedUser[] = Array(15).fill(null).map((_, i) => ({
      id: `user_${i+1}`,
      username: `discord_user_${i+1}`,
      role: availableRoles[Math.floor(Math.random() * availableRoles.length)],
      lastActive: new Date(Date.now() - Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000)),
      isOnline: Math.random() > 0.5
    }));
    
    setScrapedUsers(mockUsers);
    setSaveDialogOpen(true);
  };

  const saveUserList = () => {
    if (!newListName) {
      toast({
        title: "Erro",
        description: "Por favor, dê um nome para sua lista",
        variant: "destructive",
      });
      return;
    }
    
    const newList: SavedList = {
      id: Date.now().toString(),
      name: newListName,
      users: [...scrapedUsers],
      createdAt: new Date().toLocaleString(),
    };
    
    setSavedLists([...savedLists, newList]);
    setNewListName('');
    setSaveDialogOpen(false);
    
    toast({
      title: "Sucesso",
      description: `Lista "${newList.name}" salva com ${scrapedUsers.length} usuários`,
    });
  };

  const loadList = (listId: string) => {
    const list = savedLists.find(list => list.id === listId);
    if (list) {
      setScrapedUsers(list.users);
      setSelectedListId(listId);
      
      toast({
        title: "Lista carregada",
        description: `Lista "${list.name}" com ${list.users.length} usuários`,
      });
    }
  };

  const deleteList = (listId: string) => {
    setSavedLists(savedLists.filter(list => list.id !== listId));
    if (selectedListId === listId) {
      setSelectedListId(null);
    }
    
    toast({
      title: "Lista removida",
      description: "A lista foi removida com sucesso",
    });
  };

  // New function to filter users
  const applyFilters = () => {
    const list = savedLists.find(list => list.id === selectedListId);
    if (!list) {
      toast({
        title: "Erro",
        description: "Selecione uma lista para filtrar",
        variant: "destructive",
      });
      return;
    }

    let filteredUsers = [...list.users];
    
    // Apply role filter
    if (userFilter.role) {
      filteredUsers = filteredUsers.filter(user => user.role === userFilter.role);
    }
    
    // Apply active within 24h filter
    if (userFilter.activeWithin24h) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      filteredUsers = filteredUsers.filter(user => 
        user.lastActive && new Date(user.lastActive) > oneDayAgo
      );
    }
    
    // Apply online only filter
    if (userFilter.onlineOnly) {
      filteredUsers = filteredUsers.filter(user => user.isOnline);
    }
    
    setScrapedUsers(filteredUsers);
    setFilterDialogOpen(false);
    
    toast({
      title: "Filtros aplicados",
      description: `${filteredUsers.length} usuários encontrados com os filtros atuais`,
    });
  };

  const resetFilters = () => {
    setUserFilter({
      role: null,
      activeWithin24h: false,
      onlineOnly: false
    });
    
    const list = savedLists.find(list => list.id === selectedListId);
    if (list) {
      setScrapedUsers(list.users);
    }
    
    setFilterDialogOpen(false);
    
    toast({
      title: "Filtros resetados",
      description: "Todos os filtros foram removidos",
    });
  };

  const sendMessages = async () => {
    if (!message) {
      toast({
        title: "Erro",
        description: "Por favor, escreva uma mensagem para enviar",
        variant: "destructive",
      });
      return;
    }
    if (scrapedUsers.length === 0) {
      toast({
        title: "Erro",
        description: "Primeiro extraia ou carregue uma lista de usuários",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Iniciando",
      description: "Iniciando envio das mensagens...",
    });
    
    // Set broadcasting state
    setIsBroadcasting(true);
    setBroadcastStartTime(new Date());
    setBroadcastDialogOpen(true);
    setCompletedMessages(0);
    
    // Initialize all users as pending
    const initialStatuses: MessageStatus[] = scrapedUsers.map(user => ({
      userId: user.id,
      username: user.username,
      status: 'pending',
      timestamp: new Date().toISOString()
    }));
    setMessageStatuses(initialStatuses);
    
    // Simulate sending messages with random success/fail
    for (let i = 0; i < scrapedUsers.length; i++) {
      // Update status to sending
      setMessageStatuses(prev => prev.map((status, idx) => 
        idx === i ? { ...status, status: 'sending', timestamp: new Date().toISOString() } : status
      ));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Randomly succeed or fail (80% success rate for demo)
      const success = Math.random() > 0.2;
      
      // Update status based on success
      setMessageStatuses(prev => prev.map((status, idx) => 
        idx === i ? { 
          ...status, 
          status: success ? 'success' : 'failed',
          error: success ? undefined : 'Usuário não aceita mensagens diretas',
          timestamp: new Date().toISOString() 
        } : status
      ));
      
      // Increment completed counter
      setCompletedMessages(prev => prev + 1);
    }
    
    // Keep the dialog open to show results
    // User can close manually
  };
  
  const stopBroadcast = () => {
    setIsBroadcasting(false);
    setBroadcastStartTime(null);
    toast({
      title: "Divulgação interrompida",
      description: "O envio de mensagens foi interrompido.",
    });
  };
  
  const getElapsedTimeString = () => {
    if (!broadcastStartTime) return '00:00';
    const elapsed = new Date().getTime() - broadcastStartTime.getTime();
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const getProgressPercentage = () => {
    if (scrapedUsers.length === 0) return 0;
    return Math.round((completedMessages / scrapedUsers.length) * 100);
  };
  
  const getStatusCounts = () => {
    return {
      success: messageStatuses.filter(s => s.status === 'success').length,
      failed: messageStatuses.filter(s => s.status === 'failed').length,
      pending: messageStatuses.filter(s => s.status === 'pending' || s.status === 'sending').length
    };
  };

  return (
    <div className="glass rounded-lg p-6 space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Server className="h-6 w-6" />
          Discord User Scraper
        </h2>
        <p className="text-muted-foreground">
          Gerencie tokens de bot e extraia usuários de servidores do Discord
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Passo 1: Adicionar Tokens de Bot</h3>
        </div>
        <Alert>
          <AlertDescription>
            Crie seus tokens no painel Developer do Discord e certifique-se de que os bots estejam no servidor alvo.
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type={showTokens ? "text" : "password"}
              placeholder="Cole o token do bot aqui"
              value={newToken}
              onChange={(e) => setNewToken(e.target.value)}
              className="bg-secondary/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowTokens(!showTokens)}
          >
            {showTokens ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button onClick={addToken}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Token
          </Button>
        </div>

        <div className="space-y-2">
          {tokens.map((token, index) => (
            <div
              key={token.id}
              className="flex items-center justify-between bg-secondary/30 p-3 rounded-md"
            >
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center bg-primary/10 text-primary rounded-full w-6 h-6 text-sm font-medium">
                  {index + 1}
                </span>
                <Key className="h-4 w-4" />
                <span className="font-mono">
                  {token.visible ? token.token : token.token.replace(/./g, '•')}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleTokenVisibility(token.id)}
                >
                  {token.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeToken(token.id)}
                >
                  <Trash className="h-4 w-4 text-destructive-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Passo 2: Definir Servidor Alvo</h3>
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="ID do Servidor Discord"
            value={serverId}
            onChange={(e) => setServerId(e.target.value)}
            className="bg-secondary/50"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Passo 3: Gerenciar Listas de Usuários</h3>
          </div>
          <Button onClick={scrapeUsers} variant="default" className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Extrair Novos Usuários
          </Button>
        </div>
        
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
                        {list.users.length} usuários • {list.createdAt}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => loadList(list.id)}
                      >
                        Usar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteList(list.id)}
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
            <div className="flex justify-between items-center">
              <div className="font-medium text-sm">Usuários da Lista Atual</div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => setFilterDialogOpen(true)}
                  disabled={!selectedListId}
                >
                  <Filter className="h-3.5 w-3.5" />
                  Filtrar
                </Button>
              </div>
            </div>
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
                        <TableCell className="font-mono text-xs">{user.id.slice(0, 6)}...</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>
                          {user.role && (
                            <Badge variant="outline">{user.role}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.isOnline ? (
                            <Badge className="bg-green-500">Online</Badge>
                          ) : (
                            <Badge variant="outline">Offline</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Desconhecido'}
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
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Passo 4: Enviar Mensagens</h3>
        </div>
        <Textarea
          placeholder="Digite a mensagem que será enviada para os usuários..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="bg-secondary/50 min-h-[100px]"
        />
        <Button 
          onClick={sendMessages} 
          className="w-full" 
          variant="secondary" 
          disabled={isBroadcasting}
        >
          <Send className="h-4 w-4 mr-2" />
          Enviar Mensagens ({scrapedUsers.length} usuários)
        </Button>
      </div>

      {/* Dialog for saving a new list */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Lista de Usuários</DialogTitle>
            <DialogDescription>
              Você extraiu {scrapedUsers.length} usuários. Dê um nome para salvar esta lista para uso futuro.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Nome da lista (ex: Servidor Gaming, Comunidade XYZ)"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveUserList} className="gap-2">
              <Save className="h-4 w-4" />
              Salvar Lista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Dialog for filtering users */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtrar Usuários</DialogTitle>
            <DialogDescription>
              Defina critérios para filtrar os usuários da lista selecionada.
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
                Ativos nas últimas 24 horas
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
                Apenas usuários online
              </label>
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

      {/* New Dialog for broadcasting status */}
      <Dialog open={broadcastDialogOpen} onOpenChange={setBroadcastDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Acompanhamento de Envio em Tempo Real</DialogTitle>
            <DialogDescription>
              Monitore o progresso de envio das mensagens para os usuários.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Card>
                <CardHeader className="py-2 px-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Progresso</CardTitle>
                </CardHeader>
                <CardContent className="py-0 px-4 pb-4">
                  <div className="text-2xl font-bold">
                    {completedMessages}/{scrapedUsers.length}
                  </div>
                  <Progress value={getProgressPercentage()} className="h-2 mt-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-2 px-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Tempo Decorrido</CardTitle>
                </CardHeader>
                <CardContent className="py-0 px-4 pb-4 flex items-center gap-2">
                  <Timer className="h-5 w-5 text-muted-foreground" />
                  <div className="text-2xl font-bold font-mono">{getElapsedTimeString()}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-2 px-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Enviados com Sucesso</CardTitle>
                </CardHeader>
                <CardContent className="py-0 px-4 pb-4 flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <div className="text-2xl font-bold text-green-500">{getStatusCounts().success}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-2 px-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Falhas</CardTitle>
                </CardHeader>
                <CardContent className="py-0 px-4 pb-4 flex items-center gap-2">
                  <X className="h-5 w-5 text-red-500" />
                  <div className="text-2xl font-bold text-red-500">{getStatusCounts().failed}</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Real-time Message Log */}
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-md">Log de Mensagens</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[300px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-secondary/50 sticky top-0">
                      <tr className="text-xs text-left text-muted-foreground">
                        <th className="py-2 px-4 font-medium">Status</th>
                        <th className="py-2 px-4 font-medium">Usuário</th>
                        <th className="py-2 px-4 font-medium">ID</th>
                        <th className="py-2 px-4 font-medium">Horário</th>
                        <th className="py-2 px-4 font-medium">Detalhes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messageStatuses.map((status) => (
                        <tr key={status.userId} className="border-t border-border">
                          <td className="py-2 px-4">
                            {status.status === 'pending' && (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                                Pendente
                              </span>
                            )}
                            {status.status === 'sending' && (
                              <span className="flex items-center gap-1 text-blue-500 animate-pulse">
                                <Activity className="h-3 w-3" />
                                Enviando
                              </span>
                            )}
                            {status.status === 'success' && (
                              <span className="flex items-center gap-1 text-green-500">
                                <Check className="h-3 w-3" />
                                Enviado
                              </span>
                            )}
                            {status.status === 'failed' && (
                              <span className="flex items-center gap-1 text-red-500">
                                <X className="h-3 w-3" />
                                Falha
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-4 max-w-[150px] truncate">
                            {status.username}
                          </td>
                          <td className="py-2 px-4 font-mono text-xs text-muted-foreground">
                            {status.userId}
                          </td>
                          <td className="py-2 px-4 text-xs text-muted-foreground">
                            {new Date(status.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="py-2 px-4 text-xs">
                            {status.error && <span className="text-red-500">{status.error}</span>}
                            {status.status === 'success' && <span className="text-green-500">Mensagem entregue</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <DialogFooter>
            {isBroadcasting ? (
              <Button variant="destructive" onClick={stopBroadcast}>
                <X className="h-4 w-4 mr-2" />
                Interromper Envio
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setBroadcastDialogOpen(false)}>
                Fechar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
