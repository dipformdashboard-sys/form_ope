import PasswordGate from "@/components/PasswordGate";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart3, FileText, Users, LogOut } from "lucide-react";
import logoPcba from "@/assets/logo-pcba.png";
import { useLogout } from "@/components/PasswordGate";

const DashboardContent = () => {
  const navigate = useNavigate();
  const logout = useLogout();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <img src={logoPcba} alt="Logo PCBA" className="h-12 w-auto" />
            <div>
              <h1 className="text-lg font-bold font-heading tracking-tight sm:text-xl">Dashboard</h1>
              <p className="text-xs text-primary-foreground/70">Polícia Civil da Bahia</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            {logout && (
              <Button variant="outline" size="sm" onClick={logout} className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Atividades</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">--</div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Responsáveis Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">--</div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tipos Registrados</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">--</div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

const Dashboard = () => (
  <PasswordGate>
    <DashboardContent />
  </PasswordGate>
);

export default Dashboard;
