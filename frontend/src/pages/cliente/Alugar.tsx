import { useEffect, useState, type FormEvent } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  api,
  brl,
  brlCurto,
  isoDaqui,
  LOJAS,
  nomeAgente,
  periodo,
  usuarioLogado,
  type Agente,
  type Automovel,
  type Cliente,
  type Pagamento,
} from "../../api";
import { Icon } from "../../components/Icon";
import {
  Avatar,
  Button,
  Card,
  CarImage,
  Field,
  InfoStrip,
  Input,
  Loading,
  Notice,
  Pill,
  Select,
} from "../../components/ui";

/** Detalhe do carro + reserva. Também usada para alterar um pedido em análise (?pedido=id). */
export function Alugar() {
  const navigate = useNavigate();
  const { carroId } = useParams();
  const [params] = useSearchParams();
  const pedidoId = params.get("pedido");
  const usuario = usuarioLogado()!;

  const [carro, setCarro] = useState<Automovel | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [bancos, setBancos] = useState<Agente[]>([]);

  const [inicio, setInicio] = useState(params.get("inicio") ?? isoDaqui(7));
  const [fim, setFim] = useState(params.get("fim") ?? isoDaqui(14));
  const [local, setLocal] = useState(LOJAS[0]!);
  const [pagamento, setPagamento] = useState<Pagamento>("CREDITO");
  const [bancoId, setBancoId] = useState<number | null>(null);
  const [parcelas, setParcelas] = useState(6);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    Promise.all([
      api.automovel(Number(carroId)),
      api.cliente(usuario.id),
      api.bancos(),
      pedidoId ? api.pedido(Number(pedidoId)) : null,
    ])
      .then(([a, c, b, p]) => {
        setCarro(a);
        setCliente(c);
        setBancos(b);
        setBancoId(b[0]?.id ?? null);
        if (p) {
          setInicio(p.inicio);
          setFim(p.fim);
          setLocal(p.local);
          setPagamento(p.pagamento);
          if (p.pagamento === "CREDITO") {
            setBancoId(p.agente.id);
            setParcelas(p.parcelas);
          }
        }
      })
      .catch((e: Error) => setErro(e.message));
  }, [carroId, pedidoId, usuario.id]);

  if (!carro || !cliente)
    return erro ? <Notice tone="danger">{erro}</Notice> : <Loading />;

  const dias = Math.max(
    1,
    Math.round((Date.parse(fim) - Date.parse(inicio)) / 86_400_000),
  );
  const total = carro.diaria * dias;
  const banco = bancos.find((b) => b.id === bancoId);
  const [marca, ...resto] = [carro.marca, ...carro.modelo.split(" ")];

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const corpo = {
        clienteId: cliente.id,
        automovelId: carro.id,
        bancoId: pagamento === "CREDITO" ? bancoId : null,
        inicio,
        fim,
        local,
        pagamento,
        parcelas: pagamento === "CREDITO" ? parcelas : 1,
      };
      if (pedidoId) await api.modificarPedido(Number(pedidoId), corpo);
      else await api.criarPedido(corpo);
      navigate("/cliente/pedidos");
    } catch (err) {
      setErro((err as Error).message);
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link to={pedidoId ? "/cliente/pedidos" : "/cliente/novo-pedido"}>
          {pedidoId ? "Meus pedidos" : "Novo pedido"}
        </Link>
        <Icon name="chevRight" size={14} />
        <span className="font-medium text-ink">
          {pedidoId
            ? `Alterar pedido #${pedidoId}`
            : `${carro.marca} ${carro.modelo}`}
        </span>
      </div>

      <div className="flex items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[26px] font-normal tracking-tight">
                  {marca} {resto[0]}{" "}
                  <span className="font-medium text-muted">
                    {resto.slice(1).join(" ")}
                  </span>
                </h1>
                <div className="mt-2 flex gap-2">
                  <Pill className="bg-ok-bg text-ok">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    Livre de {periodo(inicio, fim)}
                  </Pill>
                  <Pill className="border border-line">
                    {carro.categoria ?? "—"} · {carro.ano}
                  </Pill>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[28px] font-normal tracking-tight">
                  {brlCurto(carro.diaria)}
                </span>
                <p className="text-xs text-muted">por dia</p>
              </div>
            </div>
            <CarImage carro={carro} className="mt-5 h-[260px]" />
            <div className="mt-4">
              <InfoStrip
                items={[
                  ["tag", "Marca", carro.marca],
                  ["car", "Modelo", carro.modelo],
                  ["calendar", "Ano", carro.ano],
                  ["hash", "Placa", carro.placa],
                  ["id", "Matrícula", carro.matricula],
                  [
                    carro.proprietario.tipo === "BANCO" ? "bank" : "building",
                    "Proprietário",
                    nomeAgente(carro.proprietario),
                  ],
                ]}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-medium">
                <Icon name="id" /> Seus dados para a análise
              </h2>
              <Link to="/cliente/perfil">
                <Button variant="outline" size="sm">
                  <Icon name="edit" size={15} /> Atualizar em Meu perfil
                </Button>
              </Link>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Avatar nome={cliente.nome} id={cliente.id} size={40} />
              <div>
                <p className="font-medium">{cliente.nome}</p>
                <p className="text-xs text-muted">{cliente.endereco}</p>
              </div>
            </div>
            <div className="mt-4">
              <InfoStrip
                cols={4}
                items={[
                  ["id", "CPF", cliente.cpf ?? "—"],
                  ["id", "RG", cliente.rg ?? "—"],
                  ["briefcase", "Profissão", cliente.profissao ?? "—"],
                  [
                    "wallet",
                    "Renda",
                    `${brl(cliente.rendaTotal)} · ${cliente.rendimentos.length} ${cliente.rendimentos.length === 1 ? "fonte" : "fontes"}`,
                  ],
                ]}
              />
            </div>
            {!cliente.cadastroCompleto && (
              <div className="mt-4">
                <Notice tone="warning">
                  Seu cadastro está incompleto.{" "}
                  <Link to="/cliente/perfil" className="font-medium underline">
                    Complete em Meu perfil
                  </Link>{" "}
                  para enviar o pedido.
                </Notice>
              </div>
            )}
          </Card>
        </div>

        <Card className="sticky top-6 w-[370px] shrink-0 p-6">
          <h2 className="text-lg font-medium">
            {pedidoId ? "Alterar reserva" : "Reservar"}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="Retirada">
              <Input
                type="date"
                required
                value={inicio}
                min={isoDaqui(0)}
                onChange={(e) => setInicio(e.target.value)}
              />
            </Field>
            <Field label="Devolução">
              <Input
                type="date"
                required
                value={fim}
                min={inicio}
                onChange={(e) => setFim(e.target.value)}
              />
            </Field>
            <Field label="Local de retirada" className="col-span-2">
              <Select value={local} onChange={(e) => setLocal(e.target.value)}>
                {LOJAS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </Select>
            </Field>
          </div>

          <p className="mt-4 text-[13px] font-medium">Forma de pagamento</p>
          <div className="mt-2 grid grid-cols-2 rounded-lg bg-stage-2/70 p-1">
            {(
              [
                ["DIRETO", "Direto", "building"],
                ["CREDITO", "Crédito", "bank"],
              ] as const
            ).map(([v, rotulo, icone]) => (
              <button
                key={v}
                type="button"
                onClick={() => setPagamento(v)}
                className={`flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium ${pagamento === v ? "bg-white" : "text-muted"}`}
              >
                <Icon name={icone} size={15} /> {rotulo}
              </button>
            ))}
          </div>
          {pagamento === "CREDITO" ? (
            <>
              <div className="mt-3 grid grid-cols-[1.5fr_1fr] gap-3">
                <Field label="Banco do crédito">
                  <Select
                    id="banco"
                    value={bancoId ?? ""}
                    onChange={(e) => setBancoId(Number(e.target.value))}
                    required
                  >
                    {bancos.map((b) => (
                      <option key={b.id} value={b.id}>
                        {nomeAgente(b)}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Parcelas">
                  <div className="flex h-11 items-center justify-between rounded-lg border border-line px-2">
                    <button
                      type="button"
                      aria-label="Menos parcelas"
                      className="h-7 w-7 rounded-lg hover:bg-stage"
                      onClick={() => setParcelas(Math.max(1, parcelas - 1))}
                    >
                      −
                    </button>
                    <b>{parcelas}x</b>
                    <button
                      type="button"
                      aria-label="Mais parcelas"
                      className="h-7 w-7 rounded-lg hover:bg-stage"
                      onClick={() => setParcelas(Math.min(12, parcelas + 1))}
                    >
                      +
                    </button>
                  </div>
                </Field>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                O {banco ? nomeAgente(banco) : "banco"} faz a análise de crédito
                e emite o contrato.
              </p>
            </>
          ) : (
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Pagamento direto com {nomeAgente(carro.proprietario)}, que analisa
              o pedido e emite o contrato.
            </p>
          )}

          <div className="mt-5 flex flex-col gap-2.5 border-t border-dashed border-line pt-4 text-sm">
            <Linha k="Diária" v={brl(carro.diaria)} />
            <Linha k="Período" v={`${dias} ${dias === 1 ? "dia" : "dias"}`} />
            {pagamento === "CREDITO" && (
              <Linha
                k="Parcelas estimadas"
                v={`${parcelas}x de ${brl(total / parcelas)}`}
              />
            )}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-ink pt-4">
            <div>
              <p className="text-xs text-side">Total do aluguel</p>
              <p className="text-[26px] font-normal tracking-tight">
                {brl(total)}
              </p>
            </div>
            <Icon name="wallet" size={26} />
          </div>
          {erro && (
            <div className="mt-4">
              <Notice tone="danger">{erro}</Notice>
            </div>
          )}
          <Button
            type="submit"
            block
            size="lg"
            className="mt-4"
            disabled={enviando || !cliente.cadastroCompleto}
          >
            {enviando
              ? "Enviando…"
              : pedidoId
                ? "Salvar alterações"
                : "Enviar pedido para análise"}{" "}
            <Icon name="arrowRight" size={17} />
          </Button>
          <p className="mt-3 text-center text-xs text-muted">
            O pedido fica <b>Em análise</b> até o parecer do agente.
          </p>
        </Card>
      </div>
    </form>
  );
}

function Linha({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
