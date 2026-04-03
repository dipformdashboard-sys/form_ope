import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutDashboard, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoPcba from "@/assets/logo-pcba.png";

interface Atividade {
  id: string;
  solicitante: string;
  lotacao: string;
  canal: string;
  tipo: string;
  quantidade: string;
  descricao: string;
  observacao: string;
  responsavel: string;
  participantes: string;
  data: string;
}

const emptyAtividade = (): Atividade => ({
  id: crypto.randomUUID(),
  solicitante: "",
  lotacao: "",
  canal: "",
  tipo: "",
  quantidade: "",
  descricao: "",
  observacao: "",
  responsavel: "",
  participantes: "",
  data: new Date().toISOString().split("T")[0],
});

const AtividadesForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [atividade, setAtividade] = useState<Atividade>(emptyAtividade());
  const [atividades, setAtividades] = useState<Atividade[]>([]);

  const handleChange = (field: keyof Atividade, value: string) => {
    setAtividade((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!atividade.solicitante || !atividade.descricao || !atividade.responsavel) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha solicitante, descrição e responsável.",
        variant: "destructive",
      });
      return;
    }
    setAtividades((prev) => [...prev, atividade]);
    setAtividade(emptyAtividade());
    toast({
      title: "Atividade registrada",
      description: "A atividade foi adicionada com sucesso.",
    });
  };

  const handleDelete = (id: string) => {
    setAtividades((prev) => prev.filter((a) => a.id !== id));
  };

  const fields: { key: keyof Atividade; label: string; type?: string; required?: boolean; full?: boolean }[] = [
    { key: "solicitante", label: "Solicitante", required: true },
    { key: "lotacao", label: "Lotação" },
    { key: "canal", label: "Canal" },
    { key: "tipo", label: "Tipo" },
    { key: "quantidade", label: "Quantidade", type: "number" },
    { key: "data", label: "Data", type: "date", required: true },
    { key: "responsavel", label: "Responsável", required: true },
    { key: "participantes", label: "Participantes" },
    { key: "descricao", label: "Descrição", full: true, required: true },
    { key: "observacao", label: "Observação", full: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <img src={logoPcba} alt="Logo PCBA" className="h-12 w-auto" />
            <div>
              <h1 className="text-lg font-bold font-heading tracking-tight sm:text-xl">
                Atividades Realizadas
              </h1>
              <p className="text-xs text-primary-foreground/70">
                Polícia Civil da Bahia
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Form */}
        <Card className="mb-8 border-border shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {fields.map(({ key, label, type, required, full }) => (
                  <div
                    key={key}
                    className={full ? "sm:col-span-2 lg:col-span-4" : ""}
                  >
                    <Label htmlFor={key} className="text-sm font-medium text-foreground">
                      {label}
                      {required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {full ? (
                      <Textarea
                        id={key}
                        value={atividade[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="mt-1 resize-none"
                        rows={2}
                      />
                    ) : (
                      <Input
                        id={key}
                        type={type || "text"}
                        value={atividade[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="mt-1"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-gold-dark font-semibold">
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Atividade
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Table */}
        {atividades.length > 0 && (
          <Card className="border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-primary text-primary-foreground">
                    <th className="px-3 py-2 text-left font-semibold">Solicitante</th>
                    <th className="px-3 py-2 text-left font-semibold">Lotação</th>
                    <th className="px-3 py-2 text-left font-semibold">Canal</th>
                    <th className="px-3 py-2 text-left font-semibold">Tipo</th>
                    <th className="px-3 py-2 text-left font-semibold">Qtd</th>
                    <th className="px-3 py-2 text-left font-semibold">Responsável</th>
                    <th className="px-3 py-2 text-left font-semibold">Data</th>
                    <th className="px-3 py-2 text-center font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {atividades.map((a, i) => (
                    <tr
                      key={a.id}
                      className={`border-b border-border ${i % 2 === 0 ? "bg-card" : "bg-muted/50"}`}
                    >
                      <td className="px-3 py-2">{a.solicitante}</td>
                      <td className="px-3 py-2">{a.lotacao}</td>
                      <td className="px-3 py-2">{a.canal}</td>
                      <td className="px-3 py-2">{a.tipo}</td>
                      <td className="px-3 py-2">{a.quantidade}</td>
                      <td className="px-3 py-2">{a.responsavel}</td>
                      <td className="px-3 py-2">{a.data}</td>
                      <td className="px-3 py-2 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(a.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
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
