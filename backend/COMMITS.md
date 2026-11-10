# Plano de commits (incremental)

```bash
P=src/main/java/br/pucminas/mobilis

git add pom.xml .gitignore .env.example src/main/resources/application.properties $P/MobilisApplication.java
git commit -m "chore: setup spring boot project with supabase connection"

git add $P/model/Usuario.java $P/model/Cliente.java $P/model/Rendimento.java $P/model/Agente.java
git commit -m "feat: add usuario, cliente and agente entities"

git add $P/service/AgenteService.java $P/service/AuthService.java $P/controller/AuthController.java
git commit -m "feat: add login and sign-up with bcrypt"

git add $P/controller/AgenteController.java
git commit -m "feat: add agentes routes with bank code"

git add $P/model/Automovel.java $P/model/Pedido.java $P/model/Contrato.java $P/service/AutomovelService.java $P/controller/AutomovelController.java
git commit -m "feat: add automoveis routes with single photo upload"

git add $P/service/ClienteService.java $P/controller/ClienteController.java
git commit -m "feat: add clientes routes isolated by agent"

git add $P/service/PedidoService.java $P/controller/PedidoController.java
git commit -m "feat: add pedidos routes and financial opinion"

git add $P/service/ContratoService.java $P/controller/ContratoController.java
git commit -m "feat: add contract template, emission and client answer"

git add $P/service/DadosIniciaisService.java
git commit -m "feat: seed demo data on empty database"

git add README.md COMMITS.md
git commit -m "docs: add readme and commit plan"
```

> `Pedido` e `Contrato` entram no commit de automóveis porque o `AutomovelService` usa os pedidos para calcular a
> disponibilidade; o `AgenteService` entra com a autenticação porque o cadastro do agente valida a identificação nele.
