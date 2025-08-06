'use client'

import React, { useState, useEffect } from 'react'
import styles from './Step3.module.scss'
import { BesoinFormData } from './BesoinFormData'

interface Step3Props {
  data: BesoinFormData
  setData: React.Dispatch<React.SetStateAction<BesoinFormData>>
}

const MAX_IMAGES = 10

// Fonction pour nettoyer/encoder le nom de fichier avant upload
const sanitizeFilename = (filename: string) => {
  return filename
    .normalize('NFD') // décompose les accents
    .replace(/[\u0300-\u036f]/g, '') // supprime les accents
    .replace(/[^a-zA-Z0-9._-]/g, '_') // remplace les autres caractères spéciaux
}

const Step3 = ({ data, setData }: Step3Props) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bucketUrl =
    process.env.NEXT_PUBLIC_S3_BUCKET_URL || 'https://corsica-facile-prod.s3.eu-north-1.amazonaws.com'

  useEffect(() => {
    console.log('State images a changé:', data.images)
  }, [data.images])

  const getPresignedUrl = async (filename: string, fileType: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/presigned_url`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          content_type: fileType,
          purpose: 'project_image'
        })
      }
    )

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l’URL signée')
    }

    return await response.json()
  }

  const uploadFileToS3 = async (file: File) => {
    const cleanFilename = sanitizeFilename(file.name)
    const { url, key } = await getPresignedUrl(cleanFilename, file.type)

    const uploadResponse = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type }
    })

    if (!uploadResponse.ok) {
      throw new Error('Erreur lors de l’upload vers S3')
    }

    const publicUrl = `${bucketUrl}/${key}`
    return publicUrl
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    setError(null)
    setUploading(true)

    try {
      const files = Array.from(e.target.files).slice(0, MAX_IMAGES - data.images.length)
      const uploadedUrls = await Promise.all(files.map(uploadFileToS3))

      const combinedUrls = [...data.images, ...uploadedUrls].slice(0, MAX_IMAGES)
      setData({ ...data, images: combinedUrls })
    } catch (err) {
      console.error(err)
      setError((err as Error).message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = data.images.filter((_, i) => i !== index)
    setData({ ...data, images: newImages })
  }

  const isMaxReached = data.images.length >= MAX_IMAGES

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Ajoutez des photos (facultatif)</h2>

      {error && <p className={styles.error}>Erreur : {error}</p>}

      <label
        htmlFor="fileUpload"
        className={styles.uploadLabel}
        aria-disabled={isMaxReached || uploading}
        style={{
          cursor: isMaxReached || uploading ? 'not-allowed' : 'pointer',
          opacity: isMaxReached || uploading ? 0.5 : 1
        }}
      >
        {isMaxReached
          ? `Limite atteinte (${MAX_IMAGES} images max)`
          : uploading
          ? 'Téléchargement en cours...'
          : 'Choisir des images 📷'}
      </label>
      <input
        id="fileUpload"
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className={styles.fileInput}
        disabled={isMaxReached || uploading}
      />

      {data.images.length > 0 && (
        <div className={styles.previewGrid}>
          {data.images.map((url, idx) => {
            console.log('Image URL:', url) // 💡 Log ajouté ici
            return (
              <div key={idx} className={styles.previewItem}>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => handleRemoveImage(idx)}
                  aria-label={`Supprimer l’image ${idx + 1}`}
                >
                  &times;
                </button>
                <img src={url} alt={`Image ${idx + 1}`} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Step3











