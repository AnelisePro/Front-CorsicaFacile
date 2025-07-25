'use client'

import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth } from '../auth/AuthContext'
import styles from './MessagingTab.module.scss'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

type Message = {
  id: number
  content: string
  sender_id: number
  sender_type: 'Client' | 'Artisan'
  recipient_id: number
  recipient_type: 'Client' | 'Artisan'
  sender_name: string
  created_at: string
  read: boolean
}

type Conversation = {
  id: number
  other_user_id: number
  other_user_name: string
  other_user_type: 'Client' | 'Artisan'
  last_message: string
  last_message_at: string
  unread_count: number
}

export default function MessagingTab() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [archivedConversations, setArchivedConversations] = useState<Conversation[]>([]) // État pour les conversations archivées
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const token = localStorage.getItem(user?.role === 'client' ? 'clientToken' : 'artisanToken')
  const userType = user?.role === 'client' ? 'Client' : 'Artisan'

  useEffect(() => {
    fetchConversations()
    fetchArchivedConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    try {
      const endpoint = user?.role === 'client' ? '/clients/conversations' : '/artisans/conversations'
      const response = await axios.get(`${apiUrl}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setConversations(response.data)
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error)
      if (axios.isAxiosError(error)) {
        toast.error(`Erreur ${error.response?.status}: ${error.response?.data?.message || 'Impossible de récupérer les conversations'}`)
      }
    }
  }

  const fetchArchivedConversations = async () => {
    try {
      // Changez l'endpoint - archived est maintenant en collection
      const endpoint = user?.role === 'client' ? '/clients/conversations/archived' : '/artisans/conversations/archived'
      const response = await axios.get(`${apiUrl}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setArchivedConversations(response.data)
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations archivées:', error)
    }
  }

  const archiveConversation = async (conversationId: number) => {
    try {
      // Changez POST en PATCH
      const endpoint = user?.role === 'client' ? `/clients/conversations/${conversationId}/archive` : `/artisans/conversations/${conversationId}/archive`
      await axios.patch(`${apiUrl}${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Conversation archivée avec succès.')
      fetchConversations()
      fetchArchivedConversations()
    } catch (error) {
      console.error('Erreur lors de l\'archivage de la conversation :', error)
      toast.error('Erreur lors de l\'archivage de la conversation.')
    }
  }

  const unarchiveConversation = async (conversationId: number) => {
    try {
      const endpoint = user?.role === 'client' ? `/clients/conversations/${conversationId}/unarchive` : `/artisans/conversations/${conversationId}/unarchive`;
      await axios.patch(`${apiUrl}${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Conversation désarchivée avec succès.');
      fetchConversations();
      fetchArchivedConversations();
      setSelectedConversation(null);
    } catch (error) {
      console.error('Erreur lors du désarchivage de la conversation :', error);
      toast.error('Erreur lors du désarchivage de la conversation.');
    }
  };

  const isConversationArchived = (conversationId: number): boolean => {
    return archivedConversations.some(conv => conv.id === conversationId);
  };

  const fetchMessages = async (conversationId: number) => {
    try {
      const endpoint = user?.role === 'client' ? '/clients/conversations' : '/artisans/conversations'
      const response = await axios.get(`${apiUrl}${endpoint}/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(response.data)
      
      // Marquer comme lu automatiquement
      await axios.put(`${apiUrl}${endpoint}/${conversationId}/mark_as_read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Mettre à jour le compteur de non-lus
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unread_count: 0 }
            : conv
        )
      )
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedConversation || !newMessage.trim()) return

    try {
      const endpoint = user?.role === 'client' ? '/clients/conversations' : '/artisans/conversations'
      const response = await axios.post(
        `${apiUrl}${endpoint}/${selectedConversation.id}/send_message`,
        { message: { content: newMessage } },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      setMessages(prev => [...prev, response.data])
      setNewMessage('')
      
      // Mettre à jour la conversation dans la liste
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, last_message: newMessage, last_message_at: new Date().toISOString() }
            : conv
        )
      )
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
      toast.error('Erreur lors de l\'envoi du message')
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Fonction pour déterminer si un message est envoyé par l'utilisateur actuel
  const isMessageFromCurrentUser = (message: Message) => {
    return message.sender_type === userType
  }

  // Fonction pour supprimer la conversation
  const deleteConversation = async (conversationId: number) => {
    // Demander confirmation avant suppression
    const isConfirmed = window.confirm('Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible.');
    
    if (!isConfirmed) {
      return; // L'utilisateur a annulé
    }
    
    try {
      const endpoint = user?.role === 'client' ? `/clients/conversations/${conversationId}` : `/artisans/conversations/${conversationId}`;
      await axios.delete(`${apiUrl}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Mettre à jour TOUS les states
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      setArchivedConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      // Désélectionner si c'était la conversation sélectionnée
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
      
      toast.success('Conversation supprimée avec succès.');
    } catch (error) {
      console.error('Erreur lors de la suppression de la conversation :', error);
      toast.error('Erreur lors de la suppression de la conversation.');
    }
  };

  return (
    <div className={styles.messagingContainer}>
      <div className={styles.conversationsList}>
        <h3>Conversations</h3>
        {conversations.length === 0 ? (
          <p className={styles.none}>Aucune conversation</p>
        ) : (
          conversations.map(conversation => (
            <div
              key={conversation.id}
              className={`${styles.conversationItem} ${
                selectedConversation?.id === conversation.id ? styles.active : ''
              }`}
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className={styles.conversationInfo}>
                <h4>{conversation.other_user_name}</h4>
                <p className={styles.lastMessage}>{conversation.last_message}</p>
                <small>{formatTime(conversation.last_message_at)}</small>
              </div>
              {conversation.unread_count > 0 && (
                <span className={styles.unreadBadge}>
                  {conversation.unread_count}
                </span>
              )}
            </div>
          ))
        )}
        
        {/* Section pour les conversations archivées */}
        <h3>Conversations Archivées</h3>
        {archivedConversations.length === 0 ? (
          <p className={styles.none}>Aucune conversation archivée</p>
        ) : (
          archivedConversations.map(conversation => (
            <div
              key={conversation.id}
              className={`${styles.archivedConversationItem} ${
                selectedConversation?.id === conversation.id ? styles.active : ''
              }`}
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className={styles.conversationInfo}>
                <h4>{conversation.other_user_name}</h4>
                <p className={styles.lastMessage}>{conversation.last_message}</p>
                <small>{formatTime(conversation.last_message_at)}</small>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.messagesArea}>
        {selectedConversation ? (
          <>
            <div className={styles.messagesHeader}>
              <h3>Conversation avec {selectedConversation.other_user_name}</h3>
            </div>

            <div className={styles.actionButtons}>
              {/* Vérifier si la conversation est archivée pour afficher les bons boutons */}
              {isConversationArchived(selectedConversation.id) ? (
                <>
                  <button 
                    onClick={() => unarchiveConversation(selectedConversation.id)}
                    className={styles.unarchiveButton}
                  >
                    Désarchiver
                  </button>
                  <button 
                    onClick={() => deleteConversation(selectedConversation.id)}
                    className={styles.deleteButton}
                  >
                    Supprimer
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => archiveConversation(selectedConversation.id)}
                    className={styles.archiveButton}
                  >
                    Archiver
                  </button>
                  <button 
                    onClick={() => deleteConversation(selectedConversation.id)}
                    className={styles.deleteButton}
                  >
                    Supprimer
                  </button>
                </>
              )}
            </div>
            
            <div className={styles.messagesContainer}>
              {loading ? (
                <p>Chargement des messages...</p>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`${styles.message} ${
                      isMessageFromCurrentUser(message) ? styles.sent : styles.received
                    }`}
                  >
                    <div className={styles.messageContent}>
                      <p>{message.content}</p>
                      <small>{formatTime(message.created_at)}</small>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Empêcher l'envoi de messages pour les conversations archivées */}
              {!isConversationArchived(selectedConversation.id) && (
                <form onSubmit={sendMessage} className={styles.messageForm}>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    required
                    rows={3}
                  />
                  <button type="submit" disabled={!newMessage.trim()}>
                    Envoyer
                  </button>
                </form>
              )}

              {/* Afficher un message si la conversation est archivée */}
              {isConversationArchived(selectedConversation.id) && (
                <div className={styles.archivedMessage}>
                  <p>Cette conversation est archivée. Désarchivez-la pour pouvoir envoyer des messages.</p>
                </div>
              )}
            </>
          ) : (
            <div className={styles.noConversation}>
              <p>Sélectionnez une conversation pour voir les messages</p>
            </div>
          )}
        </div>
      </div>
    )
}


