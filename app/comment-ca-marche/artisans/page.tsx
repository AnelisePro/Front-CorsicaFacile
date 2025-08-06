'use client'

import styles from './page.module.scss'

export default function CommentCaMarcheArtisans() {
  return (
    <main className={styles['main-container']}>
      <h1>Artisan ?</h1>
      <div className={styles['content-wrapper']}>
        <div className={styles.text}>
          <p>Voici comment utiliser notre plateforme :</p>
          <ol>
            <li>Créez votre profil professionnel.</li>
            <li>Répondez aux annonces des clients.</li>
            <li>Gérez vos projets et rendez-vous.</li>
            <li>Communiquez directement avec vos clients pour organiser les détails.</li>
          </ol>
        </div>
        <img
          src="/images/Sartene.JPG"
          alt="Artisan au travail"
          className={styles.image}
        />
      </div>
    </main>
  )
}


