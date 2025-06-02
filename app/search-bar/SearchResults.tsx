'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import SearchForm from '../components/SearchForm'
import styles from './page.module.scss'
import { FaMapMarkerAlt } from 'react-icons/fa'

const Map = dynamic(() => import('../components/Map'), { ssr: false })

type Artisan = {
  id: string
  company_name: string
  expertise_names?: string[] 
  address: string
  latitude?: number
  longitude?: number
  avatar_url?: string | null
}

function isArtisan(a: Artisan | null): a is Artisan {
  return a !== null
}

export default function RecherchePage() {
  const params = useSearchParams()
  const expertise = params.get('expertise') ?? ''
  const location = params.get('location') ?? params.get('localisation') ?? ''


  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([41.9, 8.7])
  const [mapZoom, setMapZoom] = useState<number>(10)
  const [hoveredArtisanId, setHoveredArtisanId] = useState<string | null>(null)

  // Ref pour scroller vers l'artisan en surbrillance
  const artisanRefs = useRef<{ [key: string]: HTMLLIElement | null }>({})

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
      setMapCenter([41.9, 8.7])
      setMapZoom(10)
      return
    }

    setLoading(true)
    setError(null)

    fetch(`http://localhost:3001/artisans?expertise=${encodeURIComponent(expertise)}&location=${encodeURIComponent(location)}`)
      .then(res => res.json())
      .then(async (data) => {
        const artisanList: Artisan[] = Array.isArray(data) ? data : data.artisans ?? []

        const artisansWithCoords = await Promise.all(
          artisanList.map(async (artisan) => {
            const coords = await geocodeAddress(artisan.address)
            if (coords) {
              return { ...artisan, latitude: coords[0], longitude: coords[1] }
            }
            return null
          })
        )

        const filteredArtisans = artisansWithCoords.filter(isArtisan) as Artisan[]

        setArtisans(filteredArtisans)

        if (filteredArtisans.length > 0) {
          const first = filteredArtisans[0]
          setMapCenter([first.latitude!, first.longitude!])
          setMapZoom(13)
        } else {
          setMapCenter([41.9, 8.7])
          setMapZoom(10)
        }
      })
      .catch(err => {
        console.error(err)
        setError('Erreur lors de la récupération des artisans.')
        setArtisans([])
        setMapCenter([41.9, 8.7])
        setMapZoom(10)
      })
      .finally(() => setLoading(false))
  }, [expertise, location])

  // Scroll vers l'artisan en surbrillance et recentre la carte
  useEffect(() => {
    if (hoveredArtisanId) {
      const el = artisanRefs.current[hoveredArtisanId]
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }

      // Recentre la carte sur l'artisan sélectionné
      const selected = artisans.find(a => a.id === hoveredArtisanId)
      if (selected && selected.latitude !== undefined && selected.longitude !== undefined) {
        setMapCenter([selected.latitude, selected.longitude])
        setMapZoom(15) // zoom plus proche sur sélection
      }
    }
  }, [hoveredArtisanId, artisans])

  return (
    <div className={styles.resultsPage}>
      <div className={styles.mapSection}>
        <Map
          center={mapCenter}
          zoom={mapZoom}
          markers={artisans.map(a => ({
            id: a.id,
            position: [a.latitude!, a.longitude!],
            label: a.company_name
          }))}
          onMarkerClick={(id) => setHoveredArtisanId(id)}
        />
      </div>

      <div className={styles.resultsSection}>
        <SearchForm defaultExpertise={expertise} defaultLocation={location} />

        {loading && <p>Chargement…</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && !error && (
          artisans.length === 0
            ? <p>Aucun artisan trouvé pour cette recherche.</p>
            : <ul className={styles.artisanList}>
                {artisans.map(artisan => (
                  <li
                    key={artisan.id}
                    className={`${styles.artisanCard} ${hoveredArtisanId === artisan.id ? styles.hovered : ''}`}
                    ref={el => {
                      artisanRefs.current[artisan.id] = el
                    }}
                    onClick={() => setHoveredArtisanId(artisan.id)} // <-- ici on gère le clic
                    style={{ cursor: 'pointer' }} // pour indiquer que c'est cliquable
                  >
                    <div className={styles.avatar}>
                      <img
                        src={
                          artisan.avatar_url
                            ? `${artisan.avatar_url}?t=${Date.now()}`
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(artisan.company_name)}&background=007bff&color=fff&rounded=true`
                        }
                        alt={`${artisan.company_name} avatar`}
                        width={64}
                        height={64}
                      />
                    </div>

                    <div className={styles.info}>
                      <h3>{artisan.company_name}</h3>

                      <p className={styles.address}>
                        <FaMapMarkerAlt aria-hidden="true" />
                        <span>{artisan.address}</span>
                      </p>

                      <div className={styles.actions}>
                        {artisan.expertise_names && artisan.expertise_names.length > 0 && (
                          <span className={styles.expertiseTag}>{artisan.expertise_names.join(', ')}</span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(`/artisan-profile/${artisan.id}`, '_blank')
                          }}
                          aria-label={`Contacter ${artisan.company_name}`}
                        >
                          Voir le profil
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
        )}
      </div>
    </div>
  )
}




