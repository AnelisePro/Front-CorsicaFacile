import React from 'react'
import styles from './ArtisanEdit.module.scss'

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
  password?: string
  password_confirmation?: string
}

type ArtisanEditProps = {
  artisan: Artisan | null // PEUT ÊTRE NULL
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
  setArtisan: React.Dispatch<React.SetStateAction<Artisan | null>> // accepter null
  kbisFile: File | null
  insuranceFile: File | null
  avatarFile: File | null
  handleUpdate: () => Promise<void>
  handleCancel: () => void
  deletedImageUrls: string[]
}

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
  kbisFile,
  insuranceFile,
  avatarFile,
  handleUpdate,
  handleCancel,
  deletedImageUrls,
}: ArtisanEditProps) {
  // Gérer le changement des expertises (array de string)
  function handleExpertiseChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedValue = e.target.value

    setArtisan(prev => {
      if (!prev) return prev // si null, on ne fait rien
      return {
        ...prev,
        expertise_names: [selectedValue],
      }
    })
  }

  if (!artisan) return <p>Chargement des données...</p>

  return (
    <form className={styles.form} onSubmit={e => e.preventDefault()}>

      {/* Card 1 : Profil / entreprise */}
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
          <label htmlFor="avatar">Changer la photo de profil</label>
          <input
            id="avatar"
            type="file"
            name="avatar"
            accept="image/*"
            onChange={handleFileChange}
          />
          {avatarFile && (
            <img
              src={URL.createObjectURL(avatarFile)}
              alt="Prévisualisation avatar"
              className={styles.avatarPreview}
            />
          )}
        </div>
      </div>

      {/* Card 2 : Infos détaillées */}
      <div className={styles.card}>
        <h3>Détails de l’entreprise</h3>

        <div className={styles.formGroup}>
          <label htmlFor="address">Adresse</label>
          <textarea
            id="address"
            name="address"
            value={artisan.address}
            onChange={handleChange}
            required
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="expertise">Expertise</label>
          <select
            id="expertise"
            name="expertise_names"
            value={artisan.expertise_names[0] || ''}
            onChange={handleExpertiseChange}
            required
          >
            <option value="">Sélectionnez une expertise</option>
            {expertises.map(expertise => (
              <option key={expertise} value={expertise}>
                {expertise}
              </option>
            ))}
          </select>
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
          <label htmlFor="membership_plan">Formule d’abonnement</label>
          <select
            id="membership_plan"
            name="membership_plan"
            value={artisan.membership_plan}
            onChange={handleChange}
            required
          >
            {membershipPlans.map(plan => (
              <option key={plan} value={plan}>
                {plan}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="kbis">KBIS (PDF uniquement)</label>
          <input
            id="kbis"
            type="file"
            name="kbis"
            accept="application/pdf"
            onChange={handleFileChange}
          />
          {kbisFile && <p>Fichier sélectionné : {kbisFile.name}</p>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="insurance">Assurance (PDF uniquement)</label>
          <input
            id="insurance"
            type="file"
            name="insurance"
            accept="application/pdf"
            onChange={handleFileChange}
          />
          {insuranceFile && <p>Fichier sélectionné : {insuranceFile.name}</p>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Nouveau mot de passe</label>
          <input
            id="password"
            name="password"
            type="password"
            value={artisan.password || ''}
            onChange={handleChange}
            placeholder="Laissez vide pour ne pas changer"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password_confirmation">Confirmer le nouveau mot de passe</label>
          <input
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            value={artisan.password_confirmation || ''}
            onChange={handleChange}
            placeholder="Confirmez le nouveau mot de passe"
          />
        </div>
      </div>

      {/* Card 3 : Images des réalisations */}
      <div className={styles.card}>
        <h3>Images des réalisations</h3>

        <div className={styles.formGroup}>
          <label>Images existantes</label>
          <div className={styles.imagesGrid}>
            {artisan.images_urls.length > 0 ? (
              artisan.images_urls.map((url, idx) => (
                <div key={idx} className={styles.imageWrapper}>
                  <img
                    src={`${url}?t=${Date.now()}`}
                    alt={`Réalisation ${idx + 1}`}
                    className={styles.image}
                  />
                  <button
                    type="button"
                    aria-label="Supprimer cette image"
                    onClick={() => removeExistingImage(url)}
                    className={styles.deleteBtn}
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
          <label htmlFor="newImages">Ajouter des nouvelles images</label>
          <input
            id="newImages"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesChange}
          />
          <div className={styles.imagesGrid}>
            {newImages.map((file, idx) => (
              <div key={idx} className={styles.imageWrapper}>
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Prévisualisation ${idx + 1}`}
                  className={styles.image}
                />
                <button
                  type="button"
                  aria-label="Supprimer cette image"
                  onClick={() => removeNewImage(idx)}
                  className={styles.deleteBtn}
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
          onClick={handleUpdate}
          className={styles.saveBtn}
          disabled={!isEditing}
        >
          Enregistrer
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className={styles.cancelBtn}
        >
          Annuler
        </button>
      </div>
    </form>
  )
}



