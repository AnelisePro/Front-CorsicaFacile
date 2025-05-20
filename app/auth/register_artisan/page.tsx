'use client'

import { useState } from 'react'
import styles from './page.module.scss'
import { loadStripe } from '@stripe/stripe-js'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useRouter } from 'next/navigation'

export default function ArtisanInscription() {
  const router = useRouter()
  const [companyName, setCompanyName] = useState('')
  const [streetNumber, setStreetNumber] = useState('')
  const [streetName, setStreetName] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [expertise, setExpertise] = useState('')
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

  const stripePublishableKey = "pk_test_51RO446Rs43niZdSJN0YjPjgq7HdFlhdFqqUqpsKxmgTAMHDyjK2g6Qh9FaRtdLjTWIkCz7ARow4rpyDliAzgzIgT00b0r32PoM"

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation simple
    if (
      !companyName || !streetNumber || !streetName || !postalCode || !city ||
      !expertise || !siren || !kbisFile || !insuranceFile || !email ||
      !phone || !password || !confirmPassword || !membershipPlan
    ) {
      setError('Veuillez remplir tous les champs et choisir un plan.')
      toast.error('Veuillez remplir tous les champs et choisir un plan.')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      toast.error('Les mots de passe ne correspondent pas.')
      return
    }

    if (!stripePublishableKey) {
      setError('Clé publique Stripe manquante.')
      toast.error('Clé publique Stripe manquante.')
      return
    }

    const fullAddress = `${streetNumber} ${streetName}, ${postalCode} ${city}`

    const formData = new FormData()
    formData.append('artisan[company_name]', companyName)
    formData.append('artisan[address]', fullAddress)
    formData.append('artisan[expertise]', expertise)
    formData.append('artisan[siren]', siren)
    if (kbisFile) formData.append('artisan[kbis]', kbisFile)
    if (insuranceFile) formData.append('artisan[insurance]', insuranceFile)
    formData.append('artisan[email]', email)
    formData.append('artisan[phone]', phone)
    formData.append('artisan[membership_plan]', membershipPlan)
    formData.append('artisan[password]', password)
    formData.append('artisan[password_confirmation]', confirmPassword)

    try {
      const response = await fetch('http://localhost:3001/artisans', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        if (data.session_id) {
          setSessionId(data.session_id)
          setStep(2) // Passage à l’étape paiement
        } else {
          toast.success('Inscription réussie !', {
            autoClose: 3000,
            onClose: () => {
              router.push('/auth/login_artisan') // redirection vers le form de connexion artisan
            }
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
    if (!stripePublishableKey) {
      setError('Clé publique Stripe manquante.')
      toast.error('Clé publique Stripe manquante.')
      return
    }
    if (!sessionId) {
      setError('Session de paiement manquante.')
      toast.error('Session de paiement manquante.')
      return
    }
    const stripe = await loadStripe(stripePublishableKey)
    if (!stripe) {
      setError('Erreur lors du chargement de Stripe.')
      toast.error('Erreur lors du chargement de Stripe.')
      return
    }
    await stripe.redirectToCheckout({ sessionId })
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Inscription - Artisan</h1>

      {error && <p className={styles.error}>{error}</p>}

      {step === 1 && (
        <form onSubmit={handleFormSubmit} className={styles.form} encType="multipart/form-data">
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

          <div>
            <label htmlFor="expertise">Domaine d'expertise</label>
            <select
              id="expertise"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              required
            >
              <option value="">Sélectionnez</option>
              <option value="Antenniste">Antenniste</option>
              <option value="Assainisseur">Assainisseur</option>
              <option value="Balnéo">Spécialiste balnéo</option>
              <option value="Bâtiment">Ingénieur en bâtiment</option>
              <option value="Béton">Opérateur de centrale à béton</option>
              <option value="Calorifugeur">Calorifugeur</option>
              <option value="Canalisateur">Canalisateur</option>
              <option value="Chapiste">Chapiste</option>
              <option value="Charpentier">Charpentier</option>
              <option value="Chantier">Chef de chantier</option>
              <option value="Chauffagiste">Chauffagiste</option>
              <option value="Cheministe/Fumisterie">Cheministe/Fumisterie</option>
              <option value="Cloisonneur">Cloisonneur</option>
              <option value="Climaticien">Climaticien</option>
              <option value="Conducteur">Conducteur d'engins de chantier</option>
              <option value="Travaux">Conducteur de travaux</option>
              <option value="Cordiste">Cordiste</option>
              <option value="Cordonnier">Cordonnier</option>
              <option value="Couturier">Couturier</option>
              <option value="Couvreur">Couvreur</option>
              <option value="Cuisiniste">Cuisiniste</option>
              <option value="Déboucheur">Déboucheur</option>
              <option value="Déménageur">Déménageur</option>
              <option value="Démolisseur">Démolisseur</option>
              <option value="Dessinateur">Dessinateur-projeteur</option>
              <option value="Désamianteur">Désamianteur</option>
              <option value="Désinsectiseur">Désinsectiseur</option>
              <option value="Diagnostiqueur">Diagnostiqueur</option>
              <option value="Ébéniste">Ébéniste</option>
              <option value="Échafaudeur">Monteur échafaudeur</option>
              <option value="Électricien">Électricien</option>
              <option value="Économiste">Économiste de la construction</option>
              <option value="Électroménager">Technicien en électroménager</option>
              <option value="Enduiseur">Enduiseur</option>
              <option value="Engins">Conducteur d'engins de chantier</option>
              <option value="Entretien">Nettoyage/entretien de bâtiments</option>
              <option value="Escaliers">Installateur/réparateur d'escaliers mécaniques</option>
              <option value="Étancheur">Étancheur</option>
              <option value="Façadier">Façadier</option>
              <option value="Ferronnier">Ferronnier</option>
              <option value="Forgeron">Forgeron</option>
              <option value="Foreur">Foreur</option>
              <option value="Géomètre">Géomètre-topographe</option>
              <option value="Goudron">Spécialiste du goudronnage</option>
              <option value="Gouttière">Poseur de gouttière</option>
              <option value="Graveur">Graveur</option>
              <option value="Grutier">Grutier</option>
              <option value="Humidité">Technicien en traitement de l'humidité</option>
              <option value="Incendie">Installateur de systèmes de sécurité incendie</option>
              <option value="Ingénieur en bâtiment">Ingénieur en bâtiment</option>
              <option value="Installateur de mobilier">Installateur de mobilier</option>
              <option value="Installateur de systèmes de sécurité">Installateur de systèmes de sécurité</option>
              <option value="Photovoltaïque">Installateur de systèmes photovoltaïques</option>
              <option value="Irrigation">Installeteur de systèmes d'irrigation</option>
              <option value="Isolateur">Isolateur</option>
              <option value="Jointeur">Jointeur</option>
              <option value="Jardinier">Jardinier</option>
              <option value="Maçon">Maçon</option>
              <option value="Marbrier">Marbrier</option>
              <option value="Menuisier">Menuisier</option>
              <option value="Mobilier">Installateur de mobilier</option>
              <option value="Monte-charges">Installateur/réparateur de monte-charges</option>
              <option value="Multi-services">Multi-services</option>
              <option value="Paratonnerres">Installateur/réparateur de paratonnerres</option>
              <option value="Paysagiste">Paysagiste</option>
              <option value="Peintre">Peintre</option>
              <option value="Pisciniste">Pisciniste</option>
              <option value="Plâtrier">Plâtrier/Plaquiste</option>
              <option value="Plombier">Plombier</option>
              <option value="PMR">Spécialiste du PMR</option>
              <option value="Portes">Installateur/réparateur de portes automatiques et tambours</option>
              <option value="Poseur de revêtement de sol">Poseur de revêtement de sol</option>
              <option value="Potier">Potier</option>
              <option value="Ramoneur">Ramoneur</option>
              <option value="Restaurateur de meubles">Restaurateur de meubles</option>
              <option value="Sécurité">Installateur de systèmes de sécurité</option>
              <option value="Serrurier">Serrurier</option>
              <option value="Spécialiste balnéo">Spécialiste balnéo</option>
              <option value="Spécialiste des terrasses en bois">Spécialiste des terrasses en bois</option>
              <option value="Spécialiste du goudronnage">Spécialiste du goudronnage</option>
              <option value="Spécialiste du PMR">Spécialiste du PMR</option>
              <option value="Spécialiste du vitrail">Spécialiste du vitrail</option>
              <option value="Tailleur">Tailleur de pierre</option>
              <option value="Technicien du traitement de l'eau">Technicien du traitement de l'eau</option>
              <option value="Terrassier">Terrassier</option>
              <option value="Terrasses-bois">Spécialiste des terrasses en bois</option>
              <option value="Toiles-tendues">Poseur de toiles tendues</option>
              <option value="Vitrier">Vitrier</option>
              <option value="Vitrail">Spécialiste du vitrail</option>
              <option value="Volets">Installateur/réparateur de volets roulants</option>
              <option value="Wifi">Wifi télécom</option>
              <option value="Zingueur">Zingueur</option>
            </select>
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
                  setKbisFile(e.target.files[0])
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
                  setInsuranceFile(e.target.files[0])
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
        </form>
      )}

      {step === 2 && (
        <div className={styles.paymentSection}>
          <h2>Paiement de la formule {membershipPlan}</h2>
          <button onClick={handlePayment} className={styles.paymentButton}>
            Payer avec Stripe
          </button>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  )
}


