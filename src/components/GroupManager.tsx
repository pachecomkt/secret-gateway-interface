
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, UserPlus, Trash, Users, User } from "lucide-react";
import {
  DiscordUserGroup,
  GroupMember,
  createUserGroup,
  getUserGroups,
  getGroupMembers,
  inviteUserToGroup,
  removeUserFromGroup,
  deleteUserGroup,
} from '@/services/discordService';

export const GroupManager = () => {
  const [groups, setGroups] = useState<DiscordUserGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<DiscordUserGroup | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadGroupMembers(selectedGroup.id);
    }
  }, [selectedGroup]);

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      const loadedGroups = await getUserGroups();
      setGroups(loadedGroups);
      
      // Selecionar o primeiro grupo automaticamente se houver algum
      if (loadedGroups.length > 0 && !selectedGroup) {
        setSelectedGroup(loadedGroups[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os grupos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadGroupMembers = async (groupId: string) => {
    try {
      setIsLoading(true);
      const members = await getGroupMembers(groupId);
      setGroupMembers(members);
    } catch (error) {
      console.error('Erro ao carregar membros do grupo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os membros do grupo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName) {
      toast({
        title: "Erro",
        description: "Por favor, forneça um nome para o grupo",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const newGroup = await createUserGroup(newGroupName, newGroupDescription);
      setGroups([newGroup, ...groups]);
      setSelectedGroup(newGroup);
      setNewGroupName('');
      setNewGroupDescription('');
      setCreateDialogOpen(false);
      
      toast({
        title: "Sucesso",
        description: "Grupo criado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o grupo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail || !selectedGroup) {
      toast({
        title: "Erro",
        description: "Por favor, forneça um e-mail válido",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const success = await inviteUserToGroup(selectedGroup.id, inviteEmail);
      
      if (success) {
        await loadGroupMembers(selectedGroup.id);
        setInviteEmail('');
        setInviteDialogOpen(false);
        
        toast({
          title: "Sucesso",
          description: "Usuário convidado com sucesso",
        });
      } else {
        toast({
          title: "Erro",
          description: "Usuário não encontrado ou já é membro do grupo",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao convidar usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível convidar o usuário",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedGroup) return;
    
    try {
      await removeUserFromGroup(memberId);
      setGroupMembers(groupMembers.filter(member => member.id !== memberId));
      
      toast({
        title: "Sucesso",
        description: "Membro removido com sucesso",
      });
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await deleteUserGroup(groupId);
      setGroups(groups.filter(group => group.id !== groupId));
      
      if (selectedGroup && selectedGroup.id === groupId) {
        setSelectedGroup(groups.length > 1 ? groups[0] : null);
        setGroupMembers([]);
      }
      
      toast({
        title: "Sucesso",
        description: "Grupo excluído com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir grupo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o grupo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="glass rounded-lg p-6 space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Gerenciamento de Grupos
        </h2>
        <p className="text-muted-foreground">
          Crie e gerencie grupos para compartilhar listas de usuários Discord
        </p>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Seus Grupos</h3>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Grupo</DialogTitle>
              <DialogDescription>
                Crie um novo grupo para compartilhar listas de usuários Discord
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="group-name" className="text-sm font-medium">
                  Nome do Grupo
                </label>
                <Input
                  id="group-name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Ex: Meu Time de Marketing"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="group-description" className="text-sm font-medium">
                  Descrição (opcional)
                </label>
                <Textarea
                  id="group-description"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Descreva o propósito deste grupo"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateGroup} disabled={isLoading}>
                {isLoading ? "Criando..." : "Criar Grupo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de Grupos */}
        <div className="md:col-span-1 space-y-4">
          {groups.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-md text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum grupo criado</p>
              <p className="text-sm">Clique em "Novo Grupo" para começar</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {groups.map((group) => (
                <Card
                  key={group.id}
                  className={`cursor-pointer hover:bg-secondary/10 transition-colors ${
                    selectedGroup?.id === group.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedGroup(group)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-medium">{group.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {group.member_count} membros
                        </p>
                        {group.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {group.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(group.id);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Detalhes do Grupo */}
        <div className="md:col-span-2">
          {!selectedGroup ? (
            <div className="text-center p-12 border border-dashed rounded-md text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Selecione um grupo para ver os detalhes</p>
            </div>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedGroup.name}</CardTitle>
                    <CardDescription>
                      {selectedGroup.description || "Sem descrição"}
                    </CardDescription>
                  </div>
                  <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Convidar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Convidar Usuário</DialogTitle>
                        <DialogDescription>
                          Insira o e-mail do usuário que você deseja convidar para o grupo
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Input
                          placeholder="Email do usuário"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleInviteUser} disabled={isLoading}>
                          {isLoading ? "Convidando..." : "Convidar"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4">
                  Membros do grupo: {groupMembers.length}
                </div>
                {groupMembers.length === 0 ? (
                  <div className="text-center p-6 border border-dashed rounded-md text-muted-foreground">
                    <p>Nenhum membro no grupo</p>
                    <p className="text-sm">Clique em "Convidar" para adicionar membros</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Entrou em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{member.user_name || member.user_id}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(member.joined_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
