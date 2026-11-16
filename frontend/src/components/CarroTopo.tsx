import type { CSSProperties } from "react";

/** Definições do carro visto de cima (desenhado uma vez e reaproveitado com <use>). A cor vem de --car. */
export function CarroDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <filter id="lp-grao" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={7} />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.06 0" />
        </filter>
        <filter id="lp-sombra" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="20" />
        </filter>
        <symbol id="lp-carro" viewBox="-180 -330 360 660" overflow="visible">
          <ellipse cx="10" cy="16" rx="160" ry="325" fill="#000" opacity="0.5" filter="url(#lp-sombra)" />
          <g fill="#0b0d11">
            <rect x="-150" y="-215" width="22" height="88" rx="9" />
            <rect x="128" y="-215" width="22" height="88" rx="9" />
            <rect x="-152" y="130" width="22" height="92" rx="9" />
            <rect x="130" y="130" width="22" height="92" rx="9" />
          </g>
          <path style={COR} d="M-112 -268 C-112 -300 -70 -312 0 -312 C70 -312 112 -300 112 -268 C128 -238 140 -190 141 -130 L143 168 C143 240 132 288 0 296 C-132 288 -143 240 -143 168 L-141 -130 C-140 -190 -128 -238 -112 -268 Z" />
          <path d="M-143 -130 L-141 168 C-141 240 -130 288 -60 294 L-60 -308 C-110 -300 -128 -240 -143 -130 Z" fill="#000" opacity="0.1" />
          <path d="M-62 -292 C-70 -230 -76 -175 -82 -128 M62 -292 C70 -230 76 -175 82 -128" stroke="#000" strokeOpacity="0.18" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M-100 -276 C-92 -292 -64 -298 -40 -299 L-44 -290 C-66 -288 -88 -282 -100 -270 Z M100 -276 C92 -292 64 -298 40 -299 L44 -290 C66 -288 88 -282 100 -270 Z" fill="#dfe6f0" />
          <path style={COR} d="M-140 -92 L-170 -84 C-176 -82 -176 -70 -170 -68 L-140 -66 Z M140 -92 L170 -84 C176 -82 176 -70 170 -68 L140 -66 Z" />
          <path d="M-112 -110 C-80 -132 80 -132 112 -110 L104 -28 C70 -38 -70 -38 -104 -28 Z" fill="#1d2431" />
          <path d="M-120 -90 L-112 -18 L-114 120 L-124 150 L-128 -60 Z M120 -90 L112 -18 L114 120 L124 150 L128 -60 Z" fill="#1a202b" />
          <rect x="-104" y="-30" width="208" height="168" rx="22" style={COR} />
          <rect x="-104" y="-30" width="208" height="168" rx="22" fill="#fff" opacity="0.1" />
          <path d="M-104 140 C-70 132 70 132 104 140 L94 196 C60 206 -60 206 -94 196 Z" fill="#1d2431" />
          <path d="M-80 252 C-40 262 40 262 80 252" stroke="#000" strokeOpacity="0.18" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M-132 256 C-118 278 -96 288 -70 292 L-70 284 C-94 280 -114 270 -126 252 Z M132 256 C118 278 96 288 70 292 L70 284 C94 280 114 270 126 252 Z" fill="#8a2a30" />
        </symbol>
      </defs>
    </svg>
  );
}

const COR: CSSProperties = { fill: "var(--car, #f4f5f8)" };

/** Um carro posicionado numa cena SVG (centro em x,y; frente para cima antes da rotação). */
export function Carro({
  x,
  y,
  cor,
  escala = 1,
  giro = 0,
}: {
  x: number;
  y: number;
  cor: string;
  escala?: number;
  giro?: number;
}) {
  const w = 120 * escala,
    h = 220 * escala;
  return (
    <use
      href="#lp-carro"
      x={-w / 2}
      y={-h / 2}
      width={w}
      height={h}
      transform={`translate(${x} ${y}) rotate(${giro})`}
      style={{ "--car": cor } as CSSProperties}
    />
  );
}

const VIZINHOS = ["#94a3b8", "#475569", "#e2e8f0", "#1e293b", "#64748b"];

/** Vaga de estacionamento com o carro do anúncio no centro e vizinhos cortados nas bordas. */
export function CenaVaga({ id, cor }: { id: number; cor: string }) {
  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="block h-full w-full" aria-hidden="true" focusable="false">
      <rect width="400" height="250" fill="#1b1e25" />
      <rect width="400" height="250" filter="url(#lp-grao)" />
      <g fill="#e9ebef" opacity=".75">
        <rect x="92" width="5" height="250" />
        <rect x="303" width="5" height="250" />
      </g>
      <text x="200" y="236" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="18" fill="#e9ebef" opacity=".5">
        A{id}
      </text>
      <g className="lp-parado">
        <Carro x={200} y={118} cor={cor} escala={1.03} giro={id % 2 ? -4 : 3} />
      </g>
      <Carro x={4} y={124} cor={VIZINHOS[(id + 1) % VIZINHOS.length]!} escala={1.03} />
      <Carro x={398} y={108} cor={VIZINHOS[(id + 3) % VIZINHOS.length]!} escala={1.03} />
    </svg>
  );
}
