package br.pucminas.mobilis.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "contratos")
public class Contrato {

    public enum Status { AGUARDANDO_ACEITE, ACEITO, RECUSADO }

    public enum Titularidade { CLIENTE, EMPRESA, BANCO }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private Titularidade titularidade;

    private BigDecimal taxaJuros;

    @Column(length = 20_000)
    private String texto;

    @Enumerated(EnumType.STRING)
    private Status status = Status.AGUARDANDO_ACEITE;

    private LocalDateTime emitidoEm = LocalDateTime.now();
    private LocalDateTime respondidoEm;

    public Long getId() { return id; }
    public Titularidade getTitularidade() { return titularidade; }
    public void setTitularidade(Titularidade titularidade) { this.titularidade = titularidade; }
    public BigDecimal getTaxaJuros() { return taxaJuros; }
    public void setTaxaJuros(BigDecimal taxaJuros) { this.taxaJuros = taxaJuros; }
    public String getTexto() { return texto; }
    public void setTexto(String texto) { this.texto = texto; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public LocalDateTime getEmitidoEm() { return emitidoEm; }
    public void setEmitidoEm(LocalDateTime emitidoEm) { this.emitidoEm = emitidoEm; }
    public LocalDateTime getRespondidoEm() { return respondidoEm; }
    public void setRespondidoEm(LocalDateTime respondidoEm) { this.respondidoEm = respondidoEm; }
}
