package br.pucminas.mobilis.model;

import jakarta.persistence.Embeddable;

import java.math.BigDecimal;

@Embeddable
public class Rendimento {

    private String entidade;
    private BigDecimal valor;

    public Rendimento() {}

    public Rendimento(String entidade, BigDecimal valor) {
        this.entidade = entidade;
        this.valor = valor;
    }

    public String getEntidade() { return entidade; }
    public void setEntidade(String entidade) { this.entidade = entidade; }
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
}
