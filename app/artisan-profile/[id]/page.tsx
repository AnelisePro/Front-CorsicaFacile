'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { FaMapMarkerAlt, FaArrowLeft} from 'react-icons/fa'
import { FiMail, FiPhone } from 'react-icons/fi'
import Image from 'next/image'
import styles from './page.module.scss'
import { useAuth } from '../../auth/AuthContext'
import { toast } from 'react-toastify'
import PremiumBadge from '../../components/PremiumBadge'
import ReviewsSection from '../../components/ReviewsSection'
import ArtisanTracker from '../../utils/ArtisanTracker'

type ProjectImageType = {
  id: number
  image_url: string
}

type ArtisanDetails = {
  id: string
  company_name: string
  address: string
  email: string
  phone: string
  expertise_names: string[]
  avatar_url?: string | null
  description?: string
  availability_slots: AvailabilitySlotType[]
  project_images: ProjectImageType[]
  membership_plan?: string | null;
}

type AvailabilitySlotType = {
  id: number
  start_time: string
  end_time: string
}

export default function ArtisanProfilePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const [artisan, setArtisan] = useState<ArtisanDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlotType[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [messageContent, setMessageContent] = useState('')
  
  // ✅ Ref pour le tracker
  const trackerRef = useRef<any>(null)
  
  const expertise = searchParams.get('expertise')
  const location = searchParams.get('location')

  // 🎯 Fonction pour récupérer les paramètres de recherche précédents
  const handleGoBack = () => {
    if (expertise && location) {
      console.log('Redirection avec paramètres URL:', { expertise, location })
      router.push(`/search-bar?expertise=${encodeURIComponent(expertise)}&location=${encodeURIComponent(location)}`)
    } else {
      console.log('Aucun paramètre dans l\'URL, retour simple')
      router.push('/search-bar')
    }
  }

  // ✅ Chargement du profil artisan
  useEffect(() => {
    if (!params?.id) return

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

    axios
      .get(`${apiUrl}/artisans/${params.id}`, {
        withCredentials: true,
      })
      .then(res => {
        const data = res.data
        setArtisan({
          ...data,
          availability_slots: data.availability_slots ?? [],
          project_images: data.project_images ?? []
        })
        setAvailabilitySlots(data.availability_slots ?? [])
      })
      .catch(err => {
        console.error('Erreur de chargement du profil:', err)
        setError('Impossible de charger le profil de l\'artisan.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [params?.id])

  // ✅ Initialisation du tracking
  useEffect(() => {
    if (artisan && !trackerRef.current) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      trackerRef.current = new ArtisanTracker(artisan.id, apiUrl)
    }
  }, [artisan])

  const formatSlot = (startISO: string, endISO: string) => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    const start = new Date(startISO)
    const end = new Date(endISO)
    const dayName = days[start.getDay()]

    const isFullDay =
      start.getHours() === 0 &&
      start.getMinutes() === 0 &&
      end.getHours() === 0 &&
      end.getMinutes() === 0 &&
      end.getTime() - start.getTime() === 24 * 60 * 60 * 1000

    const formatHour = (date: Date) => {
      const h = date.getHours()
      const m = date.getMinutes()
      return `${h}h${m.toString().padStart(2, '0')}`
    }

    if (isFullDay) {
      return { dayName, slotText: "Indisponible" }
    }

    return { dayName, slotText: `${formatHour(start)} - ${formatHour(end)}` }
  }

  const dayIndexMondayFirst = (day: number) => (day === 0 ? 7 : day)

  // ✅ Fonction pour créer/récupérer une conversation et envoyer un message avec tracking
  const sendMessage = async (message: string) => {
    try {
      if (!artisan) {
        toast.error('Informations artisan non disponibles')
        return
      }

      // 🎯 TRACKER LE CONTACT
      if (trackerRef.current) {
        trackerRef.current.trackContact()
      }

      const token = localStorage.getItem('clientToken')
      if (!token) {
        toast.error('Vous devez être connecté pour envoyer un message')
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

      // Créer ou récupérer la conversation
      const conversationResponse = await axios.post(
        `${apiUrl}/clients/conversations`,
        { artisan_id: artisan.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const conversationId = conversationResponse.data.id

      // Envoyer le message
      const messageResponse = await axios.post(
        `${apiUrl}/clients/conversations/${conversationId}/send_message`,
        {
          message: {
            content: message
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      toast.success('Message envoyé avec succès !')
      setMessageContent('')
      return messageResponse.data

    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        const message = error.response?.data?.error || error.response?.data?.message || 'Erreur inconnue'
        
        if (status === 401) {
          toast.error('Session expirée. Veuillez vous reconnecter.')
          router.push('/auth/login_client')
        } else if (status === 422) {
          toast.error(`Erreur de validation: ${message}`)
        } else {
          toast.error(`Erreur: ${message}`)
        }
      } else {
        toast.error('Erreur lors de l\'envoi du message')
      }
    }
  }

  // Handlers pour tracker les contacts directs
  const handleEmailClick = () => {
    if (trackerRef.current) {
      trackerRef.current.trackContact()
    }
  }

  const handlePhoneClick = () => {
    if (trackerRef.current) {
      trackerRef.current.trackContact()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (messageContent.trim()) {
      sendMessage(messageContent.trim())
    }
  }

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingText}>Chargement du profil...</p>
    </div>
  )

  if (error || !artisan) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <p>{error || 'Artisan non trouvé'}</p>
          <button onClick={handleGoBack} className={styles.backToSearchButton}>
            Retour à la recherche
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Header avec bouton retour */}
        <div className={styles.header}>
          <button onClick={handleGoBack} className={styles.backButton}>
            <FaArrowLeft />
            <span>Retour</span>
          </button>
        </div>

        {/* Hero Section - Profil principal */}
        <div className={styles.heroCard}>
          <div className={styles.heroContent}>
            <div className={styles.avatarSection}>
              <div className={styles.avatarContainer}>
                <Image
                  src={
                    artisan.avatar_url
                      ? `${artisan.avatar_url}?t=${Date.now()}`
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(artisan.company_name)}&background=81A04A&color=fff&rounded=true`
                  }
                  alt="avatar"
                  width={120}
                  height={120}
                  className={styles.avatar}
                />
              </div>
            </div>
            
            <div className={styles.profileInfo}>
              <div className={styles.nameContainer}>
                <h1 className={styles.companyName}>
                  {artisan.company_name}
                </h1>
                <PremiumBadge
                  membershipPlan={artisan.membership_plan}
                  className={styles.premiumBadge}
                />
              </div>
              
              <div className={styles.locationContainer}>
                <FaMapMarkerAlt className={styles.locationIcon} />
                <span className={styles.address}>{artisan.address}</span>
              </div>
              
              <div className={styles.expertiseContainer}>
                {artisan.expertise_names?.map((expertise, index) => (
                  <span key={index} className={styles.expertiseTag}>
                    {expertise}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.contentGrid}>
          {/* Colonne gauche */}
          <div className={styles.leftColumn}>
            {/* Section À propos */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>À propos de l'entreprise</h2>
              </div>
              <div className={styles.cardContent}>
                <p className={styles.description}>
                  {artisan.description || "Cet artisan n'a pas encore ajouté de description."}
                </p>
              </div>
            </div>

            {/* Section des réalisations */}
            {artisan.project_images && artisan.project_images.length > 0 && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Nos réalisations</h2>
                  <span className={styles.badge}>{artisan.project_images.length}</span>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.gallery}>
                    {artisan.project_images.map((image) => (
                      <div
                        key={image.id}
                        className={styles.galleryItem}
                        onClick={() => setSelectedImage(image.image_url)}
                      >
                        <Image
                          src={image.image_url}
                          alt={`Réalisation ${image.id}`}
                          width={200}
                          height={150}
                          className={styles.projectImage}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Section des avis */}
            <ReviewsSection artisanId={artisan.id} />

            {/* Section contact */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>
                  Contacter l'artisan
                </h2>
              </div>
              <div className={styles.cardContent}>
                {user && user.role === 'client' ? (
                  <div className={styles.contactSection}>
                    <div className={styles.contactMethods}>
                      <div className={styles.contactItem}>
                        <FiMail className={styles.contactIcon} />
                        <div className={styles.contactDetails}>
                          <span className={styles.contactLabel}>Email</span>
                          <a href={`mailto:${artisan.email}`} className={styles.contactLink} onClick={handleEmailClick}>
                            {artisan.email}
                          </a>
                        </div>
                      </div>
                      
                      <div className={styles.contactItem}>
                        <FiPhone className={styles.contactIcon} />
                        <div className={styles.contactDetails}>
                          <span className={styles.contactLabel}>Téléphone</span>
                          <a href={`tel:${artisan.phone}`} className={styles.contactLink} onClick={handlePhoneClick}>
                            {artisan.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.messageSection}>
                      <h3 className={styles.messageTitle}>
                        Envoyer un message via notre messagerie
                      </h3>
                      <form 
                        className={styles.messageForm}
                        onSubmit={async (e) => {
                          e.preventDefault()
                          if (messageContent.trim()) {
                            await sendMessage(messageContent)
                          }
                        }}
                      >
                        <div className={styles.textareaContainer}>
                          <textarea
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            placeholder="Décrivez votre projet, vos besoins ou posez vos questions..."
                            required
                            rows={4}
                            className={styles.messageTextarea}
                          />
                        </div>
                        <button type="submit" className={styles.sendButton}>
                          <span>Envoyer le message</span>
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className={styles.loginPrompt}>
                    <h3>Connexion requise</h3>
                    <p>Connectez-vous pour accéder aux informations de contact et envoyer un message à cet artisan.</p>
                    <button
                      className={styles.loginButton}
                      onClick={() => router.push('/auth/login_client')}
                    >
                      Se connecter
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Colonne droite - Disponibilités */}
          <div className={styles.rightColumn}>
            {availabilitySlots.length > 0 && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Créneaux disponibles</h2>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.availabilityList}>
                    {availabilitySlots
                      .slice()
                      .sort((a, b) => {
                        const dayA = new Date(a.start_time).getDay()
                        const dayB = new Date(b.start_time).getDay()
                        const adjustedA = dayIndexMondayFirst(dayA)
                        const adjustedB = dayIndexMondayFirst(dayB)
                        if (adjustedA !== adjustedB) return adjustedA - adjustedB
                        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
                      })
                      .map(slot => {
                        const { dayName, slotText } = formatSlot(slot.start_time, slot.end_time)
                        return (
                          <div key={slot.id} className={styles.availabilityItem}>
                            <div className={styles.dayInfo}>
                              <span className={styles.dayName}>{dayName}</span>
                            </div>
                            <div className={styles.timeInfo}>
                              <span className={styles.timeSlot}>{slotText}</span>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal pour les images en grand */}
        {selectedImage && (
          <div className={styles.modal} onClick={() => setSelectedImage(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button
                className={styles.modalClose}
                onClick={() => setSelectedImage(null)}
                aria-label="Fermer l'image"
              >
                ×
              </button>
              <Image
                src={selectedImage}
                alt="Réalisation en grand format"
                width={800}
                height={600}
                className={styles.fullSizeImage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
















