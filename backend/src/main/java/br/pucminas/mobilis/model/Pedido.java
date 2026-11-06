package br.pucminas.mobilis.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "pedidos")
public class Pedido {

    public enum Status { EM_ANALISE, APROVADO, REJEITADO, CANCELADO }

    public enum Pagamento { DIRETO, CREDITO }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Cliente cliente;

    @ManyToOne(optional = false)
    private Automovel automovel;

    @ManyToOne(optional = false)
    private Agente agente;

    private LocalDate inicio;
    private LocalDate fim;
    private String local;

    @Enumerated(EnumType.STRING)
    private Pagamento pagamento;

    private Integer parcelas;

    private BigDecimal valorTotal;

    @Enumerated(EnumType.STRING)
    private Status status = Status.EM_ANALISE;

    @Column(length = 1000)
    private String parecer;

    private LocalDateTime criadoEm = LocalDateTime.now();

    @OneToOne(cascade = CascadeType.ALL)
    private Contrato contrato;

    public long getDias() {
        return Math.max(1, ChronoUnit.DAYS.between(inicio, fim));
    }

    public BigDecimal getValorParcela() {
        int n = parcelas == null || parcelas < 1 ? 1 : parcelas;
        return valorTotal.divide(BigDecimal.valueOf(n), 2, RoundingMode.HALF_UP);
    }

    public boolean isAtivo() {
        return status == Status.EM_ANALISE
                || (status == Status.APROVADO && (contrato == null || contrato.getStatus() != Contrato.Status.RECUSADO));
    }

    public Long getId() { return id; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public Automovel getAutomovel() { return automovel; }
    public void setAutomovel(Automovel automovel) { this.automovel = automovel; }
    public Agente getAgente() { return agente; }
    public void setAgente(Agente agente) { this.agente = agente; }
    public LocalDate getInicio() { return inicio; }
    public void setInicio(LocalDate inicio) { this.inicio = inicio; }
    public LocalDate getFim() { return fim; }
    public void setFim(LocalDate fim) { this.fim = fim; }
    public String getLocal() { return local; }
    public void setLocal(String local) { this.local = local; }
    public Pagamento getPagamento() { return pagamento; }
    public void setPagamento(Pagamento pagamento) { this.pagamento = pagamento; }
    public Integer getParcelas() { return parcelas; }
    public void setParcelas(Integer parcelas) { this.parcelas = parcelas; }
    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public String getParecer() { return parecer; }
    public void setParecer(String parecer) { this.parecer = parecer; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }
    public Contrato getContrato() { return contrato; }
    public void setContrato(Contrato contrato) { this.contrato = contrato; }
}
