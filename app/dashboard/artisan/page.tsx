'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../../auth/AuthContext'
import { loadStripe } from '@stripe/stripe-js'
import styles from './page.module.scss'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface Artisan {
  company_name: string
  address: string
  expertise: string
  siren: string
  email: string
  phone: string
  membership_plan: string
  password?: string
  password_confirmation?: string
  kbis_url?: string
  insurance_url?: string
  avatar_url?: string | null
  description?: string
  images_urls?: string[]
}

interface PlanInfo {
  amount: number
  currency: string
  interval: string
}

const expertises = [
  "Antenniste", "Assainisseur", "Spécialiste balnéo", "Ingénieur en bâtiment", "Opérateur de centrale à béton",
  "Calorifugeur", "Canalisateur", "Chapiste", "Charpentier", "Chef de chantier", "Chauffagiste",
  "Cheministe/Fumisterie", "Cloisonneur", "Climaticien", "Conducteur d'engins de chantier", "Conducteur de travaux",
  "Cordiste", "Cordonnier", "Couturier", "Couvreur", "Cuisiniste", "Déboucheur", "Déménageur", "Démolisseur",
  "Dessinateur-projeteur", "Désamianteur", "Désinsectiseur", "Diagnostiqueur", "Ébéniste", "Monteur échafaudeur",
  "Électricien", "Économiste de la construction", "Technicien en électroménager", "Enduiseur",
  "Nettoyage/entretien de bâtiments", "Installateur/réparateur d'escaliers mécaniques", "Étancheur", "Façadier",
  "Ferronnier", "Forgeron", "Foreur", "Géomètre-topographe", "Spécialiste du goudronnage", "Poseur de gouttière",
  "Graveur", "Grutier", "Technicien en traitement de l'humidité", "Installateur de systèmes de sécurité incendie",
  "Installateur de mobilier", "Installateur de systèmes de sécurité", "Installateur de systèmes photovoltaïques",
  "Installeteur de systèmes d'irrigation", "Isolateur", "Jointeur", "Jardinier", "Maçon", "Marbrier", "Menuisier",
  "Installateur/réparateur de monte-charges", "Multi-services", "Installateur/réparateur de paratonnerres",
  "Paysagiste", "Peintre", "Pisciniste", "Plâtrier/Plaquiste", "Plombier", "Spécialiste du PMR",
  "Installateur/réparateur de portes automatiques et tambours", "Poseur de revêtement de sol", "Potier", "Ramoneur",
  "Restaurateur de meubles", "Serrurier", "Spécialiste des terrasses en bois", "Spécialiste du vitrail",
  "Tailleur de pierre", "Technicien du traitement de l'eau", "Terrassier", "Poseur de toiles tendues", "Vitrier",
  "Installateur/réparateur de volets roulants", "Wifi télécom", "Zingueur"
]

const membershipPlans = ['Standard', 'Pro', 'Premium']

const intervalTranslations: Record<string, string> = {
  'one_time': 'Paiement unique',
  'month': 'Mensuel',
  'year': 'Annuel',
}

const stripePromise = loadStripe('pk_test_51RO446Rs43niZdSJN0YjPjgq7HdFlhdFqqUqpsKxmgTAMHDyjK2g6Qh9FaRtdLjTWIkCz7ARow4rpyDliAzgzIgT00b0r32PoM')

export default function ArtisanDashboard() {
  const [artisan, setArtisan] = useState<Artisan | null>(null)
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [previousMembershipPlan, setPreviousMembershipPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [kbisFile, setKbisFile] = useState<File | null>(null)
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [newImages, setNewImages] = useState<File[]>([])
  const { logout, setUser } = useAuth()
  const [paymentPending, setPaymentPending] = useState(false)
  const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([])

  useEffect(() => {
    fetchArtisanData()
  }, [])

  const fetchArtisanData = async () => {
    const token = localStorage.getItem('artisanToken')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await axios.get('http://localhost:3001/artisans/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setArtisan(response.data.artisan)
      setPreviousMembershipPlan(response.data.artisan.membership_plan)

      const planResp = await axios.get('http://localhost:3001/artisans/me/plan_info', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPlanInfo(planResp.data.price_info)
    } catch (error) {
      console.error('Erreur de chargement du profil artisan :', error)
      toast.error('Impossible de charger votre profil.')
      setArtisan(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshArtisanData = async () => {
    const token = localStorage.getItem('artisanToken')
    if (!token) return
    setLoading(true)
    try {
      const [artisanResp, planResp] = await Promise.all([
        axios.get('http://localhost:3001/artisans/me', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:3001/artisans/me/plan_info', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      setArtisan(artisanResp.data.artisan)
      setPreviousMembershipPlan(artisanResp.data.artisan.membership_plan)
      setPlanInfo(planResp.data.price_info)

      toast.success("Profil mis à jour après validation du paiement.")
      setPaymentPending(false)
    } catch {
      toast.error("Impossible de récupérer le profil. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!artisan) return
    const { name, value } = e.target
    setArtisan({ ...artisan, [name]: value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const file = e.target.files[0]
    if (e.target.name === 'kbis') {
      setKbisFile(file)
    } else if (e.target.name === 'insurance') {
      setInsuranceFile(file)
    } else if (e.target.name === 'avatar') {
      setAvatarFile(file)
    }
  }

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !artisan) return
    const filesArray = Array.from(e.target.files)
    const totalImages = (artisan.images_urls?.length || 0) + newImages.length + filesArray.length
    if (totalImages > 10) {
      toast.error('Vous ne pouvez pas avoir plus de 10 images au total.')
      return
    }
    setNewImages(prev => [...prev, ...filesArray])
  }

  const removeExistingImage = (url: string) => {
    if (!artisan) return
    setDeletedImageUrls(prev => [...prev, url])
    setArtisan({
      ...artisan,
      images_urls: artisan.images_urls?.filter(imgUrl => imgUrl !== url) || [],
    })
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpdate = async () => {
    const token = localStorage.getItem('artisanToken')
    if (!token || !artisan) return

    try {
      const formData = new FormData()

      for (const [key, value] of Object.entries(artisan)) {
        if (['kbis_url', 'insurance_url', 'avatar_url', 'images_urls'].includes(key)) continue
        if (value !== undefined && value !== null) {
          formData.append(`artisan[${key}]`, String(value))
        }
      }

      if (kbisFile) formData.append('artisan[kbis]', kbisFile)
      if (insuranceFile) formData.append('artisan[insurance]', insuranceFile)
      if (avatarFile) formData.append('artisan[avatar]', avatarFile)
      newImages.forEach(file => {
        formData.append('artisan[project_images][]', file)
      })
      deletedImageUrls.forEach(url => {
        formData.append('artisan[deleted_image_urls][]', url)
      })

      const response = await axios.put('http://localhost:3001/artisans/me', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      const planChanged = previousMembershipPlan && artisan.membership_plan !== previousMembershipPlan

      if (planChanged && response.data.checkout_url) {
        window.open(response.data.checkout_url, '_blank', 'width=500,height=700')
        toast.info("Veuillez finaliser le paiement dans la nouvelle fenêtre Stripe.")
        setPaymentPending(true)
      } else {
        toast.success('Profil mis à jour avec succès.')
        setArtisan(response.data.artisan)
        setPreviousMembershipPlan(response.data.artisan.membership_plan)
        setKbisFile(null)
        setInsuranceFile(null)
        setAvatarFile(null)
        setNewImages([])
        setDeletedImageUrls([])
        setIsEditing(false)

        const updatedUser = {
          email: response.data.artisan.email,
          role: 'artisan' as 'artisan',
          avatar_url: response.data.artisan.avatar_url || null,
        }

        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour :', error)
      toast.error('Erreur lors de la mise à jour.')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) return
    const token = localStorage.getItem('artisanToken')
    if (!token) return

    try {
      await axios.delete('http://localhost:3001/artisans/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success('Compte supprimé avec succès.')
      logout()
    } catch (error) {
      toast.error('Erreur lors de la suppression du compte.')
    }
  }

  if (loading) return <p>Chargement...</p>
  if (!artisan) return <p>Impossible de charger les informations artisan.</p>

  return (
  <div className={styles.container}>
    {/* Nom de l'entreprise centré en haut */}
    <header className={styles.header}>
      <h1>{artisan.company_name || 'Artisan'}</h1>
    </header>

    <main className={styles.main}>
      {/* Colonne gauche : tout le reste */}
      <section className={styles.leftColumn}>
        {/* Avatar */}
        <div className={styles.avatarWrapper}>
          {avatarFile ? (
            <img
              src={URL.createObjectURL(avatarFile)}
              alt="Nouvel avatar"
              className={styles.avatar}
            />
          ) : artisan.avatar_url ? (
            <img
              src={`${artisan.avatar_url}?t=${Date.now()}`}
              alt="Avatar"
              className={styles.avatar}
            />
          ) : (
            <img
              src="/images/avatar.svg"
              alt="Avatar par défaut"
              className={styles.avatar}
            />
          )}

          {isEditing && (
            <>
              <label>Changer la photo de profil :</label>
              <input type="file" name="avatar" accept="image/*" onChange={handleFileChange} />
            </>
          )}
        </div>

        {/* Formulaire infos artisan */}
        <div className={styles.formGroup}>
          <label>Nom de l'entreprise</label>
          <input
            name="company_name"
            value={artisan.company_name}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Adresse</label>
          <textarea
            name="address"
            value={artisan.address}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Expertise</label>
          <select
            name="expertise"
            value={artisan.expertise}
            onChange={handleChange}
            disabled={!isEditing}
          >
            <option value="">Sélectionnez une expertise</option>
            {expertises.map(ex => (
              <option key={ex} value={ex}>{ex}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Description de l'entreprise</label>
          <textarea
            name="description"
            value={artisan.description || ''}
            onChange={handleChange}
            disabled={!isEditing}
            rows={4}
          />
        </div>

        <div className={styles.formGroup}>
          <label>SIREN</label>
          <input
            name="siren"
            value={artisan.siren}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={artisan.email}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Téléphone</label>
          <input
            name="phone"
            value={artisan.phone}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Formule d’abonnement</label>
          <select
            name="membership_plan"
            value={artisan.membership_plan}
            onChange={handleChange}
            disabled={!isEditing}
          >
            {membershipPlans.map(plan => (
              <option key={plan} value={plan}>{plan}</option>
            ))}
          </select>
        </div>

        {planInfo && (
          <div className={styles.planDetails}>
            <h3>Détails du plan actuel</h3>
            <p>Prix : {(planInfo.amount / 100).toFixed(2)} {planInfo.currency.toUpperCase()}</p>
            <p>Fréquence de paiement : {intervalTranslations[planInfo.interval] || planInfo.interval}</p>
          </div>
        )}

        {!isEditing && (
          <div>
            {artisan.kbis_url && (
              <p>KBIS: <a href={artisan.kbis_url} target="_blank" rel="noreferrer" className={styles.link}>Voir le document</a></p>
            )}
            {artisan.insurance_url && (
              <p>Assurance: <a href={artisan.insurance_url} target="_blank" rel="noreferrer" className={styles.link}>Voir le document</a></p>
            )}
          </div>
        )}

        {isEditing && (
          <>
            <div className={styles.formGroup}>
              <label>KBIS (PDF uniquement)</label>
              <input
                type="file"
                name="kbis"
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Assurance (PDF uniquement)</label>
              <input
                type="file"
                name="insurance"
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </div>
          </>
        )}

        {/* Images de réalisations */}
        <div className={styles.imagesSection}>
          <label>Images de réalisations existantes :</label>
          <div className={styles.imagesGrid}>
            {artisan.images_urls && artisan.images_urls.length > 0 ? (
              artisan.images_urls.map((url, idx) => (
                <div key={idx} className={styles.imageWrapper}>
                  <img src={`${url}?t=${Date.now()}`} alt={`Réalisation ${idx + 1}`} className={styles.images} />
                  {isEditing && (
                    <button onClick={() => removeExistingImage(url)} className={styles.deleteImageBtn} aria-label="Supprimer cette image">×</button>
                  )}
                </div>
              ))
            ) : (
              <p>Aucune image enregistrée.</p>
            )}
          </div>
        </div>

        {/* Boutons modifier/enregistrer */}
        <div className={styles.buttons}>
          {!isEditing ? (
            <>
              <button onClick={() => setIsEditing(true)} className={styles.btnPrimary}>Modifier</button>
              <button onClick={handleDelete} className={styles.btnDanger}>Supprimer mon compte</button>
            </>
          ) : (
            <>
              <button onClick={handleUpdate} className={styles.btnSuccess}>Enregistrer</button>
              <button onClick={() => setIsEditing(false)} className={styles.btnSecondary}>Annuler</button>
            </>
          )}
        </div>

        {/* Ici on intègre le message / bouton pour paiement en attente */}
          {paymentPending && (
            <div className={styles.paymentPending}>
              <p>Le paiement est en attente de validation. Merci de finaliser le paiement dans la fenêtre ouverte.</p>
              <button onClick={() => {
                refreshArtisanData()
              }}>
                Rafraîchir le profil
              </button>
            </div>
          )}
      </section>

      {/* Colonne droite : tableau de bord, notifications, commentaires */}
      <aside className={styles.rightColumn}>
        <section className={styles.card}>
          <h2>Tableau de bord des missions</h2>
          <ul>
            <li>Prestations passées : {/* nombre */}</li>
            <li>Prestations en cours : {/* nombre */}</li>
            <li>Prestations futures : {/* nombre */}</li>
          </ul>
        </section>

        <section className={styles.card}>
          <h2>Notifications de nouvelles missions</h2>
          <p>Aucune nouvelle notification pour le moment.</p>
        </section>

        <section className={styles.card}>
          <h2>Commentaires et notes reçus</h2>
          <p>Aucun commentaire pour le moment.</p>
        </section>
      </aside>

    </main>

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
)}












