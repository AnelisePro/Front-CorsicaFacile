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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <button
        onClick={() => router.push('/search-bar')}
        className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        aria-label="Retour aux résultats de recherche"
      >
        ← Retour
      </button>

      <div className="flex gap-4 items-center">
        <Image
          src={
            artisan.avatar_url
              ? `${artisan.avatar_url}?t=${Date.now()}`
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(artisan.company_name)}`
          }
          alt="avatar"
          width={80}
          height={80}
          className="rounded-full object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold">{artisan.company_name}</h1>
          <p className="text-gray-600 flex items-center gap-1"><FaMapMarkerAlt /> {artisan.address}</p>
          <span className="inline-block mt-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">{artisan.expertise}</span>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">À propos de l'entreprise</h2>
        <p>{artisan.description || "Cet artisan n'a pas encore ajouté de description."}</p>
      </div>

      {/* Section Réalisations */}
      {artisan.images_urls && artisan.images_urls.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Réalisations</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {artisan.images_urls.map((url, index) => (
              <div key={index} className={styles.projectImageWrapper}>
                <Image
                  src={`${url}?t=${Date.now()}`}
                  alt={`Projet ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nouvelle section : Créneaux de disponibilité */}
      {availabilitySlots.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Créneaux de disponibilité</h2>
          <ul className="list-disc list-inside">
            {availabilitySlots.map(slot => (
              <li key={slot.id}>{formatSlot(slot.start_time, slot.end_time)}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.form}>
        <h2 className="text-xl font-semibold mb-2">Contacter l'artisan</h2>
        <form className={styles.contactForm} onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="name">Votre nom</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Votre nom"
            />
          </div>
          <div>
            <label htmlFor="email">Votre email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Votre email"
            />
          </div>
          <div>
            <label htmlFor="message">Votre message</label>
            <textarea
              id="message"
              name="message"
              required
              placeholder="Votre message"
              rows={5}
            />
          </div>
          <button type="submit">Envoyer</button>
        </form>
      </div>
    </div>
  )
}





