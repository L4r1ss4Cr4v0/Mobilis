package br.pucminas.mobilis.service;

import jakarta.persistence.EntityManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;

/**
 * Migração única: as fotos que ainda estão gravadas no Supabase (colunas foto/foto_tipo de automoveis)
 * vão para o Cloudinary, o banco fica só com o link e as colunas antigas são removidas.
 * Se o Cloudinary não estiver configurado ou algo falhar, nada é apagado e a migração roda de novo no próximo início.
 */
@Service
public class MigracaoFotosService implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(MigracaoFotosService.class);

    private final EntityManager em;
    private final ImagemService imagens;
    private final TransactionTemplate transacao;

    public MigracaoFotosService(EntityManager em, ImagemService imagens, PlatformTransactionManager transacoes) {
        this.em = em;
        this.imagens = imagens;
        this.transacao = new TransactionTemplate(transacoes);
    }

    @Override
    public void run(String... args) {
        try {
            transacao.executeWithoutResult(status -> migrar());
        } catch (RuntimeException e) {
            // não derruba a aplicação: as colunas antigas continuam no banco até a próxima tentativa
            log.error("A migração das fotos para o Cloudinary falhou e será tentada de novo no próximo início: {}", e.getMessage());
        }
    }

    private void migrar() {
        boolean temColunaAntiga = !em.createNativeQuery(
                "select 1 from information_schema.columns where table_name = 'automoveis' and column_name = 'foto'")
                .getResultList().isEmpty();
        if (!temColunaAntiga) return;

        if (!imagens.configurado()) {
            log.warn("Há fotos guardadas no banco, mas CLOUDINARY_URL não está definido: a migração das fotos foi adiada.");
            return;
        }

        @SuppressWarnings("unchecked")
        List<Object[]> fotos = em.createNativeQuery(
                "select id, foto, foto_tipo from automoveis where foto is not null").getResultList();
        for (Object[] linha : fotos) {
            Long id = ((Number) linha[0]).longValue();
            String url = imagens.enviar(id, (byte[]) linha[1], (String) linha[2]);
            em.createNativeQuery("update automoveis set foto_url = :url where id = :id")
                    .setParameter("url", url).setParameter("id", id).executeUpdate();
        }
        em.createNativeQuery("alter table automoveis drop column foto, drop column if exists foto_tipo").executeUpdate();
        log.info("{} foto(s) migradas para o Cloudinary; colunas antigas removidas do banco.", fotos.size());
    }
}
