import { NextRequest, NextResponse } from 'next/server';
import { getGeminiResponse } from '../../lib/chatbot/gemini';

interface ChatRequest {
  message: string;
  context?: string;
  conversationHistory?: Array<{
    role: 'user' | 'model';
    parts: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, context, conversationHistory } = body;

    // Validation
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message requis' },
        { status: 400 }
      );
    }

    // Limitation de longueur
    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message trop long (max 500 caractères)' },
        { status: 400 }
      );
    }

    // Obtenir la réponse de Gemini
    const response = await getGeminiResponse(message, context, conversationHistory);

    // Log pour analytics (optionnel)
    console.log(`[CHATBOT] Context: ${context}, Message: ${message.substring(0, 50)}...`);

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
      provider: 'gemini'
    });

  } catch (error) {
    console.error('Erreur API chatbot:', error);
    
    return NextResponse.json(
      { 
        response: "Je rencontre des difficultés techniques. Veuillez réessayer dans un moment.",
        error: true 
      },
      { status: 500 }
    );
  }
}
