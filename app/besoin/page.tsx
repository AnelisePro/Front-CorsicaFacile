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

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const BesoinForm = () => {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [token, setToken] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    type_prestation: '',
    description: '',
    images: [] as File[],
    schedule: '',
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

  const handleNext = () => {
    if (step === 2 && formData.description.length < 30) return
    setStep((prev) => Math.min(prev + 1, 5))
  }

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!token) return
    const form = new FormData()
    form.append('besoin[type_prestation]', formData.type_prestation)
    form.append('besoin[description]', formData.description)
    form.append('besoin[schedule]', JSON.stringify(formData.schedule));
    form.append('besoin[address]', formData.address)

    formData.images.forEach((file) => {
      form.append('besoin[images][]', file)
    })

    try {
      await axios.post(`${apiUrl}/clients/besoins`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      router.push('/')
    } catch (error) {
      console.error('Erreur lors de la soumission', error)
    }
  }

  const steps = [
    <div key="intro" className={styles.intro}>
      <h1 className={styles.title}>Déclarer un besoin</h1>
      <p className={`${styles.paragraphLarge}`}>
        Trouvez facilement un artisan de <span className={styles.textStrong}>confiance</span> en{' '}
        <span className={`${styles.textExtraStrong} ${styles.textBlue}`}>Corse</span> !
      </p>
      <p className={`${styles.paragraphMedium}`}>
        Avec <span className={styles.textStrong + ' ' + styles.textGreen}>CorsicaFacile</span>, décrivez votre besoin en quelques étapes, et on s’occupe du reste.
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

  return (
    <div className={styles.container}>
      {step > 0 && (
        <div className={styles.progressBarContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${(step / 5) * 100}%` }}
          />
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
            <button onClick={handleNext} className={styles.buttonNext} type="button">
              Suivant
            </button>
          ) : (
            <button onClick={handleSubmit} className={styles.buttonSubmit} type="button">
              Valider ma déclaration
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default BesoinForm







