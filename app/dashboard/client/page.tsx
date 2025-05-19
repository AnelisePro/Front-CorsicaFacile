'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../../auth/AuthContext'

interface Client {
  first_name: string
  last_name: string
  email: string
  phone: string
  birthdate: string
  password?: string
  password_confirmation?: string
}

export default function ClientDashboard() {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const { logout } = useAuth()

  useEffect(() => {
    const fetchClient = async () => {
      const token = localStorage.getItem('clientToken')
      if (!token) {
        console.warn('Pas de token trouvé, utilisateur non authentifié')
        setLoading(false)
        return
      }

      try {
        const response = await axios.get('http://localhost:3001/clients/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setClient(response.data.client)
      } catch (error) {
        console.error('Erreur lors du chargement du profil client :', error)
        setClient(null)
      } finally {
        setLoading(false)
      }
    }

    fetchClient()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!client) return
    setClient({ ...client, [e.target.name]: e.target.value })
  }

  const handleUpdate = async () => {
    const token = localStorage.getItem('clientToken')
    if (!token || !client) return

    try {
      await axios.put('http://localhost:3001/clients/me', { client }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setIsEditing(false)
      alert('Profil mis à jour avec succès.')
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil :', error)
      alert('Erreur lors de la mise à jour.')
    }
  }

  const handleDelete = async () => {
    const token = localStorage.getItem('clientToken')
    if (!token) return

    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) return

    try {
      await axios.delete('http://localhost:3001/clients/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      logout() // Déconnecte et redirige vers la home
    } catch (error) {
      console.error('Erreur lors de la suppression du compte :', error)
      alert('Erreur lors de la suppression.')
    }
  }

  if (loading) return <p>Chargement...</p>
  if (!client) return <p>Impossible de charger les informations client.</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Bonjour, {client.first_name} 👋</h1>

      <div className="space-y-2">
        {['first_name', 'last_name', 'email', 'phone', 'birthdate'].map((field) => (
          <div key={field}>
            <label className="block font-semibold capitalize">{field.replace('_', ' ')}:</label>
            {isEditing ? (
              <input
                type="text"
                name={field}
                value={(client as any)[field]}
                onChange={handleChange}
                className="border p-1 rounded w-full"
              />
            ) : (
              <p>{(client as any)[field]}</p>
            )}
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="mt-4 space-y-2">
          <label className="block font-semibold">Nouveau mot de passe :</label>
          <input
            type="password"
            name="password"
            onChange={handleChange}
            className="border p-1 rounded w-full"
          />
          <label className="block font-semibold">Confirmation du mot de passe :</label>
          <input
            type="password"
            name="password_confirmation"
            onChange={handleChange}
            className="border p-1 rounded w-full"
          />
        </div>
      )}

      <div className="mt-6 flex gap-4">
        {isEditing ? (
          <>
            <button onClick={handleUpdate} className="bg-green-500 text-white px-4 py-2 rounded">
              Enregistrer
            </button>
            <button onClick={() => setIsEditing(false)} className="bg-gray-400 text-white px-4 py-2 rounded">
              Annuler
            </button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white px-4 py-2 rounded">
            Modifier mes informations
          </button>
        )}
        <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded">
          Supprimer mon compte
        </button>
      </div>
    </div>
  )
}


