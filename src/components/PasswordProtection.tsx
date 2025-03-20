
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { validatePassword, checkPasswordStatus } from "@/services/passwordService";
import { useToast } from "@/hooks/use-toast";

interface PasswordProtectionProps {
  onUnlock: (isAdmin: boolean) => void;
}

export const PasswordProtection = ({ onUnlock }: PasswordProtectionProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError(true);
      setErrorMessage("Por favor, digite uma senha");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Primeiro, verificar o status da senha
      const passwordStatus = await checkPasswordStatus(password);
      console.log('Status da senha:', passwordStatus);
      
      // Verificar a validação normal
      const isValid = await validatePassword(password);
      console.log('Senha válida:', isValid);
      
      if (isValid) {
        toast({
          title: "Acesso concedido",
          description: passwordStatus.isAdmin ? "Bem-vindo, Administrador!" : "Senha correta, seja bem-vindo!",
          variant: "default",
        });
        onUnlock(passwordStatus.isAdmin);
        setError(false);
      } else if (passwordStatus.exists && passwordStatus.expired) {
        toast({
          title: "Acesso negado",
          description: "Esta senha está expirada",
          variant: "destructive",
        });
        setError(true);
        setErrorMessage("Senha expirada");
      } else {
        toast({
          title: "Acesso negado",
          description: "Senha incorreta",
          variant: "destructive",
        });
        setError(true);
        setErrorMessage("Senha incorreta");
      }
    } catch (err) {
      console.error("Erro ao validar senha:", err);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao validar a senha. Tente novamente.",
        variant: "destructive",
      });
      setError(true);
      setErrorMessage("Erro interno. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="glass p-8 rounded-lg w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Área Protegida</h1>
          <p className="text-muted-foreground">Digite a senha para continuar</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Digite a senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`bg-secondary/50 border-secondary ${error ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {error && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}
          </div>
          <Button 
            type="submit" 
            className="w-full bg-primary/90 hover:bg-primary"
            disabled={isLoading}
          >
            {isLoading ? "Verificando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
};
