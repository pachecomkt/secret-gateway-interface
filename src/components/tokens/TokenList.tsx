
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Trash, Key, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteDiscordBotToken } from "@/services/discordService";

interface TokenListProps {
  tokens: {
    id: string;
    token: string;
    visible: boolean;
  }[];
  onTokenDelete: (id: string) => void;
  onTokenVisibilityToggle: (id: string) => void;
}

export const TokenList = ({ tokens, onTokenDelete, onTokenVisibilityToggle }: TokenListProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const removeToken = async (id: string) => {
    try {
      setIsLoading(true);
      await deleteDiscordBotToken(id);
      
      onTokenDelete(id);
      
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
    } finally {
      setIsLoading(false);
    }
  };

  if (tokens.length === 0) {
    return (
      <div className="text-center p-6 border border-dashed rounded-md text-muted-foreground">
        <Key className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Nenhum token adicionado</p>
        <p className="text-sm">Adicione seu primeiro token para começar</p>
      </div>
    );
  }

  return (
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
              onClick={() => onTokenVisibilityToggle(token.id)}
            >
              {token.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeToken(token.id)}
              disabled={isLoading}
            >
              <Trash className="h-4 w-4 text-destructive-foreground" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
