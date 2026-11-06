package br.pucminas.mobilis.service;

import br.pucminas.mobilis.model.Agente;
import br.pucminas.mobilis.model.Automovel;
import br.pucminas.mobilis.model.Cliente;
import br.pucminas.mobilis.model.Contrato;
import br.pucminas.mobilis.model.Pedido;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static br.pucminas.mobilis.service.AuthService.erro;
import static br.pucminas.mobilis.service.AuthService.naoEncontrado;
import static br.pucminas.mobilis.service.AuthService.proibido;

@Service
public class PedidoService {

    private final EntityManager em;
    private final ClienteService clienteService;
    private final AgenteService agenteService;
    private final AutomovelService automovelService;

    public PedidoService(EntityManager em, ClienteService clienteService, AgenteService agenteService,
                         AutomovelService automovelService) {
        this.em = em;
        this.clienteService = clienteService;
        this.agenteService = agenteService;
        this.automovelService = automovelService;
    }

    public List<Pedido> doCliente(Long clienteId) {
        return em.createQuery("select p from Pedido p where p.cliente.id = :id order by p.id desc", Pedido.class)
                .setParameter("id", clienteId).getResultList();
    }

    /** Pedidos que o agente analisa e os feitos para os carros dele. */
    public List<Pedido> doAgente(Long agenteId) {
        return em.createQuery("select p from Pedido p where p.agente.id = :id or p.automovel.proprietario.id = :id order by p.id desc",
                Pedido.class).setParameter("id", agenteId).getResultList();
    }

    public Pedido buscar(Long id) {
        Pedido p = em.find(Pedido.class, id);
        if (p == null) throw naoEncontrado("Pedido não encontrado.");
        return p;
    }

    @Transactional
    public Pedido criar(Long clienteId, Long automovelId, Long bancoId, LocalDate inicio, LocalDate fim,
                        String local, Pedido.Pagamento pagamento, Integer parcelas) {
        Cliente cliente = clienteService.buscar(clienteId);
        if (!cliente.isCadastroCompleto()) throw erro("Complete seus dados pessoais e financeiros antes de pedir um carro.");
        Pedido p = new Pedido();
        p.setCliente(cliente);
        p.setAutomovel(automovelService.buscar(automovelId));
        preencher(p, bancoId, inicio, fim, local, pagamento, parcelas);
        em.persist(p);
        vincular(p);
        return p;
    }

    /** O cliente altera o próprio pedido enquanto ele está em análise. */
    @Transactional
    public Pedido modificarPeloCliente(Long id, Long clienteId, Long bancoId, LocalDate inicio, LocalDate fim, String local,
                                       Pedido.Pagamento pagamento, Integer parcelas) {
        Pedido p = doCliente(id, clienteId);
        exigir(p, Pedido.Status.EM_ANALISE, "Só é possível alterar pedidos em análise.");
        preencher(p, bancoId, inicio, fim, local, pagamento, parcelas);
        vincular(p);
        return p;
    }

    /** O agente responsável ajusta datas, local e parcelas antes do parecer. */
    @Transactional
    public Pedido modificarPeloAgente(Long id, Long agenteId, LocalDate inicio, LocalDate fim, String local, Integer parcelas) {
        Pedido p = responsavel(id, agenteId);
        exigir(p, Pedido.Status.EM_ANALISE, "Só é possível alterar pedidos em análise.");
        Long bancoId = p.getPagamento() == Pedido.Pagamento.CREDITO ? p.getAgente().getId() : null;
        preencher(p, bancoId, inicio, fim, local, p.getPagamento(), parcelas);
        return p;
    }

    @Transactional
    public Pedido cancelar(Long id, Long clienteId) {
        Pedido p = doCliente(id, clienteId);
        boolean aceito = p.getContrato() != null && p.getContrato().getStatus() == Contrato.Status.ACEITO;
        if (!p.isAtivo() || aceito) throw erro("Este pedido não pode mais ser cancelado.");
        p.setStatus(Pedido.Status.CANCELADO);
        return p;
    }

    /** Parecer financeiro do agente responsável: positivo aprova, negativo rejeita. */
    @Transactional
    public Pedido emitirParecer(Long id, Long agenteId, boolean positivo, String parecer) {
        Pedido p = responsavel(id, agenteId);
        exigir(p, Pedido.Status.EM_ANALISE, "Este pedido já recebeu parecer.");
        p.setStatus(positivo ? Pedido.Status.APROVADO : Pedido.Status.REJEITADO);
        p.setParecer(parecer);
        return p;
    }

    /** Quem redige e emite o contrato é sempre o dono do carro (no crédito, o banco só analisa). */
    Pedido redatorDoContrato(Long id, Long agenteId) {
        Pedido p = buscar(id);
        if (agenteId == null || !p.getAutomovel().getProprietario().getId().equals(agenteId)) {
            throw proibido("O contrato é redigido pelo proprietário do veículo.");
        }
        return p;
    }

    /** Quem faz a análise financeira/de crédito: o banco do crédito ou, no pagamento direto, o dono do carro. */
    Pedido responsavel(Long id, Long agenteId) {
        Pedido p = buscar(id);
        if (agenteId == null || !p.getAgente().getId().equals(agenteId)) {
            throw proibido("Só o agente responsável pela análise pode fazer isso.");
        }
        return p;
    }

    Pedido doCliente(Long id, Long clienteId) {
        Pedido p = buscar(id);
        if (clienteId == null || !p.getCliente().getId().equals(clienteId)) throw proibido("Este pedido não é seu.");
        return p;
    }

    /** O cliente passa a fazer parte da carteira do agente que analisa e do dono do carro. */
    private void vincular(Pedido p) {
        p.getCliente().getAgentes().add(p.getAgente());
        p.getCliente().getAgentes().add(p.getAutomovel().getProprietario());
    }

    private void preencher(Pedido p, Long bancoId, LocalDate inicio, LocalDate fim, String local,
                           Pedido.Pagamento pagamento, Integer parcelas) {
        if (inicio == null || fim == null || !fim.isAfter(inicio)) throw erro("A devolução precisa ser depois da retirada.");
        if (inicio.isBefore(LocalDate.now())) throw erro("A retirada não pode ser no passado.");
        if (pagamento == null) throw erro("Escolha a forma de pagamento.");
        Automovel carro = p.getAutomovel();
        if (!automovelService.livre(carro, inicio, fim, p.getId())) throw erro("O carro já está reservado nessas datas.");

        if (pagamento == Pedido.Pagamento.CREDITO) {
            // contrato de crédito: o banco escolhido analisa e emite o contrato
            if (bancoId == null) throw erro("Escolha o banco do contrato de crédito.");
            Agente banco = agenteService.buscar(bancoId);
            if (banco.getTipo() != Agente.Tipo.BANCO) throw erro("O contrato de crédito precisa ser com um banco.");
            if (parcelas == null || parcelas < 1 || parcelas > 12) throw erro("Escolha de 1 a 12 parcelas.");
            p.setAgente(banco);
            p.setParcelas(parcelas);
        } else {
            // pagamento direto: quem analisa é o dono do carro
            p.setAgente(carro.getProprietario());
            p.setParcelas(1);
        }
        p.setInicio(inicio);
        p.setFim(fim);
        p.setLocal(local);
        p.setPagamento(pagamento);
        p.setValorTotal(carro.getDiaria().multiply(BigDecimal.valueOf(p.getDias())));
    }

    private static void exigir(Pedido p, Pedido.Status status, String msg) {
        if (p.getStatus() != status) throw erro(msg);
    }
}
