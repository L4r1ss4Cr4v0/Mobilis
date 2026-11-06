import { useEffect, useState, type FormEvent } from "react";
import {
  api,
  brl,
  situacao,
  usuarioLogado,
  type Cliente,
  type Pedido,
} from "../../api";
import {
  DadosCliente,
  dadosDe,
  type Dados,
} from "../../components/DadosCliente";
import { Icon } from "../../components/Icon";
import {
  Avatar,
  Button,
  Card,
  Field,
  IconButton,
  Input,
  Loading,
  Modal,
  Notice,
  PageHeader,
  Seg,
} from "../../components/ui";

type Filtro = "todos" | "ativos" | "sem";

/** Carteira de clientes do agente: só aparecem os vinculados a ele (por pedido ou cadastrados por ele). */
export function Clientes() {
  const usuario = usuarioLogado()!;
  const [clientes, setClientes] = useState<Cliente[] | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busca, setBusca] = useState("");
  const [novo, setNovo] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);

  const carregar = () =>
    Promise.all([
      api.clientesDoAgente(usuario.id),
      api.pedidosDoAgente(usuario.id),
    ])
      .then(([c, p]) => {
        setClientes(c);
        setPedidos(p);
      })
      .catch((e: Error) => setErro(e.message));
  useEffect(() => {
    carregar();
  }, []);

  const remover = async (c: Cliente) => {
    if (!confirm(`Remover ${c.nome} da sua carteira de clientes?`)) return;
    setErro("");
    try {
      await api.removerCliente(c.id, usuario.id);
      carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  };

  const doCliente = (c: Cliente) =>
    pedidos.filter((p) => p.cliente.id === c.id);
  const ativosDe = (c: Cliente) => doCliente(c).filter((p) => p.ativo);
  const resumo = (c: Cliente) => {
    const s = ativosDe(c).map(situacao);
    if (s.includes("CONTRATO_ATIVO")) return "contrato ativo";
    if (s.includes("AGUARDANDO_ACEITE")) return "contrato aguardando aceite";
    if (s.includes("EM_ANALISE")) return "pedido em análise";
    if (s.includes("APROVADO")) return "pedido aprovado";
    const n = doCliente(c).length;
    return n
      ? `${n} ${n === 1 ? "pedido encerrado" : "pedidos encerrados"}`
      : "cadastrado pela sua equipe";
  };

  const termo = busca.trim().toLowerCase();
  const lista = (clientes ?? [])
    .filter(
      (c) =>
        !termo ||
        `${c.nome} ${c.login} ${c.cpf ?? ""}`.toLowerCase().includes(termo),
    )
    .filter((c) =>
      filtro === "ativos"
        ? ativosDe(c).length > 0
        : filtro === "sem"
          ? ativosDe(c).length === 0
          : true,
    );
  const maiorRenda = Math.max(1, ...(clientes ?? []).map((c) => c.rendaTotal));

  return (
    <>
      <PageHeader
        title="Clientes"
        subtitle="Somente os clientes vinculados a você: quem fez pedidos dos seus carros ou com o seu crédito, e quem você cadastrou."
        actions={
          <>
            <div className="flex h-[42px] w-[260px] items-center gap-2.5 rounded-lg border border-line bg-white px-3.5 text-muted">
              <Icon name="search" size={17} />
              <input
                className="w-full bg-transparent text-sm text-ink outline-none"
                placeholder="Nome, CPF ou usuário…"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <Button onClick={() => setNovo(true)}>
              <Icon name="plus" size={17} /> Novo cliente
            </Button>
          </>
        }
      />
      <div>
        <Seg
          value={filtro}
          onChange={setFiltro}
          options={[
            ["todos", `Todos · ${clientes?.length ?? 0}`],
            ["ativos", "Com pedido ativo"],
            ["sem", "Sem pedido ativo"],
          ]}
        />
      </div>
      {erro && <Notice tone="danger">{erro}</Notice>}
      {!clientes && !erro && <Loading />}
      {clientes && clientes.length === 0 && (
        <span className="self-center mt-5">
          Nenhum cliente vinculado a você ainda.
        </span>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-5">
        {lista.map((c) => (
          <Card key={c.id} className="p-4.5">
            <div className="flex items-start justify-between">
              <Avatar nome={c.nome} id={c.id} size={50} />
              <div className="flex gap-1.5">
                <IconButton
                  icon="edit"
                  aria-label={`Editar ${c.nome}`}
                  onClick={() => setEditando(c)}
                />
                <IconButton
                  icon="trash"
                  aria-label={`Remover ${c.nome}`}
                  className="!text-bad"
                  onClick={() => remover(c)}
                />
              </div>
            </div>
            <p className="mt-3 truncate font-medium">{c.nome}</p>
            <p className="mt-0.5 truncate text-xs text-muted">
              @{c.login} · {c.profissao}
            </p>
            <p className="mt-0.5 text-xs text-muted">CPF {c.cpf}</p>
            <div className="mt-4 border-t border-line pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Renda declarada</span>
                <span className="text-xs text-muted">
                  {c.rendimentos.length}{" "}
                  {c.rendimentos.length === 1 ? "fonte" : "fontes"}
                </span>
              </div>
              <p className="mt-0.5 text-lg font-medium">{brl(c.rendaTotal)}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stage">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(c.rendaTotal / maiorRenda) * 100}%` }}
                />
              </div>
            </div>
            <p className="mt-3.5 flex items-center gap-1.5 text-xs text-muted">
              <Icon name="file" size={14} /> {resumo(c)}
            </p>
          </Card>
        ))}
      </div>
      {clientes && clientes.length > 0 && lista.length === 0 && (
        <p className="text-sm text-muted">Nenhum cliente encontrado.</p>
      )}

      {novo && (
        <NovoCliente
          agenteId={usuario.id}
          onClose={() => setNovo(false)}
          onSalvo={() => (setNovo(false), carregar())}
        />
      )}
      {editando && (
        <EditarCliente
          agenteId={usuario.id}
          cliente={editando}
          onClose={() => setEditando(null)}
          onSalvo={() => (setEditando(null), carregar())}
        />
      )}
    </>
  );
}

const vazio: Dados = {
  cpf: "",
  rg: "",
  endereco: "",
  profissao: "",
  rendimentos: [{ entidade: "", valor: 0 }],
};

function NovoCliente({
  agenteId,
  onClose,
  onSalvo,
}: {
  agenteId: number;
  onClose: () => void;
  onSalvo: () => void;
}) {
  const [acesso, setAcesso] = useState({ nome: "", login: "", senha: "" });
  const [dados, setDados] = useState<Dados>(vazio);
  const [erro, setErro] = useState("");
  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.criarCliente(agenteId, { ...acesso, ...dados });
      onSalvo();
    } catch (err) {
      setErro((err as Error).message);
    }
  };
  return (
    <Modal
      title="Novo cliente"
      subtitle="O cliente fica vinculado a você e pode entrar com o usuário e a senha inicial."
      onClose={onClose}
      width={720}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-cliente">
            Cadastrar
          </Button>
        </>
      }
    >
      <form id="form-cliente" onSubmit={salvar} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nome completo" className="col-span-2">
            <Input
              id="novo-nome"
              required
              value={acesso.nome}
              onChange={(e) => setAcesso({ ...acesso, nome: e.target.value })}
            />
          </Field>
          <Field label="Usuário">
            <Input
              id="novo-login"
              required
              value={acesso.login}
              onChange={(e) => setAcesso({ ...acesso, login: e.target.value })}
            />
          </Field>
          <Field label="Senha inicial">
            <Input
              id="novo-senha"
              type="password"
              required
              minLength={6}
              value={acesso.senha}
              onChange={(e) => setAcesso({ ...acesso, senha: e.target.value })}
            />
          </Field>
        </div>
        <div className="border-t border-line pt-4">
          <DadosCliente value={dados} onChange={setDados} />
        </div>
        {erro && <Notice tone="danger">{erro}</Notice>}
      </form>
    </Modal>
  );
}

function EditarCliente({
  agenteId,
  cliente,
  onClose,
  onSalvo,
}: {
  agenteId: number;
  cliente: Cliente;
  onClose: () => void;
  onSalvo: () => void;
}) {
  const [nome, setNome] = useState(cliente.nome);
  const [dados, setDados] = useState<Dados>(dadosDe(cliente));
  const [erro, setErro] = useState("");
  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.salvarCliente(cliente.id, { nome, ...dados }, agenteId);
      onSalvo();
    } catch (err) {
      setErro((err as Error).message);
    }
  };
  return (
    <Modal
      title={`Editar ${cliente.nome}`}
      onClose={onClose}
      width={720}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-editar">
            Salvar
          </Button>
        </>
      }
    >
      <form id="form-editar" onSubmit={salvar} className="flex flex-col gap-4">
        <Field label="Nome completo">
          <Input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </Field>
        <DadosCliente value={dados} onChange={setDados} />
        {erro && <Notice tone="danger">{erro}</Notice>}
      </form>
    </Modal>
  );
}
