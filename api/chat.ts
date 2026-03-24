import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.key_teste || '' });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    resposta: {
      type: Type.STRING,
      description: "A resposta conversacional em markdown com contexto executivo e estratégico.",
    },
    tipoWidget: {
      type: Type.STRING,
      description: "O tipo de widget a ser exibido. Valores permitidos: 'nenhum', 'grafico_barras', 'lista_risco', 'kpi_destaque'.",
    },
    dadosWidget: {
      type: Type.OBJECT,
      description: "Os dados para popular o widget, dependendo do tipo.",
      properties: {
        titulo: { type: Type.STRING },
        itens: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              valor: { type: Type.STRING },
              cor: { type: Type.STRING, description: "Ex: 'red', 'emerald', 'amber'" }
            }
          }
        },
        valorPrincipal: { type: Type.STRING },
        subtexto: { type: Type.STRING }
      }
    },
    acoesRecomendadas: {
      type: Type.ARRAY,
      description: "Ações acionáveis sugeridas para o usuário.",
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          acao: { type: Type.STRING }
        }
      }
    }
  },
  required: ["resposta", "tipoWidget", "acoesRecomendadas"]
};

export default async function handler(req: any, res: any) {
  // Configuração de CORS para permitir chamadas do front-end
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
    const { message, systemInstruction } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Iniciando chamada para o Gemini API...');

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-preview",
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    console.log('Resposta do Gemini recebida com sucesso.');

    const data = JSON.parse(response.text || '{}');
    return res.status(200).json(data);

  } catch (error) {
    console.error('Erro na API Route /api/chat:', error);
    return res.status(500).json({ error: 'Erro interno no servidor ao conectar com a IA.' });
  }
}
