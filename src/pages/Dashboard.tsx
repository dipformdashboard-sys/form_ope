import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart3, FileText, Users } from "lucide-react";
import logoPcba from "@/assets/logo-pcba.png";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <img src={logoPcba} alt="Logo PCBA" className="h-12 w-auto" />
            <div>
              <h1 className="text-lg font-bold font-heading tracking-tight sm:text-xl">
                Dashboard
              </h1>
              <p className="text-xs text-primary-foreground/70">
                Polícia Civil da Bahia
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Formulário
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Atividades
              </CardTitle>
              <FileText className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground mt-1">Registradas no sistema</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Participantes
              </CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground mt-1">Envolvidos nas atividades</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tipos de Atividade
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground mt-1">Categorias diferentes</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Resumo das Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Conecte um banco de dados para visualizar dados e gráficos em tempo real.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
