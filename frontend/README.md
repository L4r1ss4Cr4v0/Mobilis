# Mobilis – Front-end (React + Vite + Tailwind)

```
src/
├── main.tsx, App.tsx      entrada e rotas
├── api.ts                 chamadas à API, tipos, sessão (localStorage), regras de exibição e formatação
├── styles.css             paleta do projeto (Tailwind)
├── components/            Layout (header), AuthLayout, ui, Icon, CarIllustration, DadosCliente, ContratoTexto
└── pages/
    ├── Login, Cadastro, CadastroAgente
    ├── cliente/           NovoPedido (catálogo), Alugar, MeusPedidos (propostas e contratos), Perfil
    └── agente/            Pedidos (quadro), AnalisePedido (parecer), ContratoEditor, Contratos, Clientes, Automoveis, PerfilAgente
```

- Login simples: o usuário devolvido por `/api/auth/login` fica no `localStorage`; o `Layout` barra quem não está logado.
- Bancos aparecem sempre com o código bancário.
- Carros sem foto mostram uma ilustração; cada automóvel aceita 1 foto.

## Como rodar

```bash
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:8080/api
npm run dev            # http://localhost:5173
```
