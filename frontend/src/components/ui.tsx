// Peças visuais reaproveitadas pelas páginas.
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import {
  fotoUrl,
  situacao,
  type Automovel,
  type Pedido,
  type Situacao,
} from "../api";
import { CarIllustration } from "./CarIllustration";
import { Icon, type IconName } from "./Icon";

// ---------- botões ----------
const VARIANTES = {
  primary: "bg-primary text-white hover:bg-primary-600",
  dark: "bg-navy text-white hover:bg-primary-600",
  outline: "border border-line bg-white hover:border-ink",
  success: "bg-primary text-white hover:bg-primary-600",
  danger: "border border-line bg-white text-bad hover:border-bad",
  ghost: "text-ink underline-offset-4 hover:underline",
};

export function Button({
  variant = "primary",
  size = "md",
  block,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTES;
  size?: "sm" | "md" | "lg";
  block?: boolean;
}) {
  const tamanho =
    size === "sm"
      ? "h-9 px-3.5 text-[13px]"
      : size === "lg"
        ? "h-12 px-6 text-[15px]"
        : "h-11 px-5 text-[15px]";
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-50 ${tamanho} ${VARIANTES[variant]} ${block ? "w-full" : ""} ${className}`}
    />
  );
}

export function IconButton({
  icon,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconName }) {
  return (
    <button
      type="button"
      {...props}
      className={`grid h-9 w-9 place-items-center rounded-md border border-line bg-white text-ink transition hover:border-ink ${className}`}
    >
      <Icon name={icon} size={16} />
    </button>
  );
}

// ---------- formulário ----------
const caixa =
  "h-11 w-full rounded-md border border-line bg-white px-3.5 text-[15px] outline-none transition placeholder:text-[#a3a9b6] focus:border-ink";

export function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <span className="text-[13px] text-muted">{label}</span>
      {children}
    </label>
  );
}

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${caixa} ${className}`} />;
}

export function Select({
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${caixa} cursor-pointer ${className}`} />
  );
}

export function TextArea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${caixa} h-auto min-h-24 py-3 leading-relaxed ${className}`}
    />
  );
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "danger" | "success" | "warning";
  children: ReactNode;
}) {
  const cor = {
    info: "border-ink text-ink",
    danger: "border-bad text-bad",
    success: "border-ok text-ok",
    warning: "border-warn text-warn",
  }[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : undefined}
      className={`border-l-2 py-1 pl-3.5 text-[13px] leading-relaxed ${cor}`}
    >
      {children}
    </div>
  );
}

/** Abas/segmentos (filtros de lista). */
export function Seg<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex gap-5 border-b border-line">
      {options.map(([v, rotulo]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`-mb-px h-9 border-b-2 text-[13px] whitespace-nowrap transition ${
            v === value
              ? "border-ink text-ink"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          {rotulo}
        </button>
      ))}
    </div>
  );
}

// ---------- exibição ----------
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-line bg-white ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div>
        <h1 className="text-[28px] leading-tight font-normal tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-[15px] text-muted">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2.5">{actions}</div>
      )}
    </div>
  );
}

export const SITUACAO: Record<Situacao, [string, string]> = {
  EM_ANALISE: ["text-warn", "Em análise"],
  APROVADO: ["text-ok", "Aprovado"],
  AGUARDANDO_ACEITE: ["text-ink", "Aguardando aceite"],
  CONTRATO_ATIVO: ["text-ink", "Contrato ativo"],
  CONTRATO_RECUSADO: ["text-muted", "Contrato recusado"],
  REJEITADO: ["text-bad", "Rejeitado"],
  CANCELADO: ["text-muted", "Cancelado"],
};

/** Situação do pedido (status + contrato). */
export function StatusPill({
  pedido,
}: {
  pedido: Pick<Pedido, "status" | "contrato">;
}) {
  const [cor, rotulo] = SITUACAO[situacao(pedido)];
  return (
    <Pill className={`border border-line ${cor}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {rotulo}
    </Pill>
  );
}

export function Pill({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium whitespace-nowrap ${className}`}
    >
      {children}
    </span>
  );
}

export function Avatar({
  nome,
  id = 0,
  size = 36,
}: {
  nome: string;
  id?: number;
  size?: number;
}) {
  const iniciais = nome
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className="inline-grid shrink-0 place-items-center rounded-full border border-line bg-white font-medium text-ink"
      data-id={id}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {iniciais}
    </span>
  );
}

/** Informações em faixa: rótulo pequeno + valor, separadas por linhas finas (sem fundo). */
export function InfoStrip({
  items,
  cols = 3,
}: {
  items: [IconName, string, ReactNode][];
  cols?: number;
}) {
  return (
    <div
      className="grid border-t border-line"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {items.map(([, rotulo, valor], n) => (
        <div
          key={rotulo}
          className={`min-w-0 py-3.5 ${n % cols ? "border-l border-line pl-4" : ""} ${n % cols === cols - 1 ? "" : "pr-4"} ${n >= cols ? "border-t border-line" : ""}`}
        >
          <div className="flex items-center gap-1.5 text-[11px] tracking-wider text-muted uppercase">
            {rotulo}
          </div>
          <div className="mt-1 text-[15px]">{valor}</div>
        </div>
      ))}
    </div>
  );
}

/** Foto do automóvel (1 por registro) ou a ilustração quando ainda não há foto. */
export function CarImage({
  carro,
  className = "",
}: {
  carro: Automovel;
  className?: string;
}) {
  return (
    <div
      className={`relative grid place-items-center overflow-hidden rounded-md bg-stage ${className}`}
    >
      {carro.temFoto ? (
        <img
          src={fotoUrl(carro)}
          alt={`${carro.marca} ${carro.modelo}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-[8%]">
          <CarIllustration carro={carro} />
        </div>
      )}
    </div>
  );
}

export function Loading({ texto = "Carregando…" }: { texto?: string }) {
  return (
    <div className="grid place-items-center py-20 text-sm text-muted">
      {texto}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="py-6 text-sm text-muted">
      {children}
    </div>
  );
}

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  width = 560,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-navy/50 p-6"
      onMouseDown={onClose}
    >
      <div
        className="w-full overflow-hidden rounded-lg bg-white"
        style={{ maxWidth: width }}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={title}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-7 py-5">
          <div>
            <h2 className="text-lg font-medium">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>
            )}
          </div>
          <IconButton icon="x" onClick={onClose} aria-label="Fechar" />
        </div>
        <div className="px-7 py-6">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2.5 border-t border-line px-7 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
