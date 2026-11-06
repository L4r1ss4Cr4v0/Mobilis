package br.pucminas.mobilis.controller;

import br.pucminas.mobilis.model.Agente;
import br.pucminas.mobilis.model.Cliente;
import br.pucminas.mobilis.model.Rendimento;
import br.pucminas.mobilis.model.Usuario;
import br.pucminas.mobilis.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    public record Login(String login, String senha) {}

    public record Cadastro(String perfil, String nome, String login, String senha,
                           String cpf, String rg, String endereco, String profissao, List<Rendimento> rendimentos,
                           String cnpj, String codigoBanco) {

        Cliente dadosCliente() {
            Cliente c = new Cliente();
            c.setCpf(cpf);
            c.setRg(rg);
            c.setEndereco(endereco);
            c.setProfissao(profissao);
            c.setRendimentos(rendimentos == null ? List.of() : rendimentos);
            return c;
        }
    }

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/login")
    public Usuario login(@RequestBody Login body) {
        return service.login(body.login(), body.senha());
    }

    @PostMapping("/cadastro")
    @ResponseStatus(HttpStatus.CREATED)
    public Usuario cadastrar(@RequestBody Cadastro body) {
        if (body.perfil() == null || body.perfil().equals("CLIENTE")) {
            return service.cadastrarCliente(body.nome(), body.login(), body.senha(), body.dadosCliente());
        }
        return service.cadastrarAgente(body.nome(), body.login(), body.senha(),
                Agente.Tipo.valueOf(body.perfil()), body.cnpj(), body.codigoBanco());
    }
}
