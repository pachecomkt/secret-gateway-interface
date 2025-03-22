
import { useState, useEffect } from 'react';
import { Send, Activity, Timer, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { sendDirectMessagesToUsers } from "@/services/discordExtractService";
import { DiscordUser, MessageStatus } from "@/types/discord.types";

interface DiscordMessagingPanelProps {
  users: DiscordUser[];
  tokenId: string;
}

export const DiscordMessagingPanel = ({ users, tokenId }: DiscordMessagingPanelProps) => {
  const [message, setMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastStartTime, setBroadcastStartTime] = useState<Date | null>(null);
  const [messageStatuses, setMessageStatuses] = useState<MessageStatus[]>([]);
  const [completedMessages, setCompletedMessages] = useState(0);
  const [broadcastDialogOpen, setBroadcastDialogOpen] = useState(false);
  
  const { toast } = useToast();

  const sendMessages = async () => {
    if (!message) {
      toast({
        title: "Erro",
        description: "Por favor, escreva uma mensagem para enviar",
        variant: "destructive",
      });
      return;
    }
    if (users.length === 0) {
      toast({
        title: "Erro",
        description: "Primeiro extraia ou carregue uma lista de usuários",
        variant: "destructive",
      });
      return;
    }
    if (!tokenId) {
      toast({
        title: "Erro",
        description: "É necessário selecionar um token de bot",
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
    const initialStatuses: MessageStatus[] = users.map(user => ({
      userId: user.discord_id,
      username: user.username,
      status: 'pending',
      timestamp: new Date().toISOString()
    }));
    setMessageStatuses(initialStatuses);
    
    try {
      // Get all user IDs
      const userIds = users.map(user => user.discord_id);
      
      // Start sending messages in batches to avoid timeout
      const batchSize = 5;
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        
        // Update status to sending for this batch
        setMessageStatuses(prev => prev.map(status => 
          batch.includes(status.userId) 
            ? { ...status, status: 'sending', timestamp: new Date().toISOString() } 
            : status
        ));
        
        // Send messages to this batch
        const result = await sendDirectMessagesToUsers(batch, message, tokenId);
        
        if (!result.success) {
          throw new Error(result.message);
        }
        
        // Update status based on results
        if (result.results) {
          setMessageStatuses(prev => prev.map(status => {
            const resultItem = result.results?.find(r => r.userId === status.userId);
            if (!resultItem) return status;
            
            return {
              ...status,
              status: resultItem.success ? 'success' : 'failed',
              error: resultItem.error,
              timestamp: new Date().toISOString()
            };
          }));
        }
        
        // Update completed count
        setCompletedMessages(prev => prev + batch.length);
      }
      
      toast({
        title: "Sucesso",
        description: `Mensagens enviadas com sucesso para ${completedMessages} usuários`,
      });
      
    } catch (error) {
      console.error('Erro ao enviar mensagens:', error);
      
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar mensagens",
        variant: "destructive",
      });
      
    } finally {
      setIsBroadcasting(false);
    }
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
    if (users.length === 0) return 0;
    return Math.round((completedMessages / users.length) * 100);
  };
  
  const getStatusCounts = () => {
    return {
      success: messageStatuses.filter(s => s.status === 'success').length,
      failed: messageStatuses.filter(s => s.status === 'failed').length,
      pending: messageStatuses.filter(s => s.status === 'pending' || s.status === 'sending').length
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Send className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Enviar Mensagens</h3>
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
        disabled={isBroadcasting || users.length === 0}
      >
        <Send className="h-4 w-4 mr-2" />
        Enviar Mensagens ({users.length} usuários)
      </Button>

      {/* Dialog for broadcasting status */}
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
                    {completedMessages}/{users.length}
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
