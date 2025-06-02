'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import styles from './SearchForm.module.scss'

export default function SearchForm({ defaultExpertise = '', defaultLocation = '' }) {
  const router = useRouter()

  // État des expertises récupérées depuis l'API
  const [expertises, setExpertises] = useState<string[]>([])

  // États pour les champs du formulaire
  const [selectedExpertise, setSelectedExpertise] = useState(defaultExpertise)
  const [location, setLocation] = useState(defaultLocation)

  // Suggestions et affichage pour expertise
  const [expertiseSuggestions, setExpertiseSuggestions] = useState<string[]>([])
  const [showExpertiseSuggestions, setShowExpertiseSuggestions] = useState(false)

  // Suggestions et affichage pour location
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)

  // Refs pour gérer les clics hors des zones de saisie
  const expertiseRef = useRef<HTMLDivElement>(null)
  const locationRef = useRef<HTMLDivElement>(null)

  // Récupération des expertises au montage du composant
  useEffect(() => {
    const fetchExpertises = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/expertises")
        const data = await res.json()
        setExpertises(data)
      } catch (err) {
        console.error("Erreur récupération expertises :", err)
      }
    }
    fetchExpertises()
  }, [])

  // Mise à jour des valeurs par défaut si elles changent
  useEffect(() => {
    setSelectedExpertise(defaultExpertise)
  }, [defaultExpertise])

  useEffect(() => {
    setLocation(defaultLocation)
  }, [defaultLocation])

  // Fermer les suggestions si clic hors des champs
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
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  // Soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedExpertise || !location) return
    router.push(`/search-bar?expertise=${selectedExpertise}&location=${location}`)
  }

  // Gestion de la saisie expertise et suggestions
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

  // Gestion de la saisie location et suggestions
  const handleLocationChange = async (value: string) => {
    setLocation(value)

    if (value.length < 2) {
      setShowLocationSuggestions(false)
      return
    }

    try {
      let communes: any[] = []

      const isPostalCode = /^\d+$/.test(value)

      if (isPostalCode) {
        const res = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${value}&fields=nom,codesPostaux&limit=10`)
        communes = await res.json()

        const formatted = communes.flatMap((commune: any) =>
          commune.codesPostaux
            .filter((cp: string) => cp.startsWith(value))
        )

        setLocationSuggestions([...new Set(formatted)]) // Liste unique de codes postaux
      } else {
        const res = await fetch(`https://geo.api.gouv.fr/communes?nom=${value}&fields=nom,codesPostaux&limit=10`)
        communes = await res.json()

        const formatted = communes.map((commune: any) => commune.nom)
        setLocationSuggestions([...new Set(formatted)]) // Liste unique de villes
      }

      setShowLocationSuggestions(true)
    } catch (err) {
      console.error('Erreur de récupération des communes :', err)
      setLocationSuggestions([])
    }
  }

  // Sélection d’une suggestion expertise
  const handleExpertiseSelect = (value: string) => {
    setSelectedExpertise(value)
    setShowExpertiseSuggestions(false)
  }

  // Sélection d’une suggestion location
  const handleLocationSelect = (value: string) => {
    setLocation(value)
    setShowLocationSuggestions(false)
  }

  return (
    <form className={styles.searchForm} onSubmit={handleSubmit} autoComplete="off">
      <div className={styles.row}>

        {/* Champ expertise */}
        <div className={styles.autocomplete} ref={expertiseRef}>
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
                <li key={sug} onClick={() => handleExpertiseSelect(sug)}>
                  {sug}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Champ ville ou code postal */}
        <div className={styles.autocomplete} ref={locationRef}>
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
                <li key={entry} onClick={() => handleLocationSelect(entry)}>
                  {entry}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit">Rechercher 🔍</button>
      </div>
    </form>
  )
}


