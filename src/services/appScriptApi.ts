const API_URL =
  "https://script.google.com/macros/s/AKfycbz5UKYgpRxCjUJx6ilQBWDzO-StPxs4w214VWNanoXPKCaDYrgBK4bPRNAAIooia-5SnA/exec";

export interface AppScriptData {
  usuarios: string[];
  lotacoes: string[];
  tipos: string[];
  descricoes: string[];
  canais: string[];
  participantes: string[];
  relatorio: Record<string, unknown>[];
}

export async function fetchOptions(): Promise<AppScriptData> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Erro ao buscar dados da planilha");
  return res.json();
}

export interface AtividadePayload {
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

export async function submitAtividade(data: AtividadePayload): Promise<{ status: string }> {
  const params = new URLSearchParams(data as unknown as Record<string, string>);
  const res = await fetch(`${API_URL}?${params.toString()}`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
  });
  if (!res.ok) throw new Error("Erro ao enviar atividade");
  return res.json();
}
