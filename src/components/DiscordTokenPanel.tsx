
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash, Key, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getDiscordBotTokens, saveDiscordBotToken, deleteDiscordBotToken, DiscordBotToken } from "@/services/discordService";

interface BotToken {
  id: string;
  token: string;
  visible: boolean;
}

interface DiscordTokenPanelProps {
  onTokensChange: (tokens: BotToken[]) => void;
}

export const DiscordTokenPanel = ({ onTokensChange }: DiscordTokenPanelProps) => {
  const [tokens, setTokens] = useState<BotToken[]>([]);
  const [newToken, setNewToken] = useState('');
  const [showTokens, setShowTokens] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    loadTokens();
  }, []);

  useEffect(() => {
    onTokensChange(tokens);
  }, [tokens, onTokensChange]);

  const loadTokens = async () => {
    try {
      const botTokens = await getDiscordBotTokens();
      const formattedTokens = botTokens.map(token => ({
        id: token.id,
        token: token.token,
        visible: false
      }));
      
      setTokens(formattedTokens);
    } catch (error) {
      console.error('Error loading tokens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os tokens dos bots",
        variant: "destructive",
      });
    }
  };

  const addToken = async () => {
    if (!newToken) {
      toast({
        title: "Erro",
        description: "Por favor, insira um token válido",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const savedToken = await saveDiscordBotToken(newToken);
      
      setTokens([...tokens, { 
        id: savedToken.id, 
        token: savedToken.token, 
        visible: false 
      }]);
      
      setNewToken('');
      
      toast({
        title: "Sucesso",
        description: "Token adicionado com sucesso",
      });
    } catch (error) {
      console.error('Error adding token:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o token",
        variant: "destructive",
      });
    }
  };

  const toggleTokenVisibility = (id: string) => {
    setTokens(tokens.map(token => 
      token.id === id ? { ...token, visible: !token.visible } : token
    ));
  };

  const removeToken = async (id: string) => {
    try {
      await deleteDiscordBotToken(id);
      
      setTokens(tokens.filter(token => token.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Token removido com sucesso",
      });
    } catch (error) {
      console.error('Error removing token:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o token",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Key className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Gerenciar Tokens de Bot</h3>
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
  );
};
