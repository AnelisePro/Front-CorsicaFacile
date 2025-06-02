'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../../auth/AuthContext'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ArtisanView from '../../components/ArtisanView'
import ArtisanEdit from '../../components/ArtisanEdit'
import AvailabilitySlots from '../../components/AvailabilitySlots'
import styles from './page.module.scss'

type Artisan = {
  company_name: string
  address: string
  expertise: string
  description?: string
  siren: string
  email: string
  phone: string
  membership_plan: string
  images_urls: string[]
  avatar_url?: string
}

type PlanInfo = {
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
const intervalTranslations = {
  day: 'journalière',
  week: 'hebdomadaire',
  month: 'mensuelle',
  year: 'annuelle',
}

export default function ArtisanDashboard() {
  const { user, setUser } = useAuth()

  const [token, setToken] = useState<string | null>(null)
  const [artisan, setArtisan] = useState<Artisan | null>(null)
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [kbisFile, setKbisFile] = useState<File | null>(null)
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [newImages, setNewImages] = useState<File[]>([])
  const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([])

  useEffect(() => {
    const artisanToken = localStorage.getItem('artisanToken')
    setToken(artisanToken)
  }, [])

  useEffect(() => {
    if (token) fetchArtisan()
  }, [token])

  async function fetchArtisan() {
    try {
      const res = await axios.get('http://localhost:3001/artisans/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setArtisan(res.data.artisan)

      if (res.data.planInfo) {
        const apiPlanInfo = res.data.planInfo
        setPlanInfo({
          amount: apiPlanInfo.amount,
          currency: apiPlanInfo.currency,
          interval: apiPlanInfo.interval,
        })
      } else {
        setPlanInfo(null)
      }
    } catch (error) {
      toast.error("Impossible de récupérer les infos de l'artisan.")
    }
  }

  function handleEdit() {
    setIsEditing(true)
  }

  function handleCancel() {
    setIsEditing(false)
    setKbisFile(null)
    setInsuranceFile(null)
    setAvatarFile(null)
    setNewImages([])
    setDeletedImageUrls([])
    if (artisan) fetchArtisan()
  }

  function handleChange(e: React.ChangeEvent<any>) {
    if (!artisan) return
    const { name, value } = e.target
    setArtisan(prev => prev ? { ...prev, [name]: value } : prev)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]

    switch (e.target.name) {
      case 'kbis':
        setKbisFile(file)
        break
      case 'insurance':
        setInsuranceFile(file)
        break
      case 'avatar':
        setAvatarFile(file)
        break
    }
  }

  function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    setNewImages(prev => [...prev, ...files])
  }

  function removeExistingImage(url: string) {
    setDeletedImageUrls(prev => [...prev, url])
    if (artisan) {
      setArtisan(prev => {
        if (!prev) return prev
        return {
          ...prev,
          images_urls: prev.images_urls.filter(imgUrl => imgUrl !== url),
        }
      })
    }
  }

  function removeNewImage(index: number) {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  async function handleUpdate() {
    if (!artisan) return

    try {
      const formData = new FormData()

      Object.entries(artisan).forEach(([key, value]) => {
        if (typeof value === 'string') formData.append(`artisan[${key}]`, value)
      })

      if (kbisFile) formData.append('artisan[kbis]', kbisFile)
      if (insuranceFile) formData.append('artisan[insurance]', insuranceFile)
      if (avatarFile) formData.append('artisan[avatar]', avatarFile)

      newImages.forEach(file => {
        formData.append('artisan[project_images][]', file)
      })

      deletedImageUrls.forEach(url => {
        formData.append('artisan[deleted_image_urls][]', url)
      })

      const res = await axios.put('http://localhost:3001/artisans/me', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      if (res.data.checkout_url) {
        toast.info("Le nouveau tarif prendra effet le mois suivant. Veuillez finaliser le paiement dans la fenêtre qui va s'ouvrir.")
        window.open(res.data.checkout_url, '_blank')
      } else {
        toast.success('Informations mises à jour avec succès !')
        setIsEditing(false)
        fetchArtisan()

        // Mise à jour du contexte user avec la nouvelle URL d'avatar
        if (res.data.artisan?.avatar_url && user) {
          setUser({
            ...user,
            avatar_url: res.data.artisan.avatar_url,
          })
        }

        setKbisFile(null)
        setInsuranceFile(null)
        setAvatarFile(null)
        setNewImages([])
        setDeletedImageUrls([])
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour.')
    }
  }

  async function handleDeleteAccount() {
    if (!token) return
    try {
      await axios.delete('http://localhost:3001/artisans/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success('Compte supprimé avec succès.')
      window.location.href = '/'
    } catch (error) {
      toast.error('Erreur lors de la suppression du compte.')
    }
  }

  if (!user) return <p>Chargement...</p>
  if (!artisan) return <p>Chargement des données artisan...</p>

  return (
    <div className={styles.container}>
      <ToastContainer />

      {/* Colonne de gauche : vue ou édition */}
      <div className={styles.leftColumn}>
        {!isEditing ? (
          <ArtisanView
            artisan={artisan}
            planInfo={planInfo}
            intervalTranslations={intervalTranslations}
            onEdit={handleEdit}
            onDelete={handleDeleteAccount}
          />
        ) : (
          <ArtisanEdit
            artisan={artisan}
            handleChange={handleChange}
            handleFileChange={handleFileChange}
            handleImagesChange={handleImagesChange}
            removeExistingImage={removeExistingImage}
            removeNewImage={removeNewImage}
            newImages={newImages}
            isEditing={isEditing}
            expertises={expertises}
            membershipPlans={membershipPlans}
            kbisFile={kbisFile}
            insuranceFile={insuranceFile}
            avatarFile={avatarFile}
            handleUpdate={handleUpdate}
            handleCancel={handleCancel}
            deletedImageUrls={deletedImageUrls}
          />
        )}
      </div>

      {/* Colonne de droite : disponibilité */}
      <div className={styles.rightColumn}>
        <AvailabilitySlots isEditing={isEditing} />
      </div>
    </div>
  )
}

