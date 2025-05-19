'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './page.module.scss'
import { useAuth } from '@/app/auth/AuthContext'

export default function ClientConnexion() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { setUser } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation de base
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.')
      return
    }

    // Effacer les anciennes erreurs
    setError('')

    try {
      const response = await fetch('http://localhost:3001/clients/sign_in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client: {
            email,
            password,
          },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Récupérer le token JWT dans l'en-tête Authorization
        const authHeader = response.headers.get('Authorization') || response.headers.get('authorization')

        if (!authHeader) {
          setError('Jeton non reçu du serveur.')
          return
        }

        const token = authHeader.split(' ')[1] // format "Bearer <token>"

        // Stocker le token et les infos utilisateur
        localStorage.setItem('clientToken', token)
        localStorage.setItem('user', JSON.stringify({ email: data.client.email, role: 'client' }))
        setUser({ email: data.client.email, role: 'client' })

        console.log('Connexion réussie', data)

        // Redirection vers le dashboard client
        window.location.href = '/dashboard/client'
      } else {
        setError(data.message || "Une erreur s'est produite.")
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error)
      setError('Erreur réseau ou serveur.')
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Connexion - Particulier</h1>

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

        <button type="submit" className={styles.submitButton}>Se connecter</button>

        <div className={styles.links}>
          <Link href="/mot-de-passe-oublie" className={styles.link}>Mot de passe oublié ?</Link>
          <Link href="/auth/register_client" className={styles.link}>Pas encore inscrit ? Inscrivez-vous</Link>
        </div>
      </form>

      <Link href="/mon-espace" className={styles.backButton}>Retour à l'écran de choix</Link>
    </div>
  )
}







