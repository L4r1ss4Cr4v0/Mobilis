---
# 🚗 Mobilis 👨‍💻

<table>
<tr>
<td width="800px">
<div align="justify">
O <b>Mobilis</b> é o protótipo desenvolvido no <b>Laboratório 02 (Sistema de Aluguel de Carros)</b> da disciplina <i>Desenvolvimento e Integração de Aplicações Web</i> do curso de Engenharia de Software da PUC Minas. O sistema permite que <b>clientes</b> criem, modifiquem, consultem e cancelem pedidos de aluguel pela internet. Os <b>agentes</b> (empresas e bancos) cadastram automóveis, avaliam os pedidos do ponto de vista financeiro e, com parecer positivo, emitem o contrato a partir de um <i>template padrão</i> preenchido automaticamente. Quando o aluguel é pago a crédito, um banco agente analisa a renda do cliente e concede o <i>contrato de crédito</i>. O acesso exige cadastro prévio e login com usuário e senha.
</div>
</td>
<td>
<div>
<img src="frontend/public/logo-mobilis.png" alt="Logo do Mobilis" width="160px"/>
</div>
</td>
</tr>
</table>
---

## 🚧 Status do Projeto

[![Versão](https://img.shields.io/badge/Versão-v1.0.0-112040)](https://github.com/L4r1ss4Cr4v0/Mobilis)
[![GitHub last commit](https://img.shields.io/github/last-commit/L4r1ss4Cr4v0/Mobilis?color=112040)](https://github.com/L4r1ss4Cr4v0/Mobilis/commits)
[![GitHub repo size](https://img.shields.io/github/repo-size/L4r1ss4Cr4v0/Mobilis?color=112040)](https://github.com/L4r1ss4Cr4v0/Mobilis)
[![Licença](https://img.shields.io/badge/Licença-MIT-112040)](#-licença)

![React](https://img.shields.io/badge/React-19.1-112040?style=for-the-badge&logo=react&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-6.3-112040?style=for-the-badge&logo=vite&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-112040?style=for-the-badge&logo=typescript&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-112040?style=for-the-badge&logo=tailwindcss&logoColor=white) ![Java](https://img.shields.io/badge/Java-25-112040?style=for-the-badge&logo=openjdk&logoColor=white) ![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0.0-112040?style=for-the-badge&logo=springboot&logoColor=white) ![Maven](https://img.shields.io/badge/Maven-3.9-112040?style=for-the-badge&logo=apachemaven&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-112040?style=for-the-badge&logo=supabase&logoColor=white) ![GitHub language count](https://img.shields.io/github/languages/count/L4r1ss4Cr4v0/Mobilis?style=for-the-badge&color=112040&logo=github) ![GitHub commit activity](https://img.shields.io/github/commit-activity/m/L4r1ss4Cr4v0/Mobilis?style=for-the-badge&color=112040&logo=git)

---

## 📚 Índice

- [Links Úteis](#-links-úteis)
- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Arquitetura](#-arquitetura)
  - [Modelagem (UML)](#modelagem-uml)
- [Instalação e Execução](#-instalação-e-execução)
  - [Pré-requisitos](#pré-requisitos)
  - [Variáveis de Ambiente](#-variáveis-de-ambiente)
    - [1 Back-end (Spring Boot)](#1-back-end-spring-boot)
    - [2 Front-end (React, Vite)](#2-front-end-react-vite)
  - [Instalação de Dependências](#-instalação-de-dependências)
  - [Inicialização do Banco de Dados (Supabase)](#-inicialização-do-banco-de-dados-supabase)
  - [Como Executar a Aplicação](#-como-executar-a-aplicação)
    - [Terminal 1: Back-end (Spring Boot)](#terminal-1-back-end-spring-boot)
    - [Terminal 2: Front-end (React, Vite)](#terminal-2-front-end-react-vite)
- [Deploy](#-deploy)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Demonstração](#-demonstração)
  - [Aplicação Web](#-aplicação-web)
  - [Exemplo de Saída da API](#-exemplo-de-saída-da-api)
- [Testes](#-testes)
- [Documentações utilizadas](#-documentações-utilizadas)
- [Autores](#-autores)
- [Contribuição](#-contribuição)
- [Agradecimentos](#-agradecimentos)
- [Licença](#-licença)

---

## 🔗 Links Úteis

- 🎨 **Protótipo (Figma):** [Telas do Mobilis](https://www.figma.com/design/NE8JwWwiZrxy3gVed6P4p8/Mobilis?node-id=0-1&t=MaEy9UaDbIWPoP2t-1)
  > 💻 **Descrição:** Todas as telas da aplicação (acesso, área do cliente e área dos agentes).
- 🧭 **Modelagem (Miro):** [Board com os diagramas UML](https://miro.com/app/board/uXjVES6Zt-A=/)
  > 📚 **Descrição:** Diagrama de casos de uso, histórias do usuário, diagrama de pacotes e diagramas de classes. A versão 2 reflete a estrutura atual do código; a versão 1 fica no mesmo board como histórico.
- 🗂️ **Repositório:** [github.com/L4r1ss4Cr4v0/Mobilis](https://github.com/L4r1ss4Cr4v0/Mobilis.git)

---

## 📝 Sobre o Projeto

**Por que existe.** O Laboratório 02 pede um sistema de apoio à gestão de aluguéis de automóveis em que pedidos possam ser feitos, modificados e cancelados pela internet, com análise financeira feita por agentes (empresas e bancos).

**Que problema resolve.** Em um aluguel com financiamento, cliente, locadora e banco trocam dados e documentos por canais diferentes. O Mobilis concentra tudo em um fluxo único e rastreável:

1. o cliente se cadastra com dados pessoais, profissão e até 3 rendimentos;
2. escolhe um carro livre no período e envia o pedido, com pagamento direto ou a crédito de um banco;
3. o agente responsável avalia a renda e emite um **parecer positivo ou negativo**. No crédito, quem avalia é o banco escolhido;
4. com parecer positivo, o **proprietário do carro** redige o contrato a partir do template, já preenchido com os dados do pedido, e define a titularidade do veículo (cliente, empresa ou banco);
5. o cliente lê o contrato e **aceita ou recusa**.

**Contexto.** Projeto acadêmico do 2º período de Engenharia de Software (PUC Minas), com arquitetura MVC, Spring Boot no back-end, React + Vite no front-end e Supabase (PostgreSQL) como banco de dados.

> [!NOTE]
> O sistema é dividido em dois subsistemas, como pede o enunciado: **gestão de pedidos e contratos** (API Spring Boot) e **construção dinâmica das páginas web** (SPA em React).

---

## ✨ Funcionalidades Principais

- 🔐 **Autenticação:** login obrigatório com usuário e senha; senhas guardadas com hash BCrypt.
- 🧑 **Cadastro de clientes:** RG, CPF, nome, endereço, profissão e até 3 entidades empregadoras com rendimentos.
- 🏦 **Cadastro de agentes:** empresas e bancos com CNPJ; bancos com código bancário (COMPE de 3 dígitos).
- 🚙 **Gestão de automóveis:** matrícula, ano, marca, modelo, placa, categoria, diária e **uma foto** por veículo; só agentes cadastram carros.
- 📝 **Pedidos de aluguel:** o cliente cria, consulta, modifica (enquanto em análise) e cancela pedidos; a disponibilidade do carro é checada pelo período.
- 📊 **Análise financeira:** o agente responsável dá parecer positivo ou negativo e pode ajustar período, local e parcelas antes do parecer.
- 📄 **Contrato a partir de template:** editor em formato de documento com campos preenchidos automaticamente, titularidade e taxa de juros; o cliente aceita ou recusa.
- 💳 **Contrato de crédito:** no pagamento a crédito o banco analisa o pedido e define a taxa, mesmo quando o carro é de uma empresa.
- 👥 **Clientes vinculados:** cada agente vê e gerencia (CRUD) apenas os clientes ligados a ele por pedido ou cadastro.
- 🧯 **Tratamento de erros:** a API devolve mensagens amigáveis e o front-end repete uma vez as consultas que falham por queda de conexão.

---

## 🛠 Tecnologias Utilizadas

### 💻 Front-end

- **Biblioteca:** React 19.1
- **Linguagem:** TypeScript 5.8
- **Estilização:** Tailwind CSS 4.1 (tokens próprios em `styles.css`)
- **Rotas:** React Router 7
- **Gerenciamento de Estado:** estado local dos componentes (`useState`/`useEffect`) e sessão no `localStorage`
- **Build Tool:** Vite 6

### 🖥️ Back-end

- **Linguagem/Runtime:** Java 25 (JDK)
- **Framework:** Spring Boot 4.0.0 (Spring Web MVC)
- **Build e dependências:** Apache Maven
- **Banco de Dados:** Supabase (PostgreSQL)
- **ORM:** Spring Data JPA / Hibernate, com `EntityManager` usado diretamente nos services
- **Autenticação:** login próprio (`/api/auth/login`) e hash de senha com BCrypt (`spring-security-crypto`)

### ⚙️ Infraestrutura

- **Cloud:** Supabase (banco PostgreSQL gerenciado, conexão pelo _Session pooler_)

---

## 🏗 Arquitetura

O back-end segue o padrão **MVC** em três pacotes, sem camadas extras:

- **`model`**: entidades JPA. `Usuario` é abstrata e usa herança em tabela única (`SINGLE_TABLE`) para `Cliente` e `Agente`; `Rendimento` é `@Embeddable`; `Pedido` tem um `Contrato` (1:0..1).
- **`service`**: regras de negócio e acesso ao banco pelo `EntityManager` (JPQL). Exemplos: disponibilidade do carro no período, vínculo cliente-agente, quem analisa o pedido (o banco no crédito, o dono do carro no pagamento direto) e quem redige o contrato (sempre o dono do carro).
- **`controller`**: rotas REST em `/api`. O `ErroController` (`@RestControllerAdvice`) converte exceções em respostas `{status, message}` sem expor detalhes técnicos.

O front-end é uma SPA: `pages` (telas por área), `components` (layout com header, componentes de UI) e `api.ts` (tipos, chamadas REST e tratamento de erros). A comunicação entre as partes é HTTP/JSON.

**Decisões e trade-offs**

- O enunciado pede o mínimo necessário de segurança: em vez de Spring Security completo (JWT, filtros), o projeto usa só o BCrypt e um login simples; o front-end controla o acesso às áreas pela sessão salva.
- Sem repositories e DTOs separados, para manter o código curto e alinhado ao diagrama de classes; os poucos corpos de requisição são `records` dentro dos controllers.
- O Hibernate cria e atualiza as tabelas (`ddl-auto=update`) e o `DadosIniciaisService` popula um banco vazio com dados de exemplo.

### Modelagem (UML)

Todos os diagramas estão no [board do Miro](https://miro.com/app/board/uXjVES6Zt-A=/). Os links abaixo levam direto a cada um.

| Diagrama                                                                                                          | Conteúdo                                                                                       |
| :---------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| [**Casos de Uso**](https://miro.com/app/board/uXjVES6Zt-A=/?moveToWidget=3458764689611279047)                     | Atores Cliente e Agente (Empresa, Banco) e os 14 casos de uso do sistema                       |
| [**Histórias do Usuário**](https://miro.com/app/board/uXjVES6Zt-A=/?moveToWidget=3458764689611279048)             | US01 a US16, cada uma ligada aos requisitos (RF01 a RF11)                                      |
| [**Pacotes (Visão Lógica)**](https://miro.com/app/board/uXjVES6Zt-A=/?moveToWidget=3458764689611334952)           | `pages`, `components`, `app`, `api.ts` → `controller` → `service` → `model`, Supabase e BCrypt |
| [**Classes · Domínio**](https://miro.com/app/board/uXjVES6Zt-A=/?moveToWidget=3458764689611334991)                | Entidades do pacote `model`, enums e relacionamentos                                           |
| [**Classes · Controllers e Services**](https://miro.com/app/board/uXjVES6Zt-A=/?moveToWidget=3458764689611334994) | Métodos públicos das camadas MVC e dependências entre elas                                     |

**Requisitos atendidos**

| Requisito                                                                         | Onde                                                                                                     |
| :-------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| RF01 Login obrigatório                                                            | `AuthController` (`POST /api/auth/login`); o front só abre as áreas com usuário logado                   |
| RF02 Cadastro de clientes (RG, CPF, nome, endereço, profissão, até 3 rendimentos) | `ClienteService`, tela de cadastro e perfil                                                              |
| RF03 Introduzir, modificar, consultar e cancelar pedidos                          | `PedidoController`, telas Novo pedido e Meus pedidos                                                     |
| RF04 Identificação dos agentes e código bancário                                  | `AgenteService`; bancos sempre exibidos com o código                                                     |
| RF05 Cadastro de automóveis só por agentes                                        | `AutomovelService` (o agente vira proprietário)                                                          |
| RF06 No máximo 1 imagem por veículo                                               | `PUT /api/automoveis/{id}/foto` substitui a foto                                                         |
| RF07 Agente só vê os clientes vinculados a ele                                    | vínculo criado pelo pedido ou pelo cadastro feito pelo agente                                            |
| RF08 Análise financeira com parecer positivo ou negativo                          | `POST /api/pedidos/{id}/parecer`; o agente também modifica o pedido em análise                           |
| RF09 Contrato a partir de template com preenchimento automático e titularidade    | `ContratoService` (modelo, prévia e emissão) e editor de contrato; quem redige é o proprietário do carro |
| RF10 Cliente aceita ou recusa o contrato                                          | `POST /api/pedidos/{id}/contrato/resposta`                                                               |
| RF11 Aluguel associado a contrato de crédito de um banco                          | no pagamento a crédito o banco analisa o pedido e define parcelas e taxa de juros                        |
| Senhas com hash                                                                   | BCrypt (`spring-security-crypto`)                                                                        |

---

## 🔧 Instalação e Execução

### Pré-requisitos

- **Java JDK:** versão **25** (necessário para o **back-end Spring Boot 4**)
- **Apache Maven:** 3.9 ou superior
- **Node.js:** versão LTS (v20.x ou superior) (necessário para o **front-end React + Vite**)
- **Gerenciador de pacotes:** npm
- **Conta no Supabase** com um projeto criado (o banco PostgreSQL fica na nuvem)

---

### 🔑 Variáveis de Ambiente

Cada parte tem um `.env.example`. Copie para `.env` na mesma pasta e preencha os valores. Os arquivos `.env` não são versionados.

#### 1 Back-end (Spring Boot)

O `application.properties` lê o arquivo `backend/.env` automaticamente (`spring.config.import=optional:file:.env[.properties]`).

| Variável               | Descrição                                              | Exemplo                                                                               |
| :--------------------- | :----------------------------------------------------- | :------------------------------------------------------------------------------------ |
| `SUPABASE_DB_URL`      | URL JDBC do _Session pooler_ do Supabase (porta 5432). | `jdbc:postgresql://aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require` |
| `SUPABASE_DB_USER`     | Usuário do banco (inclui o ID do projeto).             | `postgres.SEU_PROJECT_REF`                                                            |
| `SUPABASE_DB_PASSWORD` | Senha do banco.                                        | `sua-senha-do-banco`                                                                  |
| `PORT`                 | Porta da API (opcional).                               | `8080`                                                                                |
| `APP_SEED`             | Popula o banco vazio com dados de exemplo (opcional).  | `true`                                                                                |

#### 2 Front-end (React, Vite)

| Variável       | Descrição                    | Exemplo                     |
| :------------- | :--------------------------- | :-------------------------- |
| `VITE_API_URL` | URL base da API Spring Boot. | `http://localhost:8080/api` |

> **Obs:** em projetos **Vite**, só variáveis que começam com `VITE_` chegam ao código do navegador.

---

### 📦 Instalação de Dependências

1.  **Clone o repositório:**

```bash
git clone https://github.com/L4r1ss4Cr4v0/Mobilis.git
cd Mobilis
```

2.  **Instale as dependências de cada parte:**

#### Front-end (React)

```bash
cd frontend
npm install
cd ..
```

#### Back-end (Spring Boot)

```bash
cd backend
mvn clean install
cd ..
```

---

### 💾 Inicialização do Banco de Dados (Supabase)

1. No painel do Supabase, abra **Project Settings > Database > Connect > Session pooler** e copie host, usuário e senha para o `backend/.env`.
2. Não há migrações manuais: na primeira execução o Hibernate cria as tabelas (`usuarios`, `rendimentos`, `vinculos`, `automoveis`, `pedidos`, `contratos`) a partir das entidades.
3. Com `APP_SEED=true` (padrão), um banco vazio recebe agentes, clientes, carros, pedidos e contratos de exemplo. A senha de todos é `senha123`.

| Usuário          | Perfil                                             |
| :--------------- | :------------------------------------------------- |
| `agente.banco`   | Banco Horizonte (código 777)                       |
| `agente.empresa` | Locadora Prime (empresa)                           |
| `mariana.lima`   | Cliente com contrato ativo e pedido em análise     |
| `pedro.nunes`    | Cliente com proposta de contrato aguardando aceite |

---

### ⚡ Como Executar a Aplicação

Execute em **dois terminais separados**.

#### Terminal 1: Back-end (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

🚀 _A API fica disponível em **http://localhost:8080/api**._

---

#### Terminal 2: Front-end (React, Vite)

```bash
cd frontend
npm run dev
```

🎨 _O front-end fica disponível em **http://localhost:5173**._

---

## 🚀 Deploy

1.  **Build do projeto:**

```bash
# 1. Front-end: gera a pasta frontend/dist com os arquivos estáticos
cd frontend
npm run build

# 2. Back-end: gera o .jar executável em backend/target
cd ../backend
mvn clean package
```

2.  **Ambiente de produção:** configure `SUPABASE_DB_URL`, `SUPABASE_DB_USER` e `SUPABASE_DB_PASSWORD` no servidor da API e `VITE_API_URL` com a URL pública da API antes do build do front-end.

3.  **Execução:**

```bash
# ☕ Back-end
java -jar backend/target/mobilis-backend-1.0.0.jar

# 🟢 Front-end: arquivos estáticos servidos por qualquer servidor web (Vercel, Netlify, Nginx...)
npm install -g serve
serve -s frontend/dist
```

---

## 📂 Estrutura de Pastas

```
.
├── README.md                          # 📘 Documentação principal do projeto.
├── /docs/telas                        # 🖼️ Capturas de tela usadas neste README.
│
├── /frontend                          # 📁 Aplicação React + Vite
│   ├── .env.example                   # 🧩 Variáveis de ambiente do front-end.
│   ├── README.md, COMMITS.md          # 📝 Notas e plano de commits do front-end.
│   ├── index.html                     # 🌐 Página base da SPA.
│   ├── vite.config.ts                 # ⚙️ Configuração do Vite (porta 5173, Tailwind).
│   ├── /public                        # 🖼️ Logo, favicons e imagem da tela de login.
│   ├── /src
│   │   ├── main.tsx                   # 🚪 Ponto de entrada.
│   │   ├── App.tsx                    # 🧭 Rotas das áreas de cliente e agente.
│   │   ├── api.ts                     # 🔌 Tipos, chamadas REST, sessão e tratamento de erros.
│   │   ├── styles.css                 # 🎨 Tokens de cor e fonte (Tailwind).
│   │   ├── /components                # 🧱 Layout (header), AuthLayout, ui, Icon, CarIllustration...
│   │   └── /pages                     # 📄 Telas
│   │       ├── Login.tsx, Cadastro.tsx, CadastroAgente.tsx
│   │       ├── /cliente               # 🧑 NovoPedido, Alugar, MeusPedidos, Perfil
│   │       └── /agente                # 🏦 Pedidos, AnalisePedido, ContratoEditor, Contratos, Clientes, Automoveis, PerfilAgente
│   └── package.json                   # 📦 Dependências e scripts.
│
└── /backend                           # 📁 Aplicação Spring Boot
    ├── .env.example                   # 🧩 Variáveis de ambiente do back-end (Supabase).
    ├── README.md, COMMITS.md          # 📝 Notas e plano de commits do back-end.
    ├── pom.xml                        # 🛠️ Build e dependências (Maven).
    └── /src/main
        ├── /java/br/pucminas/mobilis
        │   ├── MobilisApplication.java  # 🚀 Classe principal.
        │   ├── /controller            # 🎮 Endpoints REST e ErroController.
        │   ├── /service               # ⚙️ Regras de negócio (EntityManager/JPQL).
        │   └── /model                 # 🧬 Entidades JPA.
        └── /resources
            └── application.properties # ⚙️ Conexão com o Supabase, pool, upload e seed.
```

---

## 🌐 Aplicação Web

Todas as telas também estão no [Confira aqui](https://www.figma.com/design/NE8JwWwiZrxy3gVed6P4p8/Mobilis?node-id=0-1&t=MaEy9UaDbIWPoP2t-1).

### 💻 Exemplo de Saída da API

#### 1. Login

```bash
curl -X POST 'http://localhost:8080/api/auth/login' \
     -H 'Content-Type: application/json' \
     -d '{"login": "mariana.lima", "senha": "senha123"}'
```

**Saída esperada** (a senha nunca é devolvida):

```json
{
  "id": 4,
  "nome": "Mariana Souza Lima",
  "login": "mariana.lima",
  "perfil": "CLIENTE",
  "cpf": "123.456.789-00",
  "rg": "MG-12.345.678",
  "endereco": "Rua da Bahia, 1200 – Apto 501, Centro, Belo Horizonte – MG",
  "profissao": "Analista de sistemas",
  "rendimentos": [
    { "entidade": "TechMinas Sistemas Ltda.", "valor": 7500 },
    { "entidade": "Consultoria autônoma", "valor": 1800 }
  ],
  "rendaTotal": 9300,
  "cadastroCompleto": true
}
```

#### 2. Erro tratado

```bash
curl -X POST 'http://localhost:8080/api/auth/login' \
     -H 'Content-Type: application/json' \
     -d '{"login": "mariana.lima", "senha": "errada"}'
```

**Saída esperada** (HTTP 401):

```json
{ "status": 401, "message": "Usuário ou senha inválidos." }
```

#### 3. Principais rotas

| Método                      | Rota                                                                     | Uso                                                       |
| :-------------------------- | :----------------------------------------------------------------------- | :-------------------------------------------------------- |
| `POST`                      | `/api/auth/login`, `/api/auth/cadastro`                                  | Login e cadastro de cliente ou agente                     |
| `GET` `PUT`                 | `/api/agentes`, `/api/agentes/{id}`                                      | Listar e atualizar agentes                                |
| `GET` `POST` `PUT` `DELETE` | `/api/clientes?agenteId=`                                                | CRUD dos clientes vinculados ao agente                    |
| `GET` `POST` `PUT` `DELETE` | `/api/automoveis`                                                        | Catálogo (com filtro por período) e gestão de carros      |
| `PUT` `GET` `DELETE`        | `/api/automoveis/{id}/foto`                                              | Foto única do veículo                                     |
| `GET` `POST` `PUT`          | `/api/pedidos`                                                           | Listar (por cliente ou agente), criar e modificar pedidos |
| `POST`                      | `/api/pedidos/{id}/cancelar`, `/api/pedidos/{id}/parecer`                | Cancelar pedido e registrar parecer                       |
| `GET` `POST`                | `/api/pedidos/{id}/contrato/modelo`, `/previa`, `/contrato`, `/resposta` | Template, prévia, emissão e resposta do contrato          |

---

## 🧪 Testes

O repositório não traz testes automatizados. Para conferir o sistema manualmente, com os dados de exemplo carregados:

1. Entre como `mariana.lima` e peça um carro do Banco Horizonte com pagamento a crédito; o pedido aparece **Em análise**.
2. Entre como `agente.banco`, abra o pedido em **Pedidos** e dê parecer positivo.
3. Como o carro é do banco, ele mesmo redige o contrato no editor e o disponibiliza ao cliente.
4. Volte como `mariana.lima` e aceite o contrato; o pedido passa a **Contrato ativo**.
5. Repita com um carro da `agente.empresa` pago a crédito: o banco só analisa o crédito e a empresa redige o contrato.

---

## 🔗 Documentações utilizadas

- 📖 **Biblioteca (front-end):** [Documentação oficial do **React**](https://react.dev/reference/react)
- 📖 **Build tool (front-end):** [Guia de configuração do **Vite**](https://vitejs.dev/config/)
- 📖 **Estilização:** [Documentação do **Tailwind CSS**](https://tailwindcss.com/docs)
- 📖 **Rotas:** [Documentação do **React Router**](https://reactrouter.com/)
- 📖 **Framework (back-end):** [Documentação oficial do **Spring Boot**](https://docs.spring.io/spring-boot/index.html)
- 📖 **Banco de dados:** [Documentação do **Supabase**](https://supabase.com/docs)
- 📖 **Guia de estilo:** [**Conventional Commits**](https://www.conventionalcommits.org/en/v1.0.0/)

---

## 👥 Autora

Larissa Cravo Carvalho Câmara Santos

---

## 🙏 Agradecimentos

- [**Engenharia de Software PUC Minas**](https://www.instagram.com/engsoftwarepucminas/) - Pelo apoio institucional, estrutura acadêmica e fomento à inovação e boas práticas de engenharia.

## 📄 Licença

Este projeto é distribuído sob a **Licença MIT**.
