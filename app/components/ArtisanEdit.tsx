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
  avatar_url?: string
  kbis_url?: string
  insurance_url?: string
  password?: string
  password_confirmation?: string
}

type ArtisanEditProps = {
  artisan: Artisan | null
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditing: boolean
  expertises: string[]
  membershipPlans: string[]
  setArtisan: React.Dispatch<React.SetStateAction<Artisan | null>>
  handleUpdate: (updatedArtisan?: Artisan) => Promise<void>
  handleCancel: () => void
  kbisFile: File | null
  insuranceFile: File | null
  avatarFile: File | null
  setKbisFile: React.Dispatch<React.SetStateAction<File | null>>
  setInsuranceFile: React.Dispatch<React.SetStateAction<File | null>>
  setAvatarFile: React.Dispatch<React.SetStateAction<File | null>>
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export default function ArtisanEdit({
  artisan,
  handleChange,
  isEditing,
  expertises,
  membershipPlans,
  setArtisan,
  handleUpdate,
  handleCancel,
  kbisFile,
  insuranceFile,
  avatarFile,
  setKbisFile,
  setInsuranceFile,
  setAvatarFile,
}: ArtisanEditProps) {
  const [uploading, setUploading] = useState(false)

  if (!artisan) return <p className={styles.loadingText}>Chargement des données...</p>

  // Fonctions d'upload
  const getPresignedUrl = async (fileName: string, contentType: string, purpose: string) => {
    const token = localStorage.getItem('artisanToken') || ''
    const response = await axios.post(
      `${apiUrl}/presigned_url`,
      { filename: fileName, content_type: contentType, purpose },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data.url as string
  }

  const uploadToS3 = async (file: File, presignedUrl: string) => {
    await axios.put(presignedUrl, file, {
      headers: { 'Content-Type': file.type },
    })
  }

  const uploadFile = async (file: File, purpose: string) => {
    try {
      const presignedUrl = await getPresignedUrl(file.name, file.type, purpose)
      await uploadToS3(file, presignedUrl)
      return presignedUrl.split('?')[0]
    } catch (error) {
      console.error(`Erreur upload ${purpose}:`, error)
      throw new Error(`Erreur lors de l'upload du fichier ${purpose}`)
    }
  }

  // Gestionnaires de fichiers
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAvatarFile(e.target.files[0])
    }
  }

  const handleKbisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setKbisFile(e.target.files[0])
    }
  }

  const handleInsuranceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setInsuranceFile(e.target.files[0])
    }
  }

  const handleSave = async () => {
    if (!artisan) return

    setUploading(true)
    try {
      const updatedArtisan = { ...artisan }

      if (avatarFile) {
        const avatarUrl = await uploadFile(avatarFile, 'profile_picture')
        if (avatarUrl) updatedArtisan.avatar_url = avatarUrl
      }

      if (kbisFile) {
        const kbisUrl = await uploadFile(kbisFile, 'kbis')
        if (kbisUrl) updatedArtisan.kbis_url = kbisUrl
      }

      if (insuranceFile) {
        const insuranceUrl = await uploadFile(insuranceFile, 'insurance')
        if (insuranceUrl) updatedArtisan.insurance_url = insuranceUrl
      }

      await handleUpdate(updatedArtisan)
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error)
      alert("Erreur lors de l'enregistrement. Veuillez réessayer.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <form className={styles.form}>
      <div className={styles.card}>
        <h3 className={styles.title}>Informations de l'entreprise</h3>

        {/* Champ Nom de l'entreprise */}
        <div className={styles.formGroup}>
          <label htmlFor="company_name">Nom de l'entreprise</label>
          <input
            id="company_name"
            name="company_name"
            value={artisan.company_name}
            onChange={handleChange}
            required
            className={styles.formInput}
          />
        </div>

        {/* Champ Adresse */}
        <div className={styles.formGroup}>
          <label htmlFor="address">Adresse</label>
          <input
            id="address"
            name="address"
            value={artisan.address}
            onChange={handleChange}
            required
            className={styles.formInput}
          />
        </div>

        {/* Champ SIREN */}
        <div className={styles.formGroup}>
          <label htmlFor="siren">SIREN</label>
          <input
            id="siren"
            name="siren"
            value={artisan.siren}
            onChange={handleChange}
            required
            className={styles.formInput}
          />
        </div>

        {/* Champ Email */}
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={artisan.email}
            onChange={handleChange}
            required
            className={styles.formInput}
          />
        </div>

        {/* Champ Téléphone */}
        <div className={styles.formGroup}>
          <label htmlFor="phone">Téléphone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={artisan.phone}
            onChange={handleChange}
            required
            className={styles.formInput}
          />
        </div>

        {/* Champ Plan d'adhésion */}
        <div className={styles.formGroup}>
          <label htmlFor="membership_plan">Plan d'adhésion</label>
          <select
            id="membership_plan"
            name="membership_plan"
            value={artisan.membership_plan}
            onChange={handleChange}
            className={styles.formSelect}
          >
            {membershipPlans.map(plan => (
              <option key={plan} value={plan}>{plan}</option>
            ))}
          </select>
        </div>

        {/* Champ Expertises */}
        <div className={styles.formGroup}>
          <label htmlFor="expertise_names">Expertises</label>
          <select
            id="expertise_names"
            name="expertise_names"
            multiple
            value={artisan.expertise_names}
            onChange={handleChange}
            className={styles.expertiseSelect}
            size={Math.min(6, expertises.length)}
          >
            {expertises.map(exp => (
              <option key={exp} value={exp}>{exp}</option>
            ))}
          </select>
        </div>

        {/* Champ Description */}
        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={artisan.description || ''}
            onChange={handleChange}
            className={styles.formTextarea}
            rows={4}
          />
        </div>

        {/* Section Avatar */}
        <div className={styles.avatarSectionContainer}>
          <div className={styles.avatarSection}>
            {artisan.avatar_url && (
              <div className={styles.avatarPreview}>
                <Image
                  src={artisan.avatar_url}
                  alt="Avatar artisan"
                  width={120}
                  height={120}
                  style={{ objectFit: 'cover' }}
                />
              </div>
            )}
            <div className={styles.avatarActions}>
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
            </div>
          </div>
        </div>

        {/* Section Fichiers */}
        <div className={styles.fileSection}>
          <div className={styles.fileButtonGroup}>
            <div className={styles.fileItem}>
              <label htmlFor="kbis" className={styles.fileLabel}>
                {artisan.kbis_url ? 'Changer KBIS' : 'Ajouter KBIS'}
              </label>
              <input
                id="kbis"
                type="file"
                name="kbis"
                accept=".pdf,image/*"
                onChange={handleKbisChange}
                disabled={uploading}
                className={styles.fileInput}
              />
              {artisan.kbis_url && (
                <a
                  href={artisan.kbis_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.fileLink}
                >
                  Voir KBIS actuel
                </a>
              )}
            </div>

            <div className={styles.fileItem}>
              <label htmlFor="insurance" className={styles.fileLabel}>
                {artisan.insurance_url ? 'Changer Assurance Pro' : 'Ajouter Assurance Pro'}
              </label>
              <input
                id="insurance"
                type="file"
                name="insurance"
                accept=".pdf,image/*"
                onChange={handleInsuranceChange}
                disabled={uploading}
                className={styles.fileInput}
              />
              {artisan.insurance_url && (
                <a
                  href={artisan.insurance_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.fileLink}
                >
                  Voir Assurance actuelle
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className={styles.buttonsContainer}>
          <button
            type="button"
            onClick={handleSave}
            disabled={uploading}
            className={styles.saveButton}
          >
            {uploading ? 'Enregistrement en cours...' : 'Enregistrer'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className={styles.cancelButton}
          >
            Annuler
          </button>
        </div>
      </div>
    </form>
  )
}













