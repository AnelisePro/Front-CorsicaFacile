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
  const [hasResponded, setHasResponded] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('artisanToken')
    if (!token) {
      router.push('/auth/login_artisan')
      return
    }
    setArtisanToken(token)

    // D'abord charger l'annonce
    axios
      .get(`${apiUrl}/annonces/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setBesoin(res.data)
        // Ensuite vérifier si l'artisan a déjà répondu
        return checkIfResponded(token, res.data.client.id)
      })
      .catch(() => setError('Annonce non trouvée ou accès non autorisé.'))
      .finally(() => setLoading(false))
  }, [id, router])

  const checkIfResponded = async (token: string, clientId: number) => {
    try {
      const response = await axios.get(`${apiUrl}/client_notifications/check`, {
        params: {
          besoin_id: id,
          client_id: clientId
        },
        headers: { Authorization: `Bearer ${token}` }
      })
      setHasResponded(response.data.hasResponded)
    } catch (error) {
      console.error("Erreur vérification réponse:", error)
      setHasResponded(false)
    }
  }

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingText}>Chargement de l'annonce...</p>
    </div>
  )
  
  if (error) return <p className={styles.error}>{error}</p>
  if (!besoin) return <p className={styles.error}>Aucune annonce trouvée.</p>

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.cardTitle}>{besoin.type_prestation}</h1>
        <p className={styles.cardText}>{besoin.description}</p>
        <p className={styles.cardText}>📍 {besoin.address}</p>

        <div className={styles.imagesContainer}>
          {besoin.image_urls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Image besoin ${index + 1}`}
              className={styles.annonceImage}
            />
          ))}
        </div>

        <div className={styles.clientInfo}>
          <h2 className={styles.cardTitle}>Contact client</h2>
          <p className={styles.cardText}><span className={styles.icon}>👤</span> {besoin.client.first_name} {besoin.client.last_name}</p>
          <p className={styles.cardText}><span className={styles.icon}>✉️</span> {besoin.client.email}</p>
          <p className={styles.cardText}><span className={styles.icon}>📞</span> {besoin.client.phone}</p>
        </div>

        {artisanToken && (
          <div className={styles.buttonContainer}>
            <NotificationButton
              besoinId={besoin.id}
              clientId={besoin.client.id}
              artisanToken={artisanToken}
              disabled={hasResponded}
              className={styles.interestButton}
            />
            {hasResponded && (
              <p className={styles.disabledMessage}>
                Vous avez déjà répondu à cette annonce
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}








