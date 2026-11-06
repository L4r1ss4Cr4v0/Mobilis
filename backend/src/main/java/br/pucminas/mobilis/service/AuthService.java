package br.pucminas.mobilis.service;

import br.pucminas.mobilis.model.Agente;
import br.pucminas.mobilis.model.Cliente;
import br.pucminas.mobilis.model.Usuario;
import jakarta.persistence.EntityManager;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AuthService {

    private static final BCryptPasswordEncoder BCRYPT = new BCryptPasswordEncoder();

    private final EntityManager em;

    public AuthService(EntityManager em) {
        this.em = em;
    }

    public Usuario login(String login, String senha) {
        Usuario u = buscarPorLogin(login);
        if (u == null || senha == null || !BCRYPT.matches(senha, u.getSenha())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário ou senha inválidos.");
        }
        return u;
    }

    @Transactional
    public Cliente cadastrarCliente(String nome, String login, String senha, Cliente dados) {
        Cliente c = new Cliente();
        preencher(c, nome, login, senha);
        ClienteService.aplicarDados(em, c, dados);
        em.persist(c);
        return c;
    }

    @Transactional
    public Agente cadastrarAgente(String nome, String login, String senha, Agente.Tipo tipo, String cnpj, String codigoBanco) {
        Agente a = new Agente();
        preencher(a, nome, login, senha);
        AgenteService.aplicarIdentificacao(a, nome, tipo, cnpj, codigoBanco);
        em.persist(a);
        return a;
    }

    private void preencher(Usuario u, String nome, String login, String senha) {
        if (vazio(nome) || vazio(login)) throw erro("Informe nome e usuário.");
        if (senha == null || senha.length() < 6) throw erro("A senha precisa ter pelo menos 6 caracteres.");
        if (buscarPorLogin(login) != null) throw erro("Esse usuário já está em uso.");
        u.setNome(nome.trim());
        u.setLogin(login.trim().toLowerCase());
        u.setSenha(hash(senha));
    }

    private Usuario buscarPorLogin(String login) {
        if (login == null) return null;
        List<Usuario> r = em.createQuery("select u from Usuario u where u.login = :l", Usuario.class)
                .setParameter("l", login.trim().toLowerCase()).getResultList();
        return r.isEmpty() ? null : r.get(0);
    }

    static String hash(String senha) {
        return BCRYPT.encode(senha);
    }

    static boolean vazio(String s) { return s == null || s.isBlank(); }

    static ResponseStatusException erro(String msg) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, msg);
    }

    static ResponseStatusException naoEncontrado(String msg) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, msg);
    }

    static ResponseStatusException proibido(String msg) {
        return new ResponseStatusException(HttpStatus.FORBIDDEN, msg);
    }
}
