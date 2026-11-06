package br.pucminas.mobilis.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@DiscriminatorValue("CLIENTE")
public class Cliente extends Usuario {

    private String cpf;
    private String rg;
    private String endereco;
    private String profissao;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "rendimentos")
    private List<Rendimento> rendimentos = new ArrayList<>();

    @JsonIgnore
    @ManyToMany
    @JoinTable(name = "vinculos")
    private Set<Agente> agentes = new HashSet<>();

    @Override
    public String getPerfil() { return "CLIENTE"; }

    public boolean isCadastroCompleto() {
        return preenchido(cpf) && preenchido(rg) && preenchido(endereco) && preenchido(profissao) && !rendimentos.isEmpty();
    }

    public BigDecimal getRendaTotal() {
        return rendimentos.stream().map(Rendimento::getValor).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static boolean preenchido(String s) { return s != null && !s.isBlank(); }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public String getRg() { return rg; }
    public void setRg(String rg) { this.rg = rg; }
    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
    public String getProfissao() { return profissao; }
    public void setProfissao(String profissao) { this.profissao = profissao; }
    public List<Rendimento> getRendimentos() { return rendimentos; }
    public void setRendimentos(List<Rendimento> rendimentos) { this.rendimentos = rendimentos; }
    public Set<Agente> getAgentes() { return agentes; }
}
