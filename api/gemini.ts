import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.key_teste || '' });

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', true);
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
    const { contents, config, model } = req.body;

    if (!contents) {
      return res.status(400).json({ error: 'Contents are required' });
    }

    console.log('Iniciando chamada genérica para o Gemini API...');

    const response = await ai.models.generateContent({
      model: model || "gemini-3.1-flash-preview",
      contents: contents,
      config: config,
    });

    console.log('Resposta do Gemini recebida com sucesso.');

    return res.status(200).json({ text: response.text });

  } catch (error) {
    console.error('Erro na API Route /api/gemini:', error);
    return res.status(500).json({ error: 'Erro interno no servidor ao conectar com a IA.' });
  }
}
