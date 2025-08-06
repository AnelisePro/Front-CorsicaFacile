'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Step1 from '../components/besoin/Step1'
import Step2 from '../components/besoin/Step2'
import Step3 from '../components/besoin/Step3'
import Step4 from '../components/besoin/Step4'
import Step5 from '../components/besoin/Step5'
import styles from './page.module.scss'
import { BesoinFormData } from '../components/besoin/BesoinFormData'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const BesoinForm = () => {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [token, setToken] = useState<string | null>(null)

  const [formData, setFormData] = useState<BesoinFormData>({
    type_prestation: '',
    custom_prestation: undefined,
    description: '',
    images: [],
    schedule: {
      type: 'single_day',
      start_time: '',
      end_time: ''
    },
    address: ''
  })

  useEffect(() => {
    const clientToken = localStorage.getItem('clientToken')
    if (!clientToken) {
      router.push('/auth/login_client')
    } else {
      setToken(clientToken)
      axios.get(`${apiUrl}/clients/me`, {
        headers: { Authorization: `Bearer ${clientToken}` }
      }).catch(() => {
        router.push('/auth/login_client')
      })
    }
  }, [router])

  const isStepValid = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        if (!formData.type_prestation) return false
        if (formData.type_prestation === 'Autre' && !formData.custom_prestation?.trim()) return false
        return true

      case 2:
        return formData.description.trim().length >= 30

      case 3:
        // images facultatives, toujours valide
        return true

      case 4:
        const { type, start_time, end_time, date, start_date, end_date } = formData.schedule
        
        // Vérifier les horaires
        if (!start_time || !end_time || start_time >= end_time) return false
        
        // Vérifier les dates selon le type
        if (type === 'single_day') {
          return !!date
        } else if (type === 'date_range') {
          return !!start_date && !!end_date && start_date <= end_date
        }
        
        return false

      case 5:
        return !!formData.address?.trim()

      default:
        return true
    }
  }

  const handleNext = () => {
    if (!isStepValid(step)) return
    setStep((prev) => Math.min(prev + 1, 5))
  }

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!token) return

    // Préparer les données avec le nouveau format de schedule
    const submitData = {
      type_prestation: formData.type_prestation,
      custom_prestation: formData.custom_prestation,
      description: formData.description,
      address: formData.address,
      schedule: {
        type: formData.schedule.type,
        start_time: formData.schedule.start_time,
        end_time: formData.schedule.end_time,
        ...(formData.schedule.type === 'single_day' 
          ? { date: formData.schedule.date }
          : { 
              start_date: formData.schedule.start_date,
              end_date: formData.schedule.end_date 
            }
        )
      },
      images: formData.images
    }

    console.log('Données envoyées:', submitData)

    try {
      const response = await axios.post(`${apiUrl}/clients/besoins`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Réponse serveur:', response.data)
      router.push('/dashboard/client?success=besoin_created')
    } catch (error: any) {
      console.error('Erreur lors de la soumission', error)
      if (error.response) {
        console.error('Détails erreur:', error.response.data)
        
        // Gestion des erreurs spécifiques
        if (error.response.status === 422) {
          alert('Données de planning invalides. Veuillez vérifier vos sélections.')
          setStep(4) // Retour au step du planning
        } else {
          alert('Une erreur est survenue lors de l\'envoi. Veuillez réessayer.')
        }
      } else {
        alert('Erreur de connexion. Veuillez vérifier votre connexion internet.')
      }
    }
  }

  const steps = [
    <div key="intro" className={styles.intro}>
      <h1 className={styles.title}>Déclarer un besoin</h1>
      <p className={styles.paragraphLarge}>
        Trouvez facilement un artisan de <span className={styles.textStrong}>confiance</span> en{' '}
        <span className={`${styles.textExtraStrong} ${styles.textBlue}`}>Corse</span> !
      </p>
      <p className={styles.paragraphMedium}>
        Avec <span className={styles.textStrong + ' ' + styles.textGreen}>CorsicaFacile</span>, décrivez votre besoin en quelques étapes, et on s'occupe du reste.
      </p>
      <p className={styles.paragraphLarge}>
        Un artisan qualifié vous répond rapidement !
      </p>
      <button
        onClick={() => setStep(1)}
        className={styles.buttonStart}
        type="button"
      >
        Commencer ma déclaration
      </button>
    </div>,

    <Step1 key="step1" data={formData} setData={setFormData} setStep={setStep} />,
    <Step2 key="step2" data={formData} setData={setFormData} />,
    <Step3 key="step3" data={formData} setData={setFormData} />,
    <Step4 key="step4" data={formData} setData={setFormData} />,
    <Step5 key="step5" data={formData} setData={setFormData} />
  ]

  const totalSteps = 5

  return (
    <div className={styles.container}>
      {step > 0 && (
        <div className={styles.progressBarContainer}>
          {[...Array(totalSteps)].map((_, i) => {
            const stepIndex = i + 1
            const isActive = step >= stepIndex
            return (
              <div key={stepIndex} className={styles.stepWrapper}>
                <div className={`${styles.stepCircle} ${isActive ? styles.active : ''}`}>
                  {stepIndex}
                </div>
                {stepIndex !== totalSteps && (
                  <div className={`${styles.stepLine} ${step > stepIndex ? styles.activeLine : ''}`} />
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className={styles.formContainer}>{steps[step]}</div>

      {step > 0 && (
        <div className={styles.buttonsNav}>
          {step > 1 ? (
            <button onClick={handleBack} className={styles.buttonBack} type="button">
              Retour
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              onClick={handleNext}
              className={styles.buttonNext}
              type="button"
              disabled={!isStepValid(step)}
              aria-disabled={!isStepValid(step)}
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className={styles.buttonSubmit}
              type="button"
            >
              Valider
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default BesoinForm














