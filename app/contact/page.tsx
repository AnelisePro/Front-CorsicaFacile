'use client'

import styles from './page.module.scss'

export default function Contact() {
  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 className={styles.h1}>Contactez-nous</h1>
      
      <p className={styles.sectionText}>
        Vous avez une question, une suggestion ou besoin d'aide ? N'hésitez pas à nous contacter :
      </p>
      
      <ul className={styles.sectionText}>
        <li><strong>Par email :</strong> <a href="mailto:support@corsicafacile.fr">support@corsicafacile.fr</a></li>
        <li><strong>Par téléphone :</strong> +33 1 23 45 67 89</li>
        <li><strong>Adresse :</strong> 123 Rue de la Corse, 20000 Ajaccio, France</li>
      </ul>
      
      <p className={styles.sectionText}>
        Nous nous efforçons de répondre à vos demandes dans les plus brefs délais.
      </p>
    </main>
  )
}


