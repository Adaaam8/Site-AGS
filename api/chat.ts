import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build conversation context
    let conversationContext = '';
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationContext = conversationHistory
        .map(
          (msg: any) =>
            `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
        )
        .join('\n');
    }

    const systemPrompt = `Tu es un assistant IA pour AGS Concept, une agence de services digitaux (web design, développement, branding, SEO).
Tu dois répondre aux questions des prospects de manière professionnelle et utile.
Si quelqu'un demande des informations sur les services, parle des services web, e-commerce, branding et SEO.
Sois amical, naturel et utile. Réponds toujours en français.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'Tu es un assistant IA pour AGS Concept.' }],
        },
        {
          role: 'model',
          parts: [{ text: 'Compris! Je suis l\'assistant IA pour AGS Concept. Comment puis-je vous aider?' }],
        },
      ],
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    return res.status(200).json({ response });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}