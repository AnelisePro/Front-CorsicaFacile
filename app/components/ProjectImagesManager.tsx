'use client'

import React, { useState, useEffect, ChangeEvent } from 'react'
import styles from './ProjectImagesManager.module.scss'
import axios from 'axios'
import Image from 'next/image'

type ProjectImage = {
  id: number
  image_url: string
}

type Props = {
  token: string | null
  isEditing?: boolean
  onImageClick: (image: ProjectImage, images: ProjectImage[]) => void
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function ProjectImagesManager({ token, isEditing = false, onImageClick }: Props) {
  const [images, setImages] = useState<ProjectImage[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  useEffect(() => {
    fetchImages()
  }, [])

  // Nettoyage de l'URL de prévisualisation
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  async function fetchImages() {
    if (!token) {
      setError("Aucun token disponible")
      return
    }

    try {
      const res = await axios.get(`${apiUrl}/artisans/project_images`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      })
      setImages(res.data)
      setError(null)
    } catch (err) {
      setError("Erreur chargement images")
    }
  }

  async function handleUpload() {
    if (!token || !selectedFile) return

    const formData = new FormData()
    formData.append('image', selectedFile)

    try {
      const res = await axios.post(`${apiUrl}/artisans/project_images`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      })
      setImages((prev) => [...prev, res.data])
      setSelectedFile(null)
      setError(null)
      
      // Nettoyage de la prévisualisation
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreviewUrl(null)
      
      // Affichage du message de succès
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (err) {
      setError("Erreur lors de l'upload de l'image.")
    }
  }

  async function handleDelete(id: number) {
    if (!token) return

    try {
      await axios.delete(`${apiUrl}/artisans/project_images/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      })
      setImages((prev) => prev.filter((img) => img.id !== id))
    } catch (err) {
      setError("Erreur lors de la suppression de l'image.")
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setSelectedFile(file)
      
      // Nettoyage de l'ancienne prévisualisation
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      
      // Création de la nouvelle prévisualisation
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
      setUploadSuccess(false)
    }
  }

  const handleImageClick = (image: ProjectImage) => {
    if (!isEditing) {
      onImageClick(image, images)
    }
  }

  return (
    <div className={styles.projectImagesContainer}>
      {error && <p className={styles.errorMessage}>{error}</p>}

      {images.length === 0 ? (
        <p className={styles.emptyState}>Aucune image disponible.</p>
      ) : (
        <div className={styles.imagesScrollContainer}>
          <div className={styles.imagesGrid}>
            {images.map((img) => (
              <div key={img.id} className={styles.imageContainer}>
                <Image
                  src={img.image_url}
                  alt="Réalisation"
                  className={styles.projectImage}
                  width={300}
                  height={200}
                  style={{ objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => handleImageClick(img)}
                />
                {isEditing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(img.id)
                    }}
                    className={styles.deleteButton}
                    aria-label="Supprimer l'image"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {isEditing && (
        <div className={styles.uploadSection}>
          <div className={styles.uploadControls}>
            <label className={`${styles.fileInputLabel} ${selectedFile ? styles.hasFile : ''}`}>
              <input
                type="file"
                onChange={handleFileChange}
                className={styles.hiddenFileInput}
                accept="image/*"
              />
              {selectedFile ? selectedFile.name : 'Choisir une image'}
            </label>
            <button
              onClick={handleUpload}
              disabled={!selectedFile}
              className={styles.uploadButton}
            >
              Ajouter une image
            </button>
          </div>

          {/* Prévisualisation de l'image */}
          {previewUrl && (
            <div className={styles.previewContainer}>
              <div className={styles.previewImageContainer}>
                <Image
                  src={previewUrl}
                  alt="Aperçu"
                  className={styles.previewImage}
                  width={200}
                  height={150}
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          )}

          {/* Message de succès */}
          {uploadSuccess && (
            <div className={styles.successMessage}>
              <span className={styles.successIcon}>✓</span>
              Image bien ajoutée !
            </div>
          )}
        </div>
      )}
    </div>
  )
}








