package br.pucminas.mobilis.service;

import br.pucminas.mobilis.model.Agente;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static br.pucminas.mobilis.service.AuthService.erro;
import static br.pucminas.mobilis.service.AuthService.naoEncontrado;
import static br.pucminas.mobilis.service.AuthService.vazio;

@Service
public class AgenteService {

    private final EntityManager em;

    public AgenteService(EntityManager em) {
        this.em = em;
    }

    public List<Agente> listar(Agente.Tipo tipo) {
        if (tipo == null) {
            return em.createQuery("select a from Agente a order by a.nome", Agente.class).getResultList();
        }
        return em.createQuery("select a from Agente a where a.tipo = :t order by a.nome", Agente.class)
                .setParameter("t", tipo).getResultList();
    }

    public Agente buscar(Long id) {
        Agente a = id == null ? null : em.find(Agente.class, id);
        if (a == null) throw naoEncontrado("Agente não encontrado.");
        return a;
    }

    @Transactional
    public Agente atualizar(Long id, String nome, String cnpj, String codigoBanco) {
        Agente a = buscar(id);
        aplicarIdentificacao(a, nome, a.getTipo(), cnpj, codigoBanco);
        return a;
    }

    static void aplicarIdentificacao(Agente a, String nome, Agente.Tipo tipo, String cnpj, String codigoBanco) {
        if (vazio(nome)) throw erro("Informe o nome do agente.");
        if (tipo == null) throw erro("Informe se o agente é empresa ou banco.");
        if (vazio(cnpj)) throw erro("Informe o CNPJ.");
        String codigo = codigoBanco == null ? "" : codigoBanco.replaceAll("\\D", "");
        if (tipo == Agente.Tipo.BANCO && codigo.length() != 3) {
            throw erro("Informe o código bancário (COMPE/BACEN) com 3 dígitos.");
        }
        a.setNome(nome.trim());
        a.setTipo(tipo);
        a.setCnpj(cnpj.trim());
        a.setCodigoBanco(tipo == Agente.Tipo.BANCO ? codigo : null);
    }
}
