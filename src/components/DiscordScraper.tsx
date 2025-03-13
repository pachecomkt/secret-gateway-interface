
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash, Download, Server, Key, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BotToken {
  id: string;
  token: string;
}

export const DiscordScraper = () => {
  const [tokens, setTokens] = useState<BotToken[]>([]);
  const [newToken, setNewToken] = useState('');
  const [serverId, setServerId] = useState('');
  const [showTokens, setShowTokens] = useState(false);
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
    setTokens([...tokens, { id: Date.now().toString(), token: newToken }]);
    setNewToken('');
    toast({
      title: "Sucesso",
      description: "Token adicionado com sucesso",
    });
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

  return (
    <div className="glass rounded-lg p-6 space-y-6">
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
          {tokens.map((token) => (
            <div
              key={token.id}
              className="flex items-center justify-between bg-secondary/30 p-3 rounded-md"
            >
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                <span className="font-mono">
                  {showTokens ? token.token : token.token.replace(/./g, '•')}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeToken(token.id)}
              >
                <Trash className="h-4 w-4 text-destructive-foreground" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="ID do Servidor Discord"
            value={serverId}
            onChange={(e) => setServerId(e.target.value)}
            className="bg-secondary/50"
          />
          <Button onClick={scrapeUsers}>
            <Download className="h-4 w-4 mr-2" />
            Extrair Usuários
          </Button>
        </div>
      </div>
    </div>
  );
};
