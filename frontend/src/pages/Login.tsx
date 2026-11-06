import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api, ehAgente, salvarSessao, usuarioLogado } from "../api";
import { AuthLayout } from "../components/AuthLayout";
import { Button, Field, Input, Notice } from "../components/ui";

const inicio = (agente: boolean) =>
  agente ? "/agente/pedidos" : "/cliente/novo-pedido";

export function Login() {
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const logado = usuarioLogado();
  if (logado) return <Navigate to={inicio(ehAgente(logado))} replace />;

  const entrar = async (e: FormEvent) => {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const u = await api.login(login.trim(), senha);
      salvarSessao(u);
      navigate(inicio(ehAgente(u)), { replace: true });
    } catch (err) {
      setErro((err as Error).message);
      setEnviando(false);
    }
  };

  return (
    <AuthLayout
      titulo="Aluguel de carros, do pedido ao contrato."
      subtitulo="Entre para fazer pedidos, acompanhar a análise e assinar seu contrato."
    >
      <form onSubmit={entrar} className="flex flex-col gap-5">
        <Field label="Usuário">
          <Input
            id="login-usuario"
            placeholder="mariana.lima"
            autoComplete="username"
            required
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
        </Field>
        <Field label="Senha">
          <Input
            id="login-senha"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </Field>
        {erro && <Notice tone="danger">{erro}</Notice>}
        <Button
          type="submit"
          block
          size="lg"
          className="mt-2"
          disabled={enviando}
        >
          {enviando ? "Entrando…" : "Entrar"}
        </Button>
        <p className="text-sm text-muted">
          Ainda não tem conta?{" "}
          <Link
            to="/cadastro"
            className="text-ink underline underline-offset-4"
          >
            Criar cadastro
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
