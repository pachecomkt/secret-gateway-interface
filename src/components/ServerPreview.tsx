
import { useState, useEffect } from 'react';
import { getDiscordServerPreview } from '@/services/discordServerService';
import { ServerPreview as ServerPreviewType } from '@/types/discord.types';
import { Card, CardContent } from '@/components/ui/card';
import { UsersRound, Globe, Loader2 } from 'lucide-react';

interface ServerPreviewProps {
  serverId: string;
  tokenId: string;
}

export const ServerPreview = ({ serverId, tokenId }: ServerPreviewProps) => {
  const [preview, setPreview] = useState<ServerPreviewType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreview = async () => {
      if (!serverId || !tokenId) {
        setError(null);
        setPreview(null);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        const data = await getDiscordServerPreview(serverId, tokenId);
        setPreview(data);
      } catch (err) {
        console.error('Error fetching server preview:', err);
        setError('Não foi possível carregar a prévia do servidor');
        setPreview(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPreview();
  }, [serverId, tokenId]);

  if (!serverId || !tokenId) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="mt-2 animate-pulse">
        <CardContent className="p-4 flex items-center">
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          <span className="text-sm">Carregando prévia do servidor...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-2 border-destructive/50">
        <CardContent className="p-4 text-sm text-destructive">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (!preview) {
    return null;
  }

  return (
    <Card className="mt-2 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {preview.icon_url ? (
            <img 
              src={preview.icon_url} 
              alt={preview.name} 
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
              <Globe className="h-6 w-6 text-primary" />
            </div>
          )}
          <div className="flex-1">
            <h4 className="font-semibold">{preview.name}</h4>
            <div className="flex items-center text-sm text-muted-foreground">
              <UsersRound className="h-3.5 w-3.5 mr-1" />
              {preview.member_count.toLocaleString()} membros
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
