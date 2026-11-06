import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  api,
  brlCurto,
  CATEGORIAS,
  isoDaqui,
  nomeAgente,
  type Automovel,
} from "../../api";
import { Icon } from "../../components/Icon";
import {
  Button,
  Card,
  CarImage,
  Empty,
  Input,
  Loading,
  Notice,
  PageHeader,
  Select,
} from "../../components/ui";

type Ordem = "menor" | "maior" | "novo";

/** Catálogo: tela de entrada do cliente com os carros que ele pode alugar. */
export function NovoPedido() {
  const navigate = useNavigate();
  const [inicio, setInicio] = useState(isoDaqui(7));
  const [fim, setFim] = useState(isoDaqui(14));
  const [soLivres, setSoLivres] = useState(true);
  const [carros, setCarros] = useState<Automovel[] | null>(null);
  const [erro, setErro] = useState("");

  const [busca, setBusca] = useState("");
  const [categorias, setCategorias] = useState<string[]>([]);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [ordem, setOrdem] = useState<Ordem>("menor");

  const periodoValido = fim > inicio;

  useEffect(() => {
    setCarros(null);
    setErro("");
    api
      .catalogo(
        soLivres && periodoValido ? inicio : undefined,
        soLivres && periodoValido ? fim : undefined,
      )
      .then(setCarros)
      .catch((e: Error) => setErro(e.message));
  }, [inicio, fim, soLivres, periodoValido]);

  const todasMarcas = [...new Set((carros ?? []).map((c) => c.marca))].sort();
  const alternar = (lista: string[], v: string) =>
    lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v];

  const termo = busca.trim().toLowerCase();
  const visiveis = (carros ?? [])
    .filter(
      (c) =>
        !termo ||
        `${c.marca} ${c.modelo} ${c.placa}`.toLowerCase().includes(termo),
    )
    .filter((c) => !categorias.length || categorias.includes(c.categoria ?? ""))
    .filter((c) => !marcas.length || marcas.includes(c.marca))
    .filter(
      (c) =>
        (!min || c.diaria >= Number(min)) && (!max || c.diaria <= Number(max)),
    )
    .sort((a, b) =>
      ordem === "novo"
        ? b.ano - a.ano
        : ordem === "menor"
          ? a.diaria - b.diaria
          : b.diaria - a.diaria,
    );

  const chips = [
    ...categorias.map(
      (c) => [c, () => setCategorias(alternar(categorias, c))] as const,
    ),
    ...marcas.map((m) => [m, () => setMarcas(alternar(marcas, m))] as const),
    ...(min || max
      ? [
          [
            `R$ ${min || 0} – ${max || "…"}`,
            () => (setMin(""), setMax("")),
          ] as const,
        ]
      : []),
  ];
  const limpar = () => {
    setCategorias([]);
    setMarcas([]);
    setMin("");
    setMax("");
    setBusca("");
  };

  const alugar = (c: Automovel) =>
    navigate(`/cliente/alugar/${c.id}?inicio=${inicio}&fim=${fim}`);

  return (
    <>
      <PageHeader
        title="Carros disponíveis para você"
        subtitle="Escolha um carro livre no período e envie o pedido de aluguel."
      />

      <Card className="flex flex-wrap items-center gap-3 rounded-lg p-3">
        <div className="flex h-11 min-w-60 flex-1 items-center gap-2.5 rounded-lg bg-stage px-3.5 text-muted">
          <Icon name="search" />
          <input
            className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-[#a3a9b6]"
            placeholder="Buscar marca, modelo ou placa…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="flex h-11 items-center gap-2 rounded-lg border border-line px-3 text-sm">
          <Icon name="calendar" size={17} className="text-muted" />
          <input
            type="date"
            aria-label="Retirada"
            className="bg-transparent font-medium outline-none"
            value={inicio}
            min={isoDaqui(0)}
            onChange={(e) => setInicio(e.target.value)}
          />
          <span className="text-muted">→</span>
          <input
            type="date"
            aria-label="Devolução"
            className="bg-transparent font-medium outline-none"
            value={fim}
            min={inicio}
            onChange={(e) => setFim(e.target.value)}
          />
        </div>
        <Select
          className="!w-52"
          value={ordem}
          onChange={(e) => setOrdem(e.target.value as Ordem)}
          aria-label="Ordenar"
        >
          <option value="menor">Menor diária</option>
          <option value="maior">Maior diária</option>
          <option value="novo">Mais novos</option>
        </Select>
      </Card>

      <div className="flex items-start gap-6">
        <Card className="w-64 shrink-0 p-5">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Filtros</span>
            <button
              type="button"
              className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
              onClick={limpar}
            >
              Limpar
            </button>
          </div>

          <label className="mt-4 flex cursor-pointer items-center justify-between rounded-lg bg-stage px-3 py-2.5 text-sm font-medium">
            <span className="flex items-center gap-2">
              <Icon name="calendar" size={16} /> Livres no período
            </span>
            <input
              type="checkbox"
              className="peer sr-only"
              checked={soLivres}
              onChange={(e) => setSoLivres(e.target.checked)}
            />
            <span className="relative h-6 w-10 rounded-full bg-line transition peer-checked:bg-primary after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4" />
          </label>

          <p className="mt-5 text-[11px] font-medium tracking-wider text-muted uppercase">
            Categoria
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {CATEGORIAS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategorias(alternar(categorias, c))}
                className={`h-8 rounded-md px-3 text-sm font-medium ${
                  categorias.includes(c)
                    ? "border border-ink text-ink"
                    : "border border-line"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <p className="mt-5 text-[11px] font-medium tracking-wider text-muted uppercase">
            Marca
          </p>
          <div className="mt-3 flex flex-col gap-2.5">
            {todasMarcas.map((m) => (
              <label
                key={m}
                className="flex cursor-pointer items-center gap-2.5 text-sm"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-stage-2 text-[10px] font-medium">
                  {m[0]}
                </span>
                <span className="flex-1">{m}</span>
                <span className="text-xs text-muted">
                  {carros?.filter((c) => c.marca === m).length}
                </span>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={marcas.includes(m)}
                  onChange={() => setMarcas(alternar(marcas, m))}
                />
              </label>
            ))}
          </div>

          <p className="mt-5 text-[11px] font-medium tracking-wider text-muted uppercase">
            Diária (R$)
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <Input
              type="number"
              min={0}
              placeholder="Mín."
              className="!h-10"
              value={min}
              onChange={(e) => setMin(e.target.value)}
            />
            <span className="text-muted">—</span>
            <Input
              type="number"
              min={0}
              placeholder="Máx."
              className="!h-10"
              value={max}
              onChange={(e) => setMax(e.target.value)}
            />
          </div>
        </Card>

        <section className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-medium">
              {carros
                ? `${visiveis.length} ${visiveis.length === 1 ? "carro" : "carros"}`
                : "Carros"}
              {soLivres && periodoValido
                ? visiveis.length === 1
                  ? " livre no período"
                  : " livres no período"
                : " na frota"}
            </h2>
            <div className="flex flex-wrap gap-2">
              {chips.map(([rotulo, remover]) => (
                <button
                  key={rotulo}
                  type="button"
                  onClick={remover}
                  className="flex h-8 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-sm font-medium"
                >
                  {rotulo} <Icon name="x" size={13} />
                </button>
              ))}
            </div>
          </div>

          {!periodoValido && (
            <div className="mt-4">
              <Notice tone="warning">
                A devolução precisa ser depois da retirada.
              </Notice>
            </div>
          )}
          {erro && (
            <div className="mt-4">
              <Notice tone="danger">{erro}</Notice>
            </div>
          )}
          {!carros && !erro && <Loading />}
          {carros && visiveis.length === 0 && (
            <div className="mt-4">
              <Empty>Nenhum carro encontrado com esses filtros.</Empty>
            </div>
          )}

          <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
            {visiveis.map((c) => (
              <Card key={c.id} className="flex flex-col p-3.5">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-medium">
                    {c.marca} {c.modelo.split(" ")[0]}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {c.modelo.split(" ").slice(1).join(" ") || c.modelo} ·{" "}
                    {c.categoria ?? "—"} · {c.ano}
                  </p>
                </div>
                <CarImage carro={c} className="mt-3 h-[120px]" />
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="inline-flex h-7 items-center gap-1.5 truncate rounded-lg bg-stage px-2.5 text-xs font-medium text-primary">
                    <Icon
                      name={
                        c.proprietario.tipo === "BANCO" ? "bank" : "building"
                      }
                      size={13}
                    />
                    {nomeAgente(c.proprietario)}
                  </span>
                  <span className="whitespace-nowrap">
                    <b className="text-lg tracking-tight">
                      {brlCurto(c.diaria)}
                    </b>
                    <span className="text-xs text-muted">/dia</span>
                  </span>
                </div>
                <Button
                  block
                  className="mt-3 !h-10"
                  onClick={() => alugar(c)}
                  disabled={!periodoValido}
                >
                  Alugar <Icon name="arrowRight" size={16} />
                </Button>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
