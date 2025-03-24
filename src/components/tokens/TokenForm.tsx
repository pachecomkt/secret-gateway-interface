
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveDiscordBotToken } from "@/services/discordService";

interface TokenFormProps {
  onTokenAdded: () => void;
}

export const TokenForm = ({ onTokenAdded }: TokenFormProps) => {
  const [newToken, setNewToken] = useState('');
  const [showTokens, setShowTokens] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

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
      setIsLoading(true);
      
      await saveDiscordBotToken(newToken);
      
      setNewToken('');
      onTokenAdded();
      
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
      <Button onClick={addToken} disabled={isLoading}>
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
        ) : (
          <Plus className="h-4 w-4 mr-2" />
        )}
        {isLoading ? "Adicionando..." : "Adicionar Token"}
      </Button>
    </div>
  );
};
