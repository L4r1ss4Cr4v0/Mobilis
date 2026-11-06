package br.pucminas.mobilis.controller;

import br.pucminas.mobilis.model.Pedido;
import br.pucminas.mobilis.service.PedidoService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    public record DadosPedido(Long clienteId, Long automovelId, Long bancoId, LocalDate inicio, LocalDate fim,
                              String local, Pedido.Pagamento pagamento, Integer parcelas) {}

    public record Parecer(boolean positivo, String parecer) {}

    private final PedidoService service;

    public PedidoController(PedidoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Pedido> listar(@RequestParam(required = false) Long clienteId, @RequestParam(required = false) Long agenteId) {
        if (clienteId != null) return service.doCliente(clienteId);
        if (agenteId != null) return service.doAgente(agenteId);
        throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe clienteId ou agenteId.");
    }

    @GetMapping("/{id}")
    public Pedido buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Pedido criar(@RequestBody DadosPedido b) {
        return service.criar(b.clienteId(), b.automovelId(), b.bancoId(), b.inicio(), b.fim(), b.local(), b.pagamento(), b.parcelas());
    }

    @PutMapping("/{id}")
    public Pedido modificar(@PathVariable Long id, @RequestParam(required = false) Long agenteId, @RequestBody DadosPedido b) {
        if (agenteId != null) return service.modificarPeloAgente(id, agenteId, b.inicio(), b.fim(), b.local(), b.parcelas());
        return service.modificarPeloCliente(id, b.clienteId(), b.bancoId(), b.inicio(), b.fim(), b.local(), b.pagamento(), b.parcelas());
    }

    @PostMapping("/{id}/cancelar")
    public Pedido cancelar(@PathVariable Long id, @RequestParam Long clienteId) {
        return service.cancelar(id, clienteId);
    }

    @PostMapping("/{id}/parecer")
    public Pedido parecer(@PathVariable Long id, @RequestParam Long agenteId, @RequestBody Parecer b) {
        return service.emitirParecer(id, agenteId, b.positivo(), b.parecer());
    }
}
