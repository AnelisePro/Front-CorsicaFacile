'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
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

// Utilitaire pour extraire le nom de fichier depuis une URL ou une "key"
const getFilenameFromKey = (key: string) => {
  return key.split('/').pop() || 'file'
}

// Utilitaire pour récupérer le content type selon l'extension
const getContentType = (filename: string) => {
  if (filename.endsWith('.svg')) return 'image/svg+xml'
  if (filename.endsWith('.png')) return 'image/png'
  if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg'
  return 'application/octet-stream'
}

// Récupérer une URL signée pour une image
const fetchPresignedUrl = async (
  filename: string,
  purpose = 'uploads'
) => {
  const artisanToken = localStorage.getItem('artisanToken')
  const content_type = getContentType(filename)

  try {
    const response = await axios.post(
      `${apiUrl}/presigned_url`,
      { filename, content_type, purpose },
      {
        headers: { Authorization: `Bearer ${artisanToken}` },
      }
    )
    return response.data.url
  } catch (error: any) {
    console.error('Erreur fetchPresignedUrl:', error)
    throw error
  }
}

// Composant pour afficher une image avec URL signée
function SignedImage({ imageKey }: { imageKey: string }) {
  const [signedUrl, setSignedUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const filename = getFilenameFromKey(imageKey)

    fetchPresignedUrl(filename)
      .then((url) => {
        console.log('URL signée:', url)
        setSignedUrl(url)
      })
      .catch((err) => {
        console.error('Erreur fetchPresignedUrl:', err)
        if (err.response?.status === 422) {
          setError('Image non trouvée ou paramètres invalides.')
        } else {
          setError('Erreur lors du chargement de l’image.')
        }
      })
  }, [imageKey])

  if (error) return <p>{error}</p>
  if (!signedUrl) return <p>Chargement de l'image...</p>

  return (
    <img
      src={signedUrl}
      alt="Image besoin"
      width={150}
      height={150}
      className={styles.image}
    />
  )
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

  useEffect(() => {
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

  useEffect(() => {
    axios
      .get(`${apiUrl}/api/expertises`)
      .then((res) => setExpertises(res.data))
      .catch((err) => console.error('Erreur lors du chargement des expertises', err))
  }, [])

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

      {/* Barre de filtres */}
      <div className={styles.filters}>
        <div className={styles.dropdown}>
          <button
            className={styles.dropdownToggle}
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
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
              >
                Toutes les types
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
              <button className={styles.button} onClick={() => setSelectedBesoin(b)}>
                En savoir plus
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedBesoin && (
        <div className={styles.modalOverlay} onClick={() => setSelectedBesoin(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setSelectedBesoin(null)}>
              ✕
            </button>
            <h2 className={styles.modalTitle}>Informations supplémentaires</h2>

            <div className={styles.images}>
              {selectedBesoin.image_urls.length > 0 ? (
                selectedBesoin.image_urls.map((key, i) => <SignedImage key={i} imageKey={key} />)
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












