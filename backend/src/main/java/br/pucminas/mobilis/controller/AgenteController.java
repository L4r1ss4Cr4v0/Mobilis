package br.pucminas.mobilis.controller;

import br.pucminas.mobilis.model.Agente;
import br.pucminas.mobilis.service.AgenteService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/agentes")
public class AgenteController {

    public record Identificacao(String nome, String cnpj, String codigoBanco) {}

    private final AgenteService service;

    public AgenteController(AgenteService service) {
        this.service = service;
    }

    @GetMapping
    public List<Agente> listar(@RequestParam(required = false) Agente.Tipo tipo) {
        return service.listar(tipo);
    }

    @GetMapping("/{id}")
    public Agente buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @PutMapping("/{id}")
    public Agente atualizar(@PathVariable Long id, @RequestBody Identificacao body) {
        return service.atualizar(id, body.nome(), body.cnpj(), body.codigoBanco());
    }
}
