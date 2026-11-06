import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  api,
  brl,
  data,
  nomeAgente,
  nomeCarro,
  parcelasPagas,
  periodo,
  redatorDoContrato,
  situacao,
  TITULARIDADE,
  usuarioLogado,
  type Pedido,
  type Situacao,
} from "../../api";
import { ContratoTexto } from "../../components/ContratoTexto";
import { Icon } from "../../components/Icon";
import {
  Avatar,
  Button,
  Card,
  CarImage,
  Empty,
  InfoStrip,
  Loading,
  Modal,
  Notice,
  PageHeader,
  Seg,
  StatusPill,
} from "../../components/ui";

type Filtro = "todos" | "andamento" | "contratos" | "encerrados";
const FILTROS: Record<Filtro, Situacao[]> = {
  todos: [
    "EM_ANALISE",
    "APROVADO",
    "AGUARDANDO_ACEITE",
    "CONTRATO_ATIVO",
    "CONTRATO_RECUSADO",
    "REJEITADO",
    "CANCELADO",
  ],
  andamento: ["EM_ANALISE", "APROVADO", "AGUARDANDO_ACEITE"],
  contratos: ["CONTRATO_ATIVO"],
  encerrados: ["CONTRATO_RECUSADO", "REJEITADO", "CANCELADO"],
};

export function MeusPedidos() {
  const navigate = useNavigate();
  const usuario = usuarioLogado()!;
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [aberto, setAberto] = useState<Pedido | null>(null);
  const [respondendo, setRespondendo] = useState(false);

  const carregar = () =>
    api
      .pedidosDoCliente(usuario.id)
      .then(setPedidos)
      .catch((e: Error) => setErro(e.message));
  useEffect(() => {
    carregar();
  }, []);

  const cancelar = async (p: Pedido) => {
    if (!confirm(`Cancelar o pedido #${p.id}?`)) return;
    try {
      await api.cancelarPedido(p.id, usuario.id);
      setAberto(null);
      carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  };

  const responder = async (p: Pedido, aceitar: boolean) => {
    if (!aceitar && !confirm("Recusar o contrato? O pedido será encerrado."))
      return;
    setRespondendo(true);
    try {
      await api.responderContrato(p.id, usuario.id, aceitar);
      setAberto(null);
      carregar();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setRespondendo(false);
    }
  };

  const novo = (
    <Button onClick={() => navigate("/cliente/novo-pedido")}>
      <Icon name="plus" size={17} /> Novo pedido
    </Button>
  );
  const cabecalho = (
    <PageHeader
      title="Meus pedidos"
      subtitle="Acompanhe seus pedidos, responda às propostas de contrato e veja o histórico."
      actions={novo}
    />
  );
  if (!pedidos)
    return (
      <>
        {cabecalho}
        {erro ? <Notice tone="danger">{erro}</Notice> : <Loading />}
      </>
    );

  const propostas = pedidos.filter((p) => situacao(p) === "AGUARDANDO_ACEITE");
  const contrato = pedidos.find((p) => situacao(p) === "CONTRATO_ATIVO");
  const emAndamento = pedidos.find(
    (p) => p.status === "EM_ANALISE" || situacao(p) === "APROVADO",
  );
  const lista = pedidos.filter((p) => FILTROS[filtro].includes(situacao(p)));

  return (
    <>
      {cabecalho}
      {erro && <Notice tone="danger">{erro}</Notice>}

      {propostas.map((p) => (
        <Card key={p.id} className="flex items-center gap-5 !border-ink p-5">
          <CarImage
            carro={p.automovel}
            className="h-[84px] w-[150px] shrink-0 bg-white"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs tracking-wider text-muted uppercase">
              Proposta de contrato · pedido #{p.id}
            </p>
            <p className="mt-1 text-lg font-medium">{nomeCarro(p.automovel)}</p>
            <p className="text-sm text-muted">
              {p.agente.id === redatorDoContrato(p).id
                ? `${nomeAgente(p.agente)} aprovou seu pedido e enviou o contrato`
                : `${nomeAgente(p.agente)} aprovou o crédito e ${nomeAgente(redatorDoContrato(p))} enviou o contrato`}{" "}
              para {periodo(p.inicio, p.fim)} · {brl(p.valorTotal)}
            </p>
          </div>
          <Button onClick={() => setAberto(p)}>
            Ver proposta <Icon name="arrowRight" size={16} />
          </Button>
        </Card>
      ))}

      {(contrato || emAndamento) && (
        <div className="flex items-start gap-5">
          {contrato && (
            <Card className="min-w-0 flex-1 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Aluguel ativo</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAberto(contrato)}
                >
                  Ver contrato <Icon name="arrowRight" size={15} />
                </Button>
              </div>
              <div className="mt-3 flex items-center gap-6">
                <CarImage
                  carro={contrato.automovel}
                  className="h-[150px] w-[300px] shrink-0 bg-transparent"
                />
                <div className="min-w-0">
                  <p className="text-[19px] font-medium">
                    {nomeCarro(contrato.automovel)}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Contrato #{contrato.contrato!.id} ·{" "}
                    {nomeAgente(redatorDoContrato(contrato))}
                  </p>
                  <p className="mt-4 text-xs text-muted">
                    {contrato.pagamento === "CREDITO"
                      ? "Parcela mensal"
                      : "Valor total"}
                  </p>
                  <p className="text-2xl font-normal tracking-tight">
                    {brl(
                      contrato.pagamento === "CREDITO"
                        ? contrato.valorParcela
                        : contrato.valorTotal,
                    )}
                  </p>
                  {contrato.pagamento === "CREDITO" && (
                    <p className="mt-0.5 text-sm text-muted">
                      {parcelasPagas(contrato)} de {contrato.parcelas} parcelas
                      vencidas
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <InfoStrip
                  cols={4}
                  items={[
                    [
                      "calendar",
                      "Período",
                      `${data(contrato.inicio)} → ${data(contrato.fim)}`,
                    ],
                    ["pin", "Retirada", contrato.local],
                    [
                      "wallet",
                      "Pagamento",
                      contrato.pagamento === "CREDITO"
                        ? `Crédito · ${contrato.parcelas}x`
                        : "Direto",
                    ],
                    [
                      "key",
                      "Titular do veículo",
                      TITULARIDADE[contrato.contrato!.titularidade],
                    ],
                  ]}
                />
              </div>
            </Card>
          )}
          {emAndamento && (
            <Card
              className={`${contrato ? "w-[330px] shrink-0" : "flex-1"} p-6`}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium">Pedido #{emAndamento.id}</h2>
                <StatusPill pedido={emAndamento} />
              </div>
              <CarImage
                carro={emAndamento.automovel}
                className="mt-3 h-[120px] bg-transparent"
              />
              <p className="font-medium">{nomeCarro(emAndamento.automovel)}</p>
              <p className="mt-0.5 text-xs text-muted">
                {periodo(emAndamento.inicio, emAndamento.fim)} ·{" "}
                {brl(emAndamento.valorTotal)}
              </p>
              <p className="mt-4 border-t border-line pt-3.5 text-sm leading-relaxed text-muted">
                {emAndamento.status === "EM_ANALISE" ? (
                  <>
                    <b className="text-ink">{nomeAgente(emAndamento.agente)}</b>{" "}
                    está fazendo a análise financeira. Enviado em{" "}
                    {data(emAndamento.criadoEm)}.
                  </>
                ) : (
                  <>
                    Aprovado por{" "}
                    <b className="text-ink">{nomeAgente(emAndamento.agente)}</b>
                    .{" "}
                    {redatorDoContrato(emAndamento).id ===
                    emAndamento.agente.id ? (
                      "O contrato"
                    ) : (
                      <>
                        A{" "}
                        <b className="text-ink">
                          {nomeAgente(redatorDoContrato(emAndamento))}
                        </b>{" "}
                        está preparando o contrato.
                      </>
                    )}
                    {redatorDoContrato(emAndamento).id ===
                      emAndamento.agente.id && " está sendo preparado."}
                  </>
                )}
              </p>
              <div className="mt-4 flex gap-2">
                {emAndamento.status === "EM_ANALISE" && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      navigate(
                        `/cliente/alugar/${emAndamento.automovel.id}?pedido=${emAndamento.id}`,
                      )
                    }
                  >
                    <Icon name="edit" size={15} /> Modificar
                  </Button>
                )}
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => cancelar(emAndamento)}
                >
                  Cancelar
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium">Histórico</h2>
        <Seg
          value={filtro}
          onChange={setFiltro}
          options={[
            ["todos", "Todos"],
            ["andamento", "Em andamento"],
            ["contratos", "Contratos"],
            ["encerrados", "Encerrados"],
          ]}
        />
      </div>
      {pedidos.length === 0 && (
        <span className="mt-5 self-center text-center text-muted">
          Você ainda não fez pedidos.
          <br />
          <Link
            to="/cliente/novo-pedido"
            className="text-ink underline underline-offset-4"
          >
            Escolha um carro
          </Link>
        </span>
      )}
      {pedidos.length > 0 && lista.length === 0 && (
        <Empty>Nenhum pedido nesse filtro.</Empty>
      )}
      <div className="-mt-2 grid grid-cols-[repeat(auto-fill,minmax(480px,1fr))] gap-4">
        {lista.map((p) => (
          <Bilhete key={p.id} pedido={p} onAbrir={() => setAberto(p)} />
        ))}
      </div>

      {aberto && (
        <Detalhes
          pedido={aberto}
          respondendo={respondendo}
          onClose={() => setAberto(null)}
          onCancelar={() => cancelar(aberto)}
          onResponder={(aceitar) => responder(aberto, aceitar)}
        />
      )}
    </>
  );
}

/** Pedido do histórico: foto, dados, situação e valor. */
function Bilhete({
  pedido: p,
  onAbrir,
}: {
  pedido: Pedido;
  onAbrir: () => void;
}) {
  return (
    <Card className="flex overflow-hidden">
      <CarImage
        carro={p.automovel}
        className="w-[150px] shrink-0 rounded-none"
      />
      <div className="min-w-0 flex-1 px-4.5 py-4">
        <p className="text-xs text-muted">Pedido #{p.id}</p>
        <p className="mt-0.5 truncate font-medium">{nomeCarro(p.automovel)}</p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
          <Icon name="calendar" size={13} /> {periodo(p.inicio, p.fim)}
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
          <Avatar nome={p.agente.nome} id={p.agente.id} size={20} />{" "}
          {nomeAgente(p.agente)}
        </p>
      </div>
      <div className="flex w-[170px] shrink-0 border-l border-line flex-col items-end justify-between p-4">
        <StatusPill pedido={p} />
        <div className="text-right">
          <p className="text-xs text-muted">Valor</p>
          <p className="font-medium whitespace-nowrap">{brl(p.valorTotal)}</p>
        </div>
        <button
          type="button"
          onClick={onAbrir}
          className="flex items-center gap-1 text-sm font-medium text-primary"
        >
          Detalhes <Icon name="arrowRight" size={14} />
        </button>
      </div>
    </Card>
  );
}

function Detalhes({
  pedido: p,
  respondendo,
  onClose,
  onCancelar,
  onResponder,
}: {
  pedido: Pedido;
  respondendo: boolean;
  onClose: () => void;
  onCancelar: () => void;
  onResponder: (aceitar: boolean) => void;
}) {
  const s = situacao(p);
  const podeCancelar =
    p.status === "EM_ANALISE" || s === "APROVADO" || s === "AGUARDANDO_ACEITE";
  return (
    <Modal
      title={p.contrato ? `Contrato do pedido #${p.id}` : `Pedido #${p.id}`}
      subtitle={
        p.contrato
          ? `Emitido em ${data(p.contrato.emitidoEm)} por ${nomeAgente(redatorDoContrato(p))}`
          : `Enviado em ${data(p.criadoEm)}`
      }
      onClose={onClose}
      width={p.contrato ? 760 : 620}
      footer={
        s === "AGUARDANDO_ACEITE" ? (
          <>
            <Button
              variant="danger"
              disabled={respondendo}
              onClick={() => onResponder(false)}
            >
              <Icon name="x" size={16} /> Recusar contrato
            </Button>
            <Button
              variant="success"
              disabled={respondendo}
              onClick={() => onResponder(true)}
            >
              <Icon name="check" size={16} /> Aceitar contrato
            </Button>
          </>
        ) : (
          <>
            {podeCancelar && (
              <Button variant="danger" onClick={onCancelar}>
                Cancelar pedido
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </>
        )
      }
    >
      <div className="flex items-center gap-5">
        <CarImage
          carro={p.automovel}
          className="h-[100px] w-[180px] shrink-0"
        />
        <div>
          <p className="text-lg font-medium">{nomeCarro(p.automovel)}</p>
          <p className="text-xs text-muted">Placa {p.automovel.placa}</p>
          <div className="mt-2.5">
            <StatusPill pedido={p} />
          </div>
        </div>
      </div>
      <div className="mt-5">
        <InfoStrip
          cols={3}
          items={[
            ["calendar", "Período", `${data(p.inicio)} → ${data(p.fim)}`],
            ["pin", "Retirada", p.local],
            [
              p.agente.tipo === "BANCO" ? "bank" : "building",
              "Agente",
              nomeAgente(p.agente),
            ],
            [
              "wallet",
              "Pagamento",
              p.pagamento === "CREDITO"
                ? `Crédito · ${p.parcelas}x de ${brl(p.valorParcela)}`
                : "Direto",
            ],
            ["clock", "Diárias", `${p.dias}`],
            ["tag", "Total", brl(p.valorTotal)],
          ]}
        />
      </div>
      {p.parecer && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="text-[11px] font-medium tracking-wider text-muted uppercase">
            Parecer do agente
          </p>
          <p className="mt-1.5 text-sm leading-relaxed">{p.parecer}</p>
        </div>
      )}
      {p.contrato && (
        <div className="mt-5">
          {s === "AGUARDANDO_ACEITE" && (
            <div className="mb-3">
              <Notice>
                Leia o contrato. Ao aceitar, o aluguel é efetivado; ao recusar,
                a transação é encerrada.
              </Notice>
            </div>
          )}
          <ContratoTexto
            texto={p.contrato.texto}
            className="max-h-[360px] overflow-y-auto"
          />
        </div>
      )}
    </Modal>
  );
}
