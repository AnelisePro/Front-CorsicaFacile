'use client'

import Image from 'next/image'
import styles from './page.module.scss'

export default function QuiSommesNous() {
  return (
    <main className={styles['main-container']}>
      <h1>Qui sommes-nous ?</h1>
      <div className={styles['content-wrapper']}>
        <Image
          src="/images/Sartene.JPG"
          alt="Notre équipe"
          width={600}
          height={400}
          className={styles.image}
        />
        <div className={styles.text}>
          <p>
            Nous sommes une équipe passionnée dédiée à mettre en relation les clients et les artisans
            en toute simplicité. Notre mission est de faciliter vos démarches et de vous faire gagner
            du temps.
          </p>
          <p>
            Depuis notre création, nous nous engageons à offrir un service de qualité, en sélectionnant
            les meilleurs professionnels pour répondre à vos besoins.
          </p>
          <p>
            Merci de nous faire confiance et de faire partie de la communauté CorsicaFacile !
          </p>
        </div>
      </div>
    </main>
  )
}


