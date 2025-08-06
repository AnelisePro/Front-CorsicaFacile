'use client'

import { useEffect, useState, useMemo } from 'react'
import styles from './page.module.scss'
import { loadStripe } from '@stripe/stripe-js'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PricingModal from '../../components/PricingModal'
import PremiumBadge from '../../components/PremiumBadge'

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
  const [membershipPlan, setMembershipPlan] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

      if (!response.ok || !data.url) throw new Error('Erreur lors de la récupération de l\'URL signée.')

      const uploadResponse = await fetch(data.url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      })

      if (!uploadResponse.ok) throw new Error('Erreur lors de l\'upload vers S3.')

      const bucketUrl = process.env.NEXT_PUBLIC_S3_BUCKET_URL || 'https://corsica-facile-prod.s3.eu-north-1.amazonaws.com'
      const fileUrl = `${bucketUrl}/${data.key}`

      return fileUrl
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'upload S3.")
      return ''
    }
  }

  // Validation par étape pour activer bouton "Suivant"
  const canGoNextStep = useMemo(() => {
    switch (step) {
      case 1:
        if (!companyName.trim()) return false
        if (!siren.trim()) return false
        if (!expertise) return false
        if (expertise === 'Autre' && !customExpertise.trim()) return false
        return true
      case 2:
        if (!streetNumber.trim()) return false
        if (!streetName.trim()) return false
        if (!postalCode.trim()) return false
        if (!city.trim()) return false
        return true
      case 3:
        if (!kbisFile) return false
        if (!insuranceFile) return false
        return true
      case 4:
        if (!membershipPlan) return false
        return true
      case 5:
        if (!email.trim()) return false
        if (!phone.trim()) return false
        if (!password) return false
        if (!confirmPassword) return false
        if (password !== confirmPassword) return false
        if (password.length < 6) return false
        return true
      default:
        return false
    }
  }, [step, companyName, siren, expertise, customExpertise, streetNumber, streetName, postalCode, city, kbisFile, insuranceFile, membershipPlan, email, phone, password, confirmPassword])

  // Avance d'étape
  const handleNext = () => {
    if (step === 5) {
      handleFormSubmit()
    } else {
      setError('')
      setStep((s) => Math.min(s + 1, 5))
    }
  }

  // Recul d'étape
  const handlePrevious = () => {
    setError('')
    setStep((s) => Math.max(s - 1, 1))
  }

  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError('')

    // Validation finale avant soumission
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

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      toast.error('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    toast.info('Téléchargement des fichiers...')
    const uploadedKbisUrl = await uploadFileToS3(kbisFile)
    const uploadedInsuranceUrl = await uploadFileToS3(insuranceFile)

    if (!uploadedKbisUrl || !uploadedInsuranceUrl) {
      setError('Erreur lors de l\'upload des fichiers.')
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
          setStep(6) // étape paiement
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

  // Handlers pour drag & drop avec types corrects
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.add(styles.dragOver)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.remove(styles.dragOver)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, setter: (file: File | null) => void) => {
    e.preventDefault()
    e.currentTarget.classList.remove(styles.dragOver)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      setter(files[0])
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

  // Barre de progression (en %)
  const progressPercent = ((step - 1) / 5) * 100

  return (
    <>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.imageSection}>
            <img src="/images/img5.jpeg" alt="Image de fond" />
          </div>
          <div className={styles.contentSection}>
            <h1 className={styles.title}>Inscription Artisan</h1>

            {/* Barre de progression */}
            <div className={styles.progressWrapper}>
              <div className={styles.steps}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={`${styles.stepCircle} ${step >= n ? styles.active : ''}`}
                  >
                    {n}
                  </div>
                ))}
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBar} style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            {/* Étape 1 */}
            {step === 1 && (
              <div className={styles.formStep}>
                <div className={styles.stepTitle}>Informations d&apos;entreprise</div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="expertise">Domaine d&apos;expertise</label>
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
                      className={styles.customInput}
                    />
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="companyName">Nom de l&apos;entreprise</label>
                  <input
                    type="text"
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    placeholder="Votre nom d'entreprise"
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
                    placeholder="123 456 789"
                  />
                </div>

                <div className={styles.buttonsRow}>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canGoNextStep}
                    className={`${styles.nextButton} ${!canGoNextStep ? styles.disabledButton : ''}`}
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            )}

            {/* Étape 2 */}
            {step === 2 && (
              <div className={styles.formStep}>
                <div className={styles.stepTitle}>Adresse de l&apos;entreprise</div>
                
                <div className={styles.formRow}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="streetNumber">N° rue</label>
                    <input
                      type="text"
                      id="streetNumber"
                      value={streetNumber}
                      onChange={(e) => setStreetNumber(e.target.value)}
                      required
                      placeholder="123"
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
                      placeholder="Rue de la République"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="postalCode">Code postal</label>
                    <input
                      type="text"
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      required
                      placeholder="20000"
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
                      placeholder="Ajaccio"
                    />
                  </div>
                </div>

                <div className={styles.buttonsRow}>
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className={styles.prevButton}
                  >
                    ← Précédent
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canGoNextStep}
                    className={`${styles.nextButton} ${!canGoNextStep ? styles.disabledButton : ''}`}
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            )}

            {/* Étape 3 */}
            {step === 3 && (
              <div className={styles.formStep}>
                <div className={styles.stepTitle}>Documents officiels</div>
                <div className={styles.inputGroup}>
                  <label htmlFor="kbisFile">Extrait Kbis</label>
                  <div 
                    className={`${styles.fileInputWrapper} ${kbisFile ? styles.hasFile : ''}`}
                    onDragOver={handleDragOver} 
                    onDragLeave={handleDragLeave} 
                    onDrop={(e) => handleDrop(e, setKbisFile)}
                  >
                    <input
                      type="file"
                      id="kbisFile"
                      accept=".pdf"
                      onChange={(e) => setKbisFile(e.target.files ? e.target.files[0] : null)}
                      required
                      className={styles.hiddenFileInput}
                    />
                    <label htmlFor="kbisFile" className={styles.fileInputLabel}>
                      <div className={styles.fileInputIcon}>
                        {kbisFile ? '✅' : '📄'}
                      </div>
                      <div className={styles.fileInputText}>
                        {kbisFile ? (
                          <>
                            <span className={styles.fileName}>{kbisFile.name}</span>
                            <span className={styles.fileSize}>
                              ({Math.round(kbisFile.size / 1024)} KB)
                            </span>
                          </>
                        ) : (
                          <>
                            <span className={styles.mainText}>Cliquez pour sélectionner</span>
                            <span className={styles.helperText}>ou glissez-déposez votre fichier</span>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                  <div className={styles.fileHelper}>📄 Format PDF uniquement - Max 5MB</div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="insuranceFile">Attestation d&apos;assurance professionnelle</label>
                  <div 
                    className={`${styles.fileInputWrapper} ${insuranceFile ? styles.hasFile : ''}`}
                    onDragOver={handleDragOver} 
                    onDragLeave={handleDragLeave} 
                    onDrop={(e) => handleDrop(e, setInsuranceFile)}
                  >
                    <input
                      type="file"
                      id="insuranceFile"
                      accept=".pdf"
                      onChange={(e) => setInsuranceFile(e.target.files ? e.target.files[0] : null)}
                      required
                      className={styles.hiddenFileInput}
                    />
                    <label htmlFor="insuranceFile" className={styles.fileInputLabel}>
                      <div className={styles.fileInputIcon}>
                        {insuranceFile ? '✅' : '🛡️'}
                      </div>
                      <div className={styles.fileInputText}>
                        {insuranceFile ? (
                          <>
                            <span className={styles.fileName}>{insuranceFile.name}</span>
                            <span className={styles.fileSize}>
                              ({Math.round(insuranceFile.size / 1024)} KB)
                            </span>
                          </>
                        ) : (
                          <>
                            <span className={styles.mainText}>Cliquez pour sélectionner</span>
                            <span className={styles.helperText}>ou glissez-déposez votre fichier</span>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                  <div className={styles.fileHelper}>🛡️ Format PDF uniquement - Max 5MB</div>
                </div>

                <div className={styles.buttonsRow}>
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className={styles.prevButton}
                  >
                    ← Précédent
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canGoNextStep}
                    className={`${styles.nextButton} ${!canGoNextStep ? styles.disabledButton : ''}`}
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            )}

            {/* Étape 4 */}
            {step === 4 && (
              <div className={styles.formStep}>
                <div className={styles.stepTitle}>Choisissez votre abonnement</div>
                
                <div className={styles.radioGroup}>
                  {['Standard', 'Pro', 'Premium'].map((plan) => (
                    <label
                      key={plan}
                      className={`${styles.selectButton} ${membershipPlan === plan ? styles.selected : ''}`}
                    >
                      <input
                        type="radio"
                        name="membershipPlan"
                        value={plan}
                        checked={membershipPlan === plan}
                        onChange={(e) => setMembershipPlan(e.target.value)}
                        className={styles.hiddenInput}
                      />
                      📦 {plan}
                    </label>
                  ))}
                </div>

                <button 
                  type="button" 
                  className={styles.detailsButton} 
                  onClick={() => setIsModalOpen(true)}
                >
                  💡 Voir détails des formules
                </button>

                <div className={styles.buttonsRow}>
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className={styles.prevButton}
                  >
                    ← Précédent
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canGoNextStep}
                    className={`${styles.nextButton} ${!canGoNextStep ? styles.disabledButton : ''}`}
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            )}

            {step === 4 && membershipPlan === 'Premium' && (
              <div className={styles.premiumPreview}>
                <p>Avec l'abonnement Premium, vous bénéficierez d'un badge exclusif :</p>
                <PremiumBadge
                  membershipPlan="Premium"
                  className={styles.previewBadge}
                />
              </div>
            )}

            {/* Étape 5 */}
            {step === 5 && (
              <div className={styles.formStep}>
                <div className={styles.stepTitle}>Informations de connexion</div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="votre@email.com"
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
                    placeholder="06 12 34 56 78"
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
                    placeholder="Mot de passe sécurisé (min. 6 caractères)"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="confirmPassword">Confirmer mot de passe</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirmez votre mot de passe"
                  />
                </div>

                <div className={styles.buttonsRow}>
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className={styles.prevButton}
                  >
                    ← Précédent
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canGoNextStep}
                    className={`${styles.nextButton} ${!canGoNextStep ? styles.disabledButton : ''}`}
                  >
                    🚀 S&apos;inscrire
                  </button>
                </div>
              </div>
            )}

            <PricingModal 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)} 
            />

            {/* Étape 6 - Paiement Stripe */}
            {step === 6 && sessionId && (
              <div className={styles.paymentStep}>
                <div className={styles.stepTitle}>Finaliser l&apos;inscription</div>
                <div className={styles.paymentDescription}>
                  <p>Votre inscription est presque terminée !</p>
                  <p>Procédez au paiement pour activer votre compte artisan.</p>
                </div>
                <div className={styles.buttonsRow}>
                  <button onClick={() => setStep(5)} className={styles.prevButton}>
                    ← Retour
                  </button>
                  <button onClick={handlePayment} className={styles.payButton}>
                    Procéder au paiement
                  </button>
                </div>
              </div>
            )}

            <Link href="/auth/login_artisan" className={styles.backButton}>
              ← Retour vers la connexion
            </Link>
          </div>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={4000} theme="light" />
    </>
  )
}







