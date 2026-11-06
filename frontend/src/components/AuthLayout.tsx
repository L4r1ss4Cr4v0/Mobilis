import type { ReactNode } from "react";
import { Logo } from "./Layout";

/** Telas de acesso: formulário à esquerda (sem header, só a logo) e a imagem à direita. */
export function AuthLayout({
  titulo,
  subtitulo,
  children,
  largura = 420,
}: {
  titulo: string;
  subtitulo: string;
  children: ReactNode;
  largura?: number;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
      <section className="flex min-h-screen flex-col px-8 py-10 sm:px-14 xl:px-20">
        <Logo altura={20} />

        <div className="my-auto w-full py-14" style={{ maxWidth: largura }}>
          <h1 className="text-[44px] leading-[1.05] font-normal tracking-tight">
            {titulo}
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-muted">
            {subtitulo}
          </p>
          <div className="mt-10">{children}</div>
        </div>
      </section>

      <aside
        className="sticky top-0 h-screen bg-[#1a1d24] bg-contain bg-left bg-no-repeat max-lg:hidden"
        style={{ backgroundImage: "url(/login-carro.svg)" }}
        aria-hidden
      />
    </div>
  );
}
