'use client'

import { useState, useEffect, useRef } from 'react'
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi'
import { FaRobot, FaUser } from 'react-icons/fa'
import styles from './GeminiChatbot.module.scss'

interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
  isTyping?: boolean
}

interface ChatHistory {
  role: 'user' | 'model'
  parts: string
}

export default function GeminiChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<ChatHistory[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Message de bienvenue
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        text: "Bonjour ! 👋 Je suis votre assistant Corsica Facile. Comment puis-je vous aider ?",
        isBot: true,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, messages.length])

  // Auto-scroll
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Obtenir le contexte de la page courante
  const getCurrentContext = () => {
    if (typeof window === 'undefined') return 'Site web'
    
    const path = window.location.pathname
    const contexts: { [key: string]: string } = {
      '/': 'Page d\'accueil',
      '/annonces': 'Annonces',
      '/professionals': 'Liste des professionnels',
      '/qui-sommes-nous': 'À propos de Corsica Facile',
      '/contact': 'Page de contact'
    }
    
    return contexts[path] || `Page: ${path}`
  }

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    // Ajouter indicateur de frappe
    const typingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: 'Assistant écrit...',
      isBot: true,
      timestamp: new Date(),
      isTyping: true
    }
    setMessages(prev => [...prev, typingMessage])

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputText,
          context: getCurrentContext(),
          conversationHistory: conversationHistory.slice(-6)
        })
      })

      const data = await response.json()

      // Supprimer l'indicateur de frappe
      setMessages(prev => prev.filter(msg => !msg.isTyping))

      if (response.ok) {
        const botMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: data.response,
          isBot: true,
          timestamp: new Date()
        }

        setMessages(prev => [...prev, botMessage])

        // Mettre à jour l'historique pour Gemini
        setConversationHistory(prev => [
          ...prev,
          { role: 'user', parts: userMessage.text },
          { role: 'model', parts: data.response }
        ])
      } else {
        throw new Error(data.error || 'Erreur de communication')
      }
    } catch (error) {
      console.error('Erreur envoi message:', error)
      
      // Supprimer l'indicateur de frappe
      setMessages(prev => prev.filter(msg => !msg.isTyping))
      
      const errorMessage: Message = {
        id: (Date.now() + 3).toString(),
        text: "Désolé, je rencontre un problème technique. Pouvez-vous réessayer ?",
        isBot: true,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Questions rapides spécifiques à Corsica Facile
  const quickQuestions = [
    "Comment trouver un artisan ?",
    "Comment déclarer un besoin ?",
    "Quels sont les tarifs ?",
  ]

  const askQuickQuestion = (question: string) => {
    setInputText(question)
    sendMessage()
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        className={`${styles.chatButton} ${isOpen ? styles.chatButtonOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ouvrir le chat"
      >
        {isOpen ? <FiX /> : <FiMessageCircle />}
      </button>

      {/* Widget de chat */}
      {isOpen && (
        <div className={styles.chatWidget}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.headerInfo}>
              <FaRobot className={styles.headerIcon} />
              <div>
                <h3>Assistant Corsica Facile</h3>
                <span className={styles.status}>
                  ✨ Alimenté par Gemini AI
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className={styles.closeButton}
              aria-label="Fermer le chat"
            >
              <FiX />
            </button>
          </div>

          {/* Messages */}
          <div className={styles.messagesContainer}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${
                  message.isBot ? styles.botMessage : styles.userMessage
                }`}
              >
                <div className={styles.messageAvatar}>
                  {message.isBot ? <FaRobot /> : <FaUser />}
                </div>
                <div className={styles.messageContent}>
                  <div className={styles.messageText}>
                    {message.isTyping ? (
                      <div className={styles.typingIndicator}>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    ) : (
                      message.text
                    )}
                  </div>
                  <div className={styles.messageTime}>
                    {message.timestamp.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Questions rapides */}
          {messages.length <= 1 && (
            <div className={styles.quickQuestions}>
              <div className={styles.quickQuestionsTitle}>Questions fréquentes</div>
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  className={styles.questionButton}
                  onClick={() => askQuickQuestion(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className={styles.inputForm}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              className={styles.messageInput}
              disabled={isLoading}
              maxLength={500}
            />
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || isLoading}
              className={styles.sendButton}
              aria-label="Envoyer le message"
            >
              <FiSend />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
