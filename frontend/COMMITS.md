# Plano de commits (incremental)

```bash
git add package.json package-lock.json vite.config.ts tsconfig.json index.html .gitignore .env.example public src/main.tsx src/styles.css
git commit -m "chore: setup react + vite + tailwind project with mobilis brand"

git add src/api.ts
git commit -m "feat: add api client, types and session helpers"

git add src/components/Icon.tsx src/components/CarIllustration.tsx src/components/ui.tsx src/components/ContratoTexto.tsx
git commit -m "feat: add ui components"

git add src/components/Layout.tsx src/components/AuthLayout.tsx src/components/DadosCliente.tsx src/App.tsx src/pages/Login.tsx src/pages/Cadastro.tsx src/pages/CadastroAgente.tsx
git commit -m "feat: add login, sign-up and app layout"

git add src/pages/cliente/NovoPedido.tsx src/pages/cliente/Alugar.tsx src/pages/cliente/Perfil.tsx
git commit -m "feat: add car catalog, rent page and client profile"

git add src/pages/cliente/MeusPedidos.tsx
git commit -m "feat: add client orders with contract accept and refuse"

git add src/pages/agente/Pedidos.tsx src/pages/agente/AnalisePedido.tsx
git commit -m "feat: add agent orders board and financial opinion"

git add src/pages/agente/ContratoEditor.tsx src/pages/agente/Contratos.tsx
git commit -m "feat: add contract template editor and contracts page"

git add src/pages/agente/Clientes.tsx src/pages/agente/Automoveis.tsx src/pages/agente/PerfilAgente.tsx
git commit -m "feat: add agent clients, cars with photo and profile"

git add README.md COMMITS.md
git commit -m "docs: add readme and commit plan"
```

> O `App.tsx` importa todas as páginas; se quiser que cada commit compile sozinho, adicione as rotas junto do commit de cada página.
