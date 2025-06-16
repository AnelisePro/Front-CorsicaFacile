'use client'

import { useEffect, useState } from 'react'
import styles from './Step1.module.scss'
import axios from 'axios'

interface BesoinFormData {
  type_prestation: string
  description: string
  images: File[]
  schedule: string
  address: string
  custom_prestation?: string
}

interface Step1Props {
  data: BesoinFormData
  setData: React.Dispatch<React.SetStateAction<BesoinFormData>>
  setStep: React.Dispatch<React.SetStateAction<number>>
}

const Step1 = ({ data, setData, setStep }: Step1Props) => {
  const [expertises, setExpertises] = useState<string[]>([])

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/expertises`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setExpertises([...res.data.sort(), 'Autre'])
        }
      })
      .catch(() => {
        setExpertises(['Plomberie', 'Électricité', 'Peinture', 'Jardinage', 'Autre'])
      })
  }, [])

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setData((prev) => ({
      ...prev,
      type_prestation: value,
      custom_prestation: value === 'Autre' ? prev.custom_prestation || '' : undefined
    }))
  }

  return (
    <div className={styles.container}>
      <button
        onClick={() => setStep(0)}
        className={styles.buttonReturnIntro}
        type="button"
      >
        ← Retour
      </button>

      <h2 className={styles.title}>Quel type de prestation recherchez-vous ?</h2>

      <div className={styles.selectWrapper}>
        <select
          value={data.type_prestation}
          onChange={handleTypeChange}
          required
          className={styles.select}
          aria-label="Sélectionnez un type de prestation"
        >
          <option value="">-- Sélectionner --</option>
          {expertises.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <svg
          className={styles.selectArrow}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="#0F78B1"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </div>

      {data.type_prestation === 'Autre' && (
        <input
          type="text"
          placeholder="Entrez votre prestation"
          value={data.custom_prestation || ''}
          onChange={(e) =>
            setData((prev) => ({ ...prev, custom_prestation: e.target.value }))
          }
          className={styles.inputCustom}
          required
          aria-label="Saisissez votre prestation personnalisée"
        />
      )}
    </div>
  )
}

export default Step1





