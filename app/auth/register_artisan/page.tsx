'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import styles from './page.module.scss'
import { loadStripe } from '@stripe/stripe-js'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ArtisanInscription() {
  const router = useRouter()
  const [expertiseList, setExpertiseList] = useState<string[]>([])
  const [companyName, setCompanyName] = useState('')
  const [streetNumber, setStreetNumber] = useState('')
  const [streetName, setStreetName] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [expertise, setExpertise] = useState('')
  const [customExpertise, setCustomExpertise] = useState('')
  const [siren, setSiren] = useState('')
  const [kbisFile, setKbisFile] = useState<File | null>(null)
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null)
  const [kbisUrl, setKbisUrl] = useState('')
  const [insuranceUrl, setInsuranceUrl] = useState('')
  const [membershipPlan, setMembershipPlan] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const stripePublishableKey = 'pk_test_51RO446Rs43niZdSJN0YjPjgq7HdFlhdFqqUqpsKxmgTAMHDyjK2g6Qh9FaRtdLjTWIkCz7ARow4rpyDliAzgzIgT00b0r32PoM'

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/expertises`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setExpertiseList(data)
        }
      })
      .catch(() => toast.error('Erreur lors du chargement des expertises'))
  }, [])

  const uploadFileToS3 = async (file: File) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/presigned_url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, content_type: file.type }),
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok || !data.url) throw new Error('Erreur lors de la récupération de l’URL signée.')

      const uploadResponse = await fetch(data.url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      })

      if (!uploadResponse.ok) throw new Error('Erreur lors de l’upload vers S3.')

      const bucketUrl = process.env.NEXT_PUBLIC_S3_BUCKET_URL || 'https://corsica-facile-prod.s3.eu-north-1.amazonaws.com'
      const fileUrl = `${bucketUrl}/${data.key}`

      return fileUrl
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'upload S3.")
      return ''
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!companyName || !streetNumber || !streetName || !postalCode || !city || !expertise || !siren || !kbisFile || !insuranceFile || !email || !phone || !password || !confirmPassword || !membershipPlan) {
      setError('Veuillez remplir tous les champs et choisir un plan.')
      toast.error('Veuillez remplir tous les champs et choisir un plan.')
      return
    }

    if (expertise === 'Autre' && !customExpertise.trim()) {
      setError('Veuillez entrer votre domaine d\'expertise.')
      toast.error('Veuillez entrer votre domaine d\'expertise.')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      toast.error('Les mots de passe ne correspondent pas.')
      return
    }

    // Upload S3
    toast.info('Téléchargement des fichiers...')
    const uploadedKbisUrl = await uploadFileToS3(kbisFile)
    const uploadedInsuranceUrl = await uploadFileToS3(insuranceFile)

    if (!uploadedKbisUrl || !uploadedInsuranceUrl) {
      setError('Erreur lors de l’upload des fichiers.')
      return
    }

    const fullAddress = `${streetNumber} ${streetName}, ${postalCode} ${city}`

    const formData = {
      artisan: {
        company_name: companyName,
        address: fullAddress,
        expertise: expertise === 'Autre' ? customExpertise : expertise,
        siren,
        kbis_url: uploadedKbisUrl,
        insurance_url: uploadedInsuranceUrl,
        email,
        phone,
        membership_plan: membershipPlan,
        password,
        password_confirmation: confirmPassword
      }
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/artisans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok) {
        if (data.session_id) {
          setSessionId(data.session_id)
          setStep(2)
        } else {
          toast.success('Inscription réussie !', {
            autoClose: 3000,
            onClose: () => router.push('/auth/login_artisan')
          })
        }
      } else {
        const message = data.errors?.join(', ') || data.message || 'Erreur inconnue'
        setError(message)
        toast.error(message)
      }
    } catch {
      setError("Erreur lors de l'envoi au serveur.")
      toast.error("Erreur lors de l'envoi au serveur.")
    }
  }

  const handlePayment = async () => {
    if (!stripePublishableKey || !sessionId) {
      toast.error('Données Stripe manquantes.')
      return
    }

    const stripe = await loadStripe(stripePublishableKey)
    if (!stripe) {
      toast.error('Erreur lors du chargement de Stripe.')
      return
    }

    await stripe.redirectToCheckout({ sessionId })
  }

  return (
    <div className={styles.splitContainer}>
      <div className={styles.leftSide}>
        <Image
          src="/images/landscape1.jpg"
          alt="Inscription Artisan"
          className={styles.image}
          fill
          priority
          sizes="100vw"
        />
      </div>

      <div className={styles.rightSide}>
        <div className={styles.card}>
          <h1 className={styles.title}>Inscription</h1>
          {error && <p className={styles.error}>{error}</p>}

          {step === 1 && (
            <form onSubmit={handleFormSubmit} className={styles.form} encType="multipart/form-data">
              <div className={styles.inputGroup}>
                <label htmlFor="expertise">Domaine d'expertise</label>
                <select
                  id="expertise"
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  required
                >
                  <option value="">Sélectionnez</option>
                  {expertiseList.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                  <option value="Autre">Autre</option>
                </select>
                {expertise === 'Autre' && (
                  <input
                    type="text"
                    placeholder="Entrez votre domaine d'expertise"
                    value={customExpertise}
                    onChange={(e) => setCustomExpertise(e.target.value)}
                    required
                    style={{ marginTop: '8px' }}
                  />
                )}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="companyName">Nom de l'entreprise</label>
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="streetNumber">Numéro de rue</label>
                <input
                  type="text"
                  id="streetNumber"
                  value={streetNumber}
                  onChange={(e) => setStreetNumber(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="streetName">Nom de rue</label>
                <input
                  type="text"
                  id="streetName"
                  value={streetName}
                  onChange={(e) => setStreetName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="postalCode">Code postal</label>
                <input
                  type="text"
                  id="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="city">Ville</label>
                <input
                  type="text"
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="siren">Numéro SIREN</label>
                <input
                  type="text"
                  id="siren"
                  value={siren}
                  onChange={(e) => setSiren(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="kbis">Extrait Kbis (PDF ou image)</label>
                <input
                  type="file"
                  id="kbis"
                  accept=".pdf,image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setKbisFile(e.target.files[0]);
                    }
                  }}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="insurance">Attestation d'assurance (PDF ou image)</label>
                <input
                  type="file"
                  id="insurance"
                  accept=".pdf,image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setInsuranceFile(e.target.files[0]);
                    }
                  }}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="membershipPlan">Formule d'adhésion</label>
                <select
                  id="membershipPlan"
                  value={membershipPlan}
                  onChange={(e) => setMembershipPlan(e.target.value)}
                  required
                >
                  <option value="">Sélectionnez une formule</option>
                  <option value="Standard">Standard</option>
                  <option value="Pro">Pro</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="phone">Téléphone</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password">Mot de passe</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword">Confirmez le mot de passe</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <button type="submit" className={styles.submitButton}>
                S'inscrire
              </button>

              <Link href="/auth/login_artisan" className={styles.backButton}>
                Retour vers la connexion
              </Link>
            </form>
          )}

          {step === 2 && (
            <div className={styles.paymentSection}>
              <h3>Paiement de la formule d'adhésion</h3>
              <button onClick={handlePayment} className={styles.paymentButton}>
                Payer avec Stripe
              </button>
            </div>
          )}

          <ToastContainer position="bottom-center" autoClose={3000} />
        </div>
      </div>
    </div>
  )
}



