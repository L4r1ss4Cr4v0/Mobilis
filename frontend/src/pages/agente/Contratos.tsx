import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  api,
  brl,
  data,
  haQuanto,
  nomeAgente,
  nomeCarro,
  parcelasPagas,
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
  Loading,
  Modal,
  Notice,
  PageHeader,
  Pill,
} from "../../components/ui";

/** Uma coluna do quadro de contratos. */
interface Etapa {
  titulo: string;
  cor: string;
  fundo: string;
  lista: Pedido[];
  vazio: string;
}

/** Contratos: aprovados para emitir, enviados aguardando o cliente, ativos e recusados. */
export function Contratos() {
  const navigate = useNavigate();
  const usuario = usuarioLogado()!;
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState<Pedido | null>(null);

  useEffect(() => {
    api
      .pedidosDoAgente(usuario.id)
      .then(setPedidos)
      .catch((e: Error) => setErro(e.message));
  }, [usuario.id]);

  const termo = busca.trim().toLowerCase();
  const de = (s: Situacao) =>
    (pedidos ?? []).filter(
      (p) =>
        situacao(p) === s &&
        (!termo ||
          `${p.id} ${p.cliente.nome} ${p.automovel.placa} ${nomeCarro(p.automovel)}`
            .toLowerCase()
            .includes(termo)),
    );
  const colunas: Etapa[] = [
    {
      titulo: "A emitir",
      cor: "#2f855a",
      fundo: "#eef7f2",
      lista: de("APROVADO"),
      vazio: "Nenhum pedido aprovado esperando contrato.",
    },
    {
      titulo: "Aguardando aceite",
      cor: "#5a54c9",
      fundo: "#f1f0fb",
      lista: de("AGUARDANDO_ACEITE"),
      vazio: "Nenhum contrato aguardando resposta.",
    },
    {
      titulo: "Ativos",
      cor: "#2563a6",
      fundo: "#edf3fa",
      lista: de("CONTRATO_ATIVO"),
      vazio: "Nenhum contrato aceito ainda.",
    },
    {
      titulo: "Recusados",
      cor: "#c0392b",
      fundo: "#fbefed",
      lista: de("CONTRATO_RECUSADO"),
      vazio: "Nenhum contrato recusado.",
    },
  ];

  return (
    <>
      <PageHeader
        title="Contratos"
        subtitle="Contratos emitidos a partir do template padrão e a resposta de cada cliente."
        actions={
          <div className="flex h-[42px] w-[300px] items-center gap-2.5 rounded-lg border border-line bg-white px-3.5 text-muted">
            <Icon name="search" size={17} />
            <input
              className="w-full bg-transparent text-sm text-ink outline-none"
              placeholder="Contrato, cliente ou placa…"
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
                  <CardContrato
                    key={p.id}
                    pedido={p}
                    usuarioId={usuario.id}
                    onAbrir={() => setAberto(p)}
                    onEditar={() =>
                      navigate(`/agente/pedidos/${p.id}/contrato`)
                    }
                  />
                ))}
                {c.lista.length === 0 && (
                  <p className="rounded-md border border-dashed border-black/10 px-4 py-8 text-center text-sm text-muted">
                    {c.vazio}
                  </p>
                )}
              </section>
            ))}
          </div>
        </div>
      )}

      {aberto && aberto.contrato && (
        <Modal
          title={`Contrato #${aberto.contrato.id} · pedido #${aberto.id}`}
          subtitle={`Emitido em ${data(aberto.contrato.emitidoEm)}${aberto.contrato.respondidoEm ? ` · respondido em ${data(aberto.contrato.respondidoEm)}` : ""}`}
          onClose={() => setAberto(null)}
          width={760}
          footer={
            <Button variant="outline" onClick={() => setAberto(null)}>
              Fechar
            </Button>
          }
        >
          <ContratoTexto
            texto={aberto.contrato.texto}
            className="max-h-[460px] overflow-y-auto"
          />
        </Modal>
      )}
    </>
  );
}

function CardContrato({
  pedido: p,
  usuarioId,
  onAbrir,
  onEditar,
}: {
  pedido: Pedido;
  usuarioId: number;
  onAbrir: () => void;
  onEditar: () => void;
}) {
  const c = p.contrato;
  const credito = p.pagamento === "CREDITO";
  const souRedator = redatorDoContrato(p).id === usuarioId;
  return (
    <Card className="p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium">
            {c ? `Contrato #${c.id}` : `Pedido #${p.id}`}
          </p>
          <p className="truncate text-xs text-muted">
            {!c
              ? `pedido feito ${haQuanto(p.criadoEm)}`
              : c.respondidoEm
                ? `#${p.id} · respondido ${data(c.respondidoEm)}`
                : `#${p.id} · enviado ${data(c.emitidoEm)}`}
          </p>
        </div>
        <span className="shrink-0 text-xs text-muted">{p.automovel.placa}</span>
      </div>

      <CarImage carro={p.automovel} className="mt-3 h-[92px]" />

      <p className="mt-3 truncate text-sm font-medium">
        {nomeCarro(p.automovel)}
      </p>
      <p className="mt-1.5 flex items-center gap-2 text-sm">
        <Avatar nome={p.cliente.nome} id={p.cliente.id} size={22} />
        <span className="truncate">{p.cliente.nome}</span>
      </p>

      <div className="mt-3 flex items-end justify-between gap-2 border-t border-line pt-2.5">
        <div className="min-w-0">
          <p className="truncate text-xs text-muted">
            {credito
              ? c?.taxaJuros != null
                ? `Crédito · ${c.taxaJuros.toString().replace(".", ",")}% a.m.`
                : "Crédito"
              : "À vista"}
          </p>
          <b className="text-sm whitespace-nowrap">
            {credito
              ? `${p.parcelas}x ${brl(p.valorParcela)}`
              : brl(p.valorTotal)}
          </b>
        </div>
        {c?.status === "ACEITO" && credito && (
          <div className="text-right">
            <p className="text-xs text-muted">Vencidas</p>
            <b className="text-sm">
              {parcelasPagas(p)} de {p.parcelas}
            </b>
          </div>
        )}
      </div>

      {c && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
          <Icon name="key" size={13} /> Titular: {TITULARIDADE[c.titularidade]}
        </p>
      )}
      <div className="mt-2.5">
        <Dono p={p} />
      </div>

      <div className="mt-3 border-t border-line pt-3">
        {!c ? (
          souRedator ? (
            <Button block size="sm" onClick={onEditar}>
              Redigir contrato <Icon name="arrowRight" size={14} />
            </Button>
          ) : (
            <p className="text-xs leading-relaxed text-muted">
              Crédito aprovado por você. O contrato será redigido por{" "}
              {nomeAgente(redatorDoContrato(p))}.
            </p>
          )
        ) : (
          <div className="flex items-center justify-end gap-4">
            {c.status === "AGUARDANDO_ACEITE" && souRedator && (
              <button
                type="button"
                className="text-sm text-muted hover:text-ink"
                onClick={onEditar}
              >
                Editar
              </button>
            )}
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-ink"
              onClick={onAbrir}
            >
              Ver contrato <Icon name="arrowRight" size={14} />
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}

/** Quem redige o contrato (dono do carro) e, no crédito para carro de empresa, o banco que concede o crédito. */
function Dono({ p }: { p: Pedido }) {
  const r = redatorDoContrato(p);
  const banco = r.tipo === "BANCO";
  return (
    <div className="flex flex-wrap gap-1.5">
      <Pill
        className={
          banco
            ? "border border-line text-ink"
            : "border border-line text-muted"
        }
      >
        <Icon name={banco ? "bank" : "building"} size={13} /> {nomeAgente(r)}
      </Pill>
      {p.pagamento === "CREDITO" && p.agente.id !== r.id && (
        <Pill className="border border-line text-muted">
          <Icon name="bank" size={13} /> crédito {nomeAgente(p.agente)}
        </Pill>
      )}
    </div>
  );
}
