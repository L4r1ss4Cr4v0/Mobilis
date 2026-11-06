package br.pucminas.mobilis.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

import java.math.BigDecimal;

@Entity
@Table(name = "automoveis")
public class Automovel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String matricula;

    private Integer ano;
    private String marca;
    private String modelo;

    @Column(nullable = false, unique = true)
    private String placa;

    private String categoria;

    private BigDecimal diaria;

    @ManyToOne
    private Agente proprietario;

    @JsonIgnore
    @Column(length = 6_000_000)
    private byte[] foto;

    @JsonIgnore
    private String fotoTipo;

    @Transient
    private String situacao = "DISPONIVEL";

    public boolean isTemFoto() { return foto != null; }

    public Long getId() { return id; }
    public String getMatricula() { return matricula; }
    public void setMatricula(String matricula) { this.matricula = matricula; }
    public Integer getAno() { return ano; }
    public void setAno(Integer ano) { this.ano = ano; }
    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }
    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }
    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public BigDecimal getDiaria() { return diaria; }
    public void setDiaria(BigDecimal diaria) { this.diaria = diaria; }
    public Agente getProprietario() { return proprietario; }
    public void setProprietario(Agente proprietario) { this.proprietario = proprietario; }
    public byte[] getFoto() { return foto; }
    public void setFoto(byte[] foto) { this.foto = foto; }
    public String getFotoTipo() { return fotoTipo; }
    public void setFotoTipo(String fotoTipo) { this.fotoTipo = fotoTipo; }
    public String getSituacao() { return situacao; }
    public void setSituacao(String situacao) { this.situacao = situacao; }
}
