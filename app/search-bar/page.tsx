'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import SearchForm from '../components/SearchForm'
import styles from './page.module.scss'

// Chargement dynamique de Leaflet Map pour éviter problème SSR
const Map = dynamic(() => import('../components/Map'), { ssr: false })

type Artisan = {
  id: string
  company_name: string
  address: string
  latitude?: number
  longitude?: number
}

// Type guard pour filtrer les valeurs null
function isArtisan(a: Artisan | null): a is Artisan {
  return a !== null
}

export default function RecherchePage() {
  const params = useSearchParams()
  const expertise = params.get('expertise') ?? ''
  const location = params.get('localisation') ?? ''

  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function geocodeAddress(address: string): Promise<[number, number] | null> {
    try {
      const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`)
      const data = await res.json()

      if (data.features && data.features.length > 0) {
        const [lon, lat] = data.features[0].geometry.coordinates
        return [lat, lon]
      }
      return null
    } catch (e) {
      console.error('Erreur de géocodage pour', address, e)
      return null
    }
  }

  useEffect(() => {
    if (!expertise || !location) {
      setArtisans([])
      return
    }

    setLoading(true)
    setError(null)

    fetch(`http://localhost:3001/artisans?expertise=${encodeURIComponent(expertise)}&location=${encodeURIComponent(location)}`)
      .then(res => res.json())
      .then(async (data) => {
        const artisanList: Artisan[] = Array.isArray(data) ? data : data.artisans ?? []

        // Géocode toutes les adresses
        const artisansWithCoords = await Promise.all(
          artisanList.map(async (artisan) => {
            const coords = await geocodeAddress(artisan.address)
            if (coords) {
              return { ...artisan, latitude: coords[0], longitude: coords[1] }
            }
            return null
          })
        )

        // Filtrage avec type guard pour enlever les null
        const filteredArtisans = artisansWithCoords.filter(isArtisan) as Artisan[]

        setArtisans(filteredArtisans)
      })
      .catch(err => {
        console.error(err)
        setError('Erreur lors de la récupération des artisans.')
        setArtisans([])
      })
      .finally(() => setLoading(false))
  }, [expertise, location])

  return (
    <div className={styles.resultsPage}>
      <div className={styles.mapSection}>
        <Map
          center={[41.9, 8.7]} // Centre Corse par défaut
          markers={artisans.map(a => ({
            position: [a.latitude!, a.longitude!],
            label: a.company_name
          }))}
        />
      </div>

      <div className={styles.resultsSection}>
        <SearchForm defaultExpertise={expertise} defaultLocation={location} />

        <div className={styles.searchBarSmall}>
          <p><strong>Domaine :</strong> {expertise}</p>
          <p><strong>Localisation :</strong> {location}</p>
        </div>

        {loading && <p>Chargement...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && !error && (
          artisans.length === 0
            ? <p>Aucun artisan trouvé pour cette recherche.</p>
            : <ul className={styles.artisanList}>
                {artisans.map(artisan => (
                  <li key={artisan.id}>
                    <h3>{artisan.company_name}</h3>
                    <p>{artisan.address}</p>
                    <button onClick={() => {
                      const isAuthenticated = false
                      if (!isAuthenticated) window.location.href = '/auth/login_client'
                      else {/* autre action */}
                    }}>
                      Contacter
                    </button>
                  </li>
                ))}
              </ul>
        )}
      </div>
    </div>
  )
}





