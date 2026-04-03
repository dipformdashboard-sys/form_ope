import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Shield, LogOut } from "lucide-react";
import logoPcba from "@/assets/logo-pcba.png";

const ACCESS_PASSWORD = "pcba2024";
const SESSION_KEY = "pcba_auth";

interface PasswordGateProps {
  children: React.ReactNode;
}

const PasswordGate = ({ children }: PasswordGateProps) => {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "true"
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ACCESS_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setAuthenticated(true);
      setError("");
    } else {
      setError("Senha incorreta. Tente novamente.");
      setPassword("");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthenticated(false);
    setPassword("");
  };

  if (authenticated) {
    return (
      <LogoutContext.Provider value={handleLogout}>
        {children}
      </LogoutContext.Provider>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary">
      <div className="w-full max-w-md rounded-xl bg-card p-8 shadow-2xl border border-border mx-4">
        <div className="flex flex-col items-center gap-4 mb-8">
          <img src={logoPcba} alt="Logo PCBA" className="h-24 w-auto" />
          <div className="flex items-center gap-2 text-primary">
            <Shield className="h-5 w-5" />
            <h1 className="text-xl font-bold font-heading tracking-tight">
              Área Restrita
            </h1>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Insira a senha de acesso para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Senha de acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-gold-dark font-semibold">
            Acessar
          </Button>
        </form>
      </div>
    </div>
  );
};

// Context to share logout function
import { createContext, useContext } from "react";
const LogoutContext = createContext<(() => void) | null>(null);
export const useLogout = () => useContext(LogoutContext);

export default PasswordGate;
