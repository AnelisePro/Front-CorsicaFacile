'use client'

import styles from './page.module.scss'

export default function Formules() {
  return (
    <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 className={styles.h1}>Nos Formules Artisans</h1>

      <p className={styles.intro}>
        Choisissez la formule qui correspond le mieux à vos besoins.
      </p>

      <div className={styles.cards}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Standard</h2>
          <div className={styles.cardContent}>
            <ul className={styles.cardList}>
              <li><span className={styles.bullet}>✔</span> Accès aux annonces</li>
              <li><span className={styles.bullet}>✔</span> Réponse limitée à 3 annonces par mois</li>
              <li><span className={styles.bullet}>✔</span> Visibilité de base sur la plateforme</li>
            </ul>
          </div>
          <p className={styles.cardPrice}>29,99 € / mois</p>
        </div>

        <div className={`${styles.card} ${styles.recommended}`}>
          <div className={styles.tag}>Recommandée</div>
          <h2 className={styles.cardTitle}>Pro</h2>
          <div className={styles.cardContent}>
            <ul className={styles.cardList}>
              <li><span className={styles.bullet}>✔</span> Accès aux annonces</li>
              <li><span className={styles.bullet}>✔</span> Réponse limitée à 6 annonces par mois</li>
              <li><span className={styles.bullet}>✔</span> Visibilité renforcée dans les recherches</li>
              <li><span className={styles.bullet}>✔</span> Statistiques limitées</li>
            </ul>
          </div>
          <p className={styles.cardPrice}>49,99 € / mois</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Premium</h2>
          <div className={styles.cardContent}>
            <ul className={styles.cardList}>
              <li><span className={styles.bullet}>✔</span> Accès aux annonces </li>
                <li><span className={styles.bullet}>✔</span> Réponse illimitée aux annonces </li>
                <li><span className={styles.bullet}>✔</span> Mise en avant sur la page d'accueil </li>
                <li><span className={styles.bullet}>✔</span> Visibilité prioritaire dans les recherches </li>
                <li><span className={styles.bullet}>✔</span> Statistiques complètes </li>
                <li><span className={styles.bullet}>✔</span> Badge Premium sur votre profil </li>
            </ul>
          </div>
          <p className={styles.cardPrice}>69,99 € / mois</p>
        </div>
      </div>
    </main>
  )
}



