'use client';

import Link from 'next/link';
import styles from './page.module.scss';

export default function MonEspace() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.imageSection}>
          <img src="/images/img5.jpeg" alt="Image de fond" />
        </div>
        <div className={styles.contentSection}>
          <h2 className={styles.title}>Qui êtes-vous ?</h2>
          <div className={styles.buttonsGroup}>
            <Link href="/auth/login_client" className={`${styles.modernButton} ${styles.clientButton}`}>
              <span className={styles.buttonText}>Particulier</span>
              <div className={styles.buttonArrow}>→</div>
            </Link>
            <Link href="/auth/login_artisan" className={`${styles.modernButton} ${styles.artisanButton}`}>
              <span className={styles.buttonText}>Artisan</span>
              <div className={styles.buttonArrow}>→</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}









