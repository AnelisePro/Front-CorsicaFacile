'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { FaMapMarkerAlt } from 'react-icons/fa'
import Image from 'next/image'
import styles from './page.module.scss'
import { useAuth } from '../../auth/AuthContext'

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
}

type AvailabilitySlotType = {
  id: number
  start_time: string
  end_time: string
}

export default function ArtisanProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()

  const [artisan, setArtisan] = useState<ArtisanDetails | null>(null)
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlotType[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

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
      })
  }, [params?.id])

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    alert("Message envoyé ! (fonctionnalité à implémenter)")
  }

  const dayIndexMondayFirst = (day: number) => (day === 0 ? 7 : day)

  if (!artisan) return <p>Chargement du profil…</p>

  return (
    <div className={styles.container}>
      <button
        onClick={() => router.push('/search-bar')}
        className={styles.backButton}
        aria-label="Retour aux résultats de recherche"
      >
        ← Retour
      </button>

      <div className={styles.grid}>
        <div className={styles.leftColumn}>
          <div className={styles.card}>
            <div className={styles.profileHeader}>
              <Image
                src={
                  artisan.avatar_url
                    ? `${artisan.avatar_url}?t=${Date.now()}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(artisan.company_name)}`
                }
                alt="avatar"
                width={80}
                height={80}
                className={styles.avatar}
              />
              <div>
                <h1>{artisan.company_name}</h1>
                <p>
                  <FaMapMarkerAlt className={styles.blueIcon}/> {artisan.address}
                </p>
                <span className={styles.expertise}>{artisan.expertise_names?.join(', ')}</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2>À propos de l'entreprise</h2>
            <p>{artisan.description || "Cet artisan n'a pas encore ajouté de description."}</p>
          </div>

          {/* Section des réalisations */}
          {artisan.project_images && artisan.project_images.length > 0 && (
            <div className={styles.card}>
              <h2>Nos réalisations</h2>
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
          )}

          {/* Modal pour afficher l'image en grand */}
          {selectedImage && (
            <div className={styles.modal} onClick={() => setSelectedImage(null)}>
              <div className={styles.modalContent}>
                <Image
                  src={selectedImage}
                  alt="Réalisation en détail"
                  width={800}
                  height={600}
                  className={styles.fullSizeImage}
                />
              </div>
            </div>
          )}
        </div>

        <div className={styles.rightColumn}>
          {availabilitySlots.length > 0 && (
            <div className={styles.card}>
              <h2>Créneaux disponibles</h2>
              <div>
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
                      <div key={slot.id} className={styles.availabilityRow}>
                        <span className={styles.day}>{dayName}</span>
                        <span className={styles.slot}>{slotText}</span>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          <div className={styles.card}>
            <h2>Contacter l'artisan</h2>
            {user && user.role === 'client' ? (
              <div className={styles.contactInfo}>
                <p>Email : <a href={`mailto:${artisan.email}`}>{artisan.email}</a></p>
                <p>Téléphone : <a href={`tel:${artisan.phone}`}>{artisan.phone}</a></p>
              </div>
            ) : (
              <button
                className={styles.loginButton}
                onClick={() => router.push('/auth/login_client')}
              >
                Connectez-vous pour voir les coordonnées
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}












