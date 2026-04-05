import { useState, useEffect, useMemo, useRef } from "react";
import PasswordGate from "@/components/PasswordGate";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import {
  ArrowLeft, BarChart3, FileText, Users, CalendarDays, CalendarIcon,
  Loader2, LogOut, Download, TrendingUp, Clock,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { format, isToday, isThisWeek, isThisMonth, isThisYear, parseISO, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import logoPcba from "@/assets/logo-pcba.png";
import SearchableSelect from "@/components/SearchableSelect";
import { fetchOptions, type AppScriptData } from "@/services/appScriptApi";
import { useLogout } from "@/components/PasswordGate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Parse date from relatorio (could be dd/MM/yyyy, Date object, or ISO string)
function parseDate(raw: unknown): Date | null {
  if (!raw) return null;
  if (raw instanceof Date) return raw;
  const s = String(raw);
  // dd/MM/yyyy
  const parts = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (parts) return new Date(+parts[3], +parts[2] - 1, +parts[1]);
  // ISO or other
  try {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

const COLORS = [
  "hsl(43,75%,50%)", "hsl(220,60%,40%)", "hsl(160,50%,45%)",
  "hsl(340,60%,50%)", "hsl(30,70%,55%)", "hsl(270,50%,55%)",
  "hsl(190,60%,45%)", "hsl(10,65%,50%)",
];

const DashboardContent = () => {
  const navigate = useNavigate();
  const logout = useLogout();
  const dashRef = useRef<HTMLDivElement>(null);

  const [options, setOptions] = useState<AppScriptData | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [filterLotacao, setFilterLotacao] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterCanal, setFilterCanal] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Chart grouping
  const [timeGroup, setTimeGroup] = useState<"mes" | "trimestre" | "semestre">("mes");

  useEffect(() => {
    fetchOptions()
      .then(setOptions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Parse relatorio into typed rows
  const rows = useMemo(() => {
    if (!options?.relatorio) return [];
    return options.relatorio.map((r: Record<string, unknown>) => ({
      id: r["id"] ?? r["ID"],
      solicitante: String(r["solicitante"] ?? r["Solicitante"] ?? ""),
      lotacao: String(r["lotacao"] ?? r["Lotação"] ?? r["lotação"] ?? ""),
      canal: String(r["canal"] ?? r["Canal"] ?? ""),
      tipo: String(r["tipo"] ?? r["Tipo"] ?? ""),
      quantidade: Number(r["quantidade"] ?? r["Quantidade"] ?? 0),
      descricao: String(r["descricao"] ?? r["Descrição"] ?? r["descrição"] ?? r["Descricao"] ?? ""),
      observacao: String(r["observacao"] ?? r["Observação"] ?? r["observação"] ?? ""),
      responsavel: String(r["responsavel"] ?? r["Responsável"] ?? r["responsável"] ?? ""),
      participantes: String(r["participantes"] ?? r["Participantes"] ?? ""),
      data: parseDate(r["data"] ?? r["Data"]),
    }));
  }, [options]);

  // Apply filters
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterLotacao && r.lotacao !== filterLotacao) return false;
      if (filterTipo && r.tipo !== filterTipo) return false;
      if (filterCanal && r.canal !== filterCanal) return false;
      if (r.data && dateFrom && r.data < startOfDay(dateFrom)) return false;
      if (r.data && dateTo && r.data > endOfDay(dateTo)) return false;
      return true;
    });
  }, [rows, filterLotacao, filterTipo, filterCanal, dateFrom, dateTo]);

  // Reset page when filters change
  useEffect(() => setPage(1), [filterLotacao, filterTipo, filterCanal, dateFrom, dateTo]);

  // Indicators
  const totalQtd = filtered.reduce((s, r) => s + r.quantidade, 0);
  const hojeQtd = filtered.filter((r) => r.data && isToday(r.data)).reduce((s, r) => s + r.quantidade, 0);
  const semanaQtd = filtered.filter((r) => r.data && isThisWeek(r.data, { locale: ptBR })).reduce((s, r) => s + r.quantidade, 0);
  const mesQtd = filtered.filter((r) => r.data && isThisMonth(r.data)).reduce((s, r) => s + r.quantidade, 0);
  const anoQtd = filtered.filter((r) => r.data && isThisYear(r.data)).reduce((s, r) => s + r.quantidade, 0);

  const indicators = [
    { label: "Total", value: totalQtd, icon: FileText, color: "text-primary" },
    { label: "Hoje", value: hojeQtd, icon: Clock, color: "text-accent" },
    { label: "Semana", value: semanaQtd, icon: CalendarDays, color: "text-secondary" },
    { label: "Mês", value: mesQtd, icon: TrendingUp, color: "text-primary" },
    { label: "Ano", value: anoQtd, icon: BarChart3, color: "text-accent" },
  ];

  // --- Charts data ---

  // Timeline grouped
  const timelineData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((r) => {
      if (!r.data) return;
      let key: string;
      const y = r.data.getFullYear();
      const m = r.data.getMonth();
      if (timeGroup === "mes") {
        key = `${String(m + 1).padStart(2, "0")}/${y}`;
      } else if (timeGroup === "trimestre") {
        const q = Math.floor(m / 3) + 1;
        key = `T${q}/${y}`;
      } else {
        const s = m < 6 ? 1 : 2;
        key = `S${s}/${y}`;
      }
      map.set(key, (map.get(key) || 0) + r.quantidade);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, total]) => ({ name, total }));
  }, [filtered, timeGroup]);

  // By canal
  const canalData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((r) => {
      if (r.canal) map.set(r.canal, (map.get(r.canal) || 0) + r.quantidade);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  // By tipo
  const tipoData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((r) => {
      if (r.tipo) map.set(r.tipo, (map.get(r.tipo) || 0) + r.quantidade);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  // By lotacao
  const lotacaoData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((r) => {
      if (r.lotacao) map.set(r.lotacao, (map.get(r.lotacao) || 0) + r.quantidade);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [filtered]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);

  // PDF export
  const [exporting, setExporting] = useState(false);
  const handleExport = async () => {
    if (!dashRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(dashRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: dashRef.current.scrollWidth,
      });
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const usableW = pdfW - margin * 2;
      const usableH = pdfH - margin * 2;
      const imgW = canvas.width;
      const imgH = canvas.height;
      const scale = usableW / imgW;
      const pageHeightPx = usableH / scale;

      let yOffset = 0;
      let pageNum = 0;
      while (yOffset < imgH) {
        if (pageNum > 0) pdf.addPage();
        const sliceH = Math.min(pageHeightPx, imgH - yOffset);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = imgW;
        sliceCanvas.height = sliceH;
        const ctx = sliceCanvas.getContext("2d")!;
        ctx.drawImage(canvas, 0, yOffset, imgW, sliceH, 0, 0, imgW, sliceH);
        const sliceImg = sliceCanvas.toDataURL("image/png");
        pdf.addImage(sliceImg, "PNG", margin, margin, usableW, sliceH * scale);
        yOffset += sliceH;
        pageNum++;
      }
      pdf.save("sumario-atividades-nap.pdf");
    } catch (e) {
      console.error("Erro ao exportar PDF:", e);
    } finally {
      setExporting(false);
    }
  };

  const clearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setFilterLotacao("");
    setFilterTipo("");
    setFilterCanal("");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <img src={logoPcba} alt="Logo PCBA" className="h-12 w-auto" />
             <div>
              <h1 className="text-lg font-bold font-heading tracking-tight sm:text-xl">Sumário de Atividades</h1>
              <p className="text-xs text-primary-foreground/70">Núcleo de Assuntos Prisionais (NAP)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleExport} disabled={exporting}
              className="bg-accent text-accent-foreground hover:bg-accent/80 font-semibold shadow-md">
              {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Exportar PDF
            </Button>
            <Button size="sm" onClick={() => navigate("/")}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 font-semibold shadow-md">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            {logout && (
              <Button size="sm" onClick={logout}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/80 font-semibold shadow-md">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            )}
          </div>
        </div>
      </header>

      <div ref={dashRef}>
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 space-y-6">
          {/* Indicators */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {indicators.map((ind) => (
              <Card key={ind.label} className="border-border shadow-sm">
                <CardContent className="flex items-center gap-3 py-4 px-4">
                  <div className={cn("rounded-lg bg-muted p-2", ind.color)}>
                    <ind.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{ind.label}</p>
                    <p className="text-xl font-bold text-foreground">{ind.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card className="border-border shadow-sm">
            <CardContent className="py-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end">
                {/* Date from */}
                <div>
                  <Label className="text-xs text-muted-foreground">De</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal text-sm mt-1", !dateFrom && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Início"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                {/* Date to */}
                <div>
                  <Label className="text-xs text-muted-foreground">Até</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal text-sm mt-1", !dateTo && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "dd/MM/yyyy") : "Fim"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                {/* Lotação */}
                <div>
                  <Label className="text-xs text-muted-foreground">Lotação</Label>
                  <SearchableSelect
                    options={options?.lotacoes || []}
                    value={filterLotacao}
                    onChange={setFilterLotacao}
                    placeholder="Todas"
                  />
                </div>
                {/* Tipo */}
                <div>
                  <Label className="text-xs text-muted-foreground">Tipo</Label>
                  <SearchableSelect
                    options={options?.tipos || []}
                    value={filterTipo}
                    onChange={setFilterTipo}
                    placeholder="Todos"
                  />
                </div>
                {/* Canal */}
                <div>
                  <Label className="text-xs text-muted-foreground">Canal</Label>
                  <SearchableSelect
                    options={options?.canais || []}
                    value={filterCanal}
                    onChange={setFilterCanal}
                    placeholder="Todos"
                  />
                </div>
              </div>
              {(dateFrom || dateTo || filterLotacao || filterTipo || filterCanal) && (
                <div className="mt-3 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground">
                    Limpar filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Timeline */}
            <Card className="border-border shadow-sm lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Linha do Tempo</CardTitle>
                  <div className="flex gap-1">
                    {(["mes", "trimestre", "semestre"] as const).map((g) => (
                      <Button key={g} variant={timeGroup === g ? "default" : "ghost"} size="sm"
                        className="text-xs h-7 px-2" onClick={() => setTimeGroup(g)}>
                        {g === "mes" ? "Mês" : g === "trimestre" ? "Trimestre" : "Semestre"}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <Tooltip />
                      <Line type="monotone" dataKey="total" stroke="hsl(43,75%,50%)" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Canal - Pie */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Por Canal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72 flex flex-col sm:flex-row items-center">
                  <div className="w-full sm:w-1/2 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={canalData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                          {canalData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full sm:w-1/2 flex flex-wrap gap-2 justify-center sm:justify-start px-2">
                    {canalData.map((entry, i) => (
                      <div key={entry.name} className="flex items-center gap-1.5 text-xs text-foreground">
                        <span className="inline-block h-3 w-3 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="truncate max-w-[140px]">{entry.name}</span>
                        <span className="text-muted-foreground">({entry.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tipo - Bar */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tipoData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(220,60%,40%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Lotação - Bar horizontal */}
            <Card className="border-border shadow-sm lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Top 10 Lotações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={lotacaoData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} height={60} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(43,75%,50%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Registros ({filtered.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lotação</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead>Canal</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          Nenhum registro encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      pageRows.map((r, i) => (
                        <TableRow key={`${r.id}-${i}`}>
                          <TableCell className="text-xs">{r.lotacao}</TableCell>
                          <TableCell className="text-xs">{r.tipo}</TableCell>
                          <TableCell className="text-xs text-right">{r.quantidade}</TableCell>
                          <TableCell className="text-xs">{r.canal}</TableCell>
                          <TableCell className="text-xs max-w-[200px] truncate">{r.descricao}</TableCell>
                          <TableCell className="text-xs">{r.responsavel}</TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {r.data ? format(r.data, "dd/MM/yyyy") : "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let num: number;
                        if (totalPages <= 5) {
                          num = i + 1;
                        } else if (page <= 3) {
                          num = i + 1;
                        } else if (page >= totalPages - 2) {
                          num = totalPages - 4 + i;
                        } else {
                          num = page - 2 + i;
                        }
                        return (
                          <PaginationItem key={num}>
                            <PaginationLink isActive={num === page} onClick={() => setPage(num)} className="cursor-pointer">
                              {num}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

const Dashboard = () => (
  <PasswordGate>
    <DashboardContent />
  </PasswordGate>
);

export default Dashboard;
