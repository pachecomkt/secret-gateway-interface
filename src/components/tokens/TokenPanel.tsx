
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, AlertTriangle } from "lucide-react";
import { TokenForm } from './TokenForm';
import { TokenList } from './TokenList';
import { getDiscordBotTokens } from "@/services/discordService";
import { supabase } from "@/integrations/supabase/client";

interface BotToken {
  id: string;
  token: string;
  visible: boolean;
}

interface TokenPanelProps {
  onTokensChange: (tokens: BotToken[]) => void;
}

export const TokenPanel = ({ onTokensChange }: TokenPanelProps) => {
  const [tokens, setTokens] = useState<BotToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadTokens();
  }, []);

  useEffect(() => {
    onTokensChange(tokens);
  }, [tokens, onTokensChange]);

  const loadTokens = async () => {
    try {
      setIsLoading(true);
      const botTokens = await getDiscordBotTokens();
      const formattedTokens = botTokens.map(token => ({
        id: token.id,
        token: token.token,
        visible: false
      }));
      
      setTokens(formattedTokens);
      setErrorMessage('');
    } catch (error) {
      console.error('Error loading tokens:', error);
      setErrorMessage('Não foi possível carregar os tokens. Verifique se você está autenticado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenAdded = () => {
    loadTokens();
  };

  const handleTokenDelete = (id: string) => {
    setTokens(tokens.filter(token => token.id !== id));
  };

  const handleTokenVisibilityToggle = (id: string) => {
    setTokens(tokens.map(token => 
      token.id === id ? { ...token, visible: !token.visible } : token
    ));
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
      
      {errorMessage && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}
      
      <TokenForm onTokenAdded={handleTokenAdded} />
      
      <TokenList 
        tokens={tokens}
        onTokenDelete={handleTokenDelete}
        onTokenVisibilityToggle={handleTokenVisibilityToggle}
      />
    </div>
  );
};
