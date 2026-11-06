import type { ChangeEvent } from "react";
import type { Cliente, Rendimento } from "../api";
import { Icon } from "./Icon";
import { Field, Input } from "./ui";

export type Dados = Pick<Cliente, "cpf" | "rg" | "endereco" | "profissao"> & {
  rendimentos: Rendimento[];
};

export const dadosDe = (c: Cliente): Dados => ({
  cpf: c.cpf ?? "",
  rg: c.rg ?? "",
  endereco: c.endereco ?? "",
  profissao: c.profissao ?? "",
  rendimentos: c.rendimentos.length
    ? c.rendimentos
    : [{ entidade: "", valor: 0 }],
});

/** CPF, RG, endereço, profissão e até 3 rendimentos (pedidos no primeiro aluguel). */
export function DadosCliente({
  value,
  onChange,
}: {
  value: Dados;
  onChange: (d: Dados) => void;
}) {
  const campo = (k: "cpf" | "rg" | "endereco" | "profissao") => ({
    value: value[k] ?? "",
    onChange: (e: ChangeEvent<HTMLInputElement>) =>
      onChange({ ...value, [k]: e.target.value }),
    required: true,
  });
  const rend = (i: number, r: Partial<Rendimento>) =>
    onChange({
      ...value,
      rendimentos: value.rendimentos.map((x, j) =>
        i === j ? { ...x, ...r } : x,
      ),
    });

  return (
    <div>
      <div className="grid grid-cols-12 gap-4">
        <Field label="CPF" className="col-span-4">
          <Input placeholder="000.000.000-00" {...campo("cpf")} />
        </Field>
        <Field label="RG" className="col-span-4">
          <Input placeholder="MG-00.000.000" {...campo("rg")} />
        </Field>
        <Field label="Profissão" className="col-span-4">
          <Input placeholder="Analista de sistemas" {...campo("profissao")} />
        </Field>
        <Field label="Endereço" className="col-span-12">
          <Input
            placeholder="Rua, número, bairro, cidade – UF"
            {...campo("endereco")}
          />
        </Field>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <span className="text-[13px] font-medium">
          Empregadores e rendimentos
        </span>
        <span className="rounded-full bg-info-bg px-2.5 py-0.5 text-xs font-medium text-primary">
          {value.rendimentos.length} de 3
        </span>
      </div>
      <div className="mt-3 flex flex-col gap-2.5">
        {value.rendimentos.map((r, i) => (
          <div key={i} className="flex gap-2.5">
            <Input
              placeholder="Entidade empregadora"
              value={r.entidade}
              onChange={(e) => rend(i, { entidade: e.target.value })}
              required
            />
            <Input
              className="!w-44"
              type="number"
              min={0}
              step="0.01"
              placeholder="Valor (R$)"
              value={r.valor || ""}
              onChange={(e) => rend(i, { valor: Number(e.target.value) })}
              required
            />
            <button
              type="button"
              aria-label="Remover rendimento"
              disabled={value.rendimentos.length === 1}
              onClick={() =>
                onChange({
                  ...value,
                  rendimentos: value.rendimentos.filter((_, j) => j !== i),
                })
              }
              className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-line text-muted hover:text-bad disabled:opacity-40"
            >
              <Icon name="trash" size={17} />
            </button>
          </div>
        ))}
        {value.rendimentos.length < 3 && (
          <button
            type="button"
            onClick={() =>
              onChange({
                ...value,
                rendimentos: [...value.rendimentos, { entidade: "", valor: 0 }],
              })
            }
            className="flex h-11 items-center justify-center gap-2 rounded-lg border border-dashed border-line text-sm font-medium text-primary hover:bg-stage"
          >
            <Icon name="plus" size={16} /> Adicionar rendimento
          </button>
        )}
      </div>
    </div>
  );
}
