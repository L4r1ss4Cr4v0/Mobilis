package br.pucminas.mobilis.service;

import br.pucminas.mobilis.model.Automovel;
import br.pucminas.mobilis.model.Contrato;
import br.pucminas.mobilis.model.Pedido;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static br.pucminas.mobilis.service.AuthService.erro;
import static br.pucminas.mobilis.service.AuthService.naoEncontrado;
import static br.pucminas.mobilis.service.AuthService.proibido;
import static br.pucminas.mobilis.service.AuthService.vazio;

@Service
public class AutomovelService {

    private final EntityManager em;
    private final AgenteService agenteService;

    public AutomovelService(EntityManager em, AgenteService agenteService) {
        this.em = em;
        this.agenteService = agenteService;
    }

    public List<Automovel> listar(Long agenteId, LocalDate inicio, LocalDate fim) {
        List<Automovel> carros = agenteId == null
                ? em.createQuery("select a from Automovel a order by a.diaria", Automovel.class).getResultList()
                : em.createQuery("select a from Automovel a where a.proprietario.id = :id order by a.diaria", Automovel.class)
                        .setParameter("id", agenteId).getResultList();
        List<Pedido> ativos = pedidosAtivos();
        LocalDate hoje = LocalDate.now();
        for (Automovel a : carros) {
            List<Pedido> doCarro = ativos.stream().filter(p -> p.getAutomovel().getId().equals(a.getId())).toList();
            if (doCarro.stream().anyMatch(p -> p.getContrato() != null && p.getContrato().getStatus() == Contrato.Status.ACEITO
                    && !hoje.isBefore(p.getInicio()) && !hoje.isAfter(p.getFim()))) {
                a.setSituacao("ALUGADO");
            } else if (doCarro.stream().anyMatch(p -> !p.getFim().isBefore(hoje))) {
                a.setSituacao("RESERVADO");
            }
        }
        if (inicio == null || fim == null) return carros;
        return carros.stream().filter(a -> livre(a, inicio, fim, null)).toList();
    }

    public Automovel buscar(Long id) {
        Automovel a = em.find(Automovel.class, id);
        if (a == null) throw naoEncontrado("Automóvel não encontrado.");
        return a;
    }

    public boolean livre(Automovel a, LocalDate inicio, LocalDate fim, Long ignorarPedido) {
        return pedidosAtivos().stream()
                .filter(p -> p.getAutomovel().getId().equals(a.getId()))
                .filter(p -> !p.getId().equals(ignorarPedido))
                .noneMatch(p -> inicio.isBefore(p.getFim()) && fim.isAfter(p.getInicio()));
    }

    @Transactional
    public Automovel criar(Long agenteId, Automovel dados) {
        Automovel a = new Automovel();
        copiar(dados, a);
        checarDuplicado(a, null);
        a.setProprietario(agenteService.buscar(agenteId));
        em.persist(a);
        return a;
    }

    @Transactional
    public Automovel atualizar(Long id, Long agenteId, Automovel dados) {
        Automovel a = doAgente(id, agenteId);
        copiar(dados, a);
        checarDuplicado(a, id);
        return a;
    }

    @Transactional
    public void excluir(Long id, Long agenteId) {
        Automovel a = doAgente(id, agenteId);
        Long pedidos = em.createQuery("select count(p) from Pedido p where p.automovel = :a", Long.class)
                .setParameter("a", a).getSingleResult();
        if (pedidos > 0) throw erro("Este automóvel já tem pedidos e não pode ser excluído.");
        em.remove(a);
    }

    @Transactional
    public Automovel salvarFoto(Long id, Long agenteId, List<MultipartFile> arquivos) {
        Automovel a = doAgente(id, agenteId);
        if (arquivos == null || arquivos.isEmpty()) throw erro("Escolha uma imagem.");
        if (arquivos.size() > 1) throw erro("Envie apenas 1 imagem por automóvel.");
        MultipartFile arq = arquivos.get(0);
        String tipo = arq.getContentType();
        if (tipo == null || !tipo.startsWith("image/")) throw erro("Envie apenas imagens (JPG, PNG ou WEBP).");
        try {
            a.setFoto(arq.getBytes());
        } catch (IOException e) {
            throw erro("Não foi possível ler a imagem enviada.");
        }
        a.setFotoTipo(tipo);
        return a;
    }

    @Transactional
    public Automovel removerFoto(Long id, Long agenteId) {
        Automovel a = doAgente(id, agenteId);
        a.setFoto(null);
        a.setFotoTipo(null);
        return a;
    }

    private Automovel doAgente(Long id, Long agenteId) {
        Automovel a = buscar(id);
        if (agenteId == null || !a.getProprietario().getId().equals(agenteId)) {
            throw proibido("Só o proprietário pode alterar este automóvel.");
        }
        return a;
    }

    private void checarDuplicado(Automovel a, Long id) {
        Long n = em.createQuery("select count(x) from Automovel x where (x.placa = :p or x.matricula = :m) and x.id <> :id", Long.class)
                .setParameter("p", a.getPlaca()).setParameter("m", a.getMatricula())
                .setParameter("id", id == null ? -1L : id).getSingleResult();
        if (n > 0) throw erro("Já existe um automóvel com essa placa ou matrícula.");
    }

    private List<Pedido> pedidosAtivos() {
        return em.createQuery("select p from Pedido p where p.status in :s", Pedido.class)
                .setParameter("s", List.of(Pedido.Status.EM_ANALISE, Pedido.Status.APROVADO))
                .getResultList().stream().filter(Pedido::isAtivo).toList();
    }

    private static void copiar(Automovel de, Automovel para) {
        if (vazio(de.getMatricula()) || vazio(de.getPlaca()) || vazio(de.getMarca()) || vazio(de.getModelo())) {
            throw erro("Preencha matrícula, placa, marca e modelo.");
        }
        if (de.getAno() == null || de.getAno() < 1950 || de.getAno() > LocalDate.now().getYear() + 1) {
            throw erro("Informe um ano válido.");
        }
        if (de.getDiaria() == null || de.getDiaria().compareTo(BigDecimal.ZERO) <= 0) throw erro("Informe o valor da diária.");
        para.setMatricula(de.getMatricula().trim());
        para.setPlaca(de.getPlaca().trim().toUpperCase());
        para.setMarca(de.getMarca().trim());
        para.setModelo(de.getModelo().trim());
        para.setCategoria(de.getCategoria());
        para.setAno(de.getAno());
        para.setDiaria(de.getDiaria());
    }
}
