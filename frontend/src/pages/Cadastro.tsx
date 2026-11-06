import { useState, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, salvarSessao } from "../api";
import { AuthLayout } from "../components/AuthLayout";
import { DadosCliente, type Dados } from "../components/DadosCliente";
import { Button, Field, Input, Notice } from "../components/ui";

/** Força da senha de 0 a 4 (só para orientar o usuário). */
export function forcaSenha(s: string) {
  return [
    s.length >= 6,
    s.length >= 10,
    /\d/.test(s) && /[a-zA-Z]/.test(s),
    /[^a-zA-Z0-9]/.test(s) || /[A-Z]/.test(s),
  ].filter(Boolean).length;
}

export function BarraSenha({ senha }: { senha: string }) {
  if (!senha) return null;
  const f = forcaSenha(senha);
  const [cor, rotulo] =
    f <= 1
      ? ["var(--color-bad)", "Senha fraca"]
      : f <= 2
        ? ["var(--color-warn)", "Senha razoável"]
        : ["var(--color-ink)", "Senha forte"];
  return (
    <div className="mt-2.5 flex items-center gap-1.5">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="h-0.5 flex-1"
          style={{ background: i < f ? cor : "var(--color-line)" }}
        />
      ))}
      <span className="ml-1.5 text-xs whitespace-nowrap" style={{ color: cor }}>
        {rotulo}
      </span>
    </div>
  );
}

export function Cadastro() {
  const navigate = useNavigate();
  const [acesso, setAcesso] = useState({
    nome: "",
    login: "",
    senha: "",
    confirmar: "",
  });
  const [dados, setDados] = useState<Dados>({
    cpf: "",
    rg: "",
    endereco: "",
    profissao: "",
    rendimentos: [{ entidade: "", valor: 0 }],
  });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const set = (k: keyof typeof acesso) => (e: ChangeEvent<HTMLInputElement>) =>
    setAcesso({ ...acesso, [k]: e.target.value });

  const criar = async (e: FormEvent) => {
    e.preventDefault();
    if (acesso.senha !== acesso.confirmar)
      return setErro("As senhas não conferem.");
    setErro("");
    setEnviando(true);
    try {
      const u = await api.cadastrarCliente({
        nome: acesso.nome,
        login: acesso.login,
        senha: acesso.senha,
        ...dados,
      });
      salvarSessao(u);
      navigate("/cliente/novo-pedido", { replace: true });
    } catch (err) {
      setErro((err as Error).message);
      setEnviando(false);
    }
  };

  return (
    <AuthLayout
      largura={560}
      titulo="Criar cadastro"
      subtitulo="Seus dados pessoais e financeiros são usados pelos agentes na análise dos pedidos."
    >
      <form onSubmit={criar}>
        <p className="text-[11px] tracking-wider text-muted uppercase">
          Acesso
        </p>
        <div className="mt-2.5 grid grid-cols-2 gap-4">
          <Field label="Nome completo" className="col-span-2">
            <Input
              id="cad-nome"
              placeholder="Mariana Souza Lima"
              required
              value={acesso.nome}
              onChange={set("nome")}
            />
          </Field>
          <Field label="Usuário" className="col-span-2">
            <Input
              id="cad-usuario"
              placeholder="mariana.lima"
              autoComplete="username"
              required
              value={acesso.login}
              onChange={set("login")}
            />
          </Field>
          <Field label="Senha">
            <Input
              id="cad-senha"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={acesso.senha}
              onChange={set("senha")}
            />
          </Field>
          <Field label="Confirmar">
            <Input
              id="cad-confirmar"
              type="password"
              autoComplete="new-password"
              required
              value={acesso.confirmar}
              onChange={set("confirmar")}
            />
          </Field>
        </div>
        <BarraSenha senha={acesso.senha} />

        <p className="mt-8 mb-2.5 border-t border-line pt-6 text-[11px] tracking-wider text-muted uppercase">
          Dados pessoais e financeiros
        </p>
        <DadosCliente value={dados} onChange={setDados} />

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
          {enviando ? "Criando conta…" : "Criar conta"}
        </Button>
        <div className="mt-6 flex flex-col gap-1.5 text-sm text-muted">
          <span>
            Já tem conta?{" "}
            <Link to="/" className="text-ink underline underline-offset-4">
              Entrar
            </Link>
          </span>
          <span>
            É empresa ou banco?{" "}
            <Link
              to="/cadastro/agente"
              className="text-ink underline underline-offset-4"
            >
              Cadastrar agente
            </Link>
          </span>
        </div>
      </form>
    </AuthLayout>
  );
}
