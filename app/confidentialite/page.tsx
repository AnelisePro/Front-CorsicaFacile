import styles from './page.module.scss'

export default function Confidentialite() {
  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 className={styles.h1}>Politique de confidentialité</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Introduction</h2>
        <p className={styles.sectionText}>
          CorsicaFacile accorde une grande importance à la protection de vos données personnelles.
          Cette politique de confidentialité explique quelles données nous collectons, comment nous les utilisons, et vos droits.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Données collectées</h2>
        <p className={styles.sectionText}>
          Nous collectons uniquement les données nécessaires pour vous fournir nos services, telles que :
        </p>
        <ul className={styles.sectionText}>
          <li>Nom, prénom, coordonnées (email, téléphone)</li>
          <li>Informations relatives à vos besoins ou vos projets</li>
          <li>Données techniques liées à votre navigation (cookies, adresse IP)</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Utilisation des données</h2>
        <p className={styles.sectionText}>
          Les données collectées sont utilisées pour :
        </p>
        <ul className={styles.sectionText}>
          <li>Gérer votre compte et faciliter la mise en relation avec les artisans</li>
          <li>Améliorer nos services et personnaliser votre expérience</li>
          <li>Vous envoyer des communications liées au service (notifications, mises à jour)</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Partage des données</h2>
        <p className={styles.sectionText}>
          Vos données ne sont pas vendues à des tiers. Elles peuvent être partagées avec des partenaires uniquement dans le cadre de la réalisation de votre projet.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Sécurité</h2>
        <p className={styles.sectionText}>
          CorsicaFacile met en place des mesures techniques et organisationnelles pour protéger vos données contre tout accès non autorisé, modification ou divulgation.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Vos droits</h2>
        <p className={styles.sectionText}>
          Vous disposez des droits suivants concernant vos données personnelles :
        </p>
        <ul className={styles.sectionText}>
          <li>Droit d’accès, de rectification et de suppression</li>
          <li>Droit de limiter ou de vous opposer au traitement</li>
          <li>Droit à la portabilité des données</li>
          <li>Droit de retirer votre consentement à tout moment</li>
        </ul>
        <p className={styles.sectionText}>
          Pour exercer vos droits, vous pouvez nous contacter à l’adresse : <a href="mailto:contact@corsicafacile.com">contact@corsicafacile.com</a>.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Cookies</h2>
        <p className={styles.sectionText}>
          Notre site utilise des cookies pour améliorer votre navigation. Vous pouvez gérer vos préférences dans les paramètres de votre navigateur.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Modifications de la politique</h2>
        <p className={styles.sectionText}>
          Cette politique de confidentialité peut être mise à jour régulièrement. Nous vous invitons à la consulter fréquemment.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Contact</h2>
        <p className={styles.sectionText}>
          Pour toute question concernant vos données personnelles, vous pouvez nous contacter à l’adresse ci-dessus.
        </p>
      </section>
    </main>
  )
}


