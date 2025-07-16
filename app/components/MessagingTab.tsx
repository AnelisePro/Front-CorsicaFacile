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
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const token = localStorage.getItem(user?.role === 'client' ? 'clientToken' : 'artisanToken')
  const userType = user?.role === 'client' ? 'Client' : 'Artisan'

  useEffect(() => {
    fetchConversations()
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
    }
  }

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
    // Comparer par type d'utilisateur au lieu de l'ID
    return message.sender_type === userType
  }

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
      </div>

      <div className={styles.messagesArea}>
        {selectedConversation ? (
          <>
            <div className={styles.messagesHeader}>
              <h3>Conversation avec {selectedConversation.other_user_name}</h3>
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

