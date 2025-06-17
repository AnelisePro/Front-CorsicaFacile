'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './page.module.scss'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

type Besoin = {
  id: number
  type_prestation: string
  description: string
  schedule: string
  address: string
  image_urls: string[]
  client: {
    id: number
    first_name: string
    last_name: string
    email: string
    phone: string
  }
}

export default function ArtisansAnnonces() {
  const [besoins, setBesoins] = useState<Besoin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const artisanToken = localStorage.getItem('artisanToken')
    if (!artisanToken) {
      router.push('/auth/login_artisan')
      return
    }

    axios.get(`${apiUrl}/artisans/besoins`, {
      headers: { Authorization: `Bearer ${artisanToken}` }
    })
      .then(res => setBesoins(res.data))
      .catch(() => setError('Erreur lors du chargement des annonces'))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return <p className={styles.loading}>Chargement...</p>
  if (error) return <p className={styles.error}>{error}</p>

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Toutes les annonces</h1>

      {besoins.length === 0 && <p className={styles.noAnnonce}>Aucune annonce pour le moment.</p>}

      <div className={styles.grid}>
        {besoins.map(b => (
          <div key={b.id} className={styles.card}>
            <h2 className={styles.cardTitle}>{b.type_prestation}</h2>
            <p className={styles.description}>{b.description}</p>

            <div className={styles.client}>
              <strong>Client :</strong> {b.client.first_name} {b.client.last_name}<br />
              <strong>Adresse :</strong> {b.address}<br />
              <strong>Email :</strong> {b.client.email}<br />
              <strong>Téléphone :</strong> {b.client.phone}
            </div>

            <div className={styles.images}>
              {b.image_urls.map((url, i) => (
                <Image
                  key={i}
                  src={url}
                  alt={`Image besoin ${i + 1}`}
                  width={96}
                  height={96}
                  className={styles.image}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}



