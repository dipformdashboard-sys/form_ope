import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutDashboard, Plus, Loader2, LogOut, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import logoPcba from "@/assets/logo-pcba.png";
import SearchableSelect from "@/components/SearchableSelect";
import MultiSearchableSelect from "@/components/MultiSearchableSelect";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fetchOptions, submitAtividade, type AppScriptData } from "@/services/appScriptApi";
import { useLogout } from "@/components/PasswordGate";

interface Atividade {
  solicitante: string;
  lotacao: string;
  canal: string;
  tipo: string;
  quantidade: string;
  descricao: string;
  observacao: string;
  responsavel: string;
  participantes: string[];
  data: Date | undefined;
}

const emptyAtividade = (): Atividade => ({
  solicitante: "",
  lotacao: "",
  canal: "",
  tipo: "",
  quantidade: "",
  descricao: "",
  observacao: "",
  responsavel: "",
  participantes: [],
  data: new Date(),
});

const AtividadesForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const logout = useLogout();
  const [atividade, setAtividade] = useState<Atividade>(emptyAtividade());
  const [options, setOptions] = useState<AppScriptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOptions()
      .then((data) => setOptions(data))
      .catch(() =>
        toast({ title: "Erro", description: "Não foi possível carregar os dados da planilha.", variant: "destructive" })
      )
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof Atividade, value: unknown) => {
    setAtividade((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!atividade.solicitante || !atividade.descricao || !atividade.responsavel) {
      toast({ title: "Campos obrigatórios", description: "Preencha solicitante, descrição e responsável.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...atividade,
        participantes: atividade.participantes.join(", "),
        data: atividade.data ? format(atividade.data, "dd/MM/yyyy") : "",
      };
      const result = await submitAtividade(payload);
      if (result.status === "ok") {
        toast({ title: "Atividade registrada", description: "Enviada com sucesso para a planilha." });
        setAtividade(emptyAtividade());
      } else {
        throw new Error("Erro retornado pela planilha");
      }
    } catch {
      toast({ title: "Erro ao enviar", description: "Não foi possível registrar a atividade.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const selectFields: { key: keyof Atividade; label: string; optionsKey: keyof AppScriptData; required?: boolean }[] = [
    { key: "lotacao", label: "Lotação", optionsKey: "lotacoes" },
    { key: "canal", label: "Canal", optionsKey: "canais" },
    { key: "tipo", label: "Tipo", optionsKey: "tipos" },
    { key: "responsavel", label: "Responsável", optionsKey: "usuarios", required: true },
    { key: "descricao", label: "Descrição", optionsKey: "descricoes", required: true },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <img src={logoPcba} alt="Logo PCBA" className="h-12 w-auto" />
            <div>
              <h1 className="text-lg font-bold font-heading tracking-tight sm:text-xl">Atividades Realizadas</h1>
              <p className="text-xs text-primary-foreground/70">Polícia Civil da Bahia</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
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
        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Solicitante - campo aberto */}
                <div>
                  <Label htmlFor="solicitante" className="text-sm font-medium text-foreground">
                    Solicitante<span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="solicitante"
                    value={atividade.solicitante}
                    onChange={(e) => handleChange("solicitante", e.target.value)}
                    placeholder="Nome do solicitante..."
                    className="mt-1"
                  />
                </div>

                {/* Select fields */}
                {selectFields.map(({ key, label, optionsKey, required }) => (
                  <div key={key} className={key === "descricao" ? "sm:col-span-2 lg:col-span-4" : ""}>
                    <Label htmlFor={key} className="text-sm font-medium text-foreground">
                      {label}
                      {required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <SearchableSelect
                      id={key}
                      options={(options?.[optionsKey] as string[]) || []}
                      value={atividade[key] as string}
                      onChange={(v) => handleChange(key, v)}
                      placeholder={`Selecione ${label.toLowerCase()}...`}
                    />
                  </div>
                ))}

                {/* Quantidade */}
                <div>
                  <Label htmlFor="quantidade" className="text-sm font-medium text-foreground">Quantidade</Label>
                  <Input id="quantidade" type="number" value={atividade.quantidade} onChange={(e) => handleChange("quantidade", e.target.value)} className="mt-1" />
                </div>

                {/* Data */}
                <div>
                  <Label className="text-sm font-medium text-foreground">Data</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "mt-1 w-full justify-start text-left font-normal",
                          !atividade.data && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {atividade.data ? format(atividade.data, "dd/MM/yyyy") : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={atividade.data}
                        onSelect={(d) => handleChange("data", d)}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Participantes - multi select */}
                <div className="sm:col-span-2">
                  <Label htmlFor="participantes" className="text-sm font-medium text-foreground">Participantes</Label>
                  <MultiSearchableSelect
                    id="participantes"
                    options={options?.participantes || []}
                    value={atividade.participantes}
                    onChange={(v) => handleChange("participantes", v)}
                    placeholder="Selecione participantes..."
                  />
                </div>

                {/* Observação */}
                <div className="sm:col-span-2 lg:col-span-4">
                  <Label htmlFor="observacao" className="text-sm font-medium text-foreground">Observação</Label>
                  <Textarea id="observacao" value={atividade.observacao} onChange={(e) => handleChange("observacao", e.target.value)} className="mt-1 resize-none" rows={2} />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button type="submit" disabled={submitting} className="bg-accent text-accent-foreground hover:bg-gold-dark font-semibold">
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  {submitting ? "Enviando..." : "Registrar Atividade"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AtividadesForm;
