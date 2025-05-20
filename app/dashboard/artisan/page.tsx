'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../../auth/AuthContext'
import { loadStripe } from '@stripe/stripe-js'

interface Artisan {
  company_name: string
  address: string
  expertise: string
  siren: string
  email: string
  phone: string
  membership_plan: string
  password?: string
  password_confirmation?: string
  kbis_url?: string
  insurance_url?: string
  avatar_url?: string | null
}

interface PlanInfo {
  amount: number
  currency: string
  interval: string
}

const expertises = [
  "Antenniste", "Assainisseur", "Spécialiste balnéo", "Ingénieur en bâtiment", "Opérateur de centrale à béton",
  "Calorifugeur", "Canalisateur", "Chapiste", "Charpentier", "Chef de chantier", "Chauffagiste",
  "Cheministe/Fumisterie", "Cloisonneur", "Climaticien", "Conducteur d'engins de chantier", "Conducteur de travaux",
  "Cordiste", "Cordonnier", "Couturier", "Couvreur", "Cuisiniste", "Déboucheur", "Déménageur", "Démolisseur",
  "Dessinateur-projeteur", "Désamianteur", "Désinsectiseur", "Diagnostiqueur", "Ébéniste", "Monteur échafaudeur",
  "Électricien", "Économiste de la construction", "Technicien en électroménager", "Enduiseur",
  "Nettoyage/entretien de bâtiments", "Installateur/réparateur d'escaliers mécaniques", "Étancheur", "Façadier",
  "Ferronnier", "Forgeron", "Foreur", "Géomètre-topographe", "Spécialiste du goudronnage", "Poseur de gouttière",
  "Graveur", "Grutier", "Technicien en traitement de l'humidité", "Installateur de systèmes de sécurité incendie",
  "Installateur de mobilier", "Installateur de systèmes de sécurité", "Installateur de systèmes photovoltaïques",
  "Installeteur de systèmes d'irrigation", "Isolateur", "Jointeur", "Jardinier", "Maçon", "Marbrier", "Menuisier",
  "Installateur/réparateur de monte-charges", "Multi-services", "Installateur/réparateur de paratonnerres",
  "Paysagiste", "Peintre", "Pisciniste", "Plâtrier/Plaquiste", "Plombier", "Spécialiste du PMR",
  "Installateur/réparateur de portes automatiques et tambours", "Poseur de revêtement de sol", "Potier", "Ramoneur",
  "Restaurateur de meubles", "Serrurier", "Spécialiste des terrasses en bois", "Spécialiste du vitrail",
  "Tailleur de pierre", "Technicien du traitement de l'eau", "Terrassier", "Poseur de toiles tendues", "Vitrier",
  "Installateur/réparateur de volets roulants", "Wifi télécom", "Zingueur"
]

const membershipPlans = ['Standard', 'Pro', 'Premium']

const intervalTranslations: Record<string, string> = {
  'one_time': 'Paiement unique',
  'month': 'Mensuel',
  'year': 'Annuel',
}

const stripePromise = loadStripe('pk_test_51RO446Rs43niZdSJN0YjPjgq7HdFlhdFqqUqpsKxmgTAMHDyjK2g6Qh9FaRtdLjTWIkCz7ARow4rpyDliAzgzIgT00b0r32PoM')

export default function ArtisanDashboard() {
  const [artisan, setArtisan] = useState<Artisan | null>(null)
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [kbisFile, setKbisFile] = useState<File | null>(null)
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const { logout, setUser } = useAuth()

  useEffect(() => {
    const fetchArtisan = async () => {
      const token = localStorage.getItem('artisanToken')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await axios.get('http://localhost:3001/artisans/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setArtisan(response.data.artisan)
      } catch (error) {
        console.error('Erreur de chargement du profil artisan :', error)
        setArtisan(null)
      } finally {
        setLoading(false)
      }
    }

    fetchArtisan()
  }, [])

  // Récupération du prix + fréquence du plan
  useEffect(() => {
    const fetchPlanInfo = async () => {
      const token = localStorage.getItem('artisanToken')
      if (!token) return

      try {
        const response = await axios.get('http://localhost:3001/artisans/me/plan_info', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setPlanInfo(response.data.price_info)
      } catch (error) {
        console.error('Erreur chargement plan info:', error)
        setPlanInfo(null)
      }
    }

    fetchPlanInfo()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!artisan) return
    const { name, value } = e.target
    setArtisan({ ...artisan, [name]: value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const file = e.target.files[0]
    if (e.target.name === 'kbis') {
      setKbisFile(file)
    } else if (e.target.name === 'insurance') {
      setInsuranceFile(file)
    } else if (e.target.name === 'avatar') {
      setAvatarFile(file)
    }
  }

  const handleUpdate = async () => {
    const token = localStorage.getItem('artisanToken')
    if (!token || !artisan) return

    try {
      const formData = new FormData()

      // Ajouter les champs artisan dans formData (sauf URLs documents)
      for (const [key, value] of Object.entries(artisan)) {
        if (key === 'kbis_url' || key === 'insurance_url' || key === 'avatar_url') continue
        if (value !== undefined && value !== null) {
          formData.append(`artisan[${key}]`, String(value))
        }
      }

      // Ajouter les fichiers si présents
      if (kbisFile) formData.append('artisan[kbis]', kbisFile)
      if (insuranceFile) formData.append('artisan[insurance]', insuranceFile)
      if (avatarFile) formData.append('artisan[avatar]', avatarFile)

      const response = await axios.put('http://localhost:3001/artisans/me', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.checkout_url) {
        window.open(response.data.checkout_url, '_blank', 'width=500,height=700')
      } else {
        setArtisan(response.data.artisan)
        setKbisFile(null)
        setInsuranceFile(null)
        setAvatarFile(null)
        setIsEditing(false)
        alert('Profil mis à jour avec succès.')

        const resp = await axios.get('http://localhost:3001/artisans/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const updatedArtisan = resp.data.artisan

      const updatedUser = {
        email: updatedArtisan.email,
        role: 'artisan' as 'artisan',
        avatar_url: updatedArtisan.avatar_url || null,
      }

      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      }
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour :', error)
      alert('Erreur lors de la mise à jour.')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) return
    const token = localStorage.getItem('artisanToken')
    if (!token) return

    try {
      await axios.delete('http://localhost:3001/artisans/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      logout()
    } catch (error) {
      alert('Erreur lors de la suppression du compte.')
    }
  }

  if (loading) return <p>Chargement...</p>
  if (!artisan) return <p>Impossible de charger les informations artisan.</p>

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Bonjour, {artisan.company_name || 'Artisan'} 👷‍♂️</h1>

      {/* Avatar */}
      <div className="mb-4">
        {avatarFile ? (
          <img
            src={URL.createObjectURL(avatarFile)}
            alt="Nouvel avatar"
            className="w-24 h-24 rounded-full object-cover mb-2"
          />
        ) : artisan.avatar_url ? (
          <img
            src={`${artisan.avatar_url}?t=${Date.now()}`}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover mb-2"
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

        {isEditing && (
          <>
            <label className="block font-semibold mb-1">Changer la photo de profil :</label>
            <input type="file" name="avatar" accept="image/*" onChange={handleFileChange} />
          </>
        )}
      </div>

      <div className="space-y-4">
        {/* Champ infos artisan */}
        <div>
          <label className="block font-semibold">Nom de l'entreprise</label>
          <input
            name="company_name"
            value={artisan.company_name}
            onChange={handleChange}
            disabled={!isEditing}
            className="border rounded px-2 py-1 w-full"
          />
        </div>

        <div>
          <label className="block font-semibold">Adresse</label>
          <textarea
            name="address"
            value={artisan.address}
            onChange={handleChange}
            disabled={!isEditing}
            className="border rounded px-2 py-1 w-full"
          />
        </div>

        <div>
          <label className="block font-semibold">Expertise</label>
          <select
            name="expertise"
            value={artisan.expertise}
            onChange={handleChange}
            disabled={!isEditing}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">Sélectionnez une expertise</option>
            {expertises.map((ex) => (
              <option key={ex} value={ex}>{ex}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold">SIREN</label>
          <input
            name="siren"
            value={artisan.siren}
            onChange={handleChange}
            disabled={!isEditing}
            className="border rounded px-2 py-1 w-full"
          />
        </div>

        <div>
          <label className="block font-semibold">Email</label>
          <input
            name="email"
            type="email"
            value={artisan.email}
            onChange={handleChange}
            disabled={!isEditing}
            className="border rounded px-2 py-1 w-full"
          />
        </div>

        <div>
          <label className="block font-semibold">Téléphone</label>
          <input
            name="phone"
            value={artisan.phone}
            onChange={handleChange}
            disabled={!isEditing}
            className="border rounded px-2 py-1 w-full"
          />
        </div>

        <div>
          <label className="block font-semibold">Formule d’abonnement</label>
          <select
            name="membership_plan"
            value={artisan.membership_plan}
            onChange={handleChange}
            disabled={!isEditing}
            className="border rounded px-2 py-1 w-full"
          >
            {membershipPlans.map((plan) => (
              <option key={plan} value={plan}>{plan}</option>
            ))}
          </select>
        </div>

        {/* Affichage prix + fréquence du plan */}
        {planInfo && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <h3 className="font-semibold mb-1">Détails du plan actuel</h3>
            <p>
              Prix : {(planInfo.amount / 100).toFixed(2)} {planInfo.currency.toUpperCase()}
            </p>
            <p>
              Fréquence de paiement : {intervalTranslations[planInfo.interval] || planInfo.interval}
            </p>
          </div>
        )}

        {!isEditing && (
          <div className="mb-4">
            {artisan.kbis_url && (
              <p>KBIS: <a href={artisan.kbis_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">Voir le document</a></p>
            )}
            {artisan.insurance_url && (
              <p>Assurance: <a href={artisan.insurance_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">Voir le document</a></p>
            )}
          </div>
        )}

        {isEditing && (
          <>
            <div>
              <label className="block font-semibold">KBIS (PDF uniquement)</label>
              <input
                type="file"
                name="kbis"
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </div>
            <div>
              <label className="block font-semibold">Assurance (PDF uniquement)</label>
              <input
                type="file"
                name="insurance"
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </div>
          </>
        )}

        <div className="flex space-x-4 mt-6">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Modifier
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Supprimer mon compte
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Enregistrer
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Annuler
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}











