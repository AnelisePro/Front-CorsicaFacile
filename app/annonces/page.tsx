'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'
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

// Fonction pour extraire le nom du fichier depuis une URL ou clé
const extractFilename = (urlOrKey: string) => {
  try {
    const url = new URL(urlOrKey)
    return url.pathname.split('/').pop() || urlOrKey
  } catch {
    return urlOrKey
  }
}

// Détermine le content-type selon l'extension du fichier
const getContentType = (filename: string) => {
  if (filename.endsWith('.svg')) return 'image/svg+xml'
  if (filename.endsWith('.png')) return 'image/png'
  if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg'
  return 'application/octet-stream'
}

export default function ArtisansAnnonces() {
  const [besoins, setBesoins] = useState<Besoin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBesoin, setSelectedBesoin] = useState<Besoin | null>(null)
  const [expertises, setExpertises] = useState<string[]>([])
  const [selectedExpertise, setSelectedExpertise] = useState<string>('')
  const [searchLocation, setSearchLocation] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Chargement des besoins de l'artisan
  useEffect(() => {
    if (typeof window === 'undefined') return

    const artisanToken = localStorage.getItem('artisanToken')
    if (!artisanToken) {
      router.push('/auth/login_artisan')
      return
    }

    axios
      .get(`${apiUrl}/artisans/besoins`, {
        headers: { Authorization: `Bearer ${artisanToken}` },
      })
      .then((res) => setBesoins(res.data))
      .catch(() => setError('Erreur lors du chargement des annonces'))
      .finally(() => setLoading(false))
  }, [router])

  // Chargement des expertises disponibles pour filtre
  useEffect(() => {
    axios
      .get(`${apiUrl}/api/expertises`)
      .then((res) => setExpertises(res.data))
      .catch((err) => console.error('Erreur lors du chargement des expertises', err))
  }, [])

  // À chaque fois que besoins changent ou que le paramètre id change, sélectionner le besoin
  useEffect(() => {
    const idParam = searchParams.get('id')
    if (idParam && besoins.length > 0) {
      const found = besoins.find((b) => b.id === Number(idParam))
      if (found) setSelectedBesoin(found)
    }
  }, [searchParams, besoins])

  // Fermer dropdown si clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.querySelector(`.${styles.dropdown}`)
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Filtre des besoins selon expertise et localisation
  const filteredBesoins = besoins.filter((b) => {
    const matchesExpertise = selectedExpertise ? b.type_prestation === selectedExpertise : true
    const matchesLocation = searchLocation
      ? b.address.toLowerCase().includes(searchLocation.toLowerCase())
      : true
    return matchesExpertise && matchesLocation
  })

  if (loading) return <p className={styles.loading}>Chargement...</p>
  if (error) return <p className={styles.error}>{error}</p>

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Toutes les annonces</h1>

      <div className={styles.filters}>
        <div className={styles.dropdown}>
          <button
            className={styles.dropdownToggle}
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
            type="button"
          >
            {selectedExpertise || 'Type de prestation'}
          </button>
          {isDropdownOpen && (
            <ul className={styles.dropdownMenu} role="listbox">
              <li
                onClick={() => {
                  setSelectedExpertise('')
                  setIsDropdownOpen(false)
                }}
                role="option"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && (setSelectedExpertise(''), setIsDropdownOpen(false))}
              >
                Tous les types
              </li>
              {expertises.map((exp, i) => (
                <li
                  key={i}
                  onClick={() => {
                    setSelectedExpertise(exp)
                    setIsDropdownOpen(false)
                  }}
                  role="option"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && (setSelectedExpertise(exp), setIsDropdownOpen(false))}
                >
                  {exp}
                </li>
              ))}
            </ul>
          )}
        </div>

        <input
          type="text"
          placeholder="Rechercher par localisation"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          className={styles.input}
          aria-label="Recherche par localisation"
        />
      </div>

      {filteredBesoins.length === 0 && <p className={styles.noAnnonce}>Aucune annonce pour le moment.</p>}

      <div className={styles.grid}>
        {filteredBesoins.map((b) => (
          <div key={b.id} className={styles.card}>
            <h2 className={styles.cardTitle}>{b.type_prestation}</h2>
            <p className={styles.description}>{b.description}</p>
            <div className={styles.cardFooter}>
              <span className={styles.location}>📍 {b.address}</span>
              <button
                className={styles.button}
                type="button"
                onClick={() => setSelectedBesoin(b)}
                aria-label={`Afficher les détails pour ${b.type_prestation}`}
              >
                En savoir plus
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedBesoin && (
        <div className={styles.modalOverlay} onClick={() => setSelectedBesoin(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeButton}
              onClick={() => setSelectedBesoin(null)}
              aria-label="Fermer la fenêtre"
              type="button"
            >
              ✕
            </button>
            <h2 className={styles.modalTitle}>Informations supplémentaires</h2>

            <div className={styles.images}>
              {selectedBesoin.image_urls.length > 0 ? (
                selectedBesoin.image_urls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="Image besoin"
                    width={150}
                    height={150}
                    className={styles.image}
                    loading="lazy"
                    decoding="async"
                  />
                ))
              ) : (
                <p>Aucune image disponible.</p>
              )}
            </div>

            <h3 className={styles.contactTitle}>Contacter le client</h3>
            <p>
              {selectedBesoin.client.first_name} {selectedBesoin.client.last_name}
            </p>
            <p>{selectedBesoin.client.email}</p>
            <p>{selectedBesoin.client.phone}</p>
          </div>
        </div>
      )}
    </div>
  )
}
















