
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash, Download, Server, Key, Eye, EyeOff, Send, Save, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

interface BotToken {
  id: string;
  token: string;
  visible: boolean;
}

interface ScrapedUser {
  id: string;
  username: string;
}

interface SavedList {
  id: string;
  name: string;
  users: ScrapedUser[];
  createdAt: string;
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

    // Mock data for now
    const mockUsers: ScrapedUser[] = Array(15).fill(null).map((_, i) => ({
      id: `user_${i+1}`,
      username: `discord_user_${i+1}`
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
    // Aqui você implementará a lógica de envio
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
            <div className="font-medium text-sm">Usuários da Lista Atual</div>
            <div className="p-4 border rounded-md bg-secondary/10 max-h-[200px] overflow-y-auto">
              {scrapedUsers.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm">
                  Nenhum usuário extraído ainda
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-xs text-muted-foreground mb-2 px-2">
                    <span>ID</span>
                    <span>Nome de Usuário</span>
                  </div>
                  {scrapedUsers.map(user => (
                    <div key={user.id} className="flex justify-between text-sm py-1 px-2 hover:bg-secondary/20 rounded">
                      <span className="font-mono">{user.id}</span>
                      <span>{user.username}</span>
                    </div>
                  ))}
                </>
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
        <Button onClick={sendMessages} className="w-full" variant="secondary">
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
    </div>
  );
};
