'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { FaMapMarkerAlt } from 'react-icons/fa'
import Image from 'next/image'
import styles from './page.module.scss'

type ArtisanDetails = {
  id: string
  company_name: string
  address: string
  expertise: string
  avatar_url?: string | null
  description?: string
  images_urls?: string[]
}

type AvailabilitySlotType = {
  id: number
  start_time: string
  end_time: string
}

export default function ArtisanProfilePage() {
  const params = useParams()
  const router = useRouter()

  const [artisan, setArtisan] = useState<ArtisanDetails | null>(null)
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlotType[]>([])

  useEffect(() => {
    if (!params?.id) return

    axios.get(`http://localhost:3001/artisans/${params.id}`)
      .then(res => {
        setArtisan(res.data)
        setAvailabilitySlots(res.data.availability_slots || [])
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

    const formatHour = (date: Date) => {
      const h = date.getHours()
      const m = date.getMinutes()
      return `${h}h${m.toString().padStart(2, '0')}`
    }

    return `${dayName} ${formatHour(start)} - ${formatHour(end)}`
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    alert("Message envoyé ! (fonctionnalité à implémenter)")
  }

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
        {/* Colonne principale */}
        <div className={styles.leftColumn}>
          {/* Carte profil */}
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
                <p><FaMapMarkerAlt /> {artisan.address}</p>
                <span className={styles.expertise}>{artisan.expertise}</span>
              </div>
            </div>
          </div>

          {/* À propos */}
          <div className={styles.card}>
            <h2>À propos de l'entreprise</h2>
            <p>{artisan.description || "Cet artisan n'a pas encore ajouté de description."}</p>
          </div>

          {/* Réalisations */}
          {Array.isArray(artisan.images_urls) && artisan.images_urls.length > 0 && (
            <div className={styles.card}>
              <h2>Réalisations</h2>
              <div className={styles.projectImages}>
                {artisan.images_urls.map((url, i) => (
                  <div key={i} className={styles.projectImageWrapper}>
                    <Image
                      src={`${url}?t=${Date.now()}`}
                      alt={`Projet ${i + 1}`}
                      width={200}
                      height={150}
                      objectFit="contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite */}
        <div className={styles.rightColumn}>
          {/* Disponibilités */}
          {availabilitySlots.length > 0 && (
            <div className={styles.card}>
              <h2>Créneaux de disponibilité</h2>
              <ul>
                {availabilitySlots.map(slot => (
                  <li key={slot.id}>{formatSlot(slot.start_time, slot.end_time)}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Formulaire de contact */}
          <div className={styles.card}>
            <h2>Contacter l'artisan</h2>
            <form className={styles.contactForm} onSubmit={handleSubmit} noValidate>
              <div>
                <input id="name" name="name" type="text" required placeholder="Votre nom" />
              </div>
              <div>
                <input id="email" name="email" type="email" required placeholder="Votre email" />
              </div>
              <div>
                <textarea id="message" name="message" required placeholder="Votre message" rows={5} />
              </div>
              <button type="submit">Envoyer</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}





