import { useState, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, salvarSessao } from "../api";
import { AuthLayout } from "../components/AuthLayout";
import { Icon } from "../components/Icon";
import { Button, Field, Input, Notice } from "../components/ui";
import { BarraSenha } from "./Cadastro";

export function CadastroAgente() {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState<"EMPRESA" | "BANCO">("BANCO");
  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
    codigoBanco: "",
    login: "",
    senha: "",
    confirmar: "",
  });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const criar = async (e: FormEvent) => {
    e.preventDefault();
    if (form.senha !== form.confirmar)
      return setErro("As senhas não conferem.");
    setErro("");
    setEnviando(true);
    try {
      const u = await api.cadastrarAgente({
        perfil: tipo,
        nome: form.nome,
        login: form.login,
        senha: form.senha,
        cnpj: form.cnpj,
        codigoBanco: tipo === "BANCO" ? form.codigoBanco : undefined,
      });
      salvarSessao(u);
      navigate("/agente/pedidos", { replace: true });
    } catch (err) {
      setErro((err as Error).message);
      setEnviando(false);
    }
  };

  return (
    <AuthLayout
      titulo="Cadastrar agente"
      subtitulo="Empresas e bancos avaliam pedidos e executam contratos."
      largura={460}
    >
      <form onSubmit={criar}>
        <div className="grid grid-cols-2 gap-2.5">
          {(
            [
              ["EMPRESA", "Empresa", "building"],
              ["BANCO", "Banco", "bank"],
            ] as const
          ).map(([v, rotulo, icone]) => (
            <button
              key={v}
              type="button"
              onClick={() => setTipo(v)}
              aria-pressed={tipo === v}
              className={`flex h-11 items-center gap-2.5 rounded-md border px-3.5 text-left text-sm transition ${
                tipo === v
                  ? "border-ink text-ink"
                  : "border-line text-muted hover:text-ink"
              }`}
            >
              <Icon name={icone} size={16} />
              <span className="flex-1">{rotulo}</span>
              <span
                className={`h-3.5 w-3.5 rounded-full border ${tipo === v ? "border-[4px] border-ink" : "border-line"}`}
              />
            </button>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-4">
          <Field label="Nome do agente" className="col-span-3">
            <Input
              placeholder={
                tipo === "BANCO" ? "Banco Horizonte" : "Locadora Prime"
              }
              required
              value={form.nome}
              onChange={set("nome")}
            />
          </Field>
          <Field
            label="CNPJ"
            className={tipo === "BANCO" ? "col-span-2" : "col-span-3"}
          >
            <Input
              placeholder="00.000.000/0001-00"
              required
              value={form.cnpj}
              onChange={set("cnpj")}
            />
          </Field>
          {tipo === "BANCO" && (
            <Field label="Cód. bancário">
              <Input
                placeholder="000"
                title="Código COMPE/BACEN com 3 dígitos"
                required
                inputMode="numeric"
                pattern="[0-9]{3}"
                maxLength={3}
                value={form.codigoBanco}
                onChange={set("codigoBanco")}
              />
            </Field>
          )}
          <Field label="Usuário" className="col-span-3">
            <Input
              placeholder="agente.banco"
              autoComplete="username"
              required
              value={form.login}
              onChange={set("login")}
            />
          </Field>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Field label="Senha">
            <Input
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={form.senha}
              onChange={set("senha")}
            />
          </Field>
          <Field label="Confirmar">
            <Input
              type="password"
              autoComplete="new-password"
              required
              value={form.confirmar}
              onChange={set("confirmar")}
            />
          </Field>
        </div>
        <BarraSenha senha={form.senha} />
        {erro && (
          <div className="mt-4">
            <Notice tone="danger">{erro}</Notice>
          </div>
        )}
        <Button
          type="submit"
          block
          size="lg"
          className="mt-6"
          disabled={enviando}
        >
          {enviando ? "Cadastrando…" : "Cadastrar agente"}
        </Button>
        <div className="mt-6 text-sm text-muted">
          Já tem conta?{" "}
          <Link to="/" className="text-ink underline underline-offset-4">
            Entrar
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
