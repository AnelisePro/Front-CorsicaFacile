'use client';

import { useState, useEffect } from 'react';
import styles from './FeedbackSection.module.scss';

interface Feedback {
  id: number;
  title: string;
  content: string;
  user_name: string;
  user_type: string;
  admin_response: string | null;
  created_at: string;
  responded_at: string | null;
}

interface FeedbackFormData {
  title: string;
  content: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  user_type: 'Client' | 'Artisan';
  first_name?: string;
  last_name?: string;
  company_name?: string;
}

export default function FeedbackSection() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FeedbackFormData>({
    title: '',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
    checkAuthentication();
  }, []);

  const getCSRFToken = (): string | null => {
    const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
    return metaTag ? metaTag.content : null;
  };

  const checkAuthentication = async () => {
    try {
      const csrfToken = getCSRFToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/auth/current_user`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken })
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setCurrentUser(data.user);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/feedbacks`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const csrfToken = getCSRFToken();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/feedbacks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken })
        },
        credentials: 'include',
        body: JSON.stringify({ feedback: formData })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage(data.message);
        setFormData({ title: '', content: '' });
        setShowForm(false);
        setTimeout(fetchFeedbacks, 2000);
      } else {
        setMessage(data.errors ? data.errors.join(', ') : 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearMessage = () => {
    setTimeout(() => setMessage(''), 5000);
  };

  useEffect(() => {
    if (message) {
      clearMessage();
    }
  }, [message]);

  if (isLoading) {
    return (
      <div className={styles.feedbackSection}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <p>Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.feedbackSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Avis et Suggestions</h2>
          <p className={styles.subtitle}>
            Votre opinion compte ! Partagez vos suggestions pour améliorer notre plateforme.
          </p>
        </div>

        {/* Formulaire de feedback */}
        {isAuthenticated && currentUser ? (
          <div className={styles.feedbackForm}>
            {!showForm ? (
              <button 
                onClick={() => setShowForm(true)}
                className={styles.showFormBtn}
              >
                <span className={styles.icon}>✍️</span>
                Laisser un avis
              </button>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>
                    {currentUser.name} 
                    {currentUser.user_type === 'Client' ? ' (👤 Client)' : ' (🔨 Artisan)'}
                  </span>
                </div>
                
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Titre de votre avis..."
                    className={styles.input}
                    required
                    maxLength={100}
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Décrivez votre expérience, suggestions d'amélioration..."
                    className={styles.textarea}
                    rows={4}
                    required
                    maxLength={1000}
                  />
                  <div className={styles.charCount}>
                    {formData.content.length}/1000 caractères
                  </div>
                </div>
                
                <div className={styles.formActions}>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setMessage('');
                    }}
                    className={styles.cancelBtn}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className={styles.submitBtn}
                  >
                    {isSubmitting ? 'Envoi...' : 'Envoyer l\'avis'}
                  </button>
                </div>
              </form>
            )}
            
            {message && (
              <div className={`${styles.message} ${message.includes('succès') ? styles.success : styles.error}`}>
                {message}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.loginPrompt}>
            <p>
              Connectez-vous en tant que{' '}
              <a href="/clients/sign_in" className={styles.loginLink}>Client</a>
              {' '}ou{' '}
              <a href="/artisans/sign_in" className={styles.loginLink}>Artisan</a>
              {' '}pour laisser un avis
            </p>
          </div>
        )}

        {/* Affichage des feedbacks avec réponses */}
        {feedbacks.length > 0 && (
          <div className={styles.feedbacksList}>
            <h3 className={styles.listTitle}>💬 Échanges avec l'équipe</h3>
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className={styles.feedbackItem}>
                <div className={styles.feedbackHeader}>
                  <div className={styles.userBadge}>
                    <span className={styles.userIcon}>
                      {feedback.user_type === 'Client' ? '👤' : '🔨'}
                    </span>
                    <span className={styles.userName}>{feedback.user_name}</span>
                    <span className={styles.userType}>
                      {feedback.user_type}
                    </span>
                  </div>
                  <span className={styles.date}>{feedback.created_at}</span>
                </div>
                
                <div className={styles.feedbackContent}>
                  <h4 className={styles.feedbackTitle}>{feedback.title}</h4>
                  <p className={styles.feedbackText}>{feedback.content}</p>
                </div>
                
                {feedback.admin_response && (
                  <div className={styles.adminResponse}>
                    <div className={styles.adminHeader}>
                      <span className={styles.adminBadge}>🏢 Équipe Corsica Facile</span>
                      <span className={styles.responseDate}>{feedback.responded_at}</span>
                    </div>
                    <p className={styles.responseText}>{feedback.admin_response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {feedbacks.length === 0 && (
          <div className={styles.noFeedbacks}>
            <p>Aucun avis public pour le moment. Soyez le premier à partager votre expérience !</p>
          </div>
        )}
      </div>
    </div>
  );
}


