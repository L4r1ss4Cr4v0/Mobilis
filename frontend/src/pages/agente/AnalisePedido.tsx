import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  api,
  brl,
  brlCurto,
  comprometimento,
  data,
  isoDaqui,
  LOJAS,
  nomeAgente,
  nomeCarro,
  redatorDoContrato,
  situacao,
  usuarioLogado,
  type Pedido,
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
  Modal,
  Notice,
  Pill,
  Select,
  StatusPill,
  TextArea,
} from "../../components/ui";
import { LIMITE_RENDA } from "./Pedidos";

/** Análise financeira do pedido: o agente responsável emite parecer positivo (aprova) ou negativo (rejeita). */
export function AnalisePedido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const usuario = usuarioLogado()!;
  const [p, setP] = useState<Pedido | null>(null);
  const [parecer, setParecer] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [modificar, setModificar] = useState(false);

  useEffect(() => {
    api
      .pedido(Number(id))
      .then((x) => {
        setP(x);
        setParecer(x.parecer ?? "");
      })
      .catch((e: Error) => setErro(e.message));
  }, [id]);

  if (!p) return erro ? <Notice tone="danger">{erro}</Notice> : <Loading />;

  const pct = comprometimento(p);
  const dentro = pct == null || pct <= LIMITE_RENDA;
  const c = p.cliente;
  const responsavel = p.agente.id === usuario.id; // faz a análise
  const redator = redatorDoContrato(p); // dono do carro: redige o contrato
  const souRedator = redator.id === usuario.id;
  const s = situacao(p);

  const emitir = async (positivo: boolean) => {
    setErro("");
    if (!positivo && !parecer.trim())
      return setErro("Explique no parecer o motivo da rejeição.");
    setEnviando(true);
    try {
      await api.emitirParecer(p.id, usuario.id, positivo, parecer);
      // parecer positivo abre o editor do contrato quando o próprio analista é o dono do carro;
      // no crédito para carro de empresa, o contrato fica com a empresa
      navigate(
        positivo && souRedator
          ? `/agente/pedidos/${p.id}/contrato`
          : "/agente/pedidos",
      );
    } catch (e) {
      setErro((e as Error).message);
      setEnviando(false);
    }
  };

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <Link
            to="/agente/pedidos"
            className="flex items-center gap-1.5 text-sm text-muted"
          >
            <Icon name="chevLeft" size={15} /> Pedidos para avaliação
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-[30px] font-normal tracking-tight">
              Pedido #{p.id}
            </h1>
            <StatusPill pedido={p} />
          </div>
          <p className="mt-1 text-[15px] text-muted">
            Recebido em {data(p.criadoEm)} · análise: {nomeAgente(p.agente)}
          </p>
        </div>
        {responsavel && p.status === "EM_ANALISE" && (
          <Button variant="outline" onClick={() => setModificar(true)}>
            <Icon name="edit" size={16} /> Modificar pedido
          </Button>
        )}
      </div>

      <div className="flex items-start gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <Card className="p-6">
            <div className="flex items-center gap-6">
              <CarImage
                carro={p.automovel}
                className="h-[150px] w-[290px] shrink-0 bg-transparent"
              />
              <div className="min-w-0">
                <p className="text-[19px] font-medium">
                  {nomeCarro(p.automovel)}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {p.automovel.categoria} · {p.automovel.ano} · Placa{" "}
                  {p.automovel.placa}
                </p>
                <div className="mt-4 flex gap-6">
                  <div>
                    <p className="text-xs text-muted">Retirada</p>
                    <p className="mt-0.5 text-sm font-medium">
                      {data(p.inicio)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Devolução</p>
                    <p className="mt-0.5 text-sm font-medium">{data(p.fim)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Total · {p.dias} dias</p>
                    <p className="text-xl font-normal">
                      {brlCurto(p.valorTotal)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <InfoStrip
                cols={2}
                items={[
                  [
                    "bank",
                    "Pagamento",
                    p.pagamento === "CREDITO"
                      ? `Contrato de crédito · ${nomeAgente(p.agente)}`
                      : "Direto com a empresa",
                  ],
                  [
                    "list",
                    "Parcelas",
                    `${p.parcelas}x de ${brl(p.valorParcela)}`,
                  ],
                  [
                    "building",
                    "Proprietário do carro",
                    nomeAgente(p.automovel.proprietario),
                  ],
                  ["pin", "Retirada", p.local],
                ]}
              />
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-5">
            <Card className="p-6">
              <h2 className="flex items-center gap-2 font-medium">
                <Icon name="user" /> Contratante
              </h2>
              <div className="mt-4 flex items-center gap-3">
                <Avatar nome={c.nome} id={c.id} size={48} />
                <div>
                  <p className="font-medium">{c.nome}</p>
                  <p className="text-xs text-muted">{c.login}</p>
                </div>
              </div>
              <div className="mt-4">
                <InfoStrip
                  cols={2}
                  items={[
                    ["id", "CPF", c.cpf ?? "—"],
                    ["id", "RG", c.rg ?? "—"],
                    ["briefcase", "Profissão", c.profissao ?? "—"],
                    ["home", "Endereço", c.endereco ?? "—"],
                  ]}
                />
              </div>
            </Card>
            <Card className="flex flex-col p-6">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-medium">
                  <Icon name="briefcase" /> Rendimentos
                </h2>
                <span className="rounded-full bg-info-bg px-2.5 py-0.5 text-xs font-medium text-primary">
                  {c.rendimentos.length} de 3
                </span>
              </div>
              <div className="mt-4 flex flex-col">
                {c.rendimentos.map((r, i) => (
                  <div
                    key={i}
                    className={`flex justify-between py-3 text-sm ${i ? "border-t border-line" : ""}`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon name="briefcase" size={15} className="text-muted" />
                      {r.entidade}
                    </span>
                    <b>{brl(r.valor)}</b>
                  </div>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-ink pt-3.5">
                <span className="text-sm">Renda mensal</span>
                <b className="text-xl">{brl(c.rendaTotal)}</b>
              </div>
            </Card>
          </div>
        </div>

        <Card className="w-[350px] shrink-0 p-6">
          <h2 className="text-[17px] font-medium">Parecer financeiro</h2>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-[34px] leading-none font-normal tracking-tight">
                {pct == null ? "—" : `${pct.toFixed(1).replace(".", ",")}%`}
              </p>
              <p className="mt-1.5 text-xs text-muted">
                {pct == null
                  ? "pagamento direto, sem crédito"
                  : "da renda vai para a parcela"}
              </p>
            </div>
            <Pill
              className={dentro ? "bg-ok-bg text-ok" : "bg-bad-bg text-bad"}
            >
              <Icon name={dentro ? "check" : "x"} size={13} />{" "}
              {dentro ? "Baixo risco" : "Acima do limite"}
            </Pill>
          </div>
          <div className="mt-4 flex flex-col gap-2.5 border-t border-line pt-3.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Parcela</span>
              <b>{brl(p.valorParcela)}</b>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Renda mensal</span>
              <b>{brl(c.rendaTotal)}</b>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Limite aceito</span>
              <b>até {LIMITE_RENDA}%</b>
            </div>
          </div>

          <label
            className="mt-5 block text-[13px] font-medium"
            htmlFor="parecer"
          >
            Parecer
          </label>
          <TextArea
            id="parecer"
            className="mt-1.5"
            value={parecer}
            disabled={!responsavel || p.status !== "EM_ANALISE"}
            onChange={(e) => setParecer(e.target.value)}
            placeholder="Ex.: renda compatível com as parcelas."
          />
          {erro && (
            <div className="mt-4">
              <Notice tone="danger">{erro}</Notice>
            </div>
          )}

          {p.status === "EM_ANALISE" && !responsavel ? (
            <p className="mt-4 text-center text-sm text-muted">
              A análise de crédito deste pedido é feita por{" "}
              {nomeAgente(p.agente)}.
            </p>
          ) : p.status === "EM_ANALISE" ? (
            <>
              <Button
                block
                size="lg"
                variant="success"
                className="mt-5"
                disabled={enviando}
                onClick={() => emitir(true)}
              >
                <Icon name="check" size={17} /> Parecer positivo
              </Button>
              <Button
                block
                variant="danger"
                className="mt-2.5"
                disabled={enviando}
                onClick={() => emitir(false)}
              >
                <Icon name="x" size={17} /> Parecer negativo
              </Button>
              <p className="mt-3 text-center text-xs text-muted">
                {souRedator
                  ? "O positivo aprova o pedido e abre o editor do contrato."
                  : `O positivo aprova o crédito; o contrato é redigido por ${nomeAgente(redator)}.`}
              </p>
            </>
          ) : (s === "APROVADO" || s === "AGUARDANDO_ACEITE") && souRedator ? (
            <Button
              block
              size="lg"
              variant="dark"
              className="mt-5"
              onClick={() => navigate(`/agente/pedidos/${p.id}/contrato`)}
            >
              {s === "APROVADO"
                ? "Redigir contrato"
                : "Revisar contrato enviado"}{" "}
              <Icon name="arrowRight" size={16} />
            </Button>
          ) : s === "APROVADO" || s === "AGUARDANDO_ACEITE" ? (
            <p className="mt-4 text-center text-sm text-muted">
              {s === "APROVADO"
                ? "Crédito aprovado. O contrato está a cargo de"
                : "Contrato enviado ao cliente por"}{" "}
              {nomeAgente(redator)}.
            </p>
          ) : (
            <p className="mt-4 text-center text-sm text-muted">
              Este pedido já foi finalizado.
            </p>
          )}
        </Card>
      </div>

      {modificar && (
        <ModificarPedido
          pedido={p}
          agenteId={usuario.id}
          onClose={() => setModificar(false)}
          onSalvo={(x) => (setP(x), setModificar(false))}
        />
      )}
    </>
  );
}

/** O agente ajusta datas, local e parcelas antes de emitir o parecer. */
function ModificarPedido({
  pedido,
  agenteId,
  onClose,
  onSalvo,
}: {
  pedido: Pedido;
  agenteId: number;
  onClose: () => void;
  onSalvo: (p: Pedido) => void;
}) {
  const [form, setForm] = useState({
    inicio: pedido.inicio,
    fim: pedido.fim,
    local: pedido.local,
    parcelas: pedido.parcelas,
  });
  const [erro, setErro] = useState("");
  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    try {
      onSalvo(await api.modificarPedidoAgente(pedido.id, agenteId, form));
    } catch (err) {
      setErro((err as Error).message);
    }
  };
  return (
    <Modal
      title={`Modificar pedido #${pedido.id}`}
      subtitle="O valor é recalculado com as novas datas."
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-modificar">
            Salvar alterações
          </Button>
        </>
      }
    >
      <form
        id="form-modificar"
        onSubmit={salvar}
        className="grid grid-cols-2 gap-4"
      >
        <Field label="Retirada">
          <Input
            type="date"
            required
            min={isoDaqui(0)}
            value={form.inicio}
            onChange={(e) => setForm({ ...form, inicio: e.target.value })}
          />
        </Field>
        <Field label="Devolução">
          <Input
            type="date"
            required
            min={form.inicio}
            value={form.fim}
            onChange={(e) => setForm({ ...form, fim: e.target.value })}
          />
        </Field>
        <Field
          label="Local de retirada"
          className={pedido.pagamento === "CREDITO" ? "" : "col-span-2"}
        >
          <Select
            value={form.local}
            onChange={(e) => setForm({ ...form, local: e.target.value })}
          >
            {LOJAS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </Select>
        </Field>
        {pedido.pagamento === "CREDITO" && (
          <Field label="Parcelas">
            <Select
              value={form.parcelas}
              onChange={(e) =>
                setForm({ ...form, parcelas: Number(e.target.value) })
              }
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}x
                </option>
              ))}
            </Select>
          </Field>
        )}
        {erro && (
          <div className="col-span-2">
            <Notice tone="danger">{erro}</Notice>
          </div>
        )}
      </form>
    </Modal>
  );
}
