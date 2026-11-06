// Ilustração do carro (vista lateral), usada quando o automóvel ainda não tem foto.
import type { Automovel } from "../api";

type Tipo = "sedan" | "suv" | "hatch" | "sport";
interface Modelo {
  body: string;
  win: string;
  pillars: number[];
  wheels: number[];
  r: number;
  cy: number;
  door: number[];
  belt: number;
  sx: number;
}

// ---------- cores ----------
function mix(hex: string, alvo: string, t: number) {
  const p = (h: string) =>
    [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const a = p(hex),
    b = p(alvo);
  return (
    "#" +
    a
      .map((v, i) =>
        Math.round(v + (b[i]! - v) * t)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
const lighten = (h: string, t: number) => mix(h, "#ffffff", t);
const darken = (h: string, t: number) => mix(h, "#000000", t);

// ---------- ilustração de carro (vista lateral, frente à direita) ----------
const CARROS: Record<Tipo, Modelo> = {
  sedan: {
    body: "M24 118 C22 104 30 95 48 92 L118 85 C140 63 170 53 208 53 L254 53 C284 53 306 65 326 83 L370 89 C388 92 396 102 396 115 L396 122 C396 127 392 130 387 130 L33 130 C27 130 24 126 24 120 Z",
    win: "M134 85 C152 67 177 60 208 60 L248 60 C272 60 292 70 309 85 Z",
    pillars: [226],
    wheels: [104, 318],
    r: 27,
    cy: 122,
    door: [226],
    belt: 98,
    sx: 0.84,
  },
  suv: {
    body: "M24 120 C22 102 30 91 48 89 L104 83 C118 57 140 41 176 41 L288 41 C306 41 318 49 330 65 L341 81 L373 87 C390 91 396 101 396 113 L396 124 C396 129 392 133 387 133 L33 133 C27 133 24 129 24 123 Z",
    win: "M122 83 C134 61 151 49 178 49 L285 49 C300 49 310 56 320 70 L329 83 Z",
    pillars: [203, 266],
    wheels: [106, 318],
    r: 30,
    cy: 124,
    door: [205],
    belt: 96,
    sx: 0.74,
  },
  hatch: {
    body: "M30 120 C28 98 30 74 43 62 C53 53 70 49 92 49 L232 49 C264 49 286 63 306 83 L362 90 C383 94 392 104 392 116 L392 122 C392 127 388 130 383 130 L38 130 C33 130 30 126 30 120 Z",
    win: "M54 85 C56 71 66 57 92 57 L228 57 C252 57 270 67 288 85 Z",
    pillars: [146, 214],
    wheels: [98, 314],
    r: 28,
    cy: 122,
    door: [190],
    belt: 99,
    sx: 0.72,
  },
  sport: {
    body: "M22 116 C22 105 30 99 48 97 L122 91 C152 71 186 63 224 63 L262 63 C292 63 316 75 340 91 L378 97 C392 100 398 107 398 115 L398 120 C398 125 394 128 389 128 L31 128 C25 128 22 124 22 118 Z",
    win: "M146 91 C168 75 192 69 224 69 L258 69 C282 69 300 78 318 91 Z",
    pillars: [238],
    wheels: [102, 322],
    r: 26,
    cy: 120,
    door: [240],
    belt: 104,
    sx: 0.88,
  },
};
let carSeq = 0;
function svgCarro(tipo: Tipo, cor: string): string {
  const c = CARROS[tipo];
  const id = "c" + carSeq++;
  const claro =
    cor.toLowerCase() === "#f3f4f6" || cor.toLowerCase() === "#e2e8f0";
  const top = lighten(cor, claro ? 0 : 0.12),
    mid = cor,
    bot = darken(cor, claro ? 0.12 : 0.35);
  const rim = (cx: number) => {
    const spokes = [0, 72, 144, 216, 288]
      .map(
        (a) =>
          `<rect x="${cx - 1.6}" y="${c.cy - c.r * 0.58}" width="3.2" height="${c.r * 0.58}" rx="1.4" fill="#cbd5e1" transform="rotate(${a} ${cx} ${c.cy})"/>`,
      )
      .join("");
    return `<circle cx="${cx}" cy="${c.cy}" r="${c.r + 3.5}" fill="${darken(cor, 0.55)}" opacity=".9"/>
      <circle cx="${cx}" cy="${c.cy}" r="${c.r}" fill="#111827"/>
      <circle cx="${cx}" cy="${c.cy}" r="${c.r * 0.66}" fill="url(#${id}rim)"/>${spokes}
      <circle cx="${cx}" cy="${c.cy}" r="${c.r * 0.66}" fill="none" stroke="#64748b" stroke-width="1.5"/>
      <circle cx="${cx}" cy="${c.cy}" r="4.5" fill="#334155"/>`;
  };
  const pilares = c.pillars
    .map((x) => `<rect x="${x}" y="40" width="8" height="60" fill="${mid}"/>`)
    .join("");
  const portas = c.door
    .map(
      (x) =>
        `<path d="M${x + 4} ${c.belt - 10} L${x + 2} ${c.cy - 4}" stroke="${darken(cor, 0.3)}" stroke-width="1.4" opacity=".7"/><rect x="${x + 16}" y="${c.belt + 2}" width="16" height="3.5" rx="1.75" fill="${darken(cor, 0.35)}" opacity=".7"/>`,
    )
    .join("");
  const fx = tipo === "hatch" ? 392 : tipo === "sport" ? 398 : 396;
  return `<svg viewBox="0 0 420 162" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:100%">
    <defs>
      <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${bot}"/></linearGradient>
      <linearGradient id="${id}w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#334155"/><stop offset="1" stop-color="#0f172a"/></linearGradient>
      <radialGradient id="${id}rim" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#f1f5f9"/><stop offset="1" stop-color="#94a3b8"/></radialGradient>
      <clipPath id="${id}clip"><path d="${c.body}"/></clipPath>
    </defs>
    <ellipse cx="210" cy="${c.cy + c.r - 2}" rx="${190 * c.sx}" ry="9" fill="#0f172a" opacity=".14"/>
    <g transform="translate(210 0) scale(${c.sx} 1) translate(-210 0)">
    <path d="${c.body}" fill="url(#${id}b)" ${claro ? 'stroke="#cbd5e1" stroke-width="1.2"' : ""}/>
    <g clip-path="url(#${id}clip)">
      <path d="${c.win}" fill="url(#${id}w)"/>
      <path d="${c.win}" fill="#fff" opacity=".08" transform="translate(0 -3)"/>
      ${pilares}
      <path d="M40 ${c.belt} L390 ${c.belt}" stroke="#fff" stroke-width="2" opacity="${claro ? 0.9 : 0.22}"/>
      <rect x="0" y="${c.cy - 6}" width="420" height="40" fill="${darken(cor, 0.5)}" opacity=".35"/>
      ${portas}
    </g>
    <rect x="${fx - 18}" y="${c.belt + 1}" width="16" height="6" rx="3" fill="#fde68a"/>
    <rect x="26" y="${c.belt + 2}" width="12" height="7" rx="3" fill="#ef4444"/>
    </g>
    ${c.wheels.map((x) => rim(210 + (x - 210) * c.sx)).join("")}
  </svg>`;
}

const CORES = [
  "#f3f4f6",
  "#94a3b8",
  "#1d4ed8",
  "#b91c1c",
  "#1e293b",
  "#475569",
  "#0f766e",
  "#e2e8f0",
];
const TIPO_POR_CATEGORIA: Record<string, Tipo> = {
  SUV: "suv",
  Sedã: "sedan",
  Hatch: "hatch",
  Esportivo: "sport",
};

export function CarIllustration({
  carro,
  width,
}: {
  carro: Pick<Automovel, "id" | "categoria">;
  width?: number;
}) {
  const tipo = TIPO_POR_CATEGORIA[carro.categoria ?? ""] ?? "sedan";
  const cor = CORES[carro.id % CORES.length]!;
  return (
    <div
      style={{ width: width ?? "100%", height: "100%" }}
      dangerouslySetInnerHTML={{ __html: svgCarro(tipo, cor) }}
    />
  );
}
