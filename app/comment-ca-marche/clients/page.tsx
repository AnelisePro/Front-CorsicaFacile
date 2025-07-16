'use client'

import Image from 'next/image'
import styles from './page.module.scss'

export default function CommentCaMarcheClients() {
  return (
    <main className={styles['main-container']}>
      <h1>Client ou futur client ?</h1>
      <div className={styles['content-wrapper']}>
        <div className={styles.text}>
          <p>Voici les étapes afin de vous aider à comprendre notre plateforme :</p>
          <ol>
            <li>Déclarez votre besoin.</li>
            <li>Recevez des propositions d’artisans.</li>
            <li>Choisissez l’artisan qui vous convient.</li>
            <li>Suivez l’avancement de votre projet.</li>
          </ol>
        </div>
        <div className={styles.image}>
          <Image
            src="/images/Sartene.JPG"
            alt="Illustration comment ça marche clients"
            width={400}
            height={300}
            style={{ borderRadius: '0.75rem' }}
            priority
          />
        </div>
      </div>
    </main>
  )
}

