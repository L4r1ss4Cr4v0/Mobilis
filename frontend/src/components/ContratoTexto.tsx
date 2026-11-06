/** Texto do contrato em formato de documento (títulos das cláusulas em destaque). */
export function ContratoTexto({
  texto,
  className = "",
}: {
  texto: string;
  className?: string;
}) {
  const linhas = texto.split("\n");
  return (
    <div
      className={`rounded-lg border border-line bg-white px-7 py-6 text-[13.5px] leading-relaxed ${className}`}
    >
      {linhas.map((l, i) => {
        const t = l.trim();
        if (!t) return <div key={i} className="h-2.5" />;
        if (i === 0 || /^CONTRATO /.test(t))
          return (
            <p
              key={i}
              className="mb-1 text-center text-sm font-normal tracking-wide"
            >
              {t}
            </p>
          );
        if (/^CLÁUSULA/.test(t))
          return (
            <p
              key={i}
              className="mt-1 text-[12px] font-medium tracking-wider text-primary uppercase"
            >
              {t}
            </p>
          );
        if (/^(CONTRATADO|CONTRATANTE):/.test(t)) {
          const [rotulo, ...resto] = t.split(":");
          return (
            <p key={i}>
              <b>{rotulo}:</b>
              {resto.join(":")}
            </p>
          );
        }
        return (
          <p
            key={i}
            className={
              t.includes("{{") ? "rounded bg-warn-bg px-1 text-warn" : ""
            }
          >
            {t}
          </p>
        );
      })}
    </div>
  );
}
