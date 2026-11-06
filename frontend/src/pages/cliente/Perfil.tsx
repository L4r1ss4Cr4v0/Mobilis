import { useEffect, useState, type FormEvent } from "react";
import { api, brl, salvarSessao, usuarioLogado, type Cliente } from "../../api";
import {
  DadosCliente,
  dadosDe,
  type Dados,
} from "../../components/DadosCliente";
import {
  Avatar,
  Button,
  Card,
  Field,
  Input,
  Loading,
  Notice,
  PageHeader,
  Pill,
} from "../../components/ui";

export function Perfil() {
  const usuario = usuarioLogado()!;
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [nome, setNome] = useState("");
  const [dados, setDados] = useState<Dados | null>(null);
  const [aviso, setAviso] = useState<["success" | "danger", string] | null>(
    null,
  );
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    api
      .cliente(usuario.id)
      .then((c) => {
        setCliente(c);
        setNome(c.nome);
        setDados(dadosDe(c));
      })
      .catch((e: Error) => setAviso(["danger", e.message]));
  }, [usuario.id]);

  if (!cliente || !dados)
    return aviso ? <Notice tone="danger">{aviso[1]}</Notice> : <Loading />;

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setAviso(null);
    try {
      const c = await api.salvarCliente(cliente.id, { nome, ...dados });
      setCliente(c);
      salvarSessao(c);
      setAviso([
        "success",
        "Dados salvos. Eles serão usados nos seus próximos pedidos.",
      ]);
    } catch (err) {
      setAviso(["danger", (err as Error).message]);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={salvar} className="flex max-w-[860px] flex-col gap-6">
      <PageHeader
        title="Meu perfil"
        subtitle="Dados pessoais e financeiros usados pelos agentes na análise dos seus pedidos."
      />
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar nome={cliente.nome} id={cliente.id} size={56} />
          <div className="flex-1">
            <p className="text-lg font-medium">{cliente.nome}</p>
            <p className="text-sm text-muted">
              {cliente.login} · renda declarada {brl(cliente.rendaTotal)}
            </p>
          </div>
          {cliente.cadastroCompleto ? (
            <Pill className="bg-ok-bg text-ok">Cadastro completo</Pill>
          ) : (
            <Pill className="bg-warn-bg text-warn">Cadastro incompleto</Pill>
          )}
        </div>
        <div className="mt-6 border-t border-line pt-5">
          <Field label="Nome completo">
            <Input
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </Field>
        </div>
        <div className="mt-4">
          <DadosCliente value={dados} onChange={setDados} />
        </div>
      </Card>
      {aviso && <Notice tone={aviso[0]}>{aviso[1]}</Notice>}
      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar dados"}
        </Button>
      </div>
    </form>
  );
}
