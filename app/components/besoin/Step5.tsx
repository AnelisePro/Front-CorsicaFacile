'use client'

import React, { useState, useEffect, useRef } from 'react'
import styles from './Step5.module.scss'

interface BesoinFormData {
  type_prestation: string
  description: string
  images: File[]
  schedule: string
  address: string
}

interface Step5Props {
  data: BesoinFormData
  setData: React.Dispatch<React.SetStateAction<BesoinFormData>>
}

interface Feature {
  properties: {
    label: string
    postcode: string
    citycode: string
  }
  geometry: {
    coordinates: [number, number]
  }
}

const CORSE_BBOX = '8.6,41.3,9.6,43' // bbox approximative Corse

const Step5 = ({ data, setData }: Step5Props) => {
  const [inputValue, setInputValue] = useState(data.address || '')
  const [suggestions, setSuggestions] = useState<Feature[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([])
      return
    }
    setLoading(true)
    try {
      const url = new URL('https://api-adresse.data.gouv.fr/search/')
      url.searchParams.append('q', query)
      url.searchParams.append('limit', '5')
      url.searchParams.append('autocomplete', '1')
      url.searchParams.append('bbox', CORSE_BBOX) // filtre géographique sur la Corse

      const response = await fetch(url.toString())
      if (!response.ok) throw new Error('Erreur réseau')
      const data = await response.json()
      setSuggestions(data.features || [])
    } catch (error) {
      console.error('Erreur API adresse:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    setShowSuggestions(true)

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(val)
    }, 300)
  }

  const onSelectSuggestion = (label: string) => {
    setInputValue(label)
    setShowSuggestions(false)
    setSuggestions([])
    setData({ ...data, address: label })
  }

  const onBlur = () => {
    setTimeout(() => setShowSuggestions(false), 150) // délai pour clic sur suggestion
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Où doit se dérouler la prestation ?</h2>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          className={styles.textInput}
          placeholder="Entrer l'adresse"
          value={inputValue}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={() => inputValue && setShowSuggestions(true)}
          aria-autocomplete="list"
          aria-haspopup="true"
          aria-expanded={showSuggestions}
          required
          spellCheck={false}
          autoComplete="off"
        />
        {loading && <div className={styles.loading}>Chargement...</div>}
        {showSuggestions && suggestions.length > 0 && (
          <ul className={styles.suggestionsList} role="listbox">
            {suggestions.map((feature) => (
              <li
                key={feature.properties.label}
                className={styles.suggestion}
                onMouseDown={() => onSelectSuggestion(feature.properties.label)}
                role="option"
                aria-selected={inputValue === feature.properties.label}
              >
                {feature.properties.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Step5

