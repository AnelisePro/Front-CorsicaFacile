'use client';

import { useState } from 'react';
import { useAdminAuth } from '../../lib/admin/useAdminAuth';
import styles from './page.module.scss';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Email ou mot de passe incorrect');
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.imageSection}>
            <img src="/images/img5.jpeg" alt="Image de fond" />
          </div>

          <div className={styles['form-section']}>
            <h1 className={styles.title}>Connexion</h1>
            <p className={styles.subtitle}>Accédez à votre espace sécurisé</p>

            <form className={styles.form} onSubmit={handleSubmit}>
              {error && (
                <div className={styles['error-message']}>
                  <svg className={styles['error-icon']} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 00-1.414-1.414L10 9.586 8.586 1.293a1 1 0 001.414-1.414L11.414 8l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.586z" clipRule="evenodd" />
                  </svg>
                  <p>{error}</p>
                </div>
              )}

              <div className={styles['input-group']}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@corsicafacile.com"
                />
              </div>

              <div className={styles['input-group']}>
                <label htmlFor="password">Mot de passe</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={styles['submit-button']}
              >
                {isLoading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Connexion en cours...
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
  );
}



