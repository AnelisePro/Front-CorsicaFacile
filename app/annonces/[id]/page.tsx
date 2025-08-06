'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import { FiMapPin, FiUser, FiMail, FiPhone, FiClock, FiArrowLeft} from 'react-icons/fi'
import { FaCheckCircle } from 'react-icons/fa'
import styles from './page.module.scss'
import NotificationButton from '../../components/NotificationButton'
import UsageBanner from '../../components/UsageBanner'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

type Besoin = {
  id: number
  type_prestation: string
  description: string
  schedule: {
    type: 'single_day' | 'date_range'
    // Pour jour unique
    date?: string
    // Pour période
    start_date?: string
    end_date?: string
    // Heures communes
    start_time: string
    end_time: string
  }
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

// Interface pour les stats d'usage
interface UsageStats {
  membership_plan: string
  responses_used: number
  response_limit: number
  can_respond: boolean
  usage_percentage: number
}

export default function AnnonceDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [besoin, setBesoin] = useState<Besoin | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [artisanToken, setArtisanToken] = useState<string | null>(null)
  const [hasResponded, setHasResponded] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('artisanToken')
    if (!token) {
      router.push('/auth/login_artisan')
      return
    }
    setArtisanToken(token)

    // Charger l'annonce
    axios
      .get(`${apiUrl}/annonces/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setBesoin(res.data)
        return checkIfResponded(token, res.data.client.id)
      })
      .catch(() => setError('Annonce non trouvée ou accès non autorisé.'))
      .finally(() => setLoading(false))

    // Charger les stats d'usage en parallèle
    axios.get(`${apiUrl}/announcement_responses/usage_stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        setUsageStats(res.data)
      })
      .catch(() => {
        console.log('Stats non disponibles')
        // Optionnel : définir des stats par défaut
        // setUsageStats(null)
      })
  }, [id, router])

  const refreshUsageStats = async () => {
    if (!artisanToken) return

    try {
      const response = await axios.get(`${apiUrl}/announcement_responses/usage_stats`, {
        headers: {
          'Authorization': `Bearer ${artisanToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      setUsageStats(response.data)
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error)
    }
  }

  const handleStatsUpdate = (newStats: any) => {
    setUsageStats(newStats)
    setHasResponded(true)
  }

  const checkIfResponded = async (token: string, clientId: number) => {
    try {
      const response = await axios.get(`${apiUrl}/client_notifications/check`, {
        params: { besoin_id: id, client_id: clientId },
        headers: { Authorization: `Bearer ${token}` }
      })
      setHasResponded(response.data.hasResponded)
    } catch (error) {
      console.error("Erreur vérification réponse:", error)
      setHasResponded(false)
    }
  }

  const formatSchedule = (schedule: Besoin['schedule']) => {
    if (!schedule) return ''

    try {
      const { type, date, start_date, end_date, start_time, end_time } = schedule

      if (type === 'single_day') {
        const dateStr = date ? ` le ${new Date(date).toLocaleDateString('fr-FR')}` : ''
        return `${dateStr} entre ${start_time} et ${end_time}`
      } else if (type === 'date_range') {
        if (start_date && end_date) {
          return `Du ${new Date(start_date).toLocaleDateString('fr-FR')} au ${new Date(end_date).toLocaleDateString('fr-FR')}, chaque jour de ${start_time} à ${end_time}`
        } else {
          return `Chaque jour de ${start_time} à ${end_time}`
        }
      }

      return 'Horaire non spécifié'
    } catch (error) {
      console.error('Erreur lors du formatage du schedule:', error)
      return 'Horaire invalide'
    }
  }

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingText}>Chargement de l'annonce...</p>
    </div>
  )
  
  if (error) return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <h2>⚠️ Erreur</h2>
        <p>{error}</p>
        <button onClick={() => router.back()} className={styles.backButton}>
          Retour
        </button>
      </div>
    </div>
  )

  if (!besoin) return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <h2>🔍 Non trouvé</h2>
        <p>Aucune annonce trouvée.</p>
        <button onClick={() => router.back()} className={styles.backButton}>
          Retour
        </button>
      </div>
    </div>
  )

  return (
    <div className={styles.pageContainer}>
      {/* Header avec navigation */}
      <header className={styles.header}>
        <button 
          onClick={() => router.back()} 
          className={styles.backButton}
        >
          <FiArrowLeft />
          Retour
        </button>
      </header>

      {/* Banner d'usage - Utilisation du composant */}
      {usageStats && <UsageBanner usageStats={usageStats} />}

      <div className={styles.container}>
        <div className={styles.mainContent}>
          {/* Card principale de l'annonce */}
          <div className={styles.announcementCard}>
            <div className={styles.cardHeader}>
              <h1 className={styles.title}>{besoin.type_prestation}</h1>
              <div className={styles.locationBadge}>
                <FiMapPin />
                {besoin.address}
              </div>
            </div>

            <div className={styles.description}>
              <h3>Description du projet</h3>
              <p>{besoin.description}</p>
            </div>

            {besoin.schedule && (
              <div className={styles.schedule}>
                <FiClock className={styles.scheduleIcon} />
                <span>Créneau souhaité : {formatSchedule(besoin.schedule)}</span>
              </div>
            )}

            {/* Galerie d'images moderne */}
            {besoin.image_urls.length > 0 && (
              <div className={styles.imageGallery}>
                <h3>
                  Photos du projet ({besoin.image_urls.length})
                </h3>
                
                <div className={styles.mainImageContainer}>
                  <img
                    src={besoin.image_urls[selectedImage]}
                    alt={`Photo principale du projet`}
                    className={styles.mainImage}
                  />
                  <div className={styles.imageCounter}>
                    {selectedImage + 1} / {besoin.image_urls.length}
                  </div>
                </div>

                {besoin.image_urls.length > 1 && (
                  <div className={styles.thumbnailContainer}>
                    {besoin.image_urls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Miniature ${index + 1}`}
                        className={`${styles.thumbnail} ${
                          index === selectedImage ? styles.activeThumbnail : ''
                        }`}
                        onClick={() => setSelectedImage(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card client */}
          <div className={styles.clientCard}>
            <div className={styles.clientHeader}>
              <div className={styles.clientAvatar}>
                <FiUser />
              </div>
              <div className={styles.clientInfo}>
                <h3>Informations client</h3>
                <p className={styles.clientName}>
                  {besoin.client.first_name} {besoin.client.last_name}
                </p>
              </div>
            </div>

            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <FiMail className={styles.contactIcon} />
                <span>{besoin.client.email}</span>
              </div>
              <div className={styles.contactItem}>
                <FiPhone className={styles.contactIcon} />
                <span>{besoin.client.phone}</span>
              </div>
            </div>

            {/* Card CTA */}
            <div className={styles.ctaCard}>
              {hasResponded ? (
                <div className={styles.respondedState}>
                  <FaCheckCircle className={styles.checkIcon} />
                  <div>
                    <h3>Réponse envoyée</h3>
                    <p>Vous avez déjà manifesté votre intérêt pour cette annonce. 
                       Le client vous contactera s'il souhaite discuter avec vous.</p>
                  </div>
                </div>
              ) : (
                <div className={styles.ctaContent}>
                  <div className={styles.ctaHeader}>
                    <h3>Intéressé par ce projet ?</h3>
                    <p>Manifestez votre intérêt et le client pourra vous contacter directement.</p>
                  </div>
                  
                  {artisanToken && (
                    <NotificationButton
                      besoinId={besoin.id}
                      clientId={besoin.client.id}
                      artisanToken={artisanToken}
                      disabled={hasResponded || (usageStats ? !usageStats.can_respond : false)}
                      className={styles.interestButton}
                      onStatsUpdate={handleStatsUpdate} // Callback prioritaire
                      onSuccess={refreshUsageStats} // Fallback
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}










