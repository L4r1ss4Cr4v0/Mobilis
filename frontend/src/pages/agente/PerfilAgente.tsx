import { useEffect, useState, type FormEvent } from "react";
import {
  api,
  nomeAgente,
  salvarSessao,
  usuarioLogado,
  type Agente,
} from "../../api";
import { Icon } from "../../components/Icon";
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

/** Dados de identificação do agente; o banco mantém o código bancário (COMPE/BACEN). */
export function PerfilAgente() {
  const usuario = usuarioLogado()!;
  const [agente, setAgente] = useState<Agente | null>(null);
  const [form, setForm] = useState({ nome: "", cnpj: "", codigoBanco: "" });
  const [aviso, setAviso] = useState<["success" | "danger", string] | null>(
    null,
  );
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    api
      .agente(usuario.id)
      .then((a) => {
        setAgente(a);
        setForm({
          nome: a.nome,
          cnpj: a.cnpj,
          codigoBanco: a.codigoBanco ?? "",
        });
      })
      .catch((e: Error) => setAviso(["danger", e.message]));
  }, [usuario.id]);

  if (!agente)
    return aviso ? <Notice tone="danger">{aviso[1]}</Notice> : <Loading />;
  const banco = agente.tipo === "BANCO";

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setAviso(null);
    try {
      const a = await api.salvarAgente(agente.id, {
        nome: form.nome,
        cnpj: form.cnpj,
        codigoBanco: banco ? form.codigoBanco : null,
      });
      setAgente(a);
      salvarSessao(a);
      setAviso(["success", "Dados de identificação salvos."]);
    } catch (err) {
      setAviso(["danger", (err as Error).message]);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={salvar} className="flex max-w-[760px] flex-col gap-6">
      <PageHeader
        title="Meu perfil"
        subtitle="Dados de identificação exibidos aos clientes nos pedidos e contratos."
      />
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar nome={agente.nome} id={agente.id} size={56} />
          <div className="flex-1">
            <p className="text-lg font-medium">{nomeAgente(agente)}</p>
            <p className="text-sm text-muted">
              {agente.login} · CNPJ {agente.cnpj}
            </p>
          </div>
          <Pill
            className={
              banco
                ? "border border-line text-ink"
                : "border border-line text-muted"
            }
          >
            <Icon name={banco ? "bank" : "building"} size={13} />{" "}
            {banco ? "Banco" : "Empresa"}
          </Pill>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-5">
          <Field
            label={banco ? "Nome do banco" : "Nome da empresa"}
            className="col-span-3"
          >
            <Input
              required
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </Field>
          <Field label="CNPJ" className={banco ? "col-span-2" : "col-span-3"}>
            <Input
              required
              value={form.cnpj}
              onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
            />
          </Field>
          {banco && (
            <Field label="Código bancário (COMPE/BACEN)">
              <Input
                id="codigo-banco"
                required
                inputMode="numeric"
                pattern="[0-9]{3}"
                maxLength={3}
                value={form.codigoBanco}
                onChange={(e) =>
                  setForm({ ...form, codigoBanco: e.target.value })
                }
              />
            </Field>
          )}
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
