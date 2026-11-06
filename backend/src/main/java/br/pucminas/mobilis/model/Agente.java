package br.pucminas.mobilis.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

@Entity
@DiscriminatorValue("AGENTE")
public class Agente extends Usuario {

    public enum Tipo { EMPRESA, BANCO }

    @Enumerated(EnumType.STRING)
    private Tipo tipo;

    private String cnpj;

    private String codigoBanco;

    @Override
    public String getPerfil() { return tipo == null ? "EMPRESA" : tipo.name(); }

    public Tipo getTipo() { return tipo; }
    public void setTipo(Tipo tipo) { this.tipo = tipo; }
    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }
    public String getCodigoBanco() { return codigoBanco; }
    public void setCodigoBanco(String codigoBanco) { this.codigoBanco = codigoBanco; }
}
