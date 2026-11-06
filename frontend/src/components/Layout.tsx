import type { ReactNode } from "react";
import { Link, Navigate, NavLink, useNavigate } from "react-router-dom";
import { ehAgente, sair, usuarioLogado, type Agente } from "../api";

/** Logo da Mobilis (azul-marinho por padrão; branca para fundo escuro). */
export function Logo({
  branca = false,
  altura = 18,
}: {
  branca?: boolean;
  altura?: number;
}) {
  return (
    <Link to="/" className="inline-block shrink-0" aria-label="Mobilis">
      <img
        src={branca ? "/logo-mobilis-branca.png" : "/logo-mobilis.png"}
        alt="Mobilis"
        style={{ height: altura }}
      />
    </Link>
  );
}

const MENU: Record<"cliente" | "agente", [string, string][]> = {
  cliente: [
    ["/cliente/pedidos", "Meus pedidos"],
    ["/cliente/novo-pedido", "Novo pedido"],
    ["/cliente/perfil", "Meu perfil"],
  ],
  agente: [
    ["/agente/pedidos", "Pedidos"],
    ["/agente/contratos", "Contratos"],
    ["/agente/clientes", "Clientes"],
    ["/agente/automoveis", "Automóveis"],
    ["/agente/perfil", "Meu perfil"],
  ],
};

/** Header + conteúdo. Também barra quem não está logado (ou está na área errada). */
export function Layout({
  area,
  children,
}: {
  area: "cliente" | "agente";
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const usuario = usuarioLogado();
  if (!usuario) return <Navigate to="/" replace />;
  if (ehAgente(usuario) !== (area === "agente"))
    return (
      <Navigate
        to={ehAgente(usuario) ? "/agente/pedidos" : "/cliente/novo-pedido"}
        replace
      />
    );

  const banco = usuario as Agente;
  const papel =
    usuario.perfil === "CLIENTE"
      ? "Cliente"
      : usuario.perfil === "BANCO"
        ? `Banco · Cód. ${banco.codigoBanco ?? "—"}`
        : "Empresa";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-10 px-8">
          <Logo />
          <nav className="flex h-full items-stretch gap-7" aria-label="Menu">
            {MENU[area].map(([to, rotulo]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `-mb-px flex items-center border-b-2 text-sm transition ${
                    isActive
                      ? "border-ink text-ink"
                      : "border-transparent text-muted hover:text-ink"
                  }`
                }
              >
                {rotulo}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <div className="text-right leading-tight">
              <p className="max-w-[220px] truncate">{usuario.nome}</p>
              <p className="text-xs text-muted">{papel}</p>
            </div>
            <span className="h-6 w-px bg-line" />
            <button
              type="button"
              className="text-muted transition hover:text-ink px-5 py-2 border border-1 border-gray-300 hover:border-ink rounded-b-sm"
              onClick={() => {
                sair();
                navigate("/", { replace: true });
              }}
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-[1280px] flex-col gap-7 px-8 pt-10 pb-16">
        {children}
      </main>
    </div>
  );
}
