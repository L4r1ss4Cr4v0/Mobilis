import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  api,
  brlCurto,
  CATEGORIAS,
  fotoUrl,
  nomeAgente,
  usuarioLogado,
  type Automovel,
} from "../../api";
import { CarIllustration } from "../../components/CarIllustration";
import { Icon } from "../../components/Icon";
import {
  Avatar,
  Button,
  Card,
  CarImage,
  Field,
  IconButton,
  Input,
  Loading,
  Modal,
  Notice,
  PageHeader,
  Pill,
  Select,
} from "../../components/ui";

type Situacao = "TODOS" | Automovel["situacao"];
const SITUACAO: Record<Automovel["situacao"], [string, string]> = {
  DISPONIVEL: ["bg-ok-bg text-ok", "Disponível"],
  RESERVADO: ["bg-warn-bg text-warn", "Reservado"],
  ALUGADO: ["bg-info-bg text-primary", "Alugado"],
};

/** Frota do agente em cards (cadastro com 1 foto por automóvel). */
export function Automoveis() {
  const usuario = usuarioLogado()!;
  const [carros, setCarros] = useState<Automovel[] | null>(null);
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState<Situacao>("TODOS");
  const [ordem, setOrdem] = useState<"diaria" | "ano">("diaria");
  const [form, setForm] = useState<Automovel | "novo" | null>(null);
  const [menu, setMenu] = useState<number | null>(null);

  const carregar = () =>
    api
      .frota(usuario.id)
      .then(setCarros)
      .catch((e: Error) => setErro(e.message));
  useEffect(() => {
    carregar();
  }, []);

  const excluir = async (c: Automovel) => {
    setMenu(null);
    if (!confirm(`Excluir ${c.marca} ${c.modelo} (${c.placa})?`)) return;
    setErro("");
    try {
      await api.excluirAutomovel(c.id, usuario.id);
      carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  };

  const conta = (s: Situacao) =>
    (carros ?? []).filter((c) => s === "TODOS" || c.situacao === s).length;
  const lista = (carros ?? [])
    .filter((c) => filtro === "TODOS" || c.situacao === filtro)
    .sort((a, b) => (ordem === "diaria" ? a.diaria - b.diaria : b.ano - a.ano));

  return (
    <>
      <PageHeader
        title="Automóveis"
        subtitle="Os carros que você disponibiliza no catálogo da Mobilis."
        actions={
          <Button onClick={() => setForm("novo")}>
            <Icon name="plus" size={17} /> Cadastrar automóvel
          </Button>
        }
      />
      <div className="flex flex-wrap items-center gap-2.5">
        {(
          [
            ["TODOS", "Todos"],
            ["DISPONIVEL", "Disponíveis"],
            ["RESERVADO", "Reservados"],
            ["ALUGADO", "Alugados"],
          ] as [Situacao, string][]
        ).map(([s, rotulo]) => (
          <button
            key={s}
            type="button"
            onClick={() => setFiltro(s)}
            className={`flex h-10 items-center gap-2 rounded-lg px-3.5 text-sm font-medium ${
              filtro === s
                ? "border border-ink text-ink"
                : "border border-line bg-white"
            }`}
          >
            {rotulo}
            <span
              className={`rounded-full px-2 text-xs ${filtro === s ? "text-ink" : "text-muted"}`}
            >
              {conta(s)}
            </span>
          </button>
        ))}
        <Select
          className="ml-auto !h-10 !w-48"
          value={ordem}
          onChange={(e) => setOrdem(e.target.value as "diaria" | "ano")}
          aria-label="Ordenar"
        >
          <option value="diaria">Ordenar: diária</option>
          <option value="ano">Ordenar: mais novos</option>
        </Select>
      </div>
      {erro && <Notice tone="danger">{erro}</Notice>}
      {!carros && !erro && <Loading />}

      {carros && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
          <button
            type="button"
            onClick={() => setForm("novo")}
            className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line hover:border-primary"
          >
            <span className="grid h-[52px] w-[52px] place-items-center rounded-full bg-primary text-white">
              <Icon name="plus" size={24} />
            </span>
            <span className="font-medium">Cadastrar automóvel</span>
            <span className="max-w-[190px] text-center text-xs leading-relaxed text-muted">
              Foto, matrícula, ano, marca, modelo, placa e diária
            </span>
          </button>
          {lista.map((c) => (
            <Card key={c.id} className="relative p-3.5">
              <div className="relative">
                <CarImage carro={c} className="h-[130px]" />
                <Pill
                  className={`absolute top-2.5 left-2.5 ${SITUACAO[c.situacao][0]}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {SITUACAO[c.situacao][1]}
                </Pill>
                <IconButton
                  icon="moreH"
                  aria-label={`Opções de ${c.placa}`}
                  className="absolute top-2.5 right-2.5"
                  onClick={() => setMenu(menu === c.id ? null : c.id)}
                />
                {menu === c.id && (
                  <div className="absolute top-12 right-2.5 z-10 w-36 overflow-hidden rounded-lg border border-line bg-white py-1 text-sm">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 hover:bg-stage"
                      onClick={() => (setMenu(null), setForm(c))}
                    >
                      <Icon name="edit" size={15} /> Editar
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-bad hover:bg-bad-bg"
                      onClick={() => excluir(c)}
                    >
                      <Icon name="trash" size={15} /> Excluir
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {c.marca} {c.modelo.split(" ")[0]}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {c.modelo.split(" ").slice(1).join(" ") || c.categoria} ·{" "}
                    {c.ano}
                  </p>
                </div>
                <div className="text-right">
                  <b>{brlCurto(c.diaria)}</b>
                  <p className="text-xs text-muted">/dia</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <Icon name="hash" size={13} />
                  {c.placa}
                </span>
                <span className="flex items-center gap-1.5">
                  <Avatar
                    nome={c.proprietario.nome}
                    id={c.proprietario.id}
                    size={20}
                  />
                  {nomeAgente(c.proprietario)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {form && (
        <FormAutomovel
          carro={form === "novo" ? null : form}
          agenteId={usuario.id}
          onClose={() => setForm(null)}
          onSalvo={() => (setForm(null), carregar())}
        />
      )}
    </>
  );
}

const MAX_MB = 5;

/** Cadastro/edição do automóvel com upload de 1 foto. */
function FormAutomovel({
  carro,
  agenteId,
  onClose,
  onSalvo,
}: {
  carro: Automovel | null;
  agenteId: number;
  onClose: () => void;
  onSalvo: () => void;
}) {
  const [dados, setDados] = useState({
    matricula: carro?.matricula ?? "",
    placa: carro?.placa ?? "",
    marca: carro?.marca ?? "",
    modelo: carro?.modelo ?? "",
    categoria: carro?.categoria ?? "SUV",
    ano: carro?.ano ? String(carro.ano) : String(new Date().getFullYear()),
    diaria: carro?.diaria ? String(carro.diaria) : "",
  });
  const [nova, setNova] = useState<{ arquivo: File; url: string } | null>(null);
  const [removerAtual, setRemoverAtual] = useState(false);
  const [arrastando, setArrastando] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      if (nova) URL.revokeObjectURL(nova.url);
    },
    [nova],
  );

  const escolher = (arquivos: FileList | null) => {
    setErro("");
    if (!arquivos || arquivos.length === 0) return;
    if (arquivos.length > 1)
      return setErro("Envie apenas 1 imagem por automóvel.");
    const a = arquivos[0]!;
    if (!a.type.startsWith("image/"))
      return setErro("Envie apenas imagens (JPG, PNG ou WEBP).");
    if (a.size > MAX_MB * 1024 * 1024)
      return setErro(`A foto pode ter até ${MAX_MB} MB.`);
    setNova({ arquivo: a, url: URL.createObjectURL(a) });
    setRemoverAtual(false);
  };

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      const corpo = {
        ...dados,
        ano: Number(dados.ano),
        diaria: Number(dados.diaria),
      };
      const salvo = carro
        ? await api.salvarAutomovel(carro.id, agenteId, corpo)
        : await api.criarAutomovel(agenteId, corpo);
      if (nova) await api.enviarFoto(salvo.id, agenteId, nova.arquivo);
      else if (removerAtual && carro?.temFoto)
        await api.removerFoto(salvo.id, agenteId);
      onSalvo();
    } catch (err) {
      setErro((err as Error).message);
      setSalvando(false);
    }
  };

  const set =
    (k: keyof typeof dados) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setDados({ ...dados, [k]: e.target.value });
  const foto =
    nova?.url ?? (carro?.temFoto && !removerAtual ? fotoUrl(carro) : null);

  return (
    <Modal
      title={carro ? "Editar automóvel" : "Cadastrar automóvel"}
      subtitle="A foto aparece no catálogo dos clientes."
      onClose={onClose}
      width={920}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-carro" disabled={salvando}>
            <Icon name="check" size={16} />{" "}
            {salvando
              ? "Salvando…"
              : carro
                ? "Salvar alterações"
                : "Cadastrar automóvel"}
          </Button>
        </>
      }
    >
      <form id="form-carro" onSubmit={salvar} className="flex gap-6">
        <div className="w-[400px] shrink-0">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Foto do veículo</span>
            <span className="text-xs text-muted">1 imagem por automóvel</span>
          </div>
          <div
            onClick={() => entrada.current?.click()}
            onDragOver={(e) => (e.preventDefault(), setArrastando(true))}
            onDragLeave={() => setArrastando(false)}
            onDrop={(e) => (
              e.preventDefault(),
              setArrastando(false),
              escolher(e.dataTransfer.files)
            )}
            className={`relative mt-2.5 grid h-[250px] cursor-pointer place-items-center overflow-hidden rounded-lg ${
              foto
                ? "bg-stage"
                : `border border-dashed ${arrastando ? "border-ink bg-stage" : "border-line bg-stage"}`
            }`}
          >
            {foto ? (
              <img
                src={foto}
                alt="Foto do automóvel"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 px-6 text-center text-primary-600">
                <div className="w-[200px] opacity-50">
                  <CarIllustration
                    carro={{ id: 2, categoria: dados.categoria }}
                  />
                </div>
                <Icon name="upload" size={22} />
                <p className="text-sm">
                  <b>Arraste a foto aqui</b> ou{" "}
                  <b className="underline">escolha no computador</b>
                </p>
                <p className="text-xs opacity-80">
                  JPG, PNG ou WEBP · até {MAX_MB} MB
                </p>
              </div>
            )}
            <input
              ref={entrada}
              id="foto"
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => (
                escolher(e.target.files),
                (e.target.value = "")
              )}
            />
          </div>
          {foto && (
            <div className="mt-2.5 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => entrada.current?.click()}
              >
                <Icon name="upload" size={14} /> Trocar foto
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => (setNova(null), setRemoverAtual(true))}
              >
                <Icon name="trash" size={14} /> Remover
              </Button>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Matrícula">
              <Input
                required
                placeholder="MAT-000000"
                value={dados.matricula}
                onChange={set("matricula")}
              />
            </Field>
            <Field label="Placa">
              <Input
                required
                placeholder="ABC1D23"
                value={dados.placa}
                onChange={set("placa")}
              />
            </Field>
            <Field label="Marca">
              <Input
                required
                placeholder="Volkswagen"
                value={dados.marca}
                onChange={set("marca")}
              />
            </Field>
            <Field label="Modelo">
              <Input
                required
                placeholder="T-Cross Highline"
                value={dados.modelo}
                onChange={set("modelo")}
              />
            </Field>
            <Field label="Categoria">
              <Select value={dados.categoria} onChange={set("categoria")}>
                {CATEGORIAS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Ano">
              <Input
                type="number"
                required
                min={1950}
                max={new Date().getFullYear() + 1}
                value={dados.ano}
                onChange={set("ano")}
              />
            </Field>
            <Field label="Diária (R$)" className="col-span-2">
              <Input
                type="number"
                required
                min={1}
                step="0.01"
                placeholder="240,00"
                value={dados.diaria}
                onChange={set("diaria")}
              />
            </Field>
          </div>
          {erro && (
            <div className="mt-3">
              <Notice tone="danger">{erro}</Notice>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
