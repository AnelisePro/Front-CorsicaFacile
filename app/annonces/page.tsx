'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

type Besoin = {
  id: number
  type_prestation: string
  description: string
  schedule: string
  address: string
  image_urls: string[]
  client: {
    id: number
    name: string
  }
}

export default function ArtisansAnnonces() {
  const [besoins, setBesoins] = useState<Besoin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const artisanToken = localStorage.getItem('artisanToken')
    if (!artisanToken) {
      router.push('/auth/login_artisan')
      return
    }

    axios.get(`${apiUrl}/artisans/besoins`, {
      headers: { Authorization: `Bearer ${artisanToken}` }
    })
      .then(res => setBesoins(res.data))
      .catch(() => setError('Erreur lors du chargement des annonces'))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return <p>Chargement...</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Toutes les annonces</h1>
      {besoins.length === 0 && <p>Aucune annonce pour le moment.</p>}
      <ul>
        {besoins.map((b) => (
          <li key={b.id} className="border rounded p-4 mb-4 shadow">
            <h2 className="text-xl font-semibold">{b.type_prestation}</h2>
            <p>{b.description}</p>
            <p><strong>Adresse :</strong> {b.address}</p>
            <p><strong>Client :</strong> {b.client.name}</p>
            <div className="flex space-x-2 mt-2">
              {b.image_urls.map((url, i) => (
                <Image
                  key={i}
                  src={url}
                  alt="Image besoin"
                  width={96}
                  height={96}
                  className="object-cover rounded"
                />
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

