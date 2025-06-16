'use client'

import React from 'react'
import styles from './Step3.module.scss'

interface BesoinFormData {
  type_prestation: string
  description: string
  images: File[]
  schedule: string
  address: string
}

interface Step3Props {
  data: BesoinFormData
  setData: React.Dispatch<React.SetStateAction<BesoinFormData>>
}

const Step3 = ({ data, setData }: Step3Props) => {
  const MAX_IMAGES = 10

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    const combinedFiles = [...data.images, ...files].slice(0, MAX_IMAGES)
    setData({ ...data, images: combinedFiles })
    e.target.value = ''
  }

  const handleRemoveImage = (index: number) => {
    const newImages = data.images.filter((_, i) => i !== index)
    setData({ ...data, images: newImages })
  }

  const isMaxReached = data.images.length >= MAX_IMAGES

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Ajoutez des photos (facultatif)</h2>

      <label
        htmlFor="fileUpload"
        className={styles.uploadLabel}
        aria-disabled={isMaxReached}
        style={{
          cursor: isMaxReached ? 'not-allowed' : 'pointer',
          opacity: isMaxReached ? 0.5 : 1,
        }}
      >
        {isMaxReached ? `Limite atteinte (${MAX_IMAGES} images max)` : 'Choisir des images 📷'}
      </label>
      <input
        id="fileUpload"
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className={styles.fileInput}
        disabled={isMaxReached}
      />

      {data.images.length > 0 && (
        <div className={styles.previewGrid}>
          {data.images.map((file, idx) => {
            const imgUrl = URL.createObjectURL(file)
            return (
              <div key={idx} className={styles.previewItem}>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => handleRemoveImage(idx)}
                  aria-label={`Supprimer l’image ${file.name}`}
                >
                  &times;
                </button>
                <img src={imgUrl} alt={file.name} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Step3





