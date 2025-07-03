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
import ProgressStepper from '../../components/ProgressStepper'
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
  images_urls: string[]
  avatar_url?: string
}

type PlanInfo = {
  amount: number
  currency: string
  interval: string
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

  const [token, setToken] = useState<string | null>(null)
  const [artisan, setArtisan] = useState<Artisan | null>(null)
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [expertises, setExpertises] = useState<string[]>([])
  const [kbisFile, setKbisFile] = useState<File | null>(null)
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [newImages, setNewImages] = useState<File[]>([])
  const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([])
  const [activeMissions, setActiveMissions] = useState<{ id: number, status: string }[]>([])

  useEffect(() => {
    const artisanToken = localStorage.getItem('artisanToken')
    setToken(artisanToken)
  }, [])

  useEffect(() => {
    async function fetchArtisan() {
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

    fetchArtisan()
  }, [token])

  useEffect(() => {
    async function fetchExpertises() {
      try {
        const res = await axios.get(`${apiUrl}/api/expertises`, {
          withCredentials: true,
        })
        setExpertises(res.data)
      } catch (error) {
        toast.error("Impossible de récupérer les expertises.")
      }
    }

    fetchExpertises()
  }, [])

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

    async function fetchArtisan() {
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

    fetchArtisan()
  }

  function handleChange(e: React.ChangeEvent<any>) {
    if (!artisan) return
    const { name, value } = e.target
    if (name === 'expertise_names') {
      setArtisan(prev => (prev ? { ...prev, [name]: [value] } : prev))
    } else {
      setArtisan(prev => (prev ? { ...prev, [name]: value } : prev))
    }
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
        if (
          key === 'images_urls' ||
          key === 'avatar_url' ||
          key === 'kbis_url' ||
          key === 'insurance_url'
        ) {
          return
        }

        if (typeof value === 'string') {
          formData.append(`artisan[${key}]`, value)
        } else if (Array.isArray(value)) {
          value.forEach(v => formData.append(`artisan[${key}][]`, v))
        }
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

        async function fetchArtisan() {
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

        fetchArtisan()

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

  if (!user) return <p>Chargement...</p>
  if (!artisan) return <p>Chargement des données artisan...</p>

  return (
    <div className={styles.container}>
      <ToastContainer />

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
            setArtisan={setArtisan}
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
            setKbisFile={setKbisFile}
            insuranceFile={insuranceFile}
            setInsuranceFile={setInsuranceFile}
            avatarFile={avatarFile}
            setAvatarFile={setAvatarFile}
            handleUpdate={handleUpdate}
            handleCancel={handleCancel}
            deletedImageUrls={deletedImageUrls}
          />
        )}
      </div>

      <div className={styles.rightColumn}>
        <NotificationList onActiveMissionsChange={setActiveMissions} />
        {activeMissions.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4>Suivi de mission</h4>
            <div style={{ marginBottom: '10px' }}>
              <strong>Mission en cours :</strong><br />
              ID : {activeMissions[0].id}<br />
              Statut : {activeMissions[0].status}
            </div>
            <ProgressStepper currentStep={activeMissions[0].status === 'accepted' ? 2 : 3} />
          </div>
        )}
        <AvailabilitySlots isEditing={isEditing} />
      </div>
    </div>
  )
}





