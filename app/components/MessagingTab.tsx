'use client'

import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth } from '../auth/AuthContext'
import styles from './MessagingTab.module.scss'
import Avatar from './Avatar'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

type Message = {
  id: number
  content: string
  sender_id: number
  sender_type: 'Client' | 'Artisan'
  recipient_id: number
  recipient_type: 'Client' | 'Artisan'
  sender_name: string
  sender_avatar?: string | null
  created_at: string
  read: boolean
}

type Conversation = {
  id: number
  other_user_id: number
  other_user_name: string
  other_user_avatar?: string | null
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
  const [activeTab, setActiveTab] = useState('active'); 
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
  const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
  const isNearBottom = scrollHeight - scrollTop - clientHeight < 50
  setShouldAutoScroll(isNearBottom)
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
      
      // 👈 CHANGEMENT ICI : adapter à la nouvelle structure
      const { conversation, messages } = response.data
      
      setMessages(messages) // 👈 Maintenant on prend les messages séparément
      setSelectedConversation(conversation) // 👈 Stocker la conversation avec avatar
      
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
      setShouldAutoScroll(true)

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
    <div className={styles.sidebar}>
      {/* Navigation tabs */}
      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tab} ${activeTab === 'active' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <span className={styles.tabIcon}>💬</span>
          Conversations
          {conversations.length > 0 && (
            <span className={styles.tabCount}>({conversations.length})</span>
          )}
        </button>
        
        <button 
          className={`${styles.tab} ${activeTab === 'archived' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('archived')}
        >
          <span className={styles.tabIcon}>📁</span>
          Archivées
          {archivedConversations.length > 0 && (
            <span className={styles.tabCount}>({archivedConversations.length})</span>
          )}
        </button>
      </div>

      {/* Conversations list */}
      <div className={styles.conversationsList}>
        {activeTab === 'active' ? (
          conversations.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>💬</div>
              <p className={styles.emptyTitle}>Aucune conversation</p>
              <p className={styles.emptySubtitle}>Vos conversations apparaîtront ici</p>
            </div>
          ) : (
            conversations.map(conversation => (
              <div
                key={conversation.id}
                className={`${styles.conversationItem} ${
                  selectedConversation?.id === conversation.id ? styles.selected : ''
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className={styles.avatar}>
                  <Avatar avatarUrl={conversation.other_user_avatar} userName={conversation.other_user_name} />
                </div>
                <div className={styles.conversationContent}>
                  <div className={styles.conversationHeader}>
                    <h4 className={styles.userName}>{conversation.other_user_name}</h4>
                    <span className={styles.timestamp}>
                      {formatTime(conversation.last_message_at)}
                    </span>
                  </div>
                  <p className={styles.lastMessage}>{conversation.last_message}</p>
                </div>
                {conversation.unread_count > 0 && (
                  <div className={styles.unreadBadge}>
                    {conversation.unread_count}
                  </div>
                )}
              </div>
            ))
          )
        ) : (
          archivedConversations.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📁</div>
              <p className={styles.emptyTitle}>Aucune conversation archivée</p>
              <p className={styles.emptySubtitle}>Vos conversations archivées apparaîtront ici</p>
            </div>
          ) : (
            archivedConversations.map(conversation => (
              <div
                key={conversation.id}
                className={`${styles.conversationItem} ${styles.archivedItem} ${
                  selectedConversation?.id === conversation.id ? styles.selected : ''
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className={`${styles.avatar} ${styles.archivedAvatar}`}>
                 <Avatar avatarUrl={conversation.other_user_avatar} userName={conversation.other_user_name} />
                </div>
                <div className={styles.conversationContent}>
                  <div className={styles.conversationHeader}>
                    <h4 className={styles.userName}>{conversation.other_user_name}</h4>
                    <span className={styles.timestamp}>
                      {formatTime(conversation.last_message_at)}
                    </span>
                  </div>
                  <p className={styles.lastMessage}>{conversation.last_message}</p>
                </div>
                <div className={styles.archivedIcon}>📁</div>
              </div>
            ))
          )
        )}
      </div>
    </div>

    <div className={styles.chatArea}>
      {selectedConversation ? (
        <>
          {/* Chat header */}
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderLeft}>
              <div>
                {selectedConversation && (
                  <Avatar 
                    avatarUrl={selectedConversation.other_user_avatar} 
                    userName={selectedConversation.other_user_name}
                    size="large"
                  />
                )}
              </div>
              <div>
                <h3 className={styles.chatTitle}>{selectedConversation.other_user_name}</h3>
              </div>
            </div>
            
            <div className={styles.chatActions}>
              {isConversationArchived(selectedConversation.id) ? (
                <>
                  <button 
                    onClick={() => unarchiveConversation(selectedConversation.id)}
                    className={`${styles.actionButton} ${styles.unarchiveButton}`}
                    title="Désarchiver"
                  >
                    📤
                  </button>
                  <button 
                    onClick={() => deleteConversation(selectedConversation.id)}
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => archiveConversation(selectedConversation.id)}
                    className={`${styles.actionButton} ${styles.archiveButton}`}
                    title="Archiver"
                  >
                    📁
                  </button>
                  <button 
                    onClick={() => deleteConversation(selectedConversation.id)}
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Messages area avec gestion du scroll */}
          <div className={styles.messagesContainer}>
            <div 
              className={styles.messagesScrollable}
              onScroll={handleScroll} // 👈 AJOUTÉ ICI
            >
              {loading ? (
                <div className={styles.loadingState}>
                  <div className={styles.loadingSpinner}></div>
                  <p>Chargement des messages...</p>
                </div>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`${styles.messageWrapper} ${
                      isMessageFromCurrentUser(message) ? styles.sent : styles.received
                    }`}
                  >
                    <div className={styles.message}>
                      <div className={styles.messageContent}>
                        <p>{message.content}</p>
                      </div>
                      <div className={styles.messageTime}>
                        {formatTime(message.created_at)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message input */}
          {!isConversationArchived(selectedConversation.id) ? (
            <form onSubmit={sendMessage} className={styles.messageForm}>
              <div className={styles.inputContainer}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  className={styles.messageInput}
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className={styles.sendButton}
                >
                  <span>➤</span>
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.archivedNotice}>
              <div className={styles.archivedIcon}>📁</div>
              <p>Cette conversation est archivée</p>
              <button 
                onClick={() => unarchiveConversation(selectedConversation.id)}
                className={styles.unarchiveLink}
              >
                Désarchiver pour répondre
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={styles.welcomeState}>
          <div className={styles.welcomeIcon}>💬</div>
          <h3 className={styles.welcomeTitle}>Bienvenue dans votre messagerie</h3>
          <p className={styles.welcomeSubtitle}>
            Sélectionnez une conversation pour commencer à discuter
          </p>
        </div>
      )}
    </div>
  </div>
);
}
