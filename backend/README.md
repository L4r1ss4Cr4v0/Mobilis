# Mobilis – Back-end (Spring Boot + Supabase)

Estrutura mínima: **entidades, services e controllers**.

```
src/main/java/br/pucminas/mobilis
├── MobilisApplication.java
├── model/        Usuario, Cliente, Agente, Rendimento, Automovel, Pedido, Contrato
├── service/      AuthService, ClienteService, AgenteService, AutomovelService, PedidoService, ContratoService, DadosIniciaisService
└── controller/   AuthController, ClienteController, AgenteController, AutomovelController, PedidoController, ContratoController
```

- Sem Spring Security/JWT: o login devolve o usuário e o front envia o id dele nas chamadas. As senhas usam **BCrypt**
  (só a dependência `spring-security-crypto`).
- O Hibernate cria as tabelas (`ddl-auto=update`): `usuarios`, `rendimentos`, `vinculos`, `automoveis`, `pedidos`, `contratos`.
- A foto do automóvel (1 por registro) fica no próprio banco.
- Erros de regra de negócio voltam como `400` (dado inválido), `403` (sem permissão) ou `404`, com a mensagem no campo `message`.

## Como rodar

1. Copie `.env.example` para `.env` e preencha com o **Session pooler** do Supabase (porta 5432).
2. `mvn spring-boot:run` (ou rode `MobilisApplication` pela IDE).

> Se o banco ainda tiver as tabelas das versões anteriores (`usuario`, `pedido_aluguel`, `parecer_financeiro`, `fotos`…),
> apague-as: elas não são usadas e a carga de exemplo só roda com o banco vazio.

## Fluxo do pedido

`EM_ANALISE` → parecer do agente → `APROVADO` ou `REJEITADO` → o agente emite o contrato (`AGUARDANDO_ACEITE`)
→ o cliente aceita (`ACEITO`, aluguel efetivado) ou recusa (`RECUSADO`, transação encerrada).
O cliente pode cancelar enquanto não aceitou. Quem analisa é o **banco escolhido** (pagamento por crédito)
ou o **dono do carro** (pagamento direto).

## Rotas

| Método | Rota | O que faz |
|---|---|---|
| POST | `/api/auth/login` | Entrar (`{login, senha}`) |
| POST | `/api/auth/cadastro` | Criar conta: `perfil` CLIENTE (com RG, CPF, endereço, profissão, rendimentos) ou EMPRESA/BANCO (CNPJ, código bancário) |
| GET | `/api/clientes?agenteId=` | Clientes vinculados ao agente |
| POST | `/api/clientes?agenteId=` | Agente cadastra um cliente (fica vinculado a ele) |
| GET/PUT | `/api/clientes/{id}[?agenteId=]` | Ver / atualizar dados (o agente só se houver vínculo) |
| DELETE | `/api/clientes/{id}?agenteId=` | Tira o cliente da carteira do agente |
| GET | `/api/agentes?tipo=BANCO` | Bancos (com o código bancário) |
| GET/PUT | `/api/agentes/{id}` | Dados de identificação do agente |
| GET | `/api/automoveis?inicio=&fim=` | Catálogo (com datas: só os livres) |
| GET | `/api/automoveis?agenteId=` | Frota do agente |
| POST | `/api/automoveis?agenteId=` | Cadastrar automóvel |
| PUT/DELETE | `/api/automoveis/{id}?agenteId=` | Editar / excluir (só o proprietário) |
| PUT/GET/DELETE | `/api/automoveis/{id}/foto` | Enviar (multipart `foto`, 1 imagem), ver ou remover a foto |
| GET | `/api/pedidos?clienteId=` ou `?agenteId=` | Pedidos do cliente / do agente |
| POST | `/api/pedidos` | Novo pedido |
| PUT | `/api/pedidos/{id}[?agenteId=]` | Modificar (cliente ou agente responsável, só em análise) |
| POST | `/api/pedidos/{id}/cancelar?clienteId=` | Cliente cancela |
| POST | `/api/pedidos/{id}/parecer?agenteId=` | Parecer financeiro `{positivo, parecer}` |
| GET | `/api/pedidos/{id}/contrato/modelo?agenteId=` | Template padrão, campos de auto-fill e titularidades possíveis |
| POST | `/api/pedidos/{id}/contrato/previa?agenteId=` | Texto preenchido, sem salvar |
| POST | `/api/pedidos/{id}/contrato?agenteId=` | Emite o contrato `{modelo, titularidade, taxaJuros}` |
| POST | `/api/pedidos/{id}/contrato/resposta?clienteId=` | Cliente aceita ou recusa `{aceitar}` |
