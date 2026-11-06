package br.pucminas.mobilis.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.transaction.CannotCreateTransactionException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice 
public class ErroController {

    private static final Logger log = LoggerFactory.getLogger(ErroController.class);

    @ExceptionHandler (ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> regra(ResponseStatusException e) {
        return resposta(e.getStatusCode().value(), e.getReason());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> conflito(DataIntegrityViolationException e) {
        log.warn("Conflito ao gravar: {}", e.getMostSpecificCause().getMessage());
        return resposta(409, "Já existe um registro com esses dados. Confira e tente novamente.");
    }

    @ExceptionHandler({ CannotCreateTransactionException.class, DataAccessException.class })
    public ResponseEntity<Map<String, Object>> bancoIndisponivel(Exception e) {
        log.error("Falha de acesso ao banco de dados", e);
        return resposta(503, "O serviço está temporariamente indisponível. Tente novamente em alguns instantes.");
    }

    @ExceptionHandler({ HttpMessageNotReadableException.class, MissingServletRequestParameterException.class,
            MethodArgumentTypeMismatchException.class })
    public ResponseEntity<Map<String, Object>> requisicaoInvalida(Exception e) {
        log.warn("Requisição inválida: {}", e.getMessage());
        return resposta(400, "Alguns dados enviados estão em formato inválido. Confira e tente novamente.");
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> arquivoGrande(MaxUploadSizeExceededException e) {
        return resposta(413, "A foto pode ter no máximo 5 MB.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> inesperado(Exception e) {
        log.error("Erro inesperado", e);
        return resposta(500, "Não foi possível concluir a operação. Tente novamente em instantes.");
    }

    private static ResponseEntity<Map<String, Object>> resposta(int status, String mensagem) {
        return ResponseEntity.status(status).body(Map.of("status", status, "message", mensagem));
    }
}