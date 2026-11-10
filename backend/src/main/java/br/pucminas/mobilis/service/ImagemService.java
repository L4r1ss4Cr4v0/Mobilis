package br.pucminas.mobilis.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Guarda as fotos dos automóveis no Cloudinary (API REST de upload assinado).
 * O banco do Supabase fica só com o link da imagem.
 * Configuração: CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME no .env do back-end.
 */
@Service
public class ImagemService {

    private static final Pattern SECURE_URL = Pattern.compile("\"secure_url\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern ERRO = Pattern.compile("\"message\"\\s*:\\s*\"([^\"]+)\"");

    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

    public ImagemService(@Value("${app.cloudinary-url:}") String cloudinaryUrl) {
        String nome = null, chave = null, segredo = null;
        if (cloudinaryUrl != null && cloudinaryUrl.startsWith("cloudinary://")) {
            URI uri = URI.create(cloudinaryUrl.trim());
            String[] credenciais = uri.getRawUserInfo() == null ? new String[0] : uri.getRawUserInfo().split(":", 2);
            if (credenciais.length == 2) {
                nome = uri.getHost();
                chave = credenciais[0];
                segredo = credenciais[1];
            }
        }
        this.cloudName = nome;
        this.apiKey = chave;
        this.apiSecret = segredo;
    }

    public boolean configurado() {
        return cloudName != null && apiKey != null && apiSecret != null;
    }

    /** Envia (ou substitui) a foto do automóvel e devolve o link https da imagem. */
    public String enviar(Long automovelId, byte[] bytes, String tipo) {
        checarConfiguracao();
        Map<String, String> params = assinados(Map.of(
                "public_id", publicId(automovelId),
                "overwrite", "true",
                "invalidate", "true",
                "transformation", "c_limit,w_1600,h_1600"));

        String limite = "----mobilis" + UUID.randomUUID();
        ByteArrayOutputStream corpo = new ByteArrayOutputStream();
        params.forEach((k, v) -> escrever(corpo, "--" + limite + "\r\nContent-Disposition: form-data; name=\"" + k + "\"\r\n\r\n" + v + "\r\n"));
        escrever(corpo, "--" + limite + "\r\nContent-Disposition: form-data; name=\"file\"; filename=\"automovel-" + automovelId
                + "\"\r\nContent-Type: " + (tipo == null ? "application/octet-stream" : tipo) + "\r\n\r\n");
        corpo.writeBytes(bytes);
        escrever(corpo, "\r\n--" + limite + "--\r\n");

        HttpRequest req = HttpRequest.newBuilder(endpoint("upload"))
                .timeout(Duration.ofSeconds(60))
                .header("Content-Type", "multipart/form-data; boundary=" + limite)
                .POST(HttpRequest.BodyPublishers.ofByteArray(corpo.toByteArray()))
                .build();
        String resposta = executar(req);
        Matcher m = SECURE_URL.matcher(resposta);
        if (!m.find()) throw indisponivel("O serviço de imagens não devolveu o link da foto.");
        return m.group(1).replace("\\/", "/");
    }

    /** Apaga a foto do automóvel no Cloudinary (ignora se ela não existir). */
    public void remover(Long automovelId) {
        checarConfiguracao();
        Map<String, String> params = assinados(Map.of("public_id", publicId(automovelId), "invalidate", "true"));
        StringBuilder form = new StringBuilder();
        params.forEach((k, v) -> form.append(form.isEmpty() ? "" : "&").append(k).append('=')
                .append(java.net.URLEncoder.encode(v, StandardCharsets.UTF_8)));
        HttpRequest req = HttpRequest.newBuilder(endpoint("destroy"))
                .timeout(Duration.ofSeconds(30))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(form.toString()))
                .build();
        executar(req);
    }

    static String publicId(Long automovelId) {
        return "mobilis/automoveis/automovel-" + automovelId;
    }

    /** Assinatura do Cloudinary: SHA-1 de "a=1&b=2...<api_secret>", com os parâmetros em ordem alfabética. */
    private Map<String, String> assinados(Map<String, String> parametros) {
        TreeMap<String, String> p = new TreeMap<>(parametros);
        p.put("timestamp", String.valueOf(System.currentTimeMillis() / 1000));
        StringBuilder base = new StringBuilder();
        p.forEach((k, v) -> base.append(base.isEmpty() ? "" : "&").append(k).append('=').append(v));
        try {
            byte[] hash = MessageDigest.getInstance("SHA-1").digest((base + apiSecret).getBytes(StandardCharsets.UTF_8));
            p.put("signature", HexFormat.of().formatHex(hash));
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
        p.put("api_key", apiKey);
        return p;
    }

    private String executar(HttpRequest req) {
        try {
            HttpResponse<String> r = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (r.statusCode() >= 400) {
                Matcher m = ERRO.matcher(r.body());
                throw indisponivel("O serviço de imagens recusou a operação" + (m.find() ? ": " + m.group(1) : "."));
            }
            return r.body();
        } catch (java.io.IOException e) {
            throw indisponivel("Não foi possível falar com o serviço de imagens. Tente de novo.");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw indisponivel("O envio da imagem foi interrompido.");
        }
    }

    private URI endpoint(String acao) {
        return URI.create("https://api.cloudinary.com/v1_1/" + cloudName + "/image/" + acao);
    }

    private void checarConfiguracao() {
        if (!configurado()) {
            throw indisponivel("O serviço de imagens não está configurado. Defina CLOUDINARY_URL no .env do back-end.");
        }
    }

    private static ResponseStatusException indisponivel(String msg) {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, msg);
    }

    private static void escrever(ByteArrayOutputStream saida, String texto) {
        saida.writeBytes(texto.getBytes(StandardCharsets.UTF_8));
    }
}
