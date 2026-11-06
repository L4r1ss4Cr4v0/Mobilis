package br.pucminas.mobilis.controller;

import br.pucminas.mobilis.model.Cliente;
import br.pucminas.mobilis.service.ClienteService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService service;

    public ClienteController(ClienteService service) {
        this.service = service;
    }

    @GetMapping
    public List<Cliente> listar(@RequestParam Long agenteId) {
        return service.listarDoAgente(agenteId);
    }

    @GetMapping("/{id}")
    public Cliente buscar(@PathVariable Long id, @RequestParam(required = false) Long agenteId) {
        return agenteId == null ? service.buscar(id) : service.buscarParaAgente(id, agenteId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Cliente criar(@RequestParam Long agenteId, @RequestBody AuthController.Cadastro body) {
        return service.criarPeloAgente(agenteId, body.nome(), body.login(), body.senha(), body.dadosCliente());
    }

    @PutMapping("/{id}")
    public Cliente atualizar(@PathVariable Long id, @RequestParam(required = false) Long agenteId, @RequestBody Cliente dados) {
        return service.atualizar(id, agenteId, dados);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable Long id, @RequestParam Long agenteId) {
        service.remover(id, agenteId);
    }
}
