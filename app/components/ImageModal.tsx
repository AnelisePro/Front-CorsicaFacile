'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import styles from './ImageModal.module.scss'

type ProjectImage = {
  id: number
  image_url: string
}

type Props = {
  isOpen: boolean
  image: ProjectImage
  images: ProjectImage[]
  currentIndex: number
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
}

export default function ImageModal({ 
  isOpen, 
  image, 
  images, 
  currentIndex, 
  onClose, 
  onNext, 
  onPrevious 
}: Props) {
  
  // Gestion des touches clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        onPrevious()
      } else if (e.key === 'ArrowRight') {
        onNext()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, onNext, onPrevious])

  // Bloquer le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Bouton de fermeture */}
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
        
        {/* Flèche précédente */}
        {images.length > 1 && currentIndex > 0 && (
          <button className={styles.prevButton} onClick={onPrevious}>
            ‹
          </button>
        )}
        
        {/* Image principale */}
        <div className={styles.imageWrapper}>
          <Image
            src={image.image_url}
            alt="Image agrandie"
            width={800}
            height={600}
            style={{ objectFit: 'contain', maxWidth: '90vw', maxHeight: '90vh' }}
          />
        </div>
        
        {/* Flèche suivante */}
        {images.length > 1 && currentIndex < images.length - 1 && (
          <button className={styles.nextButton} onClick={onNext}>
            ›
          </button>
        )}
        
        {/* Indicateur de position */}
        {images.length > 1 && (
          <div className={styles.imageCounter}>
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  )
}
