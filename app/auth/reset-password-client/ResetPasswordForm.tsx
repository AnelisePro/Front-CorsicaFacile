'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.scss'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState('')
  
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setError('Token de réinitialisation manquant ou invalide')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password !== passwordConfirmation) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setLoading(false)
      return
    }

    try {
      console.log('🔍 Calling API:', `${process.env.NEXT_PUBLIC_API_URL}/api/v1/password_resets/client/update`)
      console.log('🔍 Token:', token)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/password_resets/client/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          password: password,
          password_confirmation: passwordConfirmation
        })
      })

      console.log('🔍 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        toast.success(data.message || 'Mot de passe mis à jour avec succès !', {
          onClose: () => {
            setTimeout(() => router.push('/auth/login_client'), 1000)
          }
        })
      } else {
        const data = await response.json()
        console.log('🔍 Error response:', data)
        setError(data.message || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('🔍 Network error:', error)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  if (!token && !error) {
    return <div className={styles.loading}>Chargement...</div>
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.imageSection}>
            <img src="/images/img5.jpeg" alt="Image de fond" />
          </div>
          <div className={styles.contentSection}>
            <h1 className={styles.title}>Nouveau mot de passe</h1>

            <div className={styles.description}>
              <p>Veuillez saisir votre nouveau mot de passe.</p>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="password">Nouveau mot de passe</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Votre nouveau mot de passe"
                  minLength={6}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="passwordConfirmation">Confirmer le mot de passe</label>
                <input
                  type="password"
                  id="passwordConfirmation"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Confirmez votre mot de passe"
                  minLength={6}
                />
              </div>

              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
              </button>
            </form>

            <Link href="/auth/login_client" className={styles.backButton}>
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </>
  )
}