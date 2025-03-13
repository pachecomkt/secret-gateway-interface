import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash, Download, Server, Key, Eye, EyeOff, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BotToken {
  id: string;
  token: string;
  visible: boolean;
}

interface ScrapedUser {
  id: string;
  username: string;
}

export const DiscordScraper = () => {
  const [tokens, setTokens] = useState<BotToken[]>([]);
  const [newToken, setNewToken] = useState('');
  const [serverId, setServerId] = useState('');
  const [showTokens, setShowTokens] = useState(false);
  const [scrapedUsers, setScrapedUsers] = useState<ScrapedUser[]>([]);
  const [message, setMessage] = useState('');
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
        description: "Primeiro extraia os usuários do servidor",
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
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Passo 3: Extrair Usuários</h3>
        </div>
        <Button onClick={scrapeUsers} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Extrair Usuários do Servidor
        </Button>
        {scrapedUsers.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {scrapedUsers.length} usuários extraídos
          </div>
        )}
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
    </div>
  );
};
