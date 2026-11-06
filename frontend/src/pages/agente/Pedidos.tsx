import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  api,
  brlCurto,
  comprometimento,
  haQuanto,
  nomeAgente,
  nomeCarro,
  periodo,
  redatorDoContrato,
  situacao,
  usuarioLogado,
  type Agente,
  type Pedido,
} from "../../api";
import { Icon } from "../../components/Icon";
import {
  Avatar,
  Button,
  Card,
  CarImage,
  Loading,
  Notice,
  PageHeader,
} from "../../components/ui";

export const LIMITE_RENDA = 30;

/** Uma coluna do quadro: título, cor da etapa e os pedidos nela. */
interface Etapa {
  titulo: string;
  cor: string;
  fundo: string;
  lista: Pedido[];
  dica?: string;
}

/** Quadro com os pedidos do agente: os que ele analisa e os feitos para os carros dele. */
export function PedidosAgente() {
  const navigate = useNavigate();
  const usuario = usuarioLogado<Agente>()!;
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    api
      .pedidosDoAgente(usuario.id)
      .then(setPedidos)
      .catch((e: Error) => setErro(e.message));
  }, [usuario.id]);

  const termo = busca.trim().toLowerCase();
  const filtrados = (pedidos ?? []).filter(
    (p) =>
      !termo ||
      `${p.id} ${p.cliente.nome} ${nomeCarro(p.automovel)} ${p.automovel.placa}`
        .toLowerCase()
        .includes(termo),
  );
  const colunas: Etapa[] = [
    {
      titulo: "Em análise",
      cor: "#b7791f",
      fundo: "#fbf6ea",
      lista: filtrados.filter((p) => p.status === "EM_ANALISE"),
    },
    {
      titulo: "Aprovados",
      cor: "#2f855a",
      fundo: "#eef7f2",
      lista: filtrados.filter((p) => situacao(p) === "APROVADO"),
      dica: "Crédito aprovado. Falta o contrato do proprietário do carro.",
    },
    {
      titulo: "Aguardando aceite",
      cor: "#5a54c9",
      fundo: "#f1f0fb",
      lista: filtrados.filter((p) => situacao(p) === "AGUARDANDO_ACEITE"),
      dica: "Depois do aceite do cliente, o contrato aparece em Contratos.",
    },
    {
      titulo: "Rejeitados",
      cor: "#c0392b",
      fundo: "#fbefed",
      lista: filtrados.filter((p) => p.status === "REJEITADO"),
    },
  ];

  return (
    <>
      <PageHeader
        title="Pedidos para avaliação"
        subtitle={`Pedidos analisados por ${nomeAgente(usuario)} e os feitos para os seus carros.`}
        actions={
          <div className="flex h-[42px] w-[300px] items-center gap-2.5 rounded-lg border border-line bg-white px-3.5 text-muted">
            <Icon name="search" size={17} />
            <input
              className="w-full bg-transparent text-sm text-ink outline-none"
              placeholder="Cliente, carro ou nº do pedido…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        }
      />
      {erro && <Notice tone="danger">{erro}</Notice>}
      {!pedidos && !erro && <Loading />}
      {pedidos && (
        <div className="-mx-8 overflow-x-auto px-8 pb-2">
          <div className="grid min-w-[1100px] grid-cols-4 items-start gap-4">
            {colunas.map((c) => (
              <section
                key={c.titulo}
                className="flex min-w-0 flex-col gap-3 rounded-lg border-t-[3px] p-3"
                style={{ borderTopColor: c.cor, background: c.fundo }}
              >
                <header className="flex items-center justify-between px-1 pt-1">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: c.cor }}
                    />
                    {c.titulo}
                  </span>
                  <span
                    className="grid h-6 min-w-6 place-items-center rounded-full px-2 text-xs font-medium text-white"
                    style={{ background: c.cor }}
                  >
                    {c.lista.length}
                  </span>
                </header>
                {c.lista.map((p) => (
                  <CardPedido
                    key={p.id}
                    pedido={p}
                    analista={p.agente.id === usuario.id}
                    redator={redatorDoContrato(p).id === usuario.id}
                    onAbrir={() => navigate(`/agente/pedidos/${p.id}`)}
                    onContrato={() =>
                      navigate(`/agente/pedidos/${p.id}/contrato`)
                    }
                  />
                ))}
                {c.lista.length === 0 && (
                  <p className="rounded-md border border-dashed border-black/10 py-8 text-center text-sm text-muted">
                    Nenhum pedido aqui.
                  </p>
                )}
                {c.dica && c.lista.length > 0 && (
                  <p className="px-1 text-xs leading-relaxed text-muted">
                    {c.dica}
                  </p>
                )}
              </section>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function CardPedido({
  pedido: p,
  analista,
  redator,
  onAbrir,
  onContrato,
}: {
  pedido: Pedido;
  analista: boolean; // faz a análise financeira/de crédito
  redator: boolean; // dono do carro: redige o contrato
  onAbrir: () => void;
  onContrato: () => void;
}) {
  const pct = comprometimento(p);
  const cor =
    pct == null
      ? "var(--color-muted)"
      : pct <= LIMITE_RENDA
        ? "var(--color-ok)"
        : "var(--color-bad)";
  const credito = p.pagamento === "CREDITO";
  const s = situacao(p);
  return (
    <Card className="p-3.5">
      <div className="flex items-center gap-2.5">
        <Avatar nome={p.cliente.nome} id={p.cliente.id} size={34} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{p.cliente.nome}</p>
          <p className="text-xs text-muted">
            #{p.id} · {haQuanto(p.criadoEm)}
          </p>
        </div>
      </div>
      <div className="relative mt-3">
        <CarImage carro={p.automovel} className="h-[92px]" />
        <span
          className={`absolute top-2.5 left-2.5 inline-flex h-6 items-center gap-1 rounded-md px-2 text-xs font-medium ${credito ? "bg-stage text-primary" : "bg-warn-bg text-warn"}`}
        >
          <Icon name={credito ? "bank" : "building"} size={12} />{" "}
          {credito ? `Crédito ${p.parcelas}x` : "Direto"}
        </span>
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {nomeCarro(p.automovel)}
          </p>
          <p className="text-xs text-muted">
            {periodo(p.inicio, p.fim)} · {p.dias} dias
          </p>
        </div>
        <b className="whitespace-nowrap">{brlCurto(p.valorTotal)}</b>
      </div>
      <div className="mt-3 flex flex-wrap justify-between gap-x-3 gap-y-0.5 border-t border-line pt-2.5 text-xs">
        <span className="text-muted">
          Renda {brlCurto(p.cliente.rendaTotal)}
        </span>
        {pct == null ? (
          <span className="text-muted">pagamento direto</span>
        ) : (
          <span className="font-medium" style={{ color: cor }}>
            parcela = {pct.toFixed(1).replace(".", ",")}% da renda
          </span>
        )}
      </div>
      <div className="mt-3">
        {p.status === "EM_ANALISE" ? (
          analista ? (
            <Button block className="!h-10" onClick={onAbrir}>
              {credito ? "Analisar crédito" : "Analisar pedido"}{" "}
              <Icon name="arrowRight" size={15} />
            </Button>
          ) : (
            <>
              <p className="mb-2 flex items-center gap-1.5 text-xs text-muted">
                <Icon name="bank" size={13} /> Análise de crédito:{" "}
                {nomeAgente(p.agente)}
              </p>
              <Button
                block
                variant="outline"
                className="!h-10"
                onClick={onAbrir}
              >
                Ver pedido
              </Button>
            </>
          )
        ) : s === "APROVADO" || s === "AGUARDANDO_ACEITE" ? (
          redator ? (
            s === "APROVADO" ? (
              <Button
                block
                variant="dark"
                className="!h-10"
                onClick={onContrato}
              >
                Redigir contrato <Icon name="arrowRight" size={15} />
              </Button>
            ) : (
              <Button
                block
                variant="outline"
                className="!h-10"
                onClick={onContrato}
              >
                Revisar contrato enviado
              </Button>
            )
          ) : (
            <>
              <p className="mb-2 flex items-center gap-1.5 text-xs text-muted">
                <Icon name="building" size={13} />{" "}
                {s === "APROVADO"
                  ? "Contrato a cargo de"
                  : "Contrato enviado por"}{" "}
                {nomeAgente(redatorDoContrato(p))}
              </p>
              <Button
                block
                variant="outline"
                className="!h-10"
                onClick={onAbrir}
              >
                Ver pedido
              </Button>
            </>
          )
        ) : (
          <Button block variant="outline" className="!h-10" onClick={onAbrir}>
            Ver parecer
          </Button>
        )}
      </div>
    </Card>
  );
}
