'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import { FiMapPin, FiUser, FiMail, FiPhone, FiClock, FiArrowLeft, FiImage } from 'react-icons/fi'
import { FaCheckCircle, FaStar } from 'react-icons/fa'
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
  const [selectedImage, setSelectedImage] = useState(0)

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
      .then((res) => {
        setBesoin(res.data)
        return checkIfResponded(token, res.data.client.id)
      })
      .catch(() => setError('Annonce non trouvée ou accès non autorisé.'))
      .finally(() => setLoading(false))
  }, [id, router])

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

  const formatSchedule = (schedule: string) => {
  // Si le format est déjà correct, le retourner tel quel
  if (schedule.includes('Le ') && schedule.includes('entre')) {
    return schedule
  }

  try {
    // Tentative de parsing de différents formats
    // Format ISO: "2025-07-30T08:00:00" ou "2025-07-30 08:00-13:00"
    const dateRegex = /(\d{4})-(\d{2})-(\d{2})/
    const timeRegex = /(\d{1,2}):(\d{2})/g
    
    const dateMatch = schedule.match(dateRegex)
    const timeMatches = [...schedule.matchAll(timeRegex)]

    if (dateMatch && timeMatches.length >= 2) {
      const [, year, month, day] = dateMatch
      const startTime = `${timeMatches[0][1].padStart(2, '0')}h${timeMatches[0][2]}`
      const endTime = `${timeMatches[1][1].padStart(2, '0')}H${timeMatches[1][2]}`
      
      return `Le ${day}/${month}/${year} entre ${startTime} et ${endTime}`
    }

    // Si une seule heure est trouvée
    if (dateMatch && timeMatches.length === 1) {
      const [, year, month, day] = dateMatch
      const time = `${timeMatches[0][1].padStart(2, '0')}h${timeMatches[0][2]}`
      
      return `Le ${day}/${month}/${year} à ${time}`
    }

    // Format date simple: "2025-07-30"
    if (dateMatch) {
      const [, year, month, day] = dateMatch
      return `Le ${day}/${month}/${year}`
    }

    // Retourner le format original si aucun pattern ne correspond
    return schedule

  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error)
    return schedule
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
                <span>Délai souhaité : {formatSchedule(besoin.schedule)}</span>
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
                <div>
                  <span className={styles.contactLabel}>Email</span>
                  <a href={`mailto:${besoin.client.email}`} className={styles.contactValue}>
                    {besoin.client.email}
                  </a>
                </div>
              </div>

              <div className={styles.contactItem}>
                <FiPhone className={styles.contactIcon} />
                <div>
                  <span className={styles.contactLabel}>Téléphone</span>
                  <a href={`tel:${besoin.client.phone}`} className={styles.contactValue}>
                    {besoin.client.phone}
                  </a>
                </div>
              </div>
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
                    disabled={hasResponded}
                    className={styles.interestButton}
                  />
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}









