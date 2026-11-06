// Comunicação com a API Spring Boot + tipos + formatação. Único arquivo de "serviço" do front.

export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:8080/api";

// ---------- tipos (iguais às entidades do back-end) ----------
export type Perfil = "CLIENTE" | "EMPRESA" | "BANCO";
export type Status = "EM_ANALISE" | "APROVADO" | "REJEITADO" | "CANCELADO";
export type Pagamento = "DIRETO" | "CREDITO";
export type Titularidade = "CLIENTE" | "EMPRESA" | "BANCO";

export interface Rendimento {
  entidade: string;
  valor: number;
}

export interface Usuario {
  id: number;
  nome: string;
  login: string;
  perfil: Perfil;
}

export interface Cliente extends Usuario {
  cpf: string | null;
  rg: string | null;
  endereco: string | null;
  profissao: string | null;
  rendimentos: Rendimento[];
  rendaTotal: number;
  cadastroCompleto: boolean;
}

export interface Agente extends Usuario {
  tipo: "EMPRESA" | "BANCO";
  cnpj: string;
  codigoBanco: string | null;
}

export interface Automovel {
  id: number;
  matricula: string;
  ano: number;
  marca: string;
  modelo: string;
  categoria: string | null;
  placa: string;
  diaria: number;
  proprietario: Agente;
  temFoto: boolean;
  situacao: "DISPONIVEL" | "RESERVADO" | "ALUGADO";
}

export interface Contrato {
  id: number;
  titularidade: Titularidade;
  taxaJuros: number | null;
  texto: string;
  status: "AGUARDANDO_ACEITE" | "ACEITO" | "RECUSADO";
  emitidoEm: string;
  respondidoEm: string | null;
}

export interface Pedido {
  id: number;
  cliente: Cliente;
  automovel: Automovel;
  agente: Agente;
  inicio: string;
  fim: string;
  local: string;
  pagamento: Pagamento;
  parcelas: number;
  valorTotal: number;
  valorParcela: number;
  dias: number;
  status: Status;
  parecer: string | null;
  criadoEm: string;
  contrato: Contrato | null;
  ativo: boolean;
}

export interface DadosPedido {
  clienteId: number;
  automovelId: number;
  bancoId: number | null;
  inicio: string;
  fim: string;
  local: string;
  pagamento: Pagamento;
  parcelas: number;
}

export type DadosCadastroCliente = Pick<
  Cliente,
  "cpf" | "rg" | "endereco" | "profissao" | "rendimentos"
> & {
  nome: string;
  login: string;
  senha: string;
};

export interface ModeloContrato {
  modelo: string;
  campos: Record<string, string>;
  titularidades: Titularidade[];
  credito: boolean;
}

// ---------- sessão (o login devolve o usuário; ele fica salvo no navegador) ----------
const CHAVE = "mobilis.usuario";

export function usuarioLogado<T extends Usuario = Usuario>(): T | null {
  try {
    const salvo = localStorage.getItem(CHAVE);
    return salvo ? (JSON.parse(salvo) as T) : null;
  } catch {
    return null;
  }
}

export function salvarSessao(u: Usuario) {
  localStorage.setItem(CHAVE, JSON.stringify(u));
}

export function sair() {
  localStorage.removeItem(CHAVE);
}

export const ehAgente = (u: Usuario | null) =>
  u?.perfil === "EMPRESA" || u?.perfil === "BANCO";

// ---------- chamadas ----------
/** Textos mostrados ao usuário quando o servidor não manda uma mensagem de regra de negócio. */
const MENSAGEM_PADRAO: Record<number, string> = {
  400: "Confira os dados informados e tente novamente.",
  401: "Usuário ou senha inválidos.",
  403: "Você não tem permissão para fazer isso.",
  404: "Não encontramos o que você procurou.",
  409: "Já existe um registro com esses dados.",
  413: "O arquivo é grande demais. A foto pode ter no máximo 5 MB.",
  503: "O serviço está temporariamente indisponível. Tente novamente em alguns instantes.",
};
const SEM_CONEXAO =
  "Não foi possível falar com o servidor. Verifique sua internet e tente novamente.";
const ERRO_SERVIDOR =
  "Ocorreu um erro no servidor. Tente novamente em instantes.";

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function req<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const ehForm = opcoes.body instanceof FormData;
  const leitura = !opcoes.method || opcoes.method === "GET";
  let resp: Response | null = null;
  // leituras tentam de novo uma vez se a conexão cair ou o banco estiver indisponível
  for (let tentativa = 0; tentativa < (leitura ? 2 : 1); tentativa++) {
    if (tentativa > 0) await esperar(800);
    try {
      resp = await fetch(API_URL + caminho, {
        ...opcoes,
        headers:
          ehForm || !opcoes.body
            ? opcoes.headers
            : { "Content-Type": "application/json", ...opcoes.headers },
      });
    } catch {
      resp = null; // falha de rede (conexão recusada ou reiniciada)
      continue;
    }
    if (resp.status !== 503) break;
  }
  if (!resp) throw new Error(SEM_CONEXAO);

  if (!resp.ok) {
    const erro = await resp.json().catch(() => null);
    const doServidor =
      typeof erro?.message === "string" ? erro.message.trim() : "";
    // só repassa mensagens de regra de negócio (4xx); falhas internas viram um texto amigável
    if (resp.status < 500 && doServidor) throw new Error(doServidor);
    throw new Error(
      MENSAGEM_PADRAO[resp.status] ??
        (resp.status >= 500 ? ERRO_SERVIDOR : MENSAGEM_PADRAO[400]!),
    );
  }
  if (resp.status === 204 || resp.headers.get("Content-Length") === "0")
    return undefined as T;
  try {
    return (await resp.json()) as T;
  } catch {
    throw new Error(ERRO_SERVIDOR);
  }
}

const json = (corpo: unknown) => JSON.stringify(corpo);
const POST = (corpo?: unknown): RequestInit => ({
  method: "POST",
  body: corpo === undefined ? undefined : json(corpo),
});
const PUT = (corpo: unknown): RequestInit => ({
  method: "PUT",
  body: json(corpo),
});

/** Muda quando uma foto é enviada, para o navegador não mostrar a imagem antiga do cache. */
let versaoFoto = Date.now();

export const api = {
  login: (login: string, senha: string) =>
    req<Usuario>("/auth/login", POST({ login, senha })),
  cadastrarCliente: (dados: DadosCadastroCliente) =>
    req<Cliente>("/auth/cadastro", POST({ perfil: "CLIENTE", ...dados })),
  cadastrarAgente: (dados: {
    perfil: "EMPRESA" | "BANCO";
    nome: string;
    login: string;
    senha: string;
    cnpj: string;
    codigoBanco?: string;
  }) => req<Agente>("/auth/cadastro", POST(dados)),

  // clientes: o agente só enxerga os vinculados a ele
  clientesDoAgente: (agenteId: number) =>
    req<Cliente[]>(`/clientes?agenteId=${agenteId}`),
  cliente: (id: number) => req<Cliente>(`/clientes/${id}`),
  criarCliente: (agenteId: number, dados: DadosCadastroCliente) =>
    req<Cliente>(`/clientes?agenteId=${agenteId}`, POST(dados)),
  salvarCliente: (id: number, dados: Partial<Cliente>, agenteId?: number) =>
    req<Cliente>(
      `/clientes/${id}${agenteId ? `?agenteId=${agenteId}` : ""}`,
      PUT(dados),
    ),
  removerCliente: (id: number, agenteId: number) =>
    req<void>(`/clientes/${id}?agenteId=${agenteId}`, { method: "DELETE" }),

  bancos: () => req<Agente[]>("/agentes?tipo=BANCO"),
  agente: (id: number) => req<Agente>(`/agentes/${id}`),
  salvarAgente: (
    id: number,
    dados: { nome: string; cnpj: string; codigoBanco: string | null },
  ) => req<Agente>(`/agentes/${id}`, PUT(dados)),

  catalogo: (inicio?: string, fim?: string) =>
    req<Automovel[]>(
      inicio && fim ? `/automoveis?inicio=${inicio}&fim=${fim}` : "/automoveis",
    ),
  frota: (agenteId: number) =>
    req<Automovel[]>(`/automoveis?agenteId=${agenteId}`),
  automovel: (id: number) => req<Automovel>(`/automoveis/${id}`),
  criarAutomovel: (agenteId: number, dados: Partial<Automovel>) =>
    req<Automovel>(`/automoveis?agenteId=${agenteId}`, POST(dados)),
  salvarAutomovel: (id: number, agenteId: number, dados: Partial<Automovel>) =>
    req<Automovel>(`/automoveis/${id}?agenteId=${agenteId}`, PUT(dados)),
  excluirAutomovel: (id: number, agenteId: number) =>
    req<void>(`/automoveis/${id}?agenteId=${agenteId}`, { method: "DELETE" }),
  enviarFoto: async (id: number, agenteId: number, arquivo: File) => {
    const form = new FormData();
    form.append("foto", arquivo);
    const r = await req<Automovel>(
      `/automoveis/${id}/foto?agenteId=${agenteId}`,
      { method: "PUT", body: form },
    );
    versaoFoto = Date.now();
    return r;
  },
  removerFoto: (id: number, agenteId: number) =>
    req<Automovel>(`/automoveis/${id}/foto?agenteId=${agenteId}`, {
      method: "DELETE",
    }),

  pedidosDoCliente: (clienteId: number) =>
    req<Pedido[]>(`/pedidos?clienteId=${clienteId}`),
  pedidosDoAgente: (agenteId: number) =>
    req<Pedido[]>(`/pedidos?agenteId=${agenteId}`),
  pedido: (id: number) => req<Pedido>(`/pedidos/${id}`),
  criarPedido: (dados: DadosPedido) => req<Pedido>("/pedidos", POST(dados)),
  modificarPedido: (id: number, dados: DadosPedido) =>
    req<Pedido>(`/pedidos/${id}`, PUT(dados)),
  modificarPedidoAgente: (
    id: number,
    agenteId: number,
    dados: Pick<DadosPedido, "inicio" | "fim" | "local" | "parcelas">,
  ) => req<Pedido>(`/pedidos/${id}?agenteId=${agenteId}`, PUT(dados)),
  cancelarPedido: (id: number, clienteId: number) =>
    req<Pedido>(`/pedidos/${id}/cancelar?clienteId=${clienteId}`, POST()),
  emitirParecer: (
    id: number,
    agenteId: number,
    positivo: boolean,
    parecer: string,
  ) =>
    req<Pedido>(
      `/pedidos/${id}/parecer?agenteId=${agenteId}`,
      POST({ positivo, parecer }),
    ),

  modeloContrato: (pedidoId: number, agenteId: number) =>
    req<ModeloContrato>(
      `/pedidos/${pedidoId}/contrato/modelo?agenteId=${agenteId}`,
    ),
  emitirContrato: (
    pedidoId: number,
    agenteId: number,
    corpo: {
      modelo: string;
      titularidade: Titularidade;
      taxaJuros: number | null;
    },
  ) =>
    req<Pedido>(
      `/pedidos/${pedidoId}/contrato?agenteId=${agenteId}`,
      POST(corpo),
    ),
  responderContrato: (pedidoId: number, clienteId: number, aceitar: boolean) =>
    req<Pedido>(
      `/pedidos/${pedidoId}/contrato/resposta?clienteId=${clienteId}`,
      POST({ aceitar }),
    ),
};

export const fotoUrl = (carro: Pick<Automovel, "id">) =>
  `${API_URL}/automoveis/${carro.id}/foto?v=${versaoFoto}`;

// ---------- regras de exibição ----------
/** Bancos sempre aparecem com o código bancário (COMPE/BACEN). */
export const nomeAgente = (
  a: Pick<Agente, "nome" | "tipo" | "codigoBanco"> | null | undefined,
) =>
  !a
    ? "—"
    : a.tipo === "BANCO" && a.codigoBanco
      ? `${a.nome} · Cód. ${a.codigoBanco}`
      : a.nome;

/** O contrato é sempre redigido pelo dono do carro; no crédito, o banco (p.agente) só analisa. */
export const redatorDoContrato = (p: Pick<Pedido, "automovel">) =>
  p.automovel.proprietario;

export type Situacao =
  | "EM_ANALISE"
  | "APROVADO"
  | "AGUARDANDO_ACEITE"
  | "CONTRATO_ATIVO"
  | "CONTRATO_RECUSADO"
  | "REJEITADO"
  | "CANCELADO";

/** Situação do pedido somando o status e o contrato (o que o usuário enxerga). */
export function situacao(p: Pick<Pedido, "status" | "contrato">): Situacao {
  if (p.status !== "APROVADO" || !p.contrato) return p.status;
  return p.contrato.status === "ACEITO"
    ? "CONTRATO_ATIVO"
    : p.contrato.status === "RECUSADO"
      ? "CONTRATO_RECUSADO"
      : "AGUARDANDO_ACEITE";
}

export const TITULARIDADE: Record<Titularidade, string> = {
  CLIENTE: "Cliente (contratante)",
  EMPRESA: "Empresa proprietária",
  BANCO: "Banco",
};

// ---------- formatação ----------
const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
export const brl = (v: number) => moeda.format(v);
export const brlCurto = (v: number) =>
  "R$ " + Math.round(v).toLocaleString("pt-BR");

export const data = (iso: string | null | undefined) =>
  iso ? iso.slice(0, 10).split("-").reverse().join("/") : "—";

const MESES = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];
export function periodo(inicio: string, fim: string) {
  const [, m1, d1] = inicio.split("-").map(Number) as [number, number, number];
  const [, m2, d2] = fim.split("-").map(Number) as [number, number, number];
  return m1 === m2
    ? `${d1} – ${d2} ${MESES[m1 - 1]}`
    : `${d1} ${MESES[m1 - 1]} – ${d2} ${MESES[m2 - 1]}`;
}

export function isoDaqui(dias: number) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function haQuanto(isoDataHora: string) {
  const horas = Math.floor(
    (Date.now() - Date.parse(isoDataHora.slice(0, 23))) / 3_600_000,
  );
  if (horas < 1) return "agora";
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.floor(horas / 24);
  return dias === 1 ? "ontem" : `há ${dias} dias`;
}

export const nomeCarro = (a: Pick<Automovel, "marca" | "modelo">) =>
  `${a.marca} ${a.modelo}`;

/** Parcelas já vencidas desde o aceite do contrato. */
export function parcelasPagas(p: Pedido) {
  if (!p.contrato?.respondidoEm || p.contrato.status !== "ACEITO") return 0;
  const inicio = new Date(p.contrato.respondidoEm.slice(0, 10));
  const hoje = new Date();
  const meses =
    (hoje.getFullYear() - inicio.getFullYear()) * 12 +
    hoje.getMonth() -
    inicio.getMonth() +
    1;
  return Math.max(0, Math.min(p.parcelas, meses));
}

/** Percentual da renda mensal que a parcela compromete (null no pagamento direto). */
export function comprometimento(p: Pedido) {
  if (p.pagamento !== "CREDITO" || !p.cliente.rendaTotal) return null;
  return (p.valorParcela / p.cliente.rendaTotal) * 100;
}

export const LOJAS = [
  "Loja Savassi – BH",
  "Loja Pampulha – BH",
  "Loja Centro – BH",
  "Aeroporto de Confins",
];
export const CATEGORIAS = ["SUV", "Sedã", "Hatch", "Esportivo"];
