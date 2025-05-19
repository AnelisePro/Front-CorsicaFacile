'use client'

import Link from 'next/link'
import styles from './page.module.scss'

export default function MonEspace() {
  return (
    <div className={styles.container}>
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
  )
}

