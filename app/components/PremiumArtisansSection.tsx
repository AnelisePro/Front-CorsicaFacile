'use client'

import { useEffect, useState } from 'react'
import styles from './PremiumArtisansSection.module.scss'
import Image from 'next/image'
import Link from 'next/link'

interface Artisan {
  id: number
  company_name: string
  city: string
  avatar_url?: string
  profile_url: string
  expertises: string[]
}

export default function PremiumArtisansSection() {
  const [artisans, setArtisans] = useState<Artisan[]>([])

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    fetch(`${apiUrl}/api/v1/artisans/premium`)
      .then(res => res.json())
      .then((data: Artisan[]) => setArtisans(data))
      .catch(err => console.error(err))
  }, [])

  if (artisans.length === 0) return null

  return (
    <section className={styles.premiumSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>Nos Artisans Premium</h2>
        <div className={styles.grid}>
          {artisans.map(artisan => (
            <Link
              key={artisan.id}
              href={artisan.profile_url}
              className={styles.card}
            >
              <div className={styles.avatarContainer}>
                {artisan.avatar_url ? (
                  <Image
                    src={artisan.avatar_url}
                    alt={artisan.company_name}
                    width={80}
                    height={80}
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.placeholder}>👤</div>
                )}
              </div>
              <div className={styles.info}>
                <h3>{artisan.company_name}</h3>
                <p className={styles.city}>{artisan.city}</p>
                <p className={styles.expertises}>
                  {artisan.expertises.slice(0, 2).join(', ')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

