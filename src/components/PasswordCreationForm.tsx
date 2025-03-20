
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { createTemporaryPassword } from "@/services/passwordService";
import { useToast } from "@/hooks/use-toast";

interface PasswordCreationFormProps {
  onPasswordCreated: () => void;
}

export const PasswordCreationForm = ({ onPasswordCreated }: PasswordCreationFormProps) => {
  const [newPassword, setNewPassword] = useState("");
  const [description, setDescription] = useState("");
  const [expiresIn, setExpiresIn] = useState("24");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
        onPasswordCreated();
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

  return (
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
  );
};
