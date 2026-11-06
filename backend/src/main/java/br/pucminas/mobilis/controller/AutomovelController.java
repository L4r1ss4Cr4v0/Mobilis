package br.pucminas.mobilis.controller;

import br.pucminas.mobilis.model.Automovel;
import br.pucminas.mobilis.service.AutomovelService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
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

import java.time.LocalDate;
import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/automoveis")
public class AutomovelController {

    private final AutomovelService service;

    public AutomovelController(AutomovelService service) {
        this.service = service;
    }

    @GetMapping
    public List<Automovel> listar(@RequestParam(required = false) Long agenteId,
                                  @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
                                  @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return service.listar(agenteId, inicio, fim);
    }

    @GetMapping("/{id}")
    public Automovel buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Automovel criar(@RequestParam Long agenteId, @RequestBody Automovel dados) {
        return service.criar(agenteId, dados);
    }

    @PutMapping("/{id}")
    public Automovel atualizar(@PathVariable Long id, @RequestParam Long agenteId, @RequestBody Automovel dados) {
        return service.atualizar(id, agenteId, dados);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id, @RequestParam Long agenteId) {
        service.excluir(id, agenteId);
    }

    @PutMapping(value = "/{id}/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Automovel enviarFoto(@PathVariable Long id, @RequestParam Long agenteId, @RequestParam("foto") List<MultipartFile> foto) {
        return service.salvarFoto(id, agenteId, foto);
    }

    @GetMapping("/{id}/foto")
    public ResponseEntity<byte[]> foto(@PathVariable Long id) {
        Automovel a = service.buscar(id);
        if (a.getFoto() == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(a.getFotoTipo())).body(a.getFoto());
    }

    @DeleteMapping("/{id}/foto")
    public Automovel removerFoto(@PathVariable Long id, @RequestParam Long agenteId) {
        return service.removerFoto(id, agenteId);
    }
}
