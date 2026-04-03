import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutDashboard, Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoPcba from "@/assets/logo-pcba.png";
import SearchableSelect from "@/components/SearchableSelect";
import { fetchOptions, submitAtividade, type AppScriptData } from "@/services/appScriptApi";

interface Atividade {
  solicitante: string;
  lotacao: string;
  canal: string;
  tipo: string;
  quantidade: string;
  descricao: string;
  observacao: string;
  responsavel: string;
  participantes: string;
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
  participantes: "",
});

const AtividadesForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [atividade, setAtividade] = useState<Atividade>(emptyAtividade());
  const [atividades, setAtividades] = useState<Record<string, unknown>[]>([]);
  const [options, setOptions] = useState<AppScriptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOptions()
      .then((data) => {
        setOptions(data);
        setAtividades(data.relatorio || []);
      })
      .catch(() =>
        toast({ title: "Erro", description: "Não foi possível carregar os dados da planilha.", variant: "destructive" })
      )
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof Atividade, value: string) => {
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
      const result = await submitAtividade(atividade);
      if (result.status === "ok") {
        toast({ title: "Atividade registrada", description: "Enviada com sucesso para a planilha." });
        setAtividade(emptyAtividade());
        // Refresh data
        const fresh = await fetchOptions();
        setAtividades(fresh.relatorio || []);
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
    { key: "solicitante", label: "Solicitante", optionsKey: "usuarios", required: true },
    { key: "lotacao", label: "Lotação", optionsKey: "lotacoes" },
    { key: "canal", label: "Canal", optionsKey: "canais" },
    { key: "tipo", label: "Tipo", optionsKey: "tipos" },
    { key: "responsavel", label: "Responsável", optionsKey: "usuarios", required: true },
    { key: "participantes", label: "Participantes", optionsKey: "participantes" },
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
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Card className="mb-8 border-border shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {selectFields.map(({ key, label, optionsKey, required }) => (
                  <div key={key} className={key === "descricao" ? "sm:col-span-2 lg:col-span-4" : ""}>
                    <Label htmlFor={key} className="text-sm font-medium text-foreground">
                      {label}
                      {required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <SearchableSelect
                      id={key}
                      options={(options?.[optionsKey] as string[]) || []}
                      value={atividade[key]}
                      onChange={(v) => handleChange(key, v)}
                      placeholder={`Selecione ${label.toLowerCase()}...`}
                    />
                  </div>
                ))}

                <div>
                  <Label htmlFor="quantidade" className="text-sm font-medium text-foreground">Quantidade</Label>
                  <Input id="quantidade" type="number" value={atividade.quantidade} onChange={(e) => handleChange("quantidade", e.target.value)} className="mt-1" />
                </div>

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

        {atividades.length > 0 && (
          <Card className="border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-primary text-primary-foreground">
                    <th className="px-3 py-2 text-left font-semibold">ID</th>
                    <th className="px-3 py-2 text-left font-semibold">Solicitante</th>
                    <th className="px-3 py-2 text-left font-semibold">Lotação</th>
                    <th className="px-3 py-2 text-left font-semibold">Canal</th>
                    <th className="px-3 py-2 text-left font-semibold">Tipo</th>
                    <th className="px-3 py-2 text-left font-semibold">Qtd</th>
                    <th className="px-3 py-2 text-left font-semibold">Responsável</th>
                    <th className="px-3 py-2 text-left font-semibold">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {atividades.map((a, i) => (
                    <tr key={i} className={`border-b border-border ${i % 2 === 0 ? "bg-card" : "bg-muted/50"}`}>
                      <td className="px-3 py-2">{String(a["id"] ?? "")}</td>
                      <td className="px-3 py-2">{String(a["solicitante"] ?? "")}</td>
                      <td className="px-3 py-2">{String(a["lotacao"] ?? a["lotação"] ?? "")}</td>
                      <td className="px-3 py-2">{String(a["canal"] ?? "")}</td>
                      <td className="px-3 py-2">{String(a["tipo"] ?? "")}</td>
                      <td className="px-3 py-2">{String(a["quantidade"] ?? "")}</td>
                      <td className="px-3 py-2">{String(a["responsavel"] ?? a["responsável"] ?? "")}</td>
                      <td className="px-3 py-2">{String(a["data"] ?? "")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AtividadesForm;
