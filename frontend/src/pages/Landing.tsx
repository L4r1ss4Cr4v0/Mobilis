import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  api,
  brl,
  CATEGORIAS,
  ehAgente,
  fotoUrl,
  isoDaqui,
  LOJAS,
  nomeCarro,
  usuarioLogado,
  type Automovel,
} from "../api";
import { corDoCarro } from "../components/CarIllustration";
import { Carro, CarroDefs, CenaVaga } from "../components/CarroTopo";

const PASSOS = [
  {
    img: "/landing/05-cliente-novo-pedido.webp",
    alt: "Tela com os carros livres nas datas escolhidas",
    titulo: "Escolha o carro",
    texto:
      "Informe as datas e veja só os carros livres no período, com o valor da diária.",
  },
  {
    img: "/landing/11-cliente-aceitar-contrato.webp",
    alt: "Resumo do pedido com valor e forma de pagamento",
    titulo: "Faça o pedido",
    texto:
      "Pague à vista ou parcele com um banco parceiro. Dá para mudar ou cancelar enquanto o pedido está em análise.",
  },
  {
    img: "/landing/07-cliente-meus-pedidos.webp",
    alt: "Lista de pedidos com a situação de cada um",
    titulo: "Receba a aprovação",
    texto:
      "A locadora ou o banco avalia o pedido e você acompanha cada etapa na sua conta.",
  },
  {
    img: "/landing/15-agente-editor-contrato.webp",
    alt: "Contrato preenchido com os dados do aluguel",
    titulo: "Aceite o contrato",
    texto: "O contrato chega preenchido. Leia, aceite e é só retirar o carro.",
  },
];

const DUVIDAS = [
  [
    "Preciso ir até uma loja?",
    "Não. Pedido, aprovação e contrato acontecem pela internet. Você só vai até a loja escolhida para retirar o carro.",
  ],
  [
    "Posso parcelar o aluguel?",
    "Sim. Escolha um banco parceiro na hora do pedido e parcele em até 12x. O banco avalia sua renda antes de aprovar.",
  ],
  [
    "Quais dados preciso para criar a conta?",
    "Nome, RG, CPF, endereço, profissão e até três fontes de renda. Esses dados ajudam na aprovação do pedido.",
  ],
  [
    "Posso mudar ou cancelar um pedido?",
    "Sim. Enquanto o pedido está em análise você pode alterar datas, local ou banco, e pode cancelar até aceitar o contrato.",
  ],
  [
    "Como fico sabendo se fui aprovado?",
    "A situação de cada pedido aparece na sua conta: em análise, aprovado, aguardando sua assinatura ou contrato ativo.",
  ],
];

const dias = (inicio: string, fim: string) =>
  Math.max(1, Math.round((Date.parse(fim) - Date.parse(inicio)) / 86_400_000));

/** Página inicial pública: apresenta a Mobilis, mostra a frota real e leva ao login e ao cadastro. */
export function Landing() {
  const usuario = usuarioLogado();
  const minhaArea = usuario
    ? ehAgente(usuario)
      ? "/agente/pedidos"
      : "/cliente/novo-pedido"
    : null;

  // busca do topo
  const [inicio, setInicio] = useState(isoDaqui(2));
  const [fim, setFim] = useState(isoDaqui(5));
  const [periodo, setPeriodo] = useState({
    inicio: isoDaqui(2),
    fim: isoDaqui(5),
  });

  // vitrine
  const [carros, setCarros] = useState<Automovel[] | null>(null);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [categoria, setCategoria] = useState("");
  const [parceiro, setParceiro] = useState("");
  const [diariaMax, setDiariaMax] = useState<number | null>(null);

  const [menuAberto, setMenuAberto] = useState(false);
  const [rolou, setRolou] = useState(false);
  const rail = useRef<HTMLOListElement>(null);
  const tituloFrota = useRef<HTMLHeadingElement>(null);
  const botaoMenu = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let ativo = true;
    setCarros(null);
    setErro("");
    api
      .catalogo(periodo.inicio, periodo.fim)
      .then((lista) => ativo && setCarros(lista))
      .catch((e: Error) => ativo && setErro(e.message));
    return () => {
      ativo = false;
    };
  }, [periodo, tentativa]);

  // header fica sólido ao rolar; Esc fecha o menu do celular
  useEffect(() => {
    const rolar = () => setRolou(window.scrollY > 40);
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuAberto(false);
        botaoMenu.current?.focus();
      }
    };
    rolar();
    window.addEventListener("scroll", rolar, { passive: true });
    window.addEventListener("keydown", tecla);
    return () => {
      window.removeEventListener("scroll", rolar);
      window.removeEventListener("keydown", tecla);
    };
  }, []);

  // entrada suave das seções abaixo da dobra (só deslocamento: o conteúdo nunca some)
  useEffect(() => {
    if (
      !("IntersectionObserver" in window) ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.remove("lp-pre");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll(".lp-reveal").forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add("lp-pre");
        io.observe(el);
      }
    });
    return () => io.disconnect();
  }, []);

  const parceiros = useMemo(
    () => [...new Set((carros ?? []).map((c) => c.proprietario.nome))].sort(),
    [carros],
  );
  const maiorDiaria = Math.max(0, ...(carros ?? []).map((c) => c.diaria));
  const teto = diariaMax ?? maiorDiaria;
  const lista = (carros ?? []).filter(
    (c) =>
      (!categoria || c.categoria === categoria) &&
      (!parceiro || c.proprietario.nome === parceiro) &&
      c.diaria <= teto,
  );
  const n = dias(periodo.inicio, periodo.fim);
  const diarias = `${n} ${n === 1 ? "diária" : "diárias"}`;

  const buscar = (e: FormEvent) => {
    e.preventDefault();
    setPeriodo({ inicio, fim });
    document.getElementById("frota")?.scrollIntoView({ behavior: "smooth" });
    tituloFrota.current?.focus({ preventScroll: true });
  };

  const limpar = () => {
    setCategoria("");
    setParceiro("");
    setDiariaMax(null);
  };

  const rolarPassos = (sentido: 1 | -1) => {
    const el = rail.current;
    const passo = el?.querySelector("li")?.getBoundingClientRect().width ?? 320;
    el?.scrollBy({ left: sentido * (passo + 16), behavior: "smooth" });
  };

  const reservar = (c: Automovel) =>
    usuario && !ehAgente(usuario) ? `/cliente/alugar/${c.id}` : "/login";

  const linkMenu =
    "py-2 text-white/80 no-underline transition hover:text-white max-[980px]:border-b max-[980px]:border-white/10 max-[980px]:py-3.5";
  const botaoBranco =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-6 font-medium text-navy no-underline transition hover:-translate-y-0.5";
  const botaoContorno =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/45 px-6 font-medium text-white no-underline transition hover:-translate-y-0.5 hover:border-white";
  const botaoEscuro =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-navy px-6 font-medium text-white no-underline transition hover:-translate-y-0.5";
  const etiqueta =
    "inline-flex min-h-[30px] items-center gap-2 rounded-full border border-line bg-white px-3 text-sm whitespace-nowrap before:size-1.5 before:rounded-full before:bg-ink";

  return (
    <div className="lp text-[17px] leading-relaxed">
      <CarroDefs />
      <a href="#conteudo" className="lp-pular">
        Pular para o conteúdo
      </a>

      {/* ---------- HEADER ---------- */}
      <header
        className={`fixed inset-x-0 top-0 z-50 text-white transition-colors ${rolou || menuAberto ? "bg-navy" : ""}`}
      >
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center gap-3 px-4 min-[981px]:gap-7">
          <Link
            to="/"
            aria-label="Mobilis, página inicial"
            className="shrink-0"
          >
            <img
              src="/logo-mobilis-branca.png"
              alt="Mobilis"
              className="h-[18px] w-auto"
            />
          </Link>
          <Link
            to={minhaArea ?? "/login"}
            className="ml-auto inline-flex min-h-11 items-center rounded-md bg-white px-4 font-semibold text-navy no-underline min-[981px]:hidden"
          >
            {minhaArea ? "Minha área" : "Entrar"}
          </Link>
          <button
            ref={botaoMenu}
            type="button"
            aria-expanded={menuAberto}
            aria-controls="menu-principal"
            onClick={() => setMenuAberto(!menuAberto)}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/30 px-3 min-[981px]:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                d="M2 5h14M2 9h14M2 13h14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            Menu
          </button>
          <nav
            id="menu-principal"
            aria-label="Principal"
            className={`ml-auto items-center gap-6 text-[15px] min-[981px]:flex max-[980px]:absolute max-[980px]:inset-x-0 max-[980px]:top-[71px] max-[980px]:flex-col max-[980px]:items-stretch max-[980px]:gap-0 max-[980px]:border-t max-[980px]:border-white/10 max-[980px]:bg-navy max-[980px]:px-4 max-[980px]:pb-5 ${menuAberto ? "flex" : "hidden"}`}
            onClick={(e) =>
              (e.target as HTMLElement).closest("a") && setMenuAberto(false)
            }
          >
            <a href="#como-funciona" className={linkMenu}>
              Como funciona
            </a>
            <a href="#frota" className={linkMenu}>
              Carros
            </a>
            <a href="#parceiros" className={linkMenu}>
              Seja parceiro
            </a>
            <a href="#duvidas" className={linkMenu}>
              Dúvidas
            </a>
            <Link
              to={minhaArea ?? "/login"}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-md bg-white px-5 font-semibold text-navy no-underline transition hover:-translate-y-0.5 max-[980px]:hidden"
            >
              {minhaArea ? "Minha área" : "Entrar"}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path
                  d="M6 3h6.5v10H6M9 8H2m0 0 2.5-2.5M2 8l2.5 2.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </nav>
        </div>
      </header>

      {/* ---------- HERO ---------- */}
      <section
        id="topo"
        aria-labelledby="t-hero"
        className="relative overflow-hidden bg-[#1b1e25] text-white "
      >
        <svg
          viewBox="0 0 1440 760"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
          focusable="false"
        >
          <rect width="1440" height="760" fill="#1b1e25" />
          <rect width="1440" height="760" filter="url(#lp-grao)" />
          <rect width="1440" height="150" fill="#242830" />
          <rect y="150" width="1440" height="6" fill="#3a3f4a" />
          <g stroke="#e9ebef" strokeOpacity="0.5" strokeWidth="5">
            {[30, 160, 290, 1090, 1220, 1350].map((x) => (
              <line key={x} x1={x} y1="250" x2={x + 60} y2="400" />
            ))}
          </g>
          <Carro x={155} y={328} cor="#94a3b8" escala={0.92} giro={-23} />
          <Carro x={1285} y={328} cor="#1d4ed8" escala={0.92} giro={-23} />
          <rect y="424" width="1440" height="6" fill="#e9ebef" opacity="0.85" />
          <g fill="#e9ebef" opacity="0.75">
            {[-20, 190, 400, 610, 820, 1030, 1240].map((x) => (
              <rect key={`a${x}`} x={x} y="530" width="120" height="6" />
            ))}
            {[-80, 130, 340, 550, 760, 970, 1180, 1390].map((x) => (
              <rect key={`b${x}`} x={x} y="636" width="120" height="6" />
            ))}
          </g>
          <g className="lp-dirige lp-d1">
            <Carro x={300} y={480} cor="#b91c1c" giro={90} />
          </g>
          <g className="lp-dirige lp-d2">
            <Carro x={900} y={586} cor="#f4f5f8" escala={1.03} giro={90} />
          </g>
          <g className="lp-dirige lp-d3">
            <Carro x={1200} y={480} cor="#0f766e" giro={90} />
          </g>
          <g className="lp-dirige lp-d4">
            <Carro x={300} y={692} cor="#475569" giro={90} />
          </g>
          <rect width="1440" height="760" fill="#0d1424" opacity="0.34" />
        </svg>

        <div className="relative z-10 mx-auto max-w-[1200px] px-4 pt-[190px] pb-[190px] text-center max-[980px]:pt-[140px] max-[980px]:pb-20">
          <h1
            id="t-hero"
            className="lp-sobe text-[clamp(72px,15vw,196px)] leading-[.9] font-semibold tracking-[-0.045em]"
          >
            Mobilis
          </h1>
          <p className="lp-sobe lp-a1 mx-auto mt-6 max-w-[34ch] text-[clamp(18px,2vw,21px)] text-white">
            Escolha o carro, peça pela internet e assine o contrato sem sair de
            casa. Parcele em até 12x.
          </p>
          <div className="lp-sobe lp-a2 mt-8 flex flex-wrap justify-center gap-3">
            <a href="#frota" className={botaoBranco}>
              Ver carros <span aria-hidden="true">→</span>
            </a>
            <Link to="/cadastro" className={botaoContorno}>
              Criar conta grátis
            </Link>
          </div>
        </div>

        <form
          role="search"
          aria-label="Buscar carro"
          onSubmit={buscar}
          className="lp-sobe lp-a3 z-20 min-[981px]:absolute min-[981px]:inset-x-0 min-[981px]:bottom-0"
        >
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 min-[621px]:grid-cols-2 min-[981px]:grid-cols-[repeat(4,minmax(0,1fr))_210px]">
            <div className="lp-campo">
              <label htmlFor="b-cat">Categoria</label>
              <select
                id="b-cat"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="">Todas</option>
                {CATEGORIAS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="lp-campo">
              <span id="b-ret">Retirada</span>
              <output aria-labelledby="b-ret" title={LOJAS.join(", ")}>
                {LOJAS.length} lojas em BH e Confins
              </output>
            </div>
            <div className="lp-campo">
              <label htmlFor="b-ini">Retirar em</label>
              <input
                id="b-ini"
                type="date"
                required
                min={isoDaqui(0)}
                value={inicio}
                onChange={(e) => {
                  setInicio(e.target.value);
                  if (fim <= e.target.value) {
                    const d = new Date(e.target.value);
                    d.setDate(d.getDate() + 1);
                    setFim(d.toISOString().slice(0, 10));
                  }
                }}
              />
            </div>
            <div className="lp-campo">
              <label htmlFor="b-fim">Devolver em</label>
              <input
                id="b-fim"
                type="date"
                required
                min={inicio}
                value={fim}
                onChange={(e) => setFim(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="flex min-h-14 items-center justify-center gap-2 bg-white text-[17px] font-semibold text-navy transition hover:bg-[#eef0f4] max-[980px]:col-span-full"
            >
              Buscar <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </section>

      <main id="conteudo" tabIndex={-1} className="outline-none">
        {/* ---------- MANIFESTO ---------- */}
        <section
          aria-labelledby="t-manifesto"
          className="lp-reveal mx-auto max-w-[1200px] px-4 py-28 text-center max-[620px]:py-18"
        >
          <div className="flex flex-wrap justify-center gap-2.5">
            <span className={etiqueta}>Nova em Belo Horizonte</span>
            <span className={etiqueta}>Locadoras e bancos parceiros</span>
          </div>
          <h2
            id="t-manifesto"
            className="mt-11 text-[clamp(40px,6.4vw,80px)] leading-[1.05] tracking-[-0.02em] text-balance"
          >
            Do pedido ao volante{" "}
            <span className="block min-[621px]:pl-[1.6em]">
              sem fila e sem papel
            </span>
          </h2>
          <div
            className="mx-auto mt-8 flex w-[min(320px,70%)] items-center"
            aria-hidden="true"
          >
            <span className="size-2.5 shrink-0 rounded-full bg-ink" />
            <span className="lp-tracejado mx-1.5 h-0.5 flex-1" />
            <svg
              viewBox="0 0 40 40"
              fill="none"
              className="size-10 shrink-0 text-ink"
            >
              <circle
                cx="20"
                cy="20"
                r="13"
                stroke="currentColor"
                strokeWidth="2.5"
              />
              <circle cx="20" cy="20" r="6" fill="currentColor" />
              <path
                d="M20 1v6M20 33v6M1 20h6M33 20h6"
                stroke="currentColor"
                strokeWidth="2.5"
              />
            </svg>
          </div>
          <ul className="mx-auto mt-16 grid max-w-[900px] grid-cols-2 gap-y-5 border-t border-line min-[981px]:grid-cols-4">
            {[
              ["100%", "online, do pedido ao contrato"],
              ["12x", "parcelas com banco parceiro"],
              ["4", "passos até a chave"],
              ["0", "papel para assinar"],
            ].map(([n, t]) => (
              <li key={t} className="px-3 pt-5">
                <b className="block text-[40px] font-medium tracking-[-0.02em] tabular-nums">
                  {n}
                </b>
                <span className="text-[15px] text-muted">{t}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- PASSOS ---------- */}
        <section
          id="como-funciona"
          aria-labelledby="t-passos"
          className="mx-auto grid max-w-[1200px] scroll-mt-20 gap-12 px-4 pb-28 min-[981px]:grid-cols-[320px_minmax(0,1fr)] max-[980px]:gap-7"
        >
          <div className="lp-reveal flex flex-col items-start gap-4.5 min-[981px]:sticky min-[981px]:top-[100px] min-[981px]:self-start">
            <span className={etiqueta}>Como funciona</span>
            <h2
              id="t-passos"
              className="text-[44px] leading-[1.05] tracking-[-0.02em]"
            >
              Seu carro em quatro passos
            </h2>
            <p className="max-w-[46ch] text-lg text-muted">
              Nada de balcão. Você escolhe, pede e acompanha tudo pelo celular
              ou computador, e recebe o contrato pronto para aceitar.
            </p>
            <Link to="/cadastro" className={botaoEscuro}>
              Começar agora <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="lp-reveal min-w-0">
            <ol
              ref={rail}
              id="lista-passos"
              aria-label="Passos para alugar"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  rolarPassos(1);
                }
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  rolarPassos(-1);
                }
              }}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-none pb-2.5"
            >
              {PASSOS.map((p, i) => (
                <li
                  key={p.titulo}
                  className={`group flex shrink-0 basis-[min(340px,84%)] snap-start flex-col gap-2.5 ${i % 2 ? "min-[621px]:pt-14" : ""}`}
                >
                  <div className="relative aspect-[4/3.3] rounded-[10px] border border-line bg-stage">
                    <img
                      src={p.img}
                      alt={p.alt}
                      loading="lazy"
                      className="size-full object-cover object-left-top transition duration-700 group-hover:scale-[1.04]"
                    />
                    <span className="absolute right-3 bottom-3 rounded-md bg-navy/90 px-2.5 py-1.5 text-sm text-white">
                      Passo {i + 1}
                    </span>
                  </div>
                  <span className="text-sm text-muted">Passo {i + 1} de 4</span>
                  <h3 className="text-[22px] leading-tight font-medium tracking-[-0.01em]">
                    {p.titulo}
                  </h3>
                  <p className="text-base text-muted">{p.texto}</p>
                </li>
              ))}
            </ol>
            <div className="mt-4.5 flex justify-center">
              <button
                type="button"
                aria-controls="lista-passos"
                onClick={() => rolarPassos(-1)}
                className="min-h-11 rounded-l-md border border-line bg-white px-4 text-[15px]"
              >
                ← Anterior
              </button>
              <button
                type="button"
                aria-controls="lista-passos"
                onClick={() => rolarPassos(1)}
                className="min-h-11 rounded-r-md border border-l-0 border-line bg-white px-4 text-[15px]"
              >
                Próximo →
              </button>
            </div>
          </div>
        </section>

        {/* ---------- FROTA (dados reais da API) ---------- */}
        <section
          id="frota"
          aria-labelledby="t-frota"
          className="mx-auto max-w-[1200px] scroll-mt-20 px-4 pb-28"
        >
          <div className="lp-reveal flex flex-wrap items-end justify-between gap-8">
            <div>
              <span className={etiqueta}>Frota Mobilis</span>
              <h2
                ref={tituloFrota}
                tabIndex={-1}
                id="t-frota"
                className="mt-3.5 text-[clamp(48px,7vw,88px)] leading-[1.05] tracking-[-0.02em] outline-none"
              >
                Escolha o carro
              </h2>
            </div>
            <p className="max-w-[32ch] text-muted">
              Carros livres de {formatar(periodo.inicio)} a{" "}
              {formatar(periodo.fim)}, com o preço total já calculado.
            </p>
          </div>

          <form
            aria-label="Filtrar carros"
            onSubmit={(e) => e.preventDefault()}
            className="mt-9 grid grid-cols-1 items-center gap-3 rounded-[10px] border border-line bg-white p-2.5 min-[621px]:grid-cols-2 min-[981px]:grid-cols-[repeat(3,minmax(0,1fr))_auto] min-[981px]:gap-0 min-[981px]:pl-0"
          >
            <div className="lp-filtro">
              <label htmlFor="f-cat">Categoria</label>
              <select
                id="f-cat"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="">Todas</option>
                {CATEGORIAS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="lp-filtro">
              <label htmlFor="f-par">Parceiro</label>
              <select
                id="f-par"
                value={parceiro}
                onChange={(e) => setParceiro(e.target.value)}
              >
                <option value="">Todos</option>
                {parceiros.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="lp-filtro min-[981px]:border-r-0">
              <label htmlFor="f-max">
                Diária até <output htmlFor="f-max">{brl(teto)}</output>
              </label>
              <input
                id="f-max"
                type="range"
                min={0}
                max={maiorDiaria || 0}
                step={10}
                value={teto}
                disabled={!maiorDiaria}
                onChange={(e) => setDiariaMax(Number(e.target.value))}
                className="accent-[var(--color-ink)]"
              />
            </div>
            <button
              type="button"
              onClick={limpar}
              className="min-h-12 rounded-md border border-line px-5 font-medium transition hover:border-ink max-[980px]:col-span-full"
            >
              Limpar filtros
            </button>
          </form>

          <p
            role="status"
            aria-live="polite"
            className="mt-4 text-[15px] text-muted"
          >
            {erro
              ? ""
              : carros === null
                ? "Buscando carros livres…"
                : `${lista.length} ${lista.length === 1 ? "carro" : "carros"} · preço para ${diarias}`}
          </p>

          {erro && (
            <div
              className="mt-3 flex flex-wrap items-center justify-between gap-4 border-y border-line py-8"
              role="alert"
            >
              <span className="text-muted">{erro}</span>
              <button
                type="button"
                onClick={() => setTentativa((t) => t + 1)}
                className={botaoEscuro}
              >
                Tentar de novo
              </button>
            </div>
          )}

          {carros === null && !erro && (
            <ul
              className="mt-3 grid gap-4 min-[621px]:grid-cols-2 min-[981px]:grid-cols-3"
              aria-hidden="true"
            >
              {[0, 1, 2].map((i) => (
                <li
                  key={i}
                  className="h-[420px] animate-pulse rounded-[14px] border border-line bg-stage"
                />
              ))}
            </ul>
          )}

          {carros && (
            <ul className="mt-3 grid gap-4 min-[621px]:grid-cols-2 min-[981px]:grid-cols-3">
              {lista.length === 0 && (
                <li className="col-span-full border-t border-line py-10 text-center text-muted">
                  Nenhum carro livre com esses filtros. Troque as datas ou use
                  “Limpar filtros”.
                </li>
              )}
              {lista.map((c) => (
                <li
                  key={c.id}
                  className="group flex min-w-0 flex-col gap-3 rounded-[14px] border border-line bg-white p-3.5 transition duration-300 hover:-translate-y-1 hover:border-muted"
                >
                  <div className="flex min-h-[76px] items-start justify-between gap-2 px-1 pt-0.5">
                    <div>
                      <h3 className="text-lg leading-snug font-medium tracking-[-0.01em]">
                        {nomeCarro(c)}
                      </h3>
                      <span className="text-sm text-muted">
                        {c.proprietario.nome}
                      </span>
                    </div>
                    <span className="inline-flex min-h-[26px] items-center gap-1.5 rounded-full border border-line px-2.5 text-[13px] whitespace-nowrap text-ok before:size-[7px] before:rounded-full before:bg-current">
                      Livre nas datas
                    </span>
                  </div>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[10px] bg-[#1b1e25]">
                    {c.temFoto ? (
                      <img
                        src={fotoUrl(c)}
                        alt={`Foto do ${nomeCarro(c)}`}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    ) : (
                      <CenaVaga id={c.id} cor={corDoCarro(c.id)} />
                    )}
                    <div className="absolute inset-x-2.5 bottom-2.5 flex flex-wrap gap-1.5">
                      {[c.categoria, c.ano, "Retirada em BH"]
                        .filter(Boolean)
                        .map((t) => (
                          <span
                            key={String(t)}
                            className="rounded-md bg-[#0a0e16]/80 px-2 py-1 text-[13px] text-white"
                          >
                            {t}
                          </span>
                        ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 px-1">
                    <b className="text-2xl font-medium tabular-nums">
                      {brl(c.diaria * n)}
                    </b>
                    <span className="text-sm text-muted">
                      {diarias} · {brl(c.diaria)}/dia
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2.5 px-1 pb-0.5">
                    <span
                      role="img"
                      aria-label={`Placa ${c.placa}`}
                      className="inline-flex w-[108px] shrink-0 flex-col overflow-hidden rounded border-[1.5px] border-[#222] bg-white text-[#111]"
                    >
                      <i
                        aria-hidden="true"
                        className="bg-[#1f4fa0] text-center text-[7px] leading-[11px] tracking-[.2em] text-white not-italic"
                      >
                        BRASIL
                      </i>
                      <b
                        aria-hidden="true"
                        className="text-center font-mono text-[15px] leading-[22px] font-medium tracking-[.08em]"
                      >
                        {c.placa}
                      </b>
                    </span>
                    <Link
                      to={reservar(c)}
                      className="inline-flex min-h-11 items-center rounded-md bg-navy px-4.5 text-[15px] font-medium text-white no-underline transition hover:-translate-y-0.5"
                    >
                      Reservar<span className="sr-only"> {nomeCarro(c)}</span>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ---------- PARCEIROS ---------- */}
        <section
          id="parceiros"
          aria-labelledby="t-parceiros"
          className="mx-auto max-w-[1200px] scroll-mt-20 px-4 pb-28"
        >
          <div className="lp-reveal mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className={etiqueta}>Seja parceiro</span>
              <h2
                id="t-parceiros"
                className="mt-3.5 text-[clamp(40px,5.4vw,64px)] leading-[1.05] tracking-[-0.02em]"
              >
                Tem carros ou oferece crédito?
              </h2>
            </div>
            <p className="max-w-[36ch] text-muted">
              Locadoras e bancos usam a Mobilis para alcançar quem quer alugar e
              fechar contratos sem papel.
            </p>
          </div>
          <div className="grid gap-4 min-[981px]:grid-cols-2">
            {[
              {
                rotulo: "Para locadoras",
                titulo: "Coloque sua frota na vitrine",
                itens: [
                  "Cadastre seus carros com foto e diária",
                  "Aprove os pedidos que fazem sentido para você",
                  "Envie o contrato pronto a partir do nosso modelo",
                ],
                botao: "Cadastrar minha empresa",
                cor: "#f4f5f8",
              },
              {
                rotulo: "Para bancos",
                titulo: "Ofereça crédito para cada aluguel",
                itens: [
                  "Receba os pedidos parcelados com a renda do cliente",
                  "Defina parcelas e taxa de juros",
                  "Financie carros de qualquer locadora parceira",
                ],
                botao: "Cadastrar meu banco",
                cor: "#1d4ed8",
              },
            ].map((p) => (
              <article
                key={p.rotulo}
                className="lp-reveal relative flex min-h-[320px] flex-col gap-4 overflow-hidden rounded-[14px] bg-navy p-9 text-white max-[620px]:p-6.5"
              >
                <svg
                  viewBox="-180 -330 360 660"
                  className="pointer-events-none absolute -right-[70px] -bottom-[90px] h-[370px] w-[200px] rotate-[-18deg]"
                  aria-hidden="true"
                  focusable="false"
                >
                  <Carro x={0} y={0} cor={p.cor} escala={3} />
                </svg>
                <span className="relative text-[13px] tracking-[.1em] text-[#b4bccd] uppercase">
                  {p.rotulo}
                </span>
                <h3 className="relative max-w-[min(14ch,64%)] text-[clamp(30px,3.4vw,42px)] leading-[1.05] tracking-[-0.02em]">
                  {p.titulo}
                </h3>
                <ul className="relative flex max-w-[min(30ch,64%)] flex-col gap-2 text-base text-[#b4bccd]">
                  {p.itens.map((i) => (
                    <li key={i}>— {i}</li>
                  ))}
                </ul>
                <Link
                  to="/cadastro/agente"
                  className={`${botaoBranco} relative mt-auto self-start`}
                >
                  {p.botao}
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- DÚVIDAS ---------- */}
        <section
          id="duvidas"
          aria-labelledby="t-duvidas"
          className="mx-auto grid max-w-[1200px] scroll-mt-20 gap-12 px-4 pb-28 min-[981px]:grid-cols-[340px_minmax(0,1fr)] max-[980px]:gap-7"
        >
          <div className="lp-reveal">
            <span className={etiqueta}>Dúvidas</span>
            <h2
              id="t-duvidas"
              className="mt-3.5 text-[44px] leading-[1.05] tracking-[-0.02em]"
            >
              Perguntas frequentes
            </h2>
          </div>
          <div className="lp-reveal min-w-0">
            {DUVIDAS.map(([p, r], i) => (
              <details
                key={p}
                open={i === 0}
                className="lp-duvida border-b border-line first:border-t"
              >
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-5 text-[19px] font-medium">
                  {p}
                </summary>
                <p className="max-w-[62ch] pb-5.5 text-muted">{r}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* ---------- CTA FINAL + RODAPÉ ---------- */}
      <footer className="bg-navy text-white">
        <div className="mx-auto max-w-[1200px] px-4 pt-26 pb-10">
          <h2 className="lp-reveal max-w-[16ch] text-[clamp(44px,6vw,80px)] leading-[1.05] tracking-[-0.02em]">
            Seu próximo carro está a quatro passos
          </h2>
          <p className="lp-reveal mt-4.5 text-lg text-[#b4bccd]">
            Crie sua conta grátis e faça o primeiro pedido hoje.
          </p>
          <div className="lp-reveal mt-9 flex flex-wrap gap-3">
            <Link to="/cadastro" className={botaoBranco}>
              Criar conta grátis <span aria-hidden="true">→</span>
            </Link>
            <Link to="/login" className={botaoContorno}>
              Já tenho conta
            </Link>
          </div>
          <div className="mt-24 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-sm text-[#b4bccd]">
            <img
              src="/logo-mobilis-branca.png"
              alt="Mobilis"
              className="h-4 w-auto"
            />
            <nav aria-label="Rodapé" className="flex flex-wrap gap-5">
              <a
                href="#como-funciona"
                className="no-underline hover:text-white hover:underline"
              >
                Como funciona
              </a>
              <a
                href="#frota"
                className="no-underline hover:text-white hover:underline"
              >
                Carros
              </a>
              <a
                href="#parceiros"
                className="no-underline hover:text-white hover:underline"
              >
                Seja parceiro
              </a>
              <a
                href="#duvidas"
                className="no-underline hover:text-white hover:underline"
              >
                Dúvidas
              </a>
            </nav>
            <span>
              © {new Date().getFullYear()} Mobilis · Belo Horizonte, MG
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function formatar(iso: string) {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}
