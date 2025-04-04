
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Trash, 
  Clock, 
  MoreHorizontal,
  Edit,
  Copy
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TemporaryPassword } from "@/types/database.types";
import { deleteTemporaryPassword } from "@/services/passwordService";
import { useToast } from "@/hooks/use-toast";

interface PasswordTableProps {
  passwords: TemporaryPassword[];
  onDelete: () => void;
  isSuperUser: boolean;
}

export const PasswordTable = ({ passwords, onDelete, isSuperUser }: PasswordTableProps) => {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

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
        onDelete();
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

  const handleCopyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    toast({
      title: "Senha copiada",
      description: "A senha foi copiada para a área de transferência",
      variant: "default",
    });
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
                <TableCell className="font-medium">
                  {/* Mostramos apenas os primeiros 3 caracteres da senha por segurança */}
                  {pwd.password.substring(0, 3)}***
                </TableCell>
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
                  {isSuperUser ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleCopyPassword(pwd.password)}>
                          <Copy className="mr-2 h-4 w-4" />
                          <span>Copiar Senha</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeletePassword(pwd.id)}>
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePassword(pwd.id)}
                      disabled={isDeleting === pwd.id}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
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
        <Button variant="outline" onClick={onDelete}>
          Atualizar
        </Button>
      </CardFooter>
    </Card>
  );
};
