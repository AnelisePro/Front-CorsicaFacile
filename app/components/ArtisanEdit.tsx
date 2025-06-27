import React, { useState } from 'react'
import styles from './ArtisanEdit.module.scss'
import Image from 'next/image'
import axios from 'axios'

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
  password?: string
  password_confirmation?: string
}

type ArtisanEditProps = {
  artisan: Artisan | null
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void
  removeExistingImage: (url: string) => void
  removeNewImage: (index: number) => void
  newImages: string[] // tableau d'URLs uploadées
  isEditing: boolean
  expertises: string[]
  membershipPlans: string[]
  setArtisan: React.Dispatch<React.SetStateAction<Artisan | null>>
  handleUpdate: () => Promise<void>
  handleCancel: () => void
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export default function ArtisanEdit({
  artisan,
  handleChange,
  removeExistingImage,
  removeNewImage,
  newImages,
  isEditing,
  expertises,
  membershipPlans,
  setArtisan,
  handleUpdate,
  handleCancel,
}: ArtisanEditProps) {
  const [uploading, setUploading] = useState(false)

  if (!artisan) return <p>Chargement des données...</p>

  // Récupère une URL pré-signée
  async function getPresignedUrl(fileName: string, contentType: string, purpose: string) {
    const token = localStorage.getItem('clientToken') || ''
    const response = await axios.post(
      `${apiUrl}/presigned_url`,
      { filename: fileName, content_type: contentType, purpose },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data.url as string
  }

  // Upload direct sur S3 avec l'URL pré-signée
  async function uploadToS3(file: File, presignedUrl: string) {
    await axios.put(presignedUrl, file, {
      headers: { 'Content-Type': file.type },
    })
  }

  // Upload avatar
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return
    const file = e.target.files[0]

    try {
      setUploading(true)
      const presignedUrl = await getPresignedUrl(file.name, file.type, 'profile_picture')
      await uploadToS3(file, presignedUrl)
      const publicUrl = presignedUrl.split('?')[0]

      setArtisan(prev => (prev ? { ...prev, avatar_url: publicUrl } : prev))
    } catch (error) {
      console.error('Erreur upload avatar:', error)
      alert('Erreur lors de l’upload de l’avatar.')
    } finally {
      setUploading(false)
    }
  }

  // Upload images de réalisations
  async function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return
    const files = Array.from(e.target.files)
    setUploading(true)

    try {
      const uploadedUrls = await Promise.all(
        files.map(async file => {
          const presignedUrl = await getPresignedUrl(file.name, file.type, 'project_image')
          await uploadToS3(file, presignedUrl)
          return presignedUrl.split('?')[0]
        })
      )

      setArtisan(prev => {
        if (!prev) return prev
        return {
          ...prev,
          images_urls: [...prev.images_urls, ...uploadedUrls],
        }
      })
    } catch (error) {
      console.error('Erreur upload images réalisations:', error)
      alert('Erreur lors de l’upload des images.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={e => e.preventDefault()}>
      <div className={styles.card}>
        <h3>Informations de l’entreprise</h3>
        <div className={styles.formGroup}>
          <label htmlFor="company_name">Nom de l'entreprise</label>
          <input
            id="company_name"
            name="company_name"
            value={artisan.company_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="avatar" className={styles.fileLabel}>
            Changer la photo de profil
          </label>
          <input
            id="avatar"
            type="file"
            name="avatar"
            accept="image/*"
            onChange={handleAvatarChange}
            disabled={uploading}
            className={styles.fileInput}
          />
          {artisan.avatar_url && (
            <div
              className={styles.avatarPreview}
              style={{
                position: 'relative',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                overflow: 'hidden',
              }}
            >
              <Image
                src={artisan.avatar_url}
                alt="Avatar artisan"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <h3>Images des réalisations</h3>

        <div className={styles.formGroup}>
          <label>Images existantes</label>
          <div className={styles.imagesGrid}>
            {artisan.images_urls.length > 0 ? (
              artisan.images_urls.map((url, idx) => (
                <div key={idx} className={styles.imageWrapper}>
                  <div
                    className={styles.imageWrapper}
                    style={{ position: 'relative', width: '100px', height: '100px' }}
                  >
                    <Image
                      src={`${url}?t=${Date.now()}`}
                      alt={`Réalisation ${idx + 1}`}
                      fill
                      style={{ objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </div>
                  <button
                    type="button"
                    aria-label="Supprimer cette image"
                    onClick={() => removeExistingImage(url)}
                    className={styles.deleteBtn}
                    disabled={uploading}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <p>Aucune image enregistrée.</p>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="newImages" className={styles.fileLabel}>
            Ajouter de nouvelles images
          </label>
          <input
            id="newImages"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesChange}
            disabled={uploading}
            className={styles.fileInput}
          />
          <div className={styles.imagesGrid}>
            {newImages.map((url, idx) => (
              <div key={idx} className={styles.imageWrapper}>
                <div
                  className={styles.imageWrapper}
                  style={{ position: 'relative', width: '100px', height: '100px' }}
                >
                  <Image
                    src={url}
                    alt={`Prévisualisation ${idx + 1}`}
                    fill
                    style={{ objectFit: 'cover', borderRadius: '8px' }}
                  />
                </div>
                <button
                  type="button"
                  aria-label="Supprimer cette image"
                  onClick={() => removeNewImage(idx)}
                  className={styles.deleteBtn}
                  disabled={uploading}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.buttons}>
        <button type="button" onClick={handleUpdate} className={styles.saveBtn} disabled={!isEditing || uploading}>
          Enregistrer
        </button>
        <button type="button" onClick={handleCancel} className={styles.cancelBtn} disabled={uploading}>
          Annuler
        </button>
      </div>
    </form>
  )
}





