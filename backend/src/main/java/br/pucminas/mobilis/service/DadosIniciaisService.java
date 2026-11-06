package br.pucminas.mobilis.service;

import br.pucminas.mobilis.model.Agente;
import br.pucminas.mobilis.model.Automovel;
import br.pucminas.mobilis.model.Cliente;
import br.pucminas.mobilis.model.Contrato;
import br.pucminas.mobilis.model.Pedido;
import br.pucminas.mobilis.model.Rendimento;
import br.pucminas.mobilis.model.Usuario;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Popula o banco vazio com dados de demonstração. Senha de todos: senha123. Desligue com APP_SEED=false. */
@Service
public class DadosIniciaisService implements CommandLineRunner {

    private final EntityManager em;
    private final boolean ativo;

    public DadosIniciaisService(EntityManager em, @Value("${app.seed:true}") boolean ativo) {
        this.em = em;
        this.ativo = ativo;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Long usuarios = em.createQuery("select count(u) from Usuario u", Long.class).getSingleResult();
        if (!ativo || usuarios > 0) return;

        Agente banco = agente("Banco Horizonte", "agente.banco", Agente.Tipo.BANCO, "12.345.678/0001-90", "777");
        Agente locadora = agente("Locadora Prime", "agente.empresa", Agente.Tipo.EMPRESA, "98.765.432/0001-10", null);
        agente("Banco Central Mineiro", "agente.bcm", Agente.Tipo.BANCO, "33.444.555/0001-66", "341");

        Cliente mariana = cliente("Mariana Souza Lima", "mariana.lima", "123.456.789-00", "MG-12.345.678",
                "Rua da Bahia, 1200 – Apto 501, Centro, Belo Horizonte – MG", "Analista de sistemas",
                "TechMinas Sistemas Ltda.", "7500", "Consultoria autônoma", "1800");
        Cliente juliana = cliente("Juliana Pereira Reis", "juliana.reis", "321.654.987-11", "MG-34.567.890",
                "Rua Rio de Janeiro, 450, Lourdes, Belo Horizonte – MG", "Médica",
                "Hospital das Clínicas", "8000", "Clínica Vida", "4800");
        Cliente carlos = cliente("Carlos Henrique Melo", "carlos.melo", "456.123.789-22", "MG-45.678.901",
                "Rua Pernambuco, 800, Savassi, Belo Horizonte – MG", "Engenheiro civil", "Construtora Alfa", "8100");
        Cliente rafael = cliente("Rafael Andrade Costa", "rafael.costa", "987.654.321-00", "MG-23.456.789",
                "Av. Afonso Pena, 3000, Funcionários, Belo Horizonte – MG", "Professor", "Escola Estadual Central", "5200");
        Cliente ana = cliente("Ana Beatriz Fonseca", "ana.fonseca", "159.357.258-44", "MG-67.890.123",
                "Av. do Contorno, 6000, Santo Antônio, Belo Horizonte – MG", "Designer",
                "Estúdio Criativo", "4000", "Projetos freelancer", "2450");
        Cliente bruno = cliente("Bruno Tavares Lopes", "bruno.lopes", "741.852.963-33", "MG-56.789.012",
                "Rua Padre Eustáquio, 1500, Belo Horizonte – MG", "Vendedor", "Magazine Centro", "1500");
        Cliente pedro = cliente("Pedro Alves Nunes", "pedro.nunes", "852.963.741-55", "MG-78.901.234",
                "Rua Sergipe, 300, Funcionários, Belo Horizonte – MG", "Advogado", "Nunes & Associados", "11000");

        Automovel compass = carro("MAT-000871", 2024, "Jeep", "Compass Longitude", "SUV", "ABC1D23", 270, banco);
        Automovel corolla = carro("MAT-000812", 2023, "Toyota", "Corolla XEi", "Sedã", "QWE4R56", 230, locadora);
        Automovel tcross = carro("MAT-000795", 2025, "Volkswagen", "T-Cross Highline", "SUV", "RTY7U89", 240, banco);
        Automovel pulse = carro("MAT-000760", 2024, "Fiat", "Pulse Drive", "SUV", "JKL2M34", 180, locadora);
        Automovel onix = carro("MAT-000702", 2024, "Chevrolet", "Onix Plus Premier", "Sedã", "BNM8K90", 190, locadora);
        Automovel hb20 = carro("MAT-000733", 2023, "Hyundai", "HB20 Comfort", "Hatch", "ZXC5V67", 150, locadora);
        Automovel gr86 = carro("MAT-000690", 2024, "Toyota", "GR86 Premium", "Esportivo", "SPT2G86", 420, locadora);

        LocalDate hoje = LocalDate.now();
        pedido(mariana, compass, banco, hoje.plusDays(7), hoje.plusDays(14), 6, Pedido.Status.EM_ANALISE, null);
        pedido(juliana, corolla, banco, hoje.plusDays(9), hoje.plusDays(39), 10, Pedido.Status.EM_ANALISE, null);
        pedido(rafael, hb20, locadora, hoje.plusDays(11), hoje.plusDays(14), 1, Pedido.Status.EM_ANALISE, null);
        pedido(carlos, corolla, locadora, hoje.plusDays(45), hoje.plusDays(75), 1, Pedido.Status.APROVADO,
                "Renda compatível com o valor do aluguel.");
        pedido(bruno, pulse, banco, hoje.plusDays(3), hoje.plusDays(33), 10, Pedido.Status.REJEITADO,
                "Parcela compromete 36% da renda, acima do limite de 30%.");
        Pedido proposta = pedido(pedro, gr86, locadora, hoje.plusDays(5), hoje.plusDays(10), 1, Pedido.Status.APROVADO,
                "Renda compatível.");
        contrato(proposta, Contrato.Titularidade.EMPRESA, null, Contrato.Status.AGUARDANDO_ACEITE);
        Pedido ativoBanco = pedido(mariana, tcross, banco, hoje.minusDays(20), hoje.plusDays(160), 12, Pedido.Status.APROVADO,
                "Histórico regular. Crédito aprovado.");
        contrato(ativoBanco, Contrato.Titularidade.CLIENTE, new BigDecimal("1.49"), Contrato.Status.ACEITO);
        Pedido ativoEmpresa = pedido(ana, onix, locadora, hoje.minusDays(36), hoje.plusDays(144), 1, Pedido.Status.APROVADO,
                "Renda compatível.");
        contrato(ativoEmpresa, Contrato.Titularidade.EMPRESA, null, Contrato.Status.ACEITO);
    }

    private Agente agente(String nome, String login, Agente.Tipo tipo, String cnpj, String codigo) {
        Agente a = new Agente();
        usuario(a, nome, login);
        a.setTipo(tipo);
        a.setCnpj(cnpj);
        a.setCodigoBanco(codigo);
        em.persist(a);
        return a;
    }

    private Cliente cliente(String nome, String login, String cpf, String rg, String endereco, String profissao,
                            String... rendimentos) {
        Cliente c = new Cliente();
        usuario(c, nome, login);
        c.setCpf(cpf);
        c.setRg(rg);
        c.setEndereco(endereco);
        c.setProfissao(profissao);
        for (int i = 0; i + 1 < rendimentos.length; i += 2) {
            c.getRendimentos().add(new Rendimento(rendimentos[i], new BigDecimal(rendimentos[i + 1])));
        }
        em.persist(c);
        return c;
    }

    private void usuario(Usuario u, String nome, String login) {
        u.setNome(nome);
        u.setLogin(login);
        u.setSenha(AuthService.hash("senha123")); // um hash (e um salt) por usuário
    }

    private Automovel carro(String matricula, int ano, String marca, String modelo, String categoria, String placa,
                            int diaria, Agente dono) {
        Automovel a = new Automovel();
        a.setMatricula(matricula);
        a.setAno(ano);
        a.setMarca(marca);
        a.setModelo(modelo);
        a.setCategoria(categoria);
        a.setPlaca(placa);
        a.setDiaria(BigDecimal.valueOf(diaria));
        a.setProprietario(dono);
        em.persist(a);
        return a;
    }

    private Pedido pedido(Cliente c, Automovel a, Agente agente, LocalDate inicio, LocalDate fim, int parcelas,
                          Pedido.Status status, String parecer) {
        Pedido p = new Pedido();
        p.setCliente(c);
        p.setAutomovel(a);
        p.setAgente(agente);
        p.setInicio(inicio);
        p.setFim(fim);
        p.setLocal("Loja Savassi – BH");
        p.setPagamento(agente.getTipo() == Agente.Tipo.BANCO ? Pedido.Pagamento.CREDITO : Pedido.Pagamento.DIRETO);
        p.setParcelas(parcelas);
        p.setValorTotal(a.getDiaria().multiply(BigDecimal.valueOf(p.getDias())));
        p.setStatus(status);
        p.setParecer(parecer);
        // pedidos de exemplo "chegaram" em horários diferentes, nunca no futuro
        LocalDateTime enviado = inicio.minusDays(5).atTime(14, 20);
        LocalDateTime limite = LocalDateTime.now().minusHours(3L + 17L * a.getId());
        p.setCriadoEm(enviado.isBefore(limite) ? enviado : limite);
        em.persist(p);
        c.getAgentes().add(agente);
        c.getAgentes().add(a.getProprietario());
        return p;
    }

    private void contrato(Pedido p, Contrato.Titularidade titularidade, BigDecimal taxa, Contrato.Status status) {
        Contrato c = new Contrato();
        c.setTitularidade(titularidade);
        c.setTaxaJuros(taxa);
        c.setTexto(ContratoService.textoPadrao(p, titularidade, taxa));
        c.setStatus(status);
        c.setEmitidoEm(p.getCriadoEm().plusDays(1));
        if (status != Contrato.Status.AGUARDANDO_ACEITE) c.setRespondidoEm(p.getCriadoEm().plusDays(2));
        p.setContrato(c);
    }
}
