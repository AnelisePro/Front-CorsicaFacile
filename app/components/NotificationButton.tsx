'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Props {
  besoinId: number
  clientId: number
  artisanToken: string
}

export default function NotificationButton({ besoinId, clientId, artisanToken }: Props) {
  const [loading, setLoading] = useState(false)

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
    setLoading(true)
    try {
      if (!artisanToken) {
        toast.error("Token artisan manquant.")
        setLoading(false)
        return
      }

      const artisan = await fetchArtisanInfo()
      if (!artisan) {
        toast.error("Impossible de récupérer les infos artisan.")
        setLoading(false)
        return
      }

      await axios.post(
        `${apiUrl}/client_notifications`,
        {
          client_notification: {
            client_id: clientId,
            besoin_id: besoinId,
            message: `Un artisan est intéressé par votre annonce.`,
            link: `/artisan-profile/${artisan.id}`,
          },
        },
        {
          headers: { Authorization: `Bearer ${artisanToken}` },
        }
      )

      toast.success('Notification envoyée au client.')
    } catch (error) {
      console.error(error)
      toast.error('Erreur lors de l’envoi de la notification.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleInterest} disabled={loading}>
      {loading ? 'Envoi...' : 'Je suis intéressé par cette annonce'}
    </button>
  )
}


