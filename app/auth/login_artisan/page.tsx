'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './page.module.scss'
import { useAuth } from '@/app/auth/AuthContext'

export default function ArtisanConnexion() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [siren, setSiren] = useState('')
  const [error, setError] = useState('')
  const { setUser } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation de base
    if (!email || !password || !siren) {
      setError('Veuillez remplir tous les champs.')
      return
    }

    // Effacer les erreurs précédentes
    setError('')

    try {
      const response = await fetch('http://localhost:3001/artisans/sign_in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artisan: {
            email,
            password,
            siren,
          },
        }),
      })

      const text = await response.text()
      let data
      try {
        data = JSON.parse(text)
      } catch {
        data = {}
      }

      if (response.ok) {
        localStorage.setItem('artisanToken', data.token)
        localStorage.setItem('user', JSON.stringify({ email: data.artisan.email, role: 'artisan' }))
        setUser({ email: data.artisan.email, role: 'artisan' })
        window.location.href = '/dashboard/artisan'
      } else {
        setError(data.message || 'Une erreur s\'est produite.')
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error)
      setError('Erreur réseau ou serveur.')
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Connexion - Artisan</h1>

      {error && <p className={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Votre email"
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Votre mot de passe"
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="siren">Numéro de SIREN</label>
          <input
            type="text"
            id="siren"
            value={siren}
            onChange={(e) => setSiren(e.target.value)}
            required
            placeholder="Votre numéro de SIREN"
          />
        </div>

        <button type="submit" className={styles.submitButton}>Se connecter</button>

        <div className={styles.links}>
          <Link href="/mot-de-passe-oublie" className={styles.link}>Mot de passe oublié ?</Link>
          <Link href="/auth/register_artisan" className={styles.link}>Pas encore inscrit ? Inscrivez-vous</Link>
        </div>
      </form>

      <Link href="/mon-espace" className={styles.backButton}>Retour à l'écran de choix</Link>
    </div>
  )
}









