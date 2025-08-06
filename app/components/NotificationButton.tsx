'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Props {
  besoinId: number
  clientId: number
  artisanToken: string
  disabled?: boolean | null
  className?: string
  onSuccess?: () => void
  onStatsUpdate?: (stats: any) => void
}

export default function NotificationButton({ 
  besoinId, 
  clientId, 
  artisanToken, 
  disabled = false, 
  className,
  onSuccess,      // ← Ajouté
  onStatsUpdate   // ← Ajouté
}: Props) {
  const [loading, setLoading] = useState(false)
  
  // Convertir disabled en boolean pour éviter les null/undefined
  const isDisabled = Boolean(disabled)

  const fetchArtisanInfo = async () => {
    try {
      const response = await axios.get(`${apiUrl}/artisans/me`, {
        headers: { Authorization: `Bearer ${artisanToken}` },
      })
      return response.data
    } catch (error) {
      console.error('Erreur récupération artisan:', error)
      return null
    }
  }

  const handleInterest = async () => {
    if (isDisabled) {
      toast.info("Vous avez déjà répondu à cette annonce")
      return
    }

    setLoading(true)

    try {
      const response = await axios.post(
        `${apiUrl}/announcement_responses`,
        {
          announcement_response: {
            besoin_id: besoinId,
            client_id: clientId
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${artisanToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      toast.success('Votre intérêt a été envoyé avec succès!')
      
      // Utiliser les stats retournées directement
      if (response.data.usage_stats && onStatsUpdate) {
        onStatsUpdate(response.data.usage_stats)
      } else if (onSuccess) {
        onSuccess()
      }
      
    } catch (error: any) {
      console.error('Erreur:', error)
      
      if (error.response?.status === 422 || error.response?.status === 403) {
        const errorData = error.response.data
        toast.error(errorData.error || 'Limite atteinte')
      } else {
        toast.error('Erreur lors de l\'envoi de la notification.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleInterest}
      disabled={isDisabled || loading}
      className={className}
    >
      {loading ? 'Envoi...' : 'Je suis intéressé par cette annonce'}
    </button>
  )
}

