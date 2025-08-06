import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
}

export async function getGeminiResponse(
  message: string, 
  context?: string,
  conversationHistory?: ChatMessage[]
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", // Version gratuite
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 200,
      }
    });

    // Prompt système personnalisé pour Corsica Facile
    const systemPrompt = `Tu es l'assistant virtuel de Corsica Facile, la plateforme de référence pour trouver des professionnels en Corse.

🎯 TON RÔLE :
- Aider les utilisateurs à trouver des professionnels (plombiers, électriciens, artisans, etc.)
- Expliquer comment utiliser le site
- Donner des conseils sur les services en Corse
- Être chaleureux et professionnel

📍 CONTEXTE ACTUEL : ${context || 'Page d\'accueil'}

🔧 SERVICES DISPONIBLES :
- Recherche par métier et localisation
- Déclaration de besoin pour les clients
- Évaluations et avis clients
- Contact direct avec les artisans

💬 STYLE :
- Réponds en français
- Sois concis (max 2-3 phrases)
- Utilise des emojis avec parcimonie
- Sois pratique et actionnable

Si tu ne connais pas la réponse, oriente vers le formulaire de contact qui se trouve dans le footer.`;

    let prompt: string;

    // Si on a un historique, on l'utilise pour la conversation
    if (conversationHistory && conversationHistory.length > 0) {
      const history = conversationHistory
        .map(msg => `${msg.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${msg.parts}`)
        .join('\n');
      
      prompt = `${systemPrompt}\n\nHISTORIQUE:\n${history}\n\nNouvelle question: ${message}`;
    } else {
      prompt = `${systemPrompt}\n\nQuestion: ${message}`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text() || "Je n'ai pas pu traiter votre demande. Pouvez-vous reformuler ?";
    
  } catch (error) {
    console.error('Erreur Gemini:', error);
    
    // Fallback intelligent selon le type d'erreur
    if (error instanceof Error) {
      if (error.message.includes('quota')) {
        return "Nos services IA sont temporairement surchargés. Essayez dans quelques minutes.";
      }
      if (error.message.includes('safety')) {
        return "Je ne peux pas répondre à cette question. Puis-je vous aider autrement ?";
      }
    }
    
    return getFallbackResponse(message);
  }
}

// Réponses de secours intelligentes
function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Détection d'intention basique
  if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || lowerMessage.includes('hello')) {
    return "Bonjour ! 👋 Je suis l'assistant de Corsica Facile. Comment puis-je vous aider à trouver un professionnel en Corse ?";
  }
  
  if (lowerMessage.includes('prix') || lowerMessage.includes('tarif') || lowerMessage.includes('coût')) {
    return "Pour les clients, les tarifs varient selon chaque professionnel. Utilisez notre formulaire de recherche pour demander des informations directement auprès des artisans ! Pour les artisans, vous trouverez sur notre page d'accueil toutes les informations concernant le prix des formules proposées. 💰";
  }
  
  if (lowerMessage.includes('plombier') || lowerMessage.includes('électricien') || lowerMessage.includes('artisan')) {
    return "Parfait ! Utilisez notre barre de recherche en haut de page : sélectionnez votre métier et votre ville pour trouver les meilleurs professionnels. 🔧";
  }
  
  if (lowerMessage.includes('comment') || lowerMessage.includes('aide') || lowerMessage.includes('utiliser')) {
    return "C'est simple ! Recherchez par métier et ville, consultez les profils, puis contactez directement les professionnels. Besoin d'aide spécifique ? 🎯";
  }
  
  if (lowerMessage.includes('contact') || lowerMessage.includes('téléphone') || lowerMessage.includes('email')) {
    return "Chaque professionnel a ses propres coordonnées sur sa fiche. Pour nous contacter, utilisez le formulaire de contact du site disponible en bas de page. 📞";
  }
  
  return "Je vous remercie pour votre message ! Pour une aide personnalisée, n'hésitez pas à utiliser notre formulaire de recherche ou de contact. 😊";
}
