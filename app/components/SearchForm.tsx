'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './SearchForm.module.scss'

const expertises = [
  "Antenniste", "Assainisseur", "Balnéo", "Bâtiment", "Béton", "Calorifugeur", "Canalisateur", "Chapiste",
  "Charpentier", "Chantier", "Chauffagiste", "Cheministe/Fumisterie", "Cloisonneur", "Climaticien",
  "Conducteur", "Travaux", "Cordiste", "Cordonnier", "Couturier", "Couvreur", "Cuisiniste", "Déboucheur",
  "Déménageur", "Démolisseur", "Dessinateur", "Désamianteur", "Désinsectiseur", "Diagnostiqueur",
  "Ébéniste", "Échafaudeur", "Électricien", "Économiste", "Électroménager", "Enduiseur", "Entretien",
  "Escaliers", "Étancheur", "Façadier", "Ferronnier", "Forgeron", "Foreur", "Géomètre", "Goudron",
  "Gouttière", "Graveur", "Grutier", "Humidité", "Incendie", "Installateur de mobilier", "Photovoltaïque",
  "Irrigation", "Isolateur", "Jointeur", "Jardinier", "Maçon", "Marbrier", "Menuisier", "Monte-charges",
  "Multi-services", "Paratonnerres", "Paysagiste", "Peintre", "Pisciniste", "Plâtrier", "Plombier",
  "PMR", "Portes", "Poseur de revêtement de sol", "Potier", "Ramoneur", "Restaurateur de meubles",
  "Sécurité", "Serrurier", "Spécialiste balnéo", "Terrassier", "Toiles-tendues", "Vitrier", "Vitrail",
  "Volets", "Wifi", "Zingueur"
]

export default function SearchForm({ defaultExpertise = '', defaultLocation = '' }) {
  const router = useRouter()
  const [selectedExpertise, setSelectedExpertise] = useState(defaultExpertise)
  const [location, setLocation] = useState(defaultLocation)

  const [expertiseSuggestions, setExpertiseSuggestions] = useState<string[]>([])
  const [showExpertiseSuggestions, setShowExpertiseSuggestions] = useState(false)

  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)

  useEffect(() => {
    setSelectedExpertise(defaultExpertise)
  }, [defaultExpertise])

  useEffect(() => {
    setLocation(defaultLocation)
  }, [defaultLocation])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedExpertise || !location) return
    router.push(`/search-bar?expertise=${selectedExpertise}&localisation=${location}`)
  }

  const handleExpertiseChange = (value: string) => {
    setSelectedExpertise(value)
    if (value.length >= 2) {
      const filtered = expertises.filter(exp =>
        exp.toLowerCase().includes(value.toLowerCase())
      )
      setExpertiseSuggestions(filtered.slice(0, 6))
      setShowExpertiseSuggestions(true)
    } else {
      setShowExpertiseSuggestions(false)
    }
  }

  // Ville ou code postal avec affichage : "Ville (CodePostal)"
  const handleLocationChange = async (value: string) => {
  setLocation(value)

  if (value.length < 2) {
    setShowLocationSuggestions(false)
    return
  }

  try {
    let communes: any[] = []

    // Recherche par nom ou par code postal selon l'entrée
    if (/^\d+$/.test(value)) {
      const res = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${value}&fields=nom,codesPostaux&limit=10`)
      communes = await res.json()
    } else {
      const res = await fetch(`https://geo.api.gouv.fr/communes?nom=${value}&fields=nom,codesPostaux&limit=10`)
      communes = await res.json()
    }

    // Format affiché : "20000 Ajaccio"
    const formatted = communes.flatMap((commune: any) =>
      commune.codesPostaux.map((cp: string) => `${cp} ${commune.nom}`)
    )

    setLocationSuggestions(formatted)
    setShowLocationSuggestions(true)
  } catch (err) {
    console.error('Erreur de récupération des communes :', err)
    setLocationSuggestions([])
  }
}

  const handleExpertiseSelect = (value: string) => {
    setSelectedExpertise(value)
    setShowExpertiseSuggestions(false)
  }

  const handleLocationSelect = (value: string) => {
    setLocation(value)
    setShowLocationSuggestions(false)
  }

  return (
    <form className={styles.searchForm} onSubmit={handleSubmit} autoComplete="off">
      <div className={styles.row}>
        {/* Champ expertise */}
        <div className={styles.autocomplete}>
          <input
            type="text"
            placeholder="Quel pro recherchez-vous ?"
            value={selectedExpertise}
            onChange={(e) => handleExpertiseChange(e.target.value)}
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
        <div className={styles.autocomplete}>
          <input
            type="text"
            placeholder="Ville ou code postal"
            value={location}
            onChange={(e) => handleLocationChange(e.target.value)}
            required
          />
          {showLocationSuggestions && (
            <ul className={styles.suggestions}>
              {locationSuggestions.map((city) => (
                <li key={city} onClick={() => handleLocationSelect(city)}>
                  {city}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit">Rechercher  🔍</button>
      </div>
    </form>
  )
}
