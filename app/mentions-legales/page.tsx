'use client'

import styles from './page.module.scss'

export default function MentionsLegales() {
  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 className={styles.h1}>Mentions légales</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Éditeur du site</h2>
        <p className={styles.sectionText}><strong>CorsicaFacile</strong></p>
        <p className={styles.sectionText}>Adresse : 12 Rue de l'Artisanat, 20000 Ajaccio, Corse, France</p>
        <p className={styles.sectionText}>Téléphone : 04 95 00 00 00</p>
        <p className={styles.sectionText}>Email : support@corsicafacile.fr</p>
        <p className={styles.sectionText}>Directeur de la publication : Jean Dupont</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Hébergement</h2>
        <p className={styles.sectionText}>Le site CorsicaFacile est hébergé par :</p>
        <p className={styles.sectionText}><strong>Render pour le backend et Vercel pour le frontend</strong></p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Propriété intellectuelle</h2>
        <p className={styles.sectionText}>
          L'ensemble du contenu présent sur ce site (textes, images, logos, vidéos, graphiques, etc.) est la propriété exclusive de CorsicaFacile, sauf mentions contraires.
          Toute reproduction, distribution, modification, adaptation, retransmission ou publication, même partielle, de ces différents éléments est strictement interdite sans l'accord exprès par écrit de CorsicaFacile.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Responsabilité</h2>
        <p className={styles.sectionText}>
          CorsicaFacile met tout en œuvre pour assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, CorsicaFacile ne peut garantir l'exactitude, la complétude ou l'actualité des informations fournies.
          L'utilisateur reconnaît utiliser ces informations sous sa responsabilité exclusive.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Protection des données personnelles</h2>
        <p className={styles.sectionText}>
          CorsicaFacile collecte et traite les données personnelles des utilisateurs conformément à la réglementation en vigueur, notamment le Règlement Général sur la Protection des Données (RGPD).
          Pour plus d'informations, veuillez consulter notre <a href="/confidentialite">Politique de confidentialité</a>.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Cookies</h2>
        <p className={styles.sectionText}>
          Ce site utilise des cookies pour améliorer votre expérience utilisateur. En poursuivant votre navigation, vous acceptez l'utilisation de ces cookies.
          Vous pouvez gérer vos préférences relatives aux cookies à tout moment via les paramètres de votre navigateur.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Droit applicable</h2>
        <p className={styles.sectionText}>
          Les présentes mentions légales sont soumises au droit français.
          En cas de litige, les tribunaux français seront seuls compétents.
        </p>
      </section>
    </main>
  )
}



