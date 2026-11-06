package br.pucminas.mobilis.service;

import br.pucminas.mobilis.model.Agente;
import br.pucminas.mobilis.model.Cliente;
import br.pucminas.mobilis.model.Rendimento;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static br.pucminas.mobilis.service.AuthService.erro;
import static br.pucminas.mobilis.service.AuthService.naoEncontrado;
import static br.pucminas.mobilis.service.AuthService.proibido;
import static br.pucminas.mobilis.service.AuthService.vazio;

@Service
public class ClienteService {

    private final EntityManager em;
    private final AuthService authService;
    private final AgenteService agenteService;

    public ClienteService(EntityManager em, AuthService authService, AgenteService agenteService) {
        this.em = em;
        this.authService = authService;
        this.agenteService = agenteService;
    }

    /** Só os clientes vinculados ao agente (isolamento de dados entre empresas/bancos). */
    public List<Cliente> listarDoAgente(Long agenteId) {
        return em.createQuery("select c from Cliente c join c.agentes a where a.id = :id order by c.nome", Cliente.class)
                .setParameter("id", agenteId).getResultList();
    }

    public Cliente buscar(Long id) {
        Cliente c = em.find(Cliente.class, id);
        if (c == null) throw naoEncontrado("Cliente não encontrado.");
        return c;
    }

    /** Cliente consultado por um agente: precisa estar vinculado a ele. */
    public Cliente buscarParaAgente(Long id, Long agenteId) {
        Cliente c = buscar(id);
        if (c.getAgentes().stream().noneMatch(a -> a.getId().equals(agenteId))) {
            throw proibido("Este cliente não está vinculado ao seu cadastro.");
        }
        return c;
    }

    /** Cadastro feito pelo agente: o cliente já nasce vinculado a ele. */
    @Transactional
    public Cliente criarPeloAgente(Long agenteId, String nome, String login, String senha, Cliente dados) {
        Agente agente = agenteService.buscar(agenteId);
        Cliente c = authService.cadastrarCliente(nome, login, senha, dados);
        c.getAgentes().add(agente);
        return c;
    }

    /** Atualização pelo próprio cliente (agenteId nulo) ou por um agente vinculado. */
    @Transactional
    public Cliente atualizar(Long id, Long agenteId, Cliente dados) {
        Cliente c = agenteId == null ? buscar(id) : buscarParaAgente(id, agenteId);
        if (!vazio(dados.getNome())) c.setNome(dados.getNome().trim());
        aplicarDados(em, c, dados);
        return c;
    }

    /** O agente tira o cliente da sua carteira; sem pedidos e sem outros vínculos, o cadastro é excluído. */
    @Transactional
    public void remover(Long id, Long agenteId) {
        Cliente c = buscarParaAgente(id, agenteId);
        Long pedidos = em.createQuery("select count(p) from Pedido p where p.cliente = :c", Long.class)
                .setParameter("c", c).getSingleResult();
        if (pedidos > 0) throw erro("Não é possível remover um cliente que já fez pedidos.");
        c.getAgentes().removeIf(a -> a.getId().equals(agenteId));
        if (c.getAgentes().isEmpty()) em.remove(c);
    }

    /** RG, CPF, endereço, profissão e de 1 a 3 rendimentos são obrigatórios. */
    static void aplicarDados(EntityManager em, Cliente c, Cliente dados) {
        String cpf = dados.getCpf() == null ? "" : dados.getCpf().replaceAll("\\D", "");
        if (cpf.length() != 11) throw erro("Informe um CPF válido (11 dígitos).");
        if (vazio(dados.getRg())) throw erro("Informe o RG.");
        if (vazio(dados.getEndereco())) throw erro("Informe o endereço.");
        if (vazio(dados.getProfissao())) throw erro("Informe a profissão.");
        List<Rendimento> rends = dados.getRendimentos() == null ? List.of() : dados.getRendimentos().stream()
                .filter(r -> !vazio(r.getEntidade()) && r.getValor() != null && r.getValor().compareTo(BigDecimal.ZERO) > 0)
                .toList();
        if (rends.isEmpty()) throw erro("Informe ao menos um empregador com o rendimento.");
        if (rends.size() > 3) throw erro("Informe no máximo 3 rendimentos.");

        String formatado = cpf.substring(0, 3) + "." + cpf.substring(3, 6) + "." + cpf.substring(6, 9) + "-" + cpf.substring(9);
        Long mesmoCpf = em.createQuery("select count(x) from Cliente x where x.cpf = :cpf and x.id <> :id", Long.class)
                .setParameter("cpf", formatado).setParameter("id", c.getId() == null ? -1L : c.getId()).getSingleResult();
        if (mesmoCpf > 0) throw erro("Já existe um cliente com esse CPF.");

        c.setCpf(formatado);
        c.setRg(dados.getRg().trim());
        c.setEndereco(dados.getEndereco().trim());
        c.setProfissao(dados.getProfissao().trim());
        c.getRendimentos().clear();
        c.getRendimentos().addAll(rends);
    }
}
