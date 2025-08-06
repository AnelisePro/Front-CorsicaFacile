'use client'

import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import SearchForm from '../components/SearchForm'
import styles from './page.module.scss'
import { FaMapMarkerAlt, FaStar } from 'react-icons/fa'
import PremiumBadge from '../components/PremiumBadge'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const Map = dynamic(() => import('../components/Map'), { ssr: false })

type Artisan = {
  id: string
  company_name: string
  expertise_names?: string[]
  address: string
  latitude?: number
  longitude?: number
  avatar_url?: string | null
  membership_plan?: string | null
  average_rating?: number
  total_reviews?: number
}

function isArtisan(a: Artisan | null): a is Artisan {
  return a !== null
}

const LoadingSpinner = () => (
  <div className={styles.loadingContainer}>
    <div className={styles.spinner}></div>
    <p className={styles.loadingText}>Chargement des résultats...</p>
  </div>
)

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

  const artisanRefs = useRef<{ [key: string]: HTMLLIElement | null }>({})

  async function geocodeAddress(address: string): Promise<[number, number] | null> {
    try {
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`
      )
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

    sessionStorage.setItem('searchParams', JSON.stringify({
      expertise: expertise,
      location: location
    }))

    setLoading(true)
    setError(null)

    fetch(
      `${apiUrl}/artisans?expertise=${encodeURIComponent(
        expertise
      )}&location=${encodeURIComponent(location)}`,
      {
        credentials: 'include',
      }
    )
      .then(res => res.json())
      .then(async data => {
        const artisanList: Artisan[] = Array.isArray(data) ? data : data.artisans ?? []

        const artisansWithCoords = await Promise.all(
          artisanList.map(async artisan => {
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

  useEffect(() => {
    if (hoveredArtisanId) {
      const el = artisanRefs.current[hoveredArtisanId]
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }

      const selected = artisans.find(a => a.id === hoveredArtisanId)
      if (selected && selected.latitude !== undefined && selected.longitude !== undefined) {
        setMapCenter([selected.latitude, selected.longitude])
        setMapZoom(15)
      }
    }
  }, [hoveredArtisanId, artisans])

  const renderStars = (rating: number) => {
    return (
      <div className={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`${styles.star} ${
              star <= Math.round(rating) ? styles.starFilled : styles.starEmpty
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={styles.resultsPage}>
      <div className={styles.mapSection}>
        <Map
          center={mapCenter}
          zoom={mapZoom}
          markers={artisans.map(a => ({
            id: a.id,
            position: [a.latitude!, a.longitude!],
            label: a.company_name,
          }))}
          onMarkerClick={id => setHoveredArtisanId(id)}
          hoveredArtisanId={hoveredArtisanId}
        />
      </div>

      <div className={styles.resultsSection}>
        <SearchForm defaultExpertise={expertise} defaultLocation={location} />

        {loading && <LoadingSpinner />}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && !error && (
          artisans.length === 0 ? (
            <p>Aucun artisan trouvé pour cette recherche.</p>
          ) : (
            <ul className={styles.artisanList}>
              {artisans.map(artisan => (
                <li
                  key={artisan.id}
                  className={`${styles.artisanCard} ${
                    hoveredArtisanId === artisan.id ? styles.hovered : ''
                  }`}
                  ref={el => {
                    artisanRefs.current[artisan.id] = el
                  }}
                  onClick={() => setHoveredArtisanId(artisan.id)}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.avatarContainer}>
                      <Image
                        src={
                          artisan.avatar_url
                            ? artisan.avatar_url.startsWith('http')
                              ? artisan.avatar_url
                              : `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}/${artisan.avatar_url}`
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                artisan.company_name
                              )}&background=81A04A&color=fff&rounded=true`
                        }
                        alt={`${artisan.company_name} avatar`}
                        width={60}
                        height={60}
                        className={styles.avatar}
                        onError={e => {
                          (e.currentTarget as HTMLImageElement).src = '/images/avatar.svg'
                        }}
                      />
                    </div>
                    <div className={styles.companyInfo}>
                      <div className={styles.nameBadgeContainer}>
                        <h3 className={styles.companyName}>{artisan.company_name}</h3>
                        {artisan.membership_plan === 'Premium' && (
                          <PremiumBadge
                            membershipPlan={artisan.membership_plan}
                            className={styles.premiumBadge}
                          />
                        )}
                      </div>
                      {artisan.expertise_names && artisan.expertise_names.length > 0 && (
                        <div className={styles.expertiseTags}>
                          {artisan.expertise_names.map((expertise, index) => (
                            <span key={index} className={styles.expertiseTag}>
                              {expertise}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.addressContainer}>
                      <FaMapMarkerAlt className={styles.locationIcon} />
                      <p className={styles.address}>{artisan.address}</p>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.reviewsInfo}>
                      {artisan.total_reviews && artisan.total_reviews > 0 ? (
                        <>
                          <div className={styles.rating}>
                            {renderStars(artisan.average_rating || 0)}
                            <span className={styles.ratingValue}>
                              {(artisan.average_rating || 0).toFixed(1)}
                            </span>
                          </div>
                          <span className={styles.reviewsCount}>
                            ({artisan.total_reviews} avis)
                          </span>
                        </>
                      ) : (
                        <span className={styles.noReviews}>Aucun avis</span>
                      )}
                    </div>
                    
                    <button
                      className={styles.profileButton}
                      onClick={e => {
                        e.stopPropagation()
                        window.open(`/artisan-profile/${artisan.id}?expertise=${encodeURIComponent(expertise)}&location=${encodeURIComponent(location)}`, '_blank')
                      }}
                      aria-label={`Voir le profil de ${artisan.company_name}`}
                    >
                      <span>Voir le profil</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  )
}







