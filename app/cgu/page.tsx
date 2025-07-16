import styles from './page.module.scss'

export default function CGU() {
  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 className={styles.h1}>Conditions Générales d'Utilisation</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1. Objet</h2>
        <p className={styles.sectionText}>
          Les présentes conditions générales d’utilisation régissent l’accès et l’utilisation du site CorsicaFacile.
          En utilisant ce site, vous acceptez sans réserve ces conditions.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>2. Accès au site</h2>
        <p className={styles.sectionText}>
          Le site est accessible 24h/24, 7j/7, sauf interruption pour maintenance ou force majeure.
          CorsicaFacile se réserve le droit de modifier, suspendre ou interrompre le site sans préavis.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>3. Utilisation du service</h2>
        <p className={styles.sectionText}>
          CorsicaFacile met en relation des clients et des artisans pour faciliter la réalisation de projets.
          Chaque utilisateur s’engage à fournir des informations exactes, à respecter les autres utilisateurs, et à ne pas utiliser le site à des fins illégales.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>4. Responsabilité</h2>
        <p className={styles.sectionText}>
          CorsicaFacile agit en tant qu’intermédiaire et ne peut être tenu responsable des relations contractuelles ou des litiges entre clients et artisans.
          L’utilisation du site se fait sous la responsabilité exclusive de l’utilisateur.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>5. Propriété intellectuelle</h2>
        <p className={styles.sectionText}>
          Tous les contenus du site (textes, images, logos, etc.) sont la propriété exclusive de CorsicaFacile ou de ses partenaires.
          Toute reproduction ou utilisation non autorisée est interdite.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>6. Données personnelles</h2>
        <p className={styles.sectionText}>
          La collecte et le traitement des données personnelles sont réalisés conformément à la <a href="/confidentialite">politique de confidentialité</a> du site.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>7. Modification des CGU</h2>
        <p className={styles.sectionText}>
          CorsicaFacile se réserve le droit de modifier à tout moment les présentes CGU. Les utilisateurs sont invités à les consulter régulièrement.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>8. Loi applicable et juridiction</h2>
        <p className={styles.sectionText}>
          Les présentes CGU sont régies par le droit français. En cas de litige, les tribunaux français seront compétents.
        </p>
      </section>
    </main>
  )
}


