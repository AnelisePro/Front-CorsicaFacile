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
  kbis_url?: string
  insurance_url?: string
  password?: string
  password_confirmation?: string
}

type ArtisanEditProps = {
  artisan: Artisan | null
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleImagesChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  removeExistingImage: (url: string) => void
  removeNewImage: (index: number) => void
  newImages: File[]
  isEditing: boolean
  expertises: string[]
  membershipPlans: string[]
  setArtisan: React.Dispatch<React.SetStateAction<Artisan | null>>
  handleUpdate: () => Promise<void>
  handleCancel: () => void
  kbisFile: File | null
  insuranceFile: File | null
  avatarFile: File | null
  deletedImageUrls: string[]
  setKbisFile: React.Dispatch<React.SetStateAction<File | null>>
  setInsuranceFile: React.Dispatch<React.SetStateAction<File | null>>
  setAvatarFile: React.Dispatch<React.SetStateAction<File | null>>
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export default function ArtisanEdit({
  artisan,
  handleChange,
  handleFileChange,
  handleImagesChange,
  removeExistingImage,
  removeNewImage,
  newImages,
  isEditing,
  expertises,
  membershipPlans,
  setArtisan,
  handleUpdate,
  handleCancel,
  kbisFile,
  insuranceFile,
  avatarFile,
  deletedImageUrls,
  setKbisFile,
  setInsuranceFile,
  setAvatarFile,
}: ArtisanEditProps) {
  const [uploading, setUploading] = useState(false)

  if (!artisan) return <p>Chargement des données...</p>

  async function getPresignedUrl(fileName: string, contentType: string, purpose: string) {
    const token = localStorage.getItem('artisanToken') || ''
    const response = await axios.post(
      `${apiUrl}/presigned_url`,
      { filename: fileName, content_type: contentType, purpose },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data.url as string
  }

  async function uploadToS3(file: File, presignedUrl: string) {
    await axios.put(presignedUrl, file, {
      headers: { 'Content-Type': file.type },
    })
  }

  // Gestion upload Avatar
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return
    const file = e.target.files[0]
    setAvatarFile(file)
  }

  // Gestion upload KBIS
  async function handleKbisChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return
    const file = e.target.files[0]
    setKbisFile(file)
  }

  // Gestion upload Assurance Pro
  async function handleInsuranceChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return
    const file = e.target.files[0]
    setInsuranceFile(file)
  }

  // Fonction pour uploader fichiers (avatar, kbis, assurance)
  async function uploadFile(file: File, purpose: string) {
    setUploading(true)
    try {
      const presignedUrl = await getPresignedUrl(file.name, file.type, purpose)
      await uploadToS3(file, presignedUrl)
      const publicUrl = presignedUrl.split('?')[0]
      return publicUrl
    } catch (error) {
      console.error(`Erreur upload ${purpose}:`, error)
      alert(`Erreur lors de l’upload du fichier ${purpose}.`)
      return null
    } finally {
      setUploading(false)
    }
  }

  // Appelée au moment de la sauvegarde, upload tous les fichiers modifiés avant d'appeler handleUpdate
  async function handleSave() {
    if (!artisan) return

    let updatedArtisan = { ...artisan }

    // Upload avatar si modifié
    if (avatarFile) {
      const avatarUrl = await uploadFile(avatarFile, 'profile_picture')
      if (avatarUrl) updatedArtisan.avatar_url = avatarUrl
    }

    // Upload KBIS si modifié
    if (kbisFile) {
      const kbisUrl = await uploadFile(kbisFile, 'kbis')
      if (kbisUrl) updatedArtisan.kbis_url = kbisUrl
    }

    // Upload Assurance Pro si modifié
    if (insuranceFile) {
      const insuranceUrl = await uploadFile(insuranceFile, 'insurance')
      if (insuranceUrl) updatedArtisan.insurance_url = insuranceUrl
    }

    setArtisan(updatedArtisan)

    // Appelle la fonction externe pour sauvegarder l'artisan (ex: API)
    await handleUpdate()
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
          <label htmlFor="address">Adresse</label>
          <input
            id="address"
            name="address"
            value={artisan.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={artisan.description || ''}
            onChange={handleChange}
            rows={4}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="siren">SIREN</label>
          <input
            id="siren"
            name="siren"
            value={artisan.siren}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={artisan.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone">Téléphone</label>
          <input
            id="phone"
            name="phone"
            value={artisan.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="membership_plan">Plan d'adhésion</label>
          <select
            id="membership_plan"
            name="membership_plan"
            value={artisan.membership_plan}
            onChange={handleChange}
          >
            {membershipPlans.map(plan => (
              <option key={plan} value={plan}>
                {plan}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="expertise_names">Expertises</label>
          <select
            id="expertise_names"
            name="expertise_names"
            value={artisan.expertise_names[0] || ''}
            onChange={handleChange}
          >
            <option value="">-- Choisir une expertise --</option>
            {expertises.map(exp => (
              <option key={exp} value={exp}>
                {exp}
              </option>
            ))}
          </select>
        </div>

        {/* Avatar */}
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

        {/* KBIS */}
        <div className={styles.formGroup}>
          <label htmlFor="kbis" className={styles.fileLabel}>
            {artisan.kbis_url ? 'Remplacer le KBIS' : 'Ajouter un KBIS'}
          </label>
          <input
            id="kbis"
            type="file"
            name="kbis"
            accept="application/pdf,image/*"
            onChange={handleKbisChange}
            disabled={uploading}
            className={styles.fileInput}
          />
          {artisan.kbis_url && (
            <a href={artisan.kbis_url} target="_blank" rel="noopener noreferrer" className={styles.link}>
              Voir le KBIS actuel
            </a>
          )}
          {kbisFile && <p>Fichier sélectionné : {kbisFile.name}</p>}
        </div>

        {/* Assurance Pro */}
        <div className={styles.formGroup}>
          <label htmlFor="insurance" className={styles.fileLabel}>
            {artisan.insurance_url ? 'Remplacer l’Assurance Pro' : 'Ajouter l’Assurance Pro'}
          </label>
          <input
            id="insurance"
            type="file"
            name="insurance"
            accept="application/pdf,image/*"
            onChange={handleInsuranceChange}
            disabled={uploading}
            className={styles.fileInput}
          />
          {artisan.insurance_url && (
            <a href={artisan.insurance_url} target="_blank" rel="noopener noreferrer" className={styles.link}>
              Voir l’Assurance Pro actuelle
            </a>
          )}
          {insuranceFile && <p>Fichier sélectionné : {insuranceFile.name}</p>}
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
            {newImages.map((file, idx) => (
              <div key={idx} className={styles.imageWrapper}>
                <div
                  className={styles.imageWrapper}
                  style={{ position: 'relative', width: '100px', height: '100px' }}
                >
                  <Image
                    src={URL.createObjectURL(file)}
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
        <button
          type="button"
          onClick={handleSave}
          className={styles.saveBtn}
          disabled={!isEditing || uploading}
        >
          Enregistrer
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className={styles.cancelBtn}
          disabled={uploading}
        >
          Annuler
        </button>
      </div>
    </form>
  )
}









