
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash, Plus, Clock } from "lucide-react";
import { TemporaryPassword, createTemporaryPassword, getTemporaryPasswords, deleteTemporaryPassword } from "@/services/passwordService";
import { useToast } from "@/hooks/use-toast";

export const PasswordManager = () => {
  const [passwords, setPasswords] = useState<TemporaryPassword[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [description, setDescription] = useState("");
  const [expiresIn, setExpiresIn] = useState("24");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const loadPasswords = async () => {
    const data = await getTemporaryPasswords();
    setPasswords(data);
  };

  useEffect(() => {
    loadPasswords();
    
    // Recarregar a cada 60 segundos para atualizar status de expiração
    const interval = setInterval(() => {
      loadPasswords();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword.trim()) {
      toast({
        title: "Erro",
        description: "A senha não pode estar vazia",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await createTemporaryPassword(
        newPassword,
        description || null,
        parseInt(expiresIn, 10)
      );
      
      if (result) {
        toast({
          title: "Senha criada",
          description: "A senha temporária foi criada com sucesso",
          variant: "default",
        });
        setNewPassword("");
        setDescription("");
        setExpiresIn("24");
        loadPasswords();
      }
    } catch (err) {
      console.error("Erro ao criar senha:", err);
      toast({
        title: "Erro",
        description: "Não foi possível criar a senha temporária",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePassword = async (id: string) => {
    setIsDeleting(id);
    
    try {
      const success = await deleteTemporaryPassword(id);
      
      if (success) {
        toast({
          title: "Senha excluída",
          description: "A senha temporária foi excluída com sucesso",
          variant: "default",
        });
        loadPasswords();
      }
    } catch (err) {
      console.error("Erro ao excluir senha:", err);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a senha temporária",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciador de Senhas Temporárias</CardTitle>
          <CardDescription>
            Crie e gerencie senhas temporárias com tempo de expiração definido
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleCreatePassword} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <Input
                  id="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expires">Expira em (horas)</Label>
                <Input
                  id="expires"
                  type="number"
                  min="1"
                  max="720"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Para que será usada esta senha?"
              />
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              {isLoading ? "Criando..." : "Criar Nova Senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Senhas Ativas</CardTitle>
          <CardDescription>
            Lista de todas as senhas temporárias ativas e expiradas
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableCaption>Lista de senhas temporárias</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Senha</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead>Expira em</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {passwords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Nenhuma senha temporária encontrada
                  </TableCell>
                </TableRow>
              )}
              
              {passwords.map((pwd) => (
                <TableRow key={pwd.id} className={isExpired(pwd.expires_at) ? "opacity-60" : ""}>
                  <TableCell className="font-medium">{pwd.password}</TableCell>
                  <TableCell>{pwd.description || "—"}</TableCell>
                  <TableCell>{formatDate(pwd.created_at)}</TableCell>
                  <TableCell>{formatDate(pwd.expires_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      <span className={isExpired(pwd.expires_at) ? "text-red-500" : "text-green-500"}>
                        {isExpired(pwd.expires_at) ? "Expirada" : "Ativa"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePassword(pwd.id)}
                      disabled={isDeleting === pwd.id}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Total de senhas: {passwords.length} | 
            Ativas: {passwords.filter(pwd => !isExpired(pwd.expires_at)).length} | 
            Expiradas: {passwords.filter(pwd => isExpired(pwd.expires_at)).length}
          </p>
          <Button variant="outline" onClick={loadPasswords}>
            Atualizar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
