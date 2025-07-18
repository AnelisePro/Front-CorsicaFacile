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
    avatar_url?: string
  }
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

  useEffect(() => {
    const artisanToken = localStorage.getItem('artisanToken')
    if (!artisanToken) {
      router.push('/auth/login_artisan')
      return
    }

    axios.get(`${apiUrl}/artisans/besoins`, {
      headers: { Authorization: `Bearer ${artisanToken}` },
    })
    .then((res) => setBesoins(res.data))
    .catch(() => setError('Erreur lors du chargement des annonces'))
    .finally(() => setLoading(false))
  }, [router])

  useEffect(() => {
    axios.get(`${apiUrl}/api/expertises`)
      .then((res) => setExpertises(res.data))
      .catch((err) => console.error('Erreur lors du chargement des expertises', err))
  }, [])

  useEffect(() => {
    const idParam = searchParams.get('id')
    if (idParam && besoins.length > 0) {
      const found = besoins.find((b) => b.id === Number(idParam))
      if (found) setSelectedBesoin(found)
    }
  }, [searchParams, besoins])

  const filteredBesoins = besoins.filter((b) => {
    const matchesExpertise = selectedExpertise ? b.type_prestation === selectedExpertise : true
    const matchesLocation = searchLocation
      ? b.address.toLowerCase().includes(searchLocation.toLowerCase())
      : true
    return matchesExpertise && matchesLocation
  })

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingText}>Chargement des annonces...</p>
    </div>
  )

  if (error) return (
    <div className={styles.errorContainer}>
      <p className={styles.errorText}>{error}</p>
    </div>
  )

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Toutes les annonces</h1>
        <p className={styles.subtitle}>Trouvez des opportunités près de chez vous</p>
      </header>

      <div className={styles.filtersContainer}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Rechercher par localisation..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className={styles.searchInput}
            aria-label="Recherche par localisation"
          />
          <svg className={styles.searchIcon} viewBox="0 0 24 24" width="20" height="20">
            <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </div>

        <div className={styles.filterDropdown}>
          <button
            className={styles.dropdownButton}
            onClick={() => setIsDropdownOpen(prev => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
          >
            <span>{selectedExpertise || 'Toutes les catégories'}</span>
            <svg className={styles.dropdownIcon} viewBox="0 0 24 24" width="16" height="16">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </button>

          {isDropdownOpen && (
            <div className={styles.dropdownMenu}>
              <div
                className={styles.dropdownItem}
                onClick={() => {
                  setSelectedExpertise('')
                  setIsDropdownOpen(false)
                }}
              >
                Toutes les catégories
              </div>
              {expertises.map((exp, i) => (
                <div
                  key={i}
                  className={styles.dropdownItem}
                  onClick={() => {
                    setSelectedExpertise(exp)
                    setIsDropdownOpen(false)
                  }}
                >
                  {exp}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {filteredBesoins.length === 0 ? (
        <div className={styles.emptyState}>
          <svg className={styles.emptyIcon} viewBox="0 0 24 24" width="60" height="60">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
          <p className={styles.emptyText}>Aucune annonce ne correspond à vos critères</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredBesoins.map((b) => (
            <div key={b.id} className={styles.card}>
              <div className={styles.cardHeader}>
                {b.client.avatar_url ? (
                  <img
                    src={b.client.avatar_url}
                    alt={`${b.client.first_name} ${b.client.last_name}`}
                    className={styles.clientAvatar}
                    width={40}
                    height={40}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {b.client.first_name.charAt(0)}{b.client.last_name.charAt(0)}
                  </div>
                )}
                <h2 className={styles.cardTitle}>{b.type_prestation}</h2>
              </div>

              <p className={styles.cardDescription}>{b.description}</p>

              <div className={styles.cardMeta}>
                <div className={styles.locationContainer}>
                  <svg className={styles.locationIcon} viewBox="0 0 24 24" width="16" height="16">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span className={styles.locationText}>{b.address}</span>
                </div>

                <button
                  className={styles.detailsButton}
                  onClick={() => setSelectedBesoin(b)}
                >
                  Voir les détails
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBesoin && (
        <div className={styles.modalOverlay} onClick={() => setSelectedBesoin(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeModalButton}
              onClick={() => setSelectedBesoin(null)}
              aria-label="Fermer"
            >
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>

            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{selectedBesoin.type_prestation}</h2>
              {selectedBesoin.client.avatar_url ? (
                <img
                  src={selectedBesoin.client.avatar_url}
                  alt={`${selectedBesoin.client.first_name} ${selectedBesoin.client.last_name}`}
                  className={styles.modalAvatar}
                  width={50}
                  height={50}
                />
              ) : (
                <div className={styles.modalAvatarPlaceholder}>
                  {selectedBesoin.client.first_name.charAt(0)}{selectedBesoin.client.last_name.charAt(0)}
                </div>
              )}
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalSection}>
                <h3 className={styles.sectionTitle}>Description</h3>
                <p className={styles.sectionContent}>{selectedBesoin.description}</p>
              </div>

              <div className={styles.modalSection}>
                <h3 className={styles.sectionTitle}>Localisation</h3>
                <p className={styles.sectionContent}>{selectedBesoin.address}</p>
              </div>

              {selectedBesoin.image_urls.length > 0 && (
                <div className={styles.modalSection}>
                  <h3 className={styles.sectionTitle}>Images</h3>
                  <div className={styles.imageGallery}>
                    {selectedBesoin.image_urls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Image ${i + 1}`}
                        className={styles.modalImage}
                        loading="lazy"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.modalSection}>
                <h3 className={styles.sectionTitle}>Contact</h3>
                <div className={styles.contactInfo}>
                  <p className={styles.contactName}>{selectedBesoin.client.first_name} {selectedBesoin.client.last_name}</p>
                  <a href={`mailto:${selectedBesoin.client.email}`} className={styles.contactEmail}>
                    {selectedBesoin.client.email}
                  </a>
                  <a href={`tel:${selectedBesoin.client.phone}`} className={styles.contactPhone}>
                    {selectedBesoin.client.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


















