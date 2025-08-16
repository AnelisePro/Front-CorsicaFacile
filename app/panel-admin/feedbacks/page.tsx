'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../lib/admin/useAdminAuth';
import { adminApi } from '../../lib/admin/adminApi';
import styles from './page.module.scss';

interface AdminFeedback {
  id: number;
  title: string;
  content: string;
  user_name: string;
  user_email: string;
  user_type: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  responded_at: string | null;
}

export default function AdminFeedbacks() {
  const [feedbacks, setFeedbacks] = useState<AdminFeedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<AdminFeedback | null>(null);
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { isAuthenticated } = useAdminAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchFeedbacks();
    }
  }, [isAuthenticated]);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getFeedbacks();
      setFeedbacks(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des feedbacks:', error);
      setFeedbacks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (feedbackId: number) => {
    if (!response.trim()) return;
    
    setIsSubmitting(true);
    try {
      await adminApi.respondToFeedback(feedbackId, response);
      setResponse('');
      setSelectedFeedback(null);
      await fetchFeedbacks(); // Recharger les données
      alert('Réponse envoyée avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la réponse:', error);
      alert('Erreur lors de l\'envoi de la réponse');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.feedbacksPage}>
        <div className={styles.errorContainer}>
          <h2>Accès non autorisé</h2>
          <p>Vous devez être connecté en tant qu'administrateur.</p>
        </div>
      </div>
    );
  }

  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (filter === 'pending') return feedback.status === 'pending';
    if (filter === 'responded') return feedback.status === 'responded';
    return true;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { text: 'En attente', class: styles.pending },
      responded: { text: 'Répondu', class: styles.responded },
      archived: { text: 'Archivé', class: styles.archived }
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    return <span className={`${styles.badge} ${badge.class}`}>{badge.text}</span>;
  };

  return (
    <div className={styles.feedbacksPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestion des Avis</h1>
        <p className={styles.subtitle}>Consultez et répondez aux avis des utilisateurs</p>

        <div className={styles.filters}>
          <button 
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            Tous ({feedbacks.length})
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'pending' ? styles.active : ''}`}
            onClick={() => setFilter('pending')}
          >
            En attente ({feedbacks.filter(f => f.status === 'pending').length})
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'responded' ? styles.active : ''}`}
            onClick={() => setFilter('responded')}
          >
            Répondus ({feedbacks.filter(f => f.status === 'responded').length})
          </button>
        </div>
      </div>

      <div className={styles.feedbacksList}>
        {filteredFeedbacks.map((feedback) => (
          <div key={feedback.id} className={styles.feedbackCard}>
            <div className={styles.feedbackHeader}>
              <div className={styles.userInfo}>
                <span className={styles.userName}>
                  {feedback.user_name} <span className={styles.userType}>{feedback.user_type}</span>
                </span>
                <span className={styles.userEmail}>{feedback.user_email}</span>
              </div>
              <div className={styles.meta}>
                {getStatusBadge(feedback.status)}
                <span className={styles.date}>{formatDate(feedback.created_at)}</span>
              </div>
            </div>

            <div className={styles.feedbackContent}>
              <h3 className={styles.feedbackTitle}>{feedback.title}</h3>
              <p className={styles.feedbackText}>{feedback.content}</p>
            </div>

            {feedback.admin_response ? (
              <div className={styles.existingResponse}>
                <div className={styles.responseHeader}>
                  <h4>Votre réponse :</h4>
                  <small>{feedback.responded_at ? formatDate(feedback.responded_at) : ''}</small>
                </div>
                <p className={styles.responseText}>{feedback.admin_response}</p>
              </div>
            ) : (
              <div className={styles.responseSection}>
                {selectedFeedback?.id === feedback.id ? (
                  <div className={styles.responseForm}>
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Écrivez votre réponse..."
                      rows={4}
                      className={styles.responseTextarea}
                    />
                    <div className={styles.responseActions}>
                      <button 
                        onClick={() => {
                          setSelectedFeedback(null);
                          setResponse('');
                        }}
                        className={styles.cancelBtn}
                        disabled={isSubmitting}
                      >
                        Annuler
                      </button>
                      <button 
                        onClick={() => handleRespond(feedback.id)}
                        disabled={!response.trim() || isSubmitting}
                        className={styles.sendBtn}
                      >
                        {isSubmitting ? 'Envoi...' : 'Envoyer la réponse'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setSelectedFeedback(feedback)}
                    className={styles.respondBtn}
                  >
                    Répondre
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredFeedbacks.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📝</div>
          <h3>Aucun avis {filter !== 'all' ? `${filter === 'pending' ? 'en attente' : 'répondu'}` : ''}</h3>
          <p>Les avis des utilisateurs apparaîtront ici.</p>
        </div>
      )}
    </div>
  );
}

