import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  api,
  brl,
  nomeAgente,
  nomeCarro,
  TITULARIDADE,
  usuarioLogado,
  type ModeloContrato,
  type Pedido,
  type Titularidade,
} from "../../api";
import { Icon } from "../../components/Icon";
import { Button, Loading, Notice, StatusPill } from "../../components/ui";

/** Nomes amigáveis dos campos preenchidos automaticamente (painel da direita). */
const ROTULOS: Record<string, string> = {
  numero: "Nº do contrato",
  agente: "Contratado",
  cnpj: "CNPJ",
  codigoBanco: "Código bancário",
  cliente: "Cliente",
  cpf: "CPF",
  rg: "RG",
  profissao: "Profissão",
  endereco: "Endereço",
  carro: "Automóvel",
  ano: "Ano",
  placa: "Placa",
  matricula: "Matrícula",
  inicio: "Retirada",
  fim: "Devolução",
  dias: "Diárias",
  local: "Local",
  valorTotal: "Valor total",
  pagamento: "Forma de pagamento",
  credito: "Cláusula de crédito",
};

// classes dos elementos criados dentro do documento (strings literais para o Tailwind encontrar)
const CLASSE_CAMPO =
  "mx-0.5 rounded-md border border-line bg-stage px-1.5 py-0.5 text-ink whitespace-nowrap";
const CLASSE_DINAMICO =
  "mx-0.5 inline-flex items-center rounded-md border border-ink bg-white align-baseline";
const CLASSE_CONTROLE =
  "bg-transparent px-1.5 py-0.5 font-medium text-ink outline-none";

const escapar = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Editor do contrato em formato de documento: o texto inteiro é editável em tempo real,
 * os dados do pedido aparecem como campos preenchidos e a titularidade/taxa como dropdown/input no próprio texto.
 */
export function ContratoEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const usuario = usuarioLogado()!;
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [base, setBase] = useState<ModeloContrato | null>(null);
  const [titularidade, setTitularidade] = useState<Titularidade>("CLIENTE");
  const [taxa, setTaxa] = useState("1,49");
  const [palavras, setPalavras] = useState(0);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const doc = useRef<HTMLDivElement>(null);
  const cursor = useRef<Range | null>(null);
  const atual = useRef({ titularidade, taxa }); // valores mais recentes para os ouvintes do DOM
  atual.current = { titularidade, taxa };

  useEffect(() => {
    Promise.all([
      api.pedido(Number(id)),
      api.modeloContrato(Number(id), usuario.id),
    ])
      .then(([p, m]) => {
        setPedido(p);
        setBase(m);
        setTitularidade(p.contrato?.titularidade ?? m.titularidades[0]!);
        if (p.contrato?.taxaJuros != null)
          setTaxa(String(p.contrato.taxaJuros).replace(".", ","));
      })
      .catch((e: Error) => setErro(e.message));
  }, [id, usuario.id]);

  const respondido =
    !!pedido?.contrato && pedido.contrato.status !== "AGUARDANDO_ACEITE";

  const nomeTitular = (t: Titularidade) => {
    if (!pedido) return TITULARIDADE[t];
    if (t === "CLIENTE") return `${pedido.cliente.nome} (contratante)`;
    if (t === "BANCO")
      return nomeAgente(
        pedido.agente.tipo === "BANCO"
          ? pedido.agente
          : pedido.automovel.proprietario,
      );
    return pedido.automovel.proprietario.nome;
  };

  // ---------- montagem do documento (HTML a partir do template) ----------
  const valorCampo = (campo: string) =>
    (base!.campos[campo] ?? "")
      .replace("{{taxaJuros}}", atual.current.taxa)
      .replace("{{titular}}", nomeTitular(atual.current.titularidade));
  const htmlCampo = (campo: string) =>
    `<span contenteditable="false" data-campo="${campo}" title="${escapar(ROTULOS[campo] ?? campo)} (preenchido automaticamente)" class="${CLASSE_CAMPO}">${escapar(valorCampo(campo))}</span>`;
  const htmlTitular = () =>
    `<span contenteditable="false" data-dinamico="titular" class="${CLASSE_DINAMICO}"><select class="${CLASSE_CONTROLE}">${base!.titularidades
      .map(
        (t) =>
          `<option value="${t}"${t === titularidade ? " selected" : ""}>${escapar(nomeTitular(t))}</option>`,
      )
      .join("")}</select></span>`;
  const htmlTaxa = () =>
    `<span contenteditable="false" data-dinamico="taxaJuros" class="${CLASSE_DINAMICO}"><input inputmode="decimal" value="${escapar(taxa)}" class="${CLASSE_CONTROLE} w-14 text-center" /></span>`;

  const linhaParaHtml = (linha: string, i: number) => {
    // a cláusula de crédito vira texto editável, com a taxa de juros como input no meio da frase
    const expandida = linha.replace(
      /\{\{credito\}\}/g,
      () => base!.campos.credito ?? "",
    );
    const partes = expandida.split(/(\{\{\w+\}\})/g).map((p) => {
      const m = /^\{\{(\w+)\}\}$/.exec(p);
      if (!m) return escapar(p);
      if (m[1] === "titular") return htmlTitular();
      if (m[1] === "taxaJuros") return htmlTaxa();
      return m[1]! in base!.campos ? htmlCampo(m[1]!) : escapar(p);
    });
    const texto = linha.trim();
    const estilo =
      i === 0 || /^CONTRATO /.test(texto)
        ? "text-center text-[15px] font-normal tracking-wide mb-2"
        : /^CLÁUSULA/.test(texto)
          ? "mt-3 text-[12px] font-medium tracking-wider text-primary uppercase"
          : "";
    return `<div class="${estilo}">${partes.join("") || "<br>"}</div>`;
  };

  const montar = (modelo: string) => {
    if (!doc.current || !base) return;
    doc.current.innerHTML = modelo.split("\n").map(linhaParaHtml).join("");
    contarPalavras();
  };

  useEffect(() => {
    if (base) montar(base.modelo);
  }, [base]);

  // os dropdowns/inputs criados dentro do documento não são do React: ouvimos os eventos direto no DOM
  useEffect(() => {
    const el = doc.current;
    if (!el) return;
    const ouvir = (e: Event) => {
      const alvo = e.target as HTMLElement;
      const dono = alvo.closest<HTMLElement>("[data-dinamico]");
      if (dono?.dataset.dinamico === "titular")
        mudarTitular((alvo as HTMLSelectElement).value as Titularidade);
      else if (dono?.dataset.dinamico === "taxaJuros")
        mudarTaxa((alvo as HTMLInputElement).value);
      else contarPalavras();
    };
    el.addEventListener("input", ouvir);
    el.addEventListener("change", ouvir);
    return () => {
      el.removeEventListener("input", ouvir);
      el.removeEventListener("change", ouvir);
    };
  }, [base]);

  // ---------- leitura do documento de volta para o template ----------
  const serializar = (no: Node): string => {
    if (no.nodeType === Node.TEXT_NODE)
      return (no.textContent ?? "").replace(/ /g, " ");
    if (!(no instanceof HTMLElement)) return "";
    if (no.dataset.campo) return `{{${no.dataset.campo}}}`;
    if (no.dataset.dinamico) return `{{${no.dataset.dinamico}}}`;
    if (no.tagName === "BR") return "\n";
    let s = "";
    no.childNodes.forEach((filho, i) => {
      const bloco =
        filho instanceof HTMLElement &&
        (filho.tagName === "DIV" || filho.tagName === "P");
      if (bloco && i > 0 && !s.endsWith("\n")) s += "\n";
      s += serializar(filho);
    });
    return s;
  };
  const textoDoDocumento = () =>
    doc.current ? serializar(doc.current).replace(/\n$/, "") : "";

  const contarPalavras = () =>
    setPalavras(
      doc.current?.innerText.trim().split(/\s+/).filter(Boolean).length ?? 0,
    );

  // ---------- campos dinâmicos (sincroniza todas as ocorrências no texto e o painel) ----------
  const sincronizar = (t: Titularidade, tx: string) => {
    atual.current = { titularidade: t, taxa: tx };
    doc.current
      ?.querySelectorAll<HTMLSelectElement>('[data-dinamico="titular"] select')
      .forEach((s) => (s.value = t));
    doc.current
      ?.querySelectorAll<HTMLInputElement>('[data-dinamico="taxaJuros"] input')
      .forEach((i) => {
        if (i.value !== tx) i.value = tx;
      });
    doc.current
      ?.querySelectorAll<HTMLElement>("[data-campo]")
      .forEach((c) => (c.textContent = valorCampo(c.dataset.campo!)));
  };
  const mudarTitular = (t: Titularidade) => {
    setTitularidade(t);
    sincronizar(t, atual.current.taxa);
  };
  const mudarTaxa = (tx: string) => {
    setTaxa(tx);
    sincronizar(atual.current.titularidade, tx);
  };

  // ---------- inserção de campos na posição do cursor ----------
  const guardarCursor = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && doc.current?.contains(sel.anchorNode))
      cursor.current = sel.getRangeAt(0).cloneRange();
  };
  const inserir = (campo: string) => {
    if (!doc.current || respondido) return;
    const html =
      campo === "titular"
        ? htmlTitular()
        : campo === "taxaJuros"
          ? htmlTaxa()
          : htmlCampo(campo);
    const molde = document.createElement("template");
    molde.innerHTML = html + " ";
    const range =
      cursor.current ??
      (() => {
        const r = document.createRange();
        r.selectNodeContents(doc.current!);
        r.collapse(false);
        return r;
      })();
    range.deleteContents();
    const ultimo = molde.content.lastChild!;
    range.insertNode(molde.content);
    range.setStartAfter(ultimo);
    range.collapse(true);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    cursor.current = range.cloneRange();
    doc.current.focus();
    contarPalavras();
  };

  const fechar = () =>
    navigate(pedido ? `/agente/pedidos/${pedido.id}` : "/agente/pedidos");

  const emitir = async () => {
    setErro("");
    const modelo = textoDoDocumento();
    const taxaNumero = base?.credito ? Number(taxa.replace(",", ".")) : null;
    if (!modelo.trim()) return setErro("O contrato não pode ficar vazio.");
    if (base?.credito && (taxaNumero == null || Number.isNaN(taxaNumero)))
      return setErro("Informe a taxa de juros do crédito.");
    setEnviando(true);
    try {
      await api.emitirContrato(pedido!.id, usuario.id, {
        modelo,
        titularidade,
        taxaJuros: taxaNumero,
      });
      navigate("/agente/contratos");
    } catch (e) {
      setErro((e as Error).message);
      setEnviando(false);
    }
  };

  const executar = (comando: "undo" | "redo") => {
    doc.current?.focus();
    document.execCommand(comando);
    contarPalavras();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-navy/75 p-6 backdrop-blur-[3px]"
      role="dialog"
      aria-label="Editor do contrato"
    >
      <div className="flex h-full max-h-[940px] w-full max-w-[1320px] flex-col overflow-hidden rounded-lg bg-white">
        {/* cabeçalho */}
        <header className="flex items-center gap-4 border-b border-line px-6 py-4">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-stage text-primary">
            <Icon name="file" size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <h1 className="truncate text-lg font-medium">
                Contrato do pedido #{id}
              </h1>
              {pedido && <StatusPill pedido={pedido} />}
            </div>
            {pedido && (
              <p className="truncate text-[13px] text-muted">
                {pedido.cliente.nome} · {nomeCarro(pedido.automovel)} ·{" "}
                {brl(pedido.valorTotal)}
                {pedido.pagamento === "CREDITO" &&
                  ` · crédito ${nomeAgente(pedido.agente)}`}
              </p>
            )}
          </div>
          {!respondido && base && (
            <Button variant="outline" onClick={() => montar(base.modelo)}>
              <Icon name="list" size={16} /> Restaurar modelo
            </Button>
          )}
          {!respondido && (
            <Button disabled={enviando || !base} onClick={emitir}>
              <Icon name="check" size={17} />{" "}
              {pedido?.contrato
                ? "Reenviar ao cliente"
                : "Disponibilizar ao cliente"}
            </Button>
          )}
          <button
            type="button"
            aria-label="Fechar"
            onClick={fechar}
            className="grid h-10 w-10 place-items-center rounded-lg border border-line hover:bg-stage"
          >
            <Icon name="x" size={18} />
          </button>
        </header>

        {erro && (
          <div className="px-6 pt-3">
            <Notice tone="danger">{erro}</Notice>
          </div>
        )}
        {respondido && (
          <div className="px-6 pt-3">
            <Notice tone="warning">
              O cliente já respondeu a este contrato; ele não pode mais ser
              alterado.
            </Notice>
          </div>
        )}

        <div className="flex min-h-0 flex-1">
          {/* documento */}
          <main className="flex min-w-0 flex-1 flex-col bg-[#eef1f6]">
            <div className="flex items-center gap-1 border-b border-line bg-white/70 px-4 py-2 text-[13px] text-muted">
              <button
                type="button"
                title="Desfazer"
                disabled={respondido}
                onClick={() => executar("undo")}
                className="rounded-lg px-2.5 py-1.5 hover:bg-stage"
              >
                ↶ Desfazer
              </button>
              <button
                type="button"
                title="Refazer"
                disabled={respondido}
                onClick={() => executar("redo")}
                className="rounded-lg px-2.5 py-1.5 hover:bg-stage"
              >
                ↷ Refazer
              </button>
              <span className="mx-2 h-5 w-px bg-line" />
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded border border-line bg-stage" />{" "}
                preenchido automaticamente
              </span>
              <span className="ml-3 flex items-center gap-1.5">
                <span className="h-3 w-3 rounded border border-ink bg-white" />{" "}
                escolha do agente
              </span>
              <span className="ml-auto">{palavras} palavras</span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
              {!base && !erro && <Loading texto="Abrindo o contrato…" />}
              <div
                className={`mx-auto w-full max-w-[760px] rounded-sm bg-white px-16 py-14 shadow-[0_1px_3px_rgba(15,23,42,.12),0_20px_40px_-24px_rgba(15,23,42,.35)] ${base ? "" : "hidden"}`}
              >
                <div
                  ref={doc}
                  id="documento"
                  contentEditable={!respondido}
                  suppressContentEditableWarning
                  spellCheck
                  onKeyUp={guardarCursor}
                  onMouseUp={guardarCursor}
                  onBlur={guardarCursor}
                  onPaste={(e) => {
                    e.preventDefault();
                    document.execCommand(
                      "insertText",
                      false,
                      e.clipboardData.getData("text/plain"),
                    );
                  }}
                  className="min-h-[600px] text-[14px] leading-7 text-ink outline-none [&_select]:cursor-pointer"
                />
              </div>
            </div>
          </main>

          {/* campos personalizados */}
          <aside className="flex w-[320px] shrink-0 flex-col border-l border-line bg-white">
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <h2 className="font-medium">Campos personalizados</h2>
              <p className="mt-1 text-xs text-muted">
                Clique num campo para inseri-lo onde está o cursor do documento.
              </p>

              <p className="mt-5 text-[11px] font-medium tracking-wider text-muted uppercase">
                Escolhas do agente
              </p>
              <div className="mt-2 rounded-lg border border-line bg-white p-3">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="painel-titular"
                    className="text-[13px] font-medium"
                  >
                    Titularidade do veículo
                  </label>
                  <button
                    type="button"
                    disabled={respondido}
                    onClick={() => inserir("titular")}
                    className="text-xs font-medium text-primary"
                  >
                    + inserir
                  </button>
                </div>
                <select
                  id="painel-titular"
                  value={titularidade}
                  disabled={respondido || !base}
                  onChange={(e) => mudarTitular(e.target.value as Titularidade)}
                  className="mt-2 h-10 w-full rounded-lg border border-line bg-white px-2.5 text-sm"
                >
                  {base?.titularidades.map((t) => (
                    <option key={t} value={t}>
                      {nomeTitular(t)}
                    </option>
                  ))}
                </select>
                {base?.credito && (
                  <>
                    <div className="mt-3 flex items-center justify-between">
                      <label
                        htmlFor="painel-taxa"
                        className="text-[13px] font-medium"
                      >
                        Taxa de juros (% ao mês)
                      </label>
                      <button
                        type="button"
                        disabled={respondido}
                        onClick={() => inserir("taxaJuros")}
                        className="text-xs font-medium text-primary"
                      >
                        + inserir
                      </button>
                    </div>
                    <input
                      id="painel-taxa"
                      inputMode="decimal"
                      value={taxa}
                      disabled={respondido}
                      onChange={(e) => mudarTaxa(e.target.value)}
                      className="mt-2 h-10 w-full rounded-lg border border-line bg-white px-2.5 text-sm"
                    />
                  </>
                )}
              </div>

              <p className="mt-5 text-[11px] font-medium tracking-wider text-muted uppercase">
                Dados do pedido (auto-fill)
              </p>
              <div className="mt-2 flex flex-col gap-1.5">
                {base &&
                  Object.entries(base.campos)
                    .filter(([k]) => k !== "titular" && k !== "taxaJuros")
                    .map(([campo, valor]) => (
                      <button
                        key={campo}
                        type="button"
                        disabled={respondido}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => inserir(campo)}
                        className="group flex items-start gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-stage disabled:opacity-60"
                      >
                        <Icon
                          name="plus"
                          size={14}
                          className="mt-0.5 text-primary opacity-50 group-hover:opacity-100"
                        />
                        <span className="min-w-0">
                          <span className="block text-[12px] font-medium">
                            {ROTULOS[campo] ?? campo}
                          </span>
                          <span className="block truncate text-[12px] text-muted">
                            {valor.replace(/\{\{\w+\}\}/g, "…") || "—"}
                          </span>
                        </span>
                      </button>
                    ))}
              </div>
            </div>
            <div className="border-t border-line p-4 text-xs leading-relaxed text-muted">
              Os campos em cinza são preenchidos com o cadastro do cliente e os
              dados do pedido; o restante do texto é livre.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
