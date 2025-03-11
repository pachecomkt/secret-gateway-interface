
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

interface PasswordProtectionProps {
  onUnlock: () => void;
}

const CORRECT_PASSWORD = "1234"; // Você pode alterar esta senha

export const PasswordProtection = ({ onUnlock }: PasswordProtectionProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      onUnlock();
      setError(false);
    } else {
      setError(true);
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
            />
            {error && (
              <p className="text-sm text-red-500">Senha incorreta</p>
            )}
          </div>
          <Button type="submit" className="w-full bg-primary/90 hover:bg-primary">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
};
