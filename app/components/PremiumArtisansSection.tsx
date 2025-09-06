'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from './PremiumArtisansSection.module.scss'
import Image from 'next/image'
import { FaMapMarkerAlt } from 'react-icons/fa'
import PremiumBadge from './PremiumBadge'

interface Artisan {
  id: number
  company_name: string
  city: string
  address?: string
  avatar_url?: string | null
  profile_url: string
  expertises: string[]
  expertise_names?: string[]
  membership_plan?: string
  average_rating?: number
  total_reviews?: number
}

function PremiumArtisansContent() {
  const [artisans, setArtisans] = useState<Artisan[]>([])
  const params = useSearchParams()
  const expertise = params.get('expertise') ?? ''
  const location = params.get('location') ?? params.get('localisation') ?? ''
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

    fetch(`${apiUrl}/api/v1/artisans/premium`)
      .then(res => {
        console.log('Response status:', res.status)
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        console.log('Data received:', data)

        if (Array.isArray(data)) {
          setArtisans(data)
        } else if (data && Array.isArray(data.artisans)) {
          setArtisans(data.artisans)
        } else {
          console.error('Data is not an array:', data)
          setError('Format de données invalide')
        }

        setLoading(false)
      })
      .catch(err => {
        console.error('Fetch error:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className={styles.star}>⭐</span>)
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className={styles.halfStar}>⭐</span>)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className={styles.emptyStar}>☆</span>)
    }

    return stars
  }

  if (loading) return <div>Chargement des artisans...</div>
  if (error) return <div>Erreur: {error}</div>
  if (artisans.length === 0) return <div>Aucun artisan premium trouvé</div>

  return (
    <section className={styles.premiumSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>Nos Artisans Premium</h2>
        <div className={styles.grid}>
          {artisans.map(artisan => (
            <div key={artisan.id} className={styles.card}>
              {/* Tout votre contenu existant reste identique */}
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
                    <PremiumBadge
                      membershipPlan="Premium"
                      className={styles.premiumBadge}
                    />
                  </div>
                  {(artisan.expertises || artisan.expertise_names) && (
                    <div className={styles.expertiseTags}>
                      {(artisan.expertise_names || artisan.expertises)?.slice(0, 3).map((expertise, index) => (
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
                  <p className={styles.address}>{artisan.address || artisan.city}</p>
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
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function PremiumArtisansSection() {
  return (
    <Suspense fallback={<div className={styles.loading}>Chargement des artisans premium...</div>}>
      <PremiumArtisansContent />
    </Suspense>
  )
}




