'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FiMapPin, FiSearch } from 'react-icons/fi'
import { FaBriefcase } from 'react-icons/fa'
import styles from './SearchForm.module.scss'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

type Commune = {
  nom: string
  codesPostaux: string[]
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Erreur réseau')
  return res.json()
}

export default function SearchForm({ defaultExpertise = '', defaultLocation = '' }) {
  const router = useRouter()

  const [expertises, setExpertises] = useState<string[]>([])
  const [selectedExpertise, setSelectedExpertise] = useState(defaultExpertise)
  const [location, setLocation] = useState(defaultLocation)
  const [expertiseSuggestions, setExpertiseSuggestions] = useState<string[]>([])
  const [showExpertiseSuggestions, setShowExpertiseSuggestions] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const expertiseRef = useRef<HTMLDivElement>(null)
  const locationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchExpertises = async () => {
      try {
        const data = await fetchJSON<string[]>(`${apiUrl}/api/expertises`)
        setExpertises(data)
      } catch (err) {
        console.error('Erreur récupération expertises :', err)
      }
    }
    fetchExpertises()
  }, [])

  useEffect(() => {
    setSelectedExpertise(defaultExpertise)
  }, [defaultExpertise])

  useEffect(() => {
    setLocation(defaultLocation)
  }, [defaultLocation])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expertiseRef.current && !expertiseRef.current.contains(event.target as Node)) {
        setShowExpertiseSuggestions(false)
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedExpertise || !location) return

    setIsLoading(true)
    router.push(`/search-bar?expertise=${selectedExpertise}&location=${location}`)
  }

  const handleExpertiseChange = (value: string) => {
    setSelectedExpertise(value)
    if (value.length >= 1) {
      const filtered = expertises.filter(exp =>
        exp.toLowerCase().startsWith(value.toLowerCase())
      )
      setExpertiseSuggestions(filtered)
      setShowExpertiseSuggestions(true)
    } else {
      setShowExpertiseSuggestions(false)
    }
  }

  const handleExpertiseFocus = () => {
    setExpertiseSuggestions(expertises)
    setShowExpertiseSuggestions(true)
  }

  const handleLocationChange = async (value: string) => {
    setLocation(value)
    if (value.length < 2) return setShowLocationSuggestions(false)

    try {
      const isPostalCode = /^\d+$/.test(value)
      const endpoint = isPostalCode
        ? `https://geo.api.gouv.fr/communes?codePostal=${value}&fields=nom,codesPostaux&limit=10`
        : `https://geo.api.gouv.fr/communes?nom=${value}&fields=nom,codesPostaux&limit=10`

      const data = await fetchJSON<Commune[]>(endpoint)

      const formatted = isPostalCode
        ? [...new Set(data.flatMap((c) => c.codesPostaux.filter(cp => cp.startsWith(value))))]
        : [...new Set(data.map((c) => c.nom))]

      setLocationSuggestions(formatted)
      setShowLocationSuggestions(true)
    } catch (err) {
      console.error('Erreur communes :', err)
      setLocationSuggestions([])
    }
  }

  return (
    <form className={styles.searchForm} onSubmit={handleSubmit} autoComplete="off">
      <div className={styles.row}>

        {/* Expertise */}
        <div className={styles.autocomplete} ref={expertiseRef}>
          <FaBriefcase className={styles.icon} />
          <input
            type="text"
            placeholder="Quel pro recherchez-vous ?"
            value={selectedExpertise}
            onChange={(e) => handleExpertiseChange(e.target.value)}
            onFocus={handleExpertiseFocus}
            required
          />
          {showExpertiseSuggestions && (
            <ul className={styles.suggestions}>
              {expertiseSuggestions.map((sug) => (
                <li key={sug} onClick={() => {
                  setSelectedExpertise(sug)
                  setShowExpertiseSuggestions(false)
                }}>{sug}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Localisation */}
        <div className={styles.autocomplete} ref={locationRef}>
          <FiMapPin className={styles.icon} />
          <input
            type="text"
            placeholder="Ville ou code postal"
            value={location}
            onChange={(e) => handleLocationChange(e.target.value)}
            required
          />
          {showLocationSuggestions && (
            <ul className={styles.suggestions}>
              {locationSuggestions.map((entry) => (
                <li key={entry} onClick={() => {
                  setLocation(entry)
                  setShowLocationSuggestions(false)
                }}>{entry}</li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading
            ? <span className={styles.loader}></span>
            : <>Rechercher <FiSearch /></>
          }
        </button>
      </div>
    </form>
  )
}




