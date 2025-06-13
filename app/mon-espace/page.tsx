'use client'

import Link from 'next/link'
import Image from 'next/image'
import styles from './page.module.scss'

export default function MonEspace() {
  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        <Image
          src="/images/landscape1.jpg"
          alt="Illustration"
          className={styles.image}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      <div className={styles.content}>
        <h1 className={styles.title}>DITES-NOUS QUI VOUS ÊTES</h1>
        <div className={styles.options}>
          <Link href="/auth/login_client" className={styles.card}>
            Je suis un particulier
          </Link>
          <Link href="/auth/login_artisan" className={styles.card}>
            Je suis un artisan
          </Link>
        </div>
      </div>
    </div>
  )
}


