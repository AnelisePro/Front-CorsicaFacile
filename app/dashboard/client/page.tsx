'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../../auth/AuthContext'
import styles from './page.module.scss'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface Client {
  first_name: string
  last_name: string
  email: string
  phone: string
  birthdate: string
  password?: string
  password_confirmation?: string
  avatar_url?: string | null
}

export default function ClientDashboard() {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const { logout, setUser } = useAuth()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    const fetchClient = async () => {
      const token = localStorage.getItem('clientToken')
      if (!token) {
        console.warn('Pas de token trouvé, utilisateur non authentifié')
        setLoading(false)
        return
      }

      try {
        const response = await axios.get('http://localhost:3001/clients/me', {
          headers: { Authorization: `Bearer ${token}` },
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0])
    }
  }

  const handleUpdate = async () => {
    const token = localStorage.getItem('clientToken')
    if (!token || !client) return

    try {
      const formData = new FormData()

      Object.entries(client).forEach(([key, value]) => {
        if (key !== 'avatar_url' && value !== undefined && value !== null) {
          formData.append(`client[${key}]`, value as string)
        }
      })

      if (avatarFile) {
        formData.append('client[avatar]', avatarFile)
      }

      await axios.put('http://localhost:3001/clients/me', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      toast.success('Profil mis à jour avec succès.')
      setIsEditing(false)
      setAvatarFile(null)

      const response = await axios.get('http://localhost:3001/clients/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const updatedClient = response.data.client
      setClient(updatedClient)

      const updatedUser = {
        email: updatedClient.email,
        role: 'client' as const,
        avatar_url: updatedClient.avatar_url || '/images/avatar.svg',
      }

      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil :', error)
      toast.error('Erreur lors de la mise à jour.')
    }
  }

  const confirmDelete = () => {
    toast.info(
      <div>
        <p>Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.</p>
        <div className="mt-2 flex justify-end gap-2">
          <button
            onClick={() => {
              toast.dismiss()
              handleDelete()
            }}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Oui, supprimer
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="bg-gray-400 text-white px-3 py-1 rounded"
          >
            Annuler
          </button>
        </div>
      </div>,
      {
        position: 'top-center',
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
        pauseOnHover: false,
      }
    )
  }

  const handleDelete = async () => {
    const token = localStorage.getItem('clientToken')
    if (!token) return

    try {
      await axios.delete('http://localhost:3001/clients/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success('Compte supprimé avec succès.')
      logout()
    } catch (error) {
      console.error('Erreur lors de la suppression du compte :', error)
      toast.error('Erreur lors de la suppression.')
    }
  }

  if (loading) return <p>Chargement...</p>
  if (!client) return <p>Impossible de charger les informations client.</p>

  return (
    <>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Bonjour, {client.first_name} 👋</h1>

        {/* Profil et édition */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-4">
            {avatarFile ? (
              <img
                src={URL.createObjectURL(avatarFile)}
                alt="Nouvel avatar"
                className={`${styles.avatar} rounded-full object-cover mb-2`}
                width={96}
                height={96}
              />
            ) : client.avatar_url ? (
              <img
                src={`${client.avatar_url}?t=${Date.now()}`}
                alt="Avatar"
                className={`${styles.avatar} rounded-full object-cover mb-2`}
                width={96}
                height={96}
              />
            ) : (
              <img
                src="/images/avatar.svg"
                alt="Avatar par défaut"
                width={96}
                height={96}
                className="rounded-full object-cover mb-2"
              />
            )}

            {(isEditing || !client.avatar_url) && (
              <div>
                <label className="block font-semibold mb-1">Changer la photo de profil :</label>
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
              </div>
            )}
          </div>

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
            <button onClick={confirmDelete} className="bg-red-500 text-white px-4 py-2 rounded">
              Supprimer mon compte
            </button>
          </div>
        </section>

        {/* Espaces fonctionnels */}
        <section className="space-y-8">
          {/* Annonces postées */}
          <div className="border p-4 rounded shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Mes annonces</h2>
            <p className="text-gray-600 italic">Aucune annonce pour le moment.</p>
            {/* Ici tu pourras afficher la liste des annonces du client */}
          </div>

          {/* Suivi des interventions */}
          <div className="border p-4 rounded shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Suivi des interventions</h2>
            <ul className="list-disc ml-6 text-gray-700">
              <li>En attente : 0</li>
              <li>En cours : 0</li>
              <li>Validées : 0</li>
            </ul>
            {/* Remplace ces valeurs par de vraies données */}
          </div>

          {/* Suivi des points gagnés */}
          <div className="border p-4 rounded shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Mes points gagnés</h2>
            <p className="text-gray-700 font-bold text-2xl">0</p>
            {/* Affiche ici le total des points du client */}
          </div>

          {/* Historique des interventions */}
          <div className="border p-4 rounded shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Historique des interventions</h2>
            <ul className="list-disc ml-6 text-gray-700">
              <li>Passées : 0</li>
              <li>En cours : 0</li>
              <li>Futures : 0</li>
            </ul>
            {/* À compléter avec les interventions historiques */}
          </div>
        </section>
      </div>

      {isClient && (
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      )}
    </>
  )
}





