package br.pucminas.mobilis.controller;

import br.pucminas.mobilis.model.Contrato;
import br.pucminas.mobilis.model.Pedido;
import br.pucminas.mobilis.service.ContratoService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/api/pedidos/{id}/contrato")
public class ContratoController {

    public record Emissao(String modelo, Contrato.Titularidade titularidade, BigDecimal taxaJuros) {}

    public record Resposta(boolean aceitar) {}

    private final ContratoService service;

    public ContratoController(ContratoService service) {
        this.service = service;
    }

    @GetMapping("/modelo")
    public Map<String, Object> modelo(@PathVariable Long id, @RequestParam Long agenteId) {
        return service.modelo(id, agenteId);
    }

    @PostMapping("/previa")
    public Map<String, String> previa(@PathVariable Long id, @RequestParam Long agenteId, @RequestBody Emissao b) {
        return Map.of("texto", service.previa(id, agenteId, b.modelo(), b.titularidade(), b.taxaJuros()));
    }

    @PostMapping
    public Pedido emitir(@PathVariable Long id, @RequestParam Long agenteId, @RequestBody Emissao b) {
        return service.emitir(id, agenteId, b.modelo(), b.titularidade(), b.taxaJuros());
    }

    @PostMapping("/resposta")
    public Pedido responder(@PathVariable Long id, @RequestParam Long clienteId, @RequestBody Resposta b) {
        return service.responder(id, clienteId, b.aceitar());
    }
}
