'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import styles from './page.module.scss'
import NotificationButton from '../../components/NotificationButton'

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

export default function AnnonceDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [besoin, setBesoin] = useState<Besoin | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [artisanToken, setArtisanToken] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('artisanToken')
    if (!token) {
      router.push('/auth/login_artisan')
      return
    }
    setArtisanToken(token)

    axios
      .get(`${apiUrl}/annonces/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBesoin(res.data))
      .catch(() => setError('Annonce non trouvée ou accès non autorisé.'))
      .finally(() => setLoading(false))
  }, [id, router])

  if (loading) return <p>Chargement...</p>
  if (error) return <p>{error}</p>
  if (!besoin) return <p>Aucune annonce trouvée.</p>

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>{besoin.type_prestation}</h1>
        <p>{besoin.description}</p>
        <p>📍 {besoin.address}</p>
        <div>
          {besoin.image_urls.map((url, index) => (
            <img key={index} src={url} alt="Image besoin" width={150} height={150} />
          ))}
        </div>

        {/* Bouton intérêt - rendu uniquement si artisanToken est disponible */}
        {artisanToken && (
          <NotificationButton
            besoinId={besoin.id}
            clientId={besoin.client.id}
            artisanToken={artisanToken}
          />
        )}

        <h2>Contact client</h2>
        <p>{besoin.client.first_name} {besoin.client.last_name}</p>
        <p>{besoin.client.email}</p>
        <p>{besoin.client.phone}</p>
      </div>
    </div>
  )
}






