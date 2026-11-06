package br.pucminas.mobilis.service;

import br.pucminas.mobilis.model.Agente;
import br.pucminas.mobilis.model.Cliente;
import br.pucminas.mobilis.model.Contrato;
import br.pucminas.mobilis.model.Pedido;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import static br.pucminas.mobilis.service.AuthService.erro;
import static br.pucminas.mobilis.service.AuthService.vazio;

/**
 * Contrato a partir de um template padrão: o agente pode editar o texto, os dados do pedido entram
 * automaticamente ({{campos}}) e ele escolhe a titularidade do veículo e, no crédito, a taxa de juros.
 */
@Service
public class ContratoService {

    public static final String MODELO_PADRAO = """
            CONTRATO DE ALUGUEL DE AUTOMÓVEL Nº {{numero}}

            CONTRATADO: {{agente}}, CNPJ {{cnpj}}{{codigoBanco}}.
            CONTRATANTE: {{cliente}}, CPF {{cpf}}, RG {{rg}}, profissão {{profissao}}, residente em {{endereco}}.

            CLÁUSULA 1 – OBJETO
            Aluguel do automóvel {{carro}}, ano {{ano}}, placa {{placa}}, matrícula {{matricula}}.

            CLÁUSULA 2 – PERÍODO
            De {{inicio}} a {{fim}} ({{dias}} diárias), com retirada em {{local}}.

            CLÁUSULA 3 – VALOR E PAGAMENTO
            Valor total de {{valorTotal}}, {{pagamento}}.

            CLÁUSULA 4 – TITULARIDADE
            Durante a vigência deste contrato, o veículo fica registrado em nome de {{titular}}.

            CLÁUSULA 5 – CRÉDITO
            {{credito}}

            CLÁUSULA 6 – ACEITE
            Este contrato só produz efeitos após o aceite do CONTRATANTE na plataforma Mobilis.
            """;

    private static final DateTimeFormatter DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final PedidoService pedidoService;

    public ContratoService(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    /** Template padrão + campos que serão preenchidos automaticamente e as titularidades possíveis. */
    public Map<String, Object> modelo(Long pedidoId, Long agenteId) {
        Pedido p = pedidoService.redatorDoContrato(pedidoId, agenteId);
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("modelo", p.getContrato() != null ? modeloSalvo(p) : MODELO_PADRAO);
        r.put("campos", campos(p, null, null));
        r.put("titularidades", titularidades(p));
        r.put("credito", p.getPagamento() == Pedido.Pagamento.CREDITO);
        return r;
    }

    /** Texto final com o auto-fill, sem salvar (pré-visualização do editor). */
    public String previa(Long pedidoId, Long agenteId, String modelo, Contrato.Titularidade titularidade, BigDecimal taxaJuros) {
        Pedido p = pedidoService.redatorDoContrato(pedidoId, agenteId);
        return preencher(modelo, campos(p, titularidade, taxaJuros));
    }

    /** Disponibiliza o contrato ao cliente (pode ser reemitido enquanto ele não responde). */
    @Transactional
    public Pedido emitir(Long pedidoId, Long agenteId, String modelo, Contrato.Titularidade titularidade, BigDecimal taxaJuros) {
        Pedido p = pedidoService.redatorDoContrato(pedidoId, agenteId);
        if (p.getStatus() != Pedido.Status.APROVADO) throw erro("O contrato só pode ser emitido para pedidos aprovados.");
        if (p.getContrato() != null && p.getContrato().getStatus() != Contrato.Status.AGUARDANDO_ACEITE) {
            throw erro("O cliente já respondeu a este contrato.");
        }
        if (vazio(modelo)) throw erro("O texto do contrato não pode ficar vazio.");
        if (titularidade == null || !titularidades(p).contains(titularidade)) throw erro("Escolha uma titularidade válida para o veículo.");
        boolean credito = p.getPagamento() == Pedido.Pagamento.CREDITO;
        if (credito && (taxaJuros == null || taxaJuros.signum() < 0 || taxaJuros.compareTo(BigDecimal.TEN) > 0)) {
            throw erro("Informe a taxa de juros mensal do crédito (de 0% a 10%).");
        }
        Contrato c = p.getContrato() == null ? new Contrato() : p.getContrato();
        c.setTitularidade(titularidade);
        c.setTaxaJuros(credito ? taxaJuros : null);
        c.setTexto(preencher(modelo, campos(p, titularidade, credito ? taxaJuros : null)));
        c.setStatus(Contrato.Status.AGUARDANDO_ACEITE);
        c.setEmitidoEm(LocalDateTime.now());
        p.setContrato(c);
        return p;
    }

    /** O cliente aceita (efetiva o aluguel) ou recusa (encerra a transação). */
    @Transactional
    public Pedido responder(Long pedidoId, Long clienteId, boolean aceitar) {
        Pedido p = pedidoService.doCliente(pedidoId, clienteId);
        Contrato c = p.getContrato();
        if (p.getStatus() != Pedido.Status.APROVADO || c == null || c.getStatus() != Contrato.Status.AGUARDANDO_ACEITE) {
            throw erro("Não há contrato aguardando sua resposta neste pedido.");
        }
        c.setStatus(aceitar ? Contrato.Status.ACEITO : Contrato.Status.RECUSADO);
        c.setRespondidoEm(LocalDateTime.now());
        return p;
    }

    /** Cliente, ou o dono do carro (empresa/banco), ou o banco do crédito. */
    static List<Contrato.Titularidade> titularidades(Pedido p) {
        Agente dono = p.getAutomovel().getProprietario();
        Contrato.Titularidade doDono = dono.getTipo() == Agente.Tipo.BANCO ? Contrato.Titularidade.BANCO : Contrato.Titularidade.EMPRESA;
        if (p.getPagamento() == Pedido.Pagamento.CREDITO && doDono != Contrato.Titularidade.BANCO) {
            return List.of(Contrato.Titularidade.CLIENTE, doDono, Contrato.Titularidade.BANCO);
        }
        return List.of(Contrato.Titularidade.CLIENTE, doDono);
    }

    private static Map<String, String> campos(Pedido p, Contrato.Titularidade titularidade, BigDecimal taxaJuros) {
        Cliente c = p.getCliente();
        Agente a = p.getAutomovel().getProprietario(); // contratado: o dono do carro, que redige o contrato
        Agente banco = p.getAgente();                 // no crédito: o banco que analisou e concede o crédito
        boolean credito = p.getPagamento() == Pedido.Pagamento.CREDITO;
        Map<String, String> m = new LinkedHashMap<>();
        m.put("numero", String.valueOf(p.getId()));
        m.put("agente", a.getNome());
        m.put("cnpj", a.getCnpj());
        m.put("codigoBanco", a.getTipo() == Agente.Tipo.BANCO ? ", código bancário " + a.getCodigoBanco() : "");
        m.put("cliente", c.getNome());
        m.put("cpf", c.getCpf());
        m.put("rg", c.getRg());
        m.put("profissao", c.getProfissao());
        m.put("endereco", c.getEndereco());
        m.put("carro", p.getAutomovel().getMarca() + " " + p.getAutomovel().getModelo());
        m.put("ano", String.valueOf(p.getAutomovel().getAno()));
        m.put("placa", p.getAutomovel().getPlaca());
        m.put("matricula", p.getAutomovel().getMatricula());
        m.put("inicio", p.getInicio().format(DATA));
        m.put("fim", p.getFim().format(DATA));
        m.put("dias", String.valueOf(p.getDias()));
        m.put("local", p.getLocal() == null ? "local a combinar" : p.getLocal());
        m.put("valorTotal", reais(p.getValorTotal()));
        m.put("pagamento", credito
                ? "financiado em " + p.getParcelas() + " parcelas de " + reais(p.getValorParcela())
                : "pago diretamente ao CONTRATADO");
        m.put("titular", titularidade == null ? "{{titular}}" : nomeTitular(p, titularidade));
        m.put("taxaJuros", !credito ? "não se aplica" : taxaJuros == null ? "{{taxaJuros}}" : taxaJuros.stripTrailingZeros().toPlainString().replace('.', ','));
        m.put("credito", !credito ? "Não se aplica (pagamento direto)."
                : "Contrato de crédito concedido por " + banco.getNome() + " (código bancário " + banco.getCodigoBanco() + "), em "
                + p.getParcelas() + " parcelas de " + reais(p.getValorParcela()) + ", com taxa de juros de "
                + m.get("taxaJuros") + "% ao mês.");
        return m;
    }

    private static String nomeTitular(Pedido p, Contrato.Titularidade t) {
        return switch (t) {
            case CLIENTE -> p.getCliente().getNome() + " (CONTRATANTE)";
            case BANCO -> (p.getAgente().getTipo() == Agente.Tipo.BANCO ? p.getAgente() : p.getAutomovel().getProprietario()).getNome();
            case EMPRESA -> p.getAutomovel().getProprietario().getNome();
        };
    }

    /** Texto do template padrão já preenchido (usado na carga de dados de exemplo). */
    static String textoPadrao(Pedido p, Contrato.Titularidade titularidade, BigDecimal taxaJuros) {
        return preencher(MODELO_PADRAO, campos(p, titularidade, taxaJuros));
    }

    private static String preencher(String modelo, Map<String, String> campos) {
        String texto = modelo;
        for (Map.Entry<String, String> e : campos.entrySet()) {
            texto = texto.replace("{{" + e.getKey() + "}}", e.getValue() == null ? "" : e.getValue());
        }
        return texto;
    }

    /** Ao reabrir o editor de um contrato já emitido, parte do texto emitido. */
    private static String modeloSalvo(Pedido p) {
        return p.getContrato().getTexto();
    }

    private static String reais(BigDecimal v) {
        return NumberFormat.getCurrencyInstance(Locale.of("pt", "BR")).format(v);
    }
}
