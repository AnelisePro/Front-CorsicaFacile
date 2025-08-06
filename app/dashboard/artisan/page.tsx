'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../../auth/AuthContext'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ArtisanView from '../../components/ArtisanView'
import ArtisanEdit from '../../components/ArtisanEdit'
import AvailabilitySlots from '../../components/AvailabilitySlots'
import NotificationList from '../../components/NotificationList'
import ProjectImagesManager from '../../components/ProjectImagesManager'
import ImageModal from '../../components/ImageModal'
import MessagingTab from '../../components/MessagingTab'
import styles from './page.module.scss'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

type Artisan = {
  company_name: string
  address: string
  expertise_names: string[]
  description?: string
  siren: string
  email: string
  phone: string
  membership_plan: string
  avatar_url?: string
  kbis_url?: string
  insurance_url?: string
}

type PlanInfo = {
  amount: number
  currency: string
  interval: string
}

type Mission = {
  id: number
  status: string
}

type ProjectImage = {
  id: number
  image_url: string
}

const membershipPlans = ['Standard', 'Pro', 'Premium']
const intervalTranslations = {
  day: 'jour',
  week: 'semaine',
  month: 'mois',
  year: 'an',
}

export default function ArtisanDashboard() {
  const { user, setUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'notifications' | 'creneaux' | 'realisations' | 'messagerie'>('creneaux')
  const [token, setToken] = useState<string | null>(null)
  const [artisan, setArtisan] = useState<Artisan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [expertises, setExpertises] = useState<string[]>([])
  const [kbisFile, setKbisFile] = useState<File | null>(null)
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [activeMissions, setActiveMissions] = useState<Mission[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<ProjectImage | null>(null)
  const [allImages, setAllImages] = useState<ProjectImage[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const artisanToken = localStorage.getItem('artisanToken')
    setToken(artisanToken)
  }, [])

  useEffect(() => {
    async function fetchInitialData() {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        // Récupérer les données de l'artisan et les expertises en parallèle
        const [artisanRes, expertisesRes] = await Promise.all([
          axios.get(`${apiUrl}/artisans/me`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }),
          axios.get(`${apiUrl}/api/expertises`, {
            withCredentials: true,
          })
        ])

        // Traiter les données artisan
        setArtisan(artisanRes.data.artisan)
        setExpertises(expertisesRes.data)

        if (artisanRes.data.plan_info) {
          const apiPlanInfo = artisanRes.data.plan_info
          setPlanInfo({
            amount: apiPlanInfo.amount,
            currency: apiPlanInfo.currency,
            interval: apiPlanInfo.interval,
          })
        } else {
          setPlanInfo(null)
        }

      } catch (error) {
        console.error('Erreur lors du chargement:', error)
        setError("Impossible de récupérer les informations du dashboard.")
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [token])

  // Fonctions pour gérer le modal d'images
  const openImageModal = (image: ProjectImage, images: ProjectImage[]) => {
    const index = images.findIndex(img => img.id === image.id)
    setCurrentImageIndex(index)
    setSelectedImage(image)
    setAllImages(images)
    setIsImageModalOpen(true)
  }

  const closeImageModal = () => {
    setIsImageModalOpen(false)
    setSelectedImage(null)
    setAllImages([])
  }

  const goToNextImage = () => {
    if (currentImageIndex < allImages.length - 1) {
      const nextIndex = currentImageIndex + 1
      setCurrentImageIndex(nextIndex)
      setSelectedImage(allImages[nextIndex])
    }
  }

  const goToPreviousImage = () => {
    if (currentImageIndex > 0) {
      const prevIndex = currentImageIndex - 1
      setCurrentImageIndex(prevIndex)
      setSelectedImage(allImages[prevIndex])
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

    async function refetchArtisan() {
      if (!token) return
      try {
        const res = await axios.get(`${apiUrl}/artisans/me`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        })
        setArtisan(res.data.artisan)

        if (res.data.plan_info) {
          const apiPlanInfo = res.data.plan_info
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

    refetchArtisan()
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    if (!artisan) return
    const { name, value } = e.target
    if (name === 'expertise_names') {
      const selectedOptions = Array.from(
        (e.target as HTMLSelectElement).selectedOptions
      ).map((option) => option.value)
      setArtisan((prev) => (prev ? { ...prev, [name]: selectedOptions } : prev))
    } else {
      setArtisan((prev) => (prev ? { ...prev, [name]: value } : prev))
    }
  }

  // Récupération du nombre de notifications non lues
  useEffect(() => {
    if (!token || activeTab === 'notifications') return

    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get(`${apiUrl}/artisans/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        })
        const count = response.data.unread_count || 0
        setUnreadCount(count)
      } catch (error) {
        console.error("Erreur lors de la récupération des notifications", error)
      }
    }

    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [token, activeTab])

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

  async function handleUpdate() {
    if (!artisan) return

    try {
      const formData = new FormData()

      Object.entries(artisan).forEach(([key, value]) => {
        if (
          key === 'avatar_url' ||
          key === 'kbis_url' ||
          key === 'insurance_url'
        ) {
          return
        }

        if (typeof value === 'string') {
          formData.append(`artisan[${key}]`, value)
        } else if (Array.isArray(value)) {
          value.forEach((v) => formData.append(`artisan[${key}][]`, v))
        }
      })

      if (kbisFile) formData.append('artisan[kbis]', kbisFile)
      if (insuranceFile) formData.append('artisan[insurance]', insuranceFile)
      if (avatarFile) formData.append('artisan[avatar]', avatarFile)

      const res = await axios.put(`${apiUrl}/artisans/me`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      })

      if (res.data.checkout_url) {
        toast.info(
          "Le nouveau tarif prendra effet le mois suivant. Veuillez finaliser le paiement dans la fenêtre qui va s'ouvrir."
        )
        window.open(res.data.checkout_url, '_blank')
      } else {
        toast.success('Informations mises à jour avec succès !')
        setIsEditing(false)

        if (res.data.artisan) {
          setArtisan(res.data.artisan)
        }

        if (res.data.plan_info) {
          const apiPlanInfo = res.data.plan_info
          setPlanInfo({
            amount: apiPlanInfo.amount,
            currency: apiPlanInfo.currency,
            interval: apiPlanInfo.interval,
          })
        } else {
          setPlanInfo(null)
        }

        if (res.data.artisan?.avatar_url && user) {
          setUser({
            ...user,
            avatar_url: res.data.artisan.avatar_url,
          })
        }

        setKbisFile(null)
        setInsuranceFile(null)
        setAvatarFile(null)
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour.')
    }
  }

  async function handleDeleteAccount() {
    if (!token) return
    try {
      await axios.delete(`${apiUrl}/artisans/me`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
      toast.success('Compte supprimé avec succès.')

      localStorage.removeItem('artisanToken')
      setUser(null)
      window.location.href = '/'
    } catch (error) {
      toast.error('Erreur lors de la suppression du compte.')
    }
  }

  // Gestion des états de chargement avec spinner
  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingText}>Initialisation...</p>
    </div>
  )

  if (error) return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <h2>⚠️ Erreur de chargement</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className={styles.retryButton}
        >
          Réessayer
        </button>
      </div>
    </div>
  )

  if (!user || !artisan || !token) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingText}>Initialisation...</p>
    </div>
  )

  return (
    <div className={styles.artisanDashboard}>
      <ToastContainer />

      <section className={styles.profileSection}>
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
            setArtisan={setArtisan}
            handleChange={handleChange}
            handleFileChange={handleFileChange}
            isEditing={isEditing}
            expertises={expertises}
            membershipPlans={membershipPlans}
            kbisFile={kbisFile}
            setKbisFile={setKbisFile}
            insuranceFile={insuranceFile}
            setInsuranceFile={setInsuranceFile}
            avatarFile={avatarFile}
            setAvatarFile={setAvatarFile}
            handleUpdate={handleUpdate}
            handleCancel={handleCancel}
          />
        )}
      </section>

      {/* Onglets */}
      <nav className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'creneaux' ? styles.active : ''}`}
          onClick={() => setActiveTab('creneaux')}
        >
          Créneaux
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'realisations' ? styles.active : ''}`}
          onClick={() => setActiveTab('realisations')}
        >
          Réalisations
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'notifications' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('notifications')
            setUnreadCount(0)
          }}
          style={{ position: 'relative' }}
        >
          Notifications
          {activeTab !== 'notifications' && unreadCount > 0 && (
            <span className={styles.notificationBadge}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'messagerie' ? styles.active : ''}`}
          onClick={() => setActiveTab('messagerie')}
        >
          Messagerie
        </button>
      </nav>

      {/* Contenu des onglets */}
      <section className={styles.tabContent}>
        {activeTab === 'creneaux' && (
          <div className={styles.creneauxContent}>
            <AvailabilitySlots isEditing={isEditing} />
          </div>
        )}
        
        {activeTab === 'realisations' && (
          <div className={styles.realisationsContent}>
            {token && (
              <ProjectImagesManager
                token={token}
                isEditing={isEditing}
                onImageClick={openImageModal}
              />
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className={styles.notificationsContent}>
            <NotificationList onActiveMissionsChange={setActiveMissions} />
          </div>
        )}

        {activeTab === 'messagerie' && (
          <div className={styles.messagerieContent}>
            <MessagingTab />
          </div>
        )}
      </section>

      {/* Modal d'images */}
      {isImageModalOpen && selectedImage && (
        <ImageModal
          isOpen={isImageModalOpen}
          image={selectedImage}
          images={allImages}
          currentIndex={currentImageIndex}
          onClose={closeImageModal}
          onNext={goToNextImage}
          onPrevious={goToPreviousImage}
        />
      )}
    </div>
  )
}











