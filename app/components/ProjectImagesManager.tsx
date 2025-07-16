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
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function ProjectImagesManager({ token, isEditing = false }: Props) {
  const [images, setImages] = useState<ProjectImage[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<ProjectImage | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchImages()
  }, [])

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
      setSelectedFile(e.target.files[0])
    }
  }

  const openModal = (image: ProjectImage) => {
    setSelectedImage(image)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedImage(null)
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
                  onClick={() => !isEditing && openModal(img)}
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
      )}

      {/* Modal pour afficher l'image en grand */}
      {isModalOpen && selectedImage && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeModal}>
              ✕
            </button>
            <Image
              src={selectedImage.image_url}
              alt="Image agrandie"
              width={800}
              height={600}
              style={{ objectFit: 'contain', maxWidth: '90vw', maxHeight: '90vh' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}





