import OpenAI from 'openai';
import config from '../config/env';

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const explainTopic = async (topic, ageLevel = 'adulto', style = 'didático') => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um mentor educacional especializado. Sempre responda em formato JSON válido.'
        },
        {
          role: 'user',
          content: `Explique o seguinte tema de forma ${style}, adequado para nível ${ageLevel}:
      
"${topic}"

Formate sua resposta em JSON com a seguinte estrutura:
{
  "titulo": "título do tema",
  "explicacao": "explicação detalhada e didática",
  "resumo": "resumo em 2-3 linhas",
  "pontosChave": ["ponto 1", "ponto 2", "ponto 3"],
  "dificuldade": "básico|intermediário|avançado"
}

Retorne APENAS o JSON, sem texto adicional ou markdown.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const text = completion.choices[0].message.content;
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Erro ao explicar tema:', error);
    throw new Error('Não foi possível gerar a explicação. Tente novamente.');
  }
};

export const generateQuiz = async (topic, explanation) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um criador de quizzes educacionais. Sempre responda em formato JSON válido.'
        },
        {
          role: 'user',
          content: `Baseado na seguinte explicação sobre "${topic}":
${explanation}

Crie um quiz de 4 perguntas de múltipla escolha em português.

Formate sua resposta em JSON com a seguinte estrutura:
{
  "perguntas": [
    {
      "pergunta": "texto da pergunta",
      "opcoes": ["opção A", "opção B", "opção C", "opção D"],
      "respostaCorreta": 0,
      "explicacao": "breve explicação da resposta"
    }
  ]
}

Retorne APENAS o JSON, sem texto adicional ou markdown.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const text = completion.choices[0].message.content;
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Erro ao gerar quiz:', error);
    throw new Error('Não foi possível gerar o quiz. Tente novamente.');
  }
};

export const generateImagePrompt = async (topic) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você cria descrições para gerar imagens educativas.'
        },
        {
          role: 'user',
          content: `Crie uma descrição detalhada em inglês para gerar uma imagem educativa/didática sobre: "${topic}"

A descrição deve ser objetiva, visual e educativa, adequada para ilustração de conceito.
Retorne apenas a descrição em inglês, sem explicações adicionais.
Máximo 100 palavras.`
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Erro ao gerar prompt de imagem:', error);
    return `Educational illustration of ${topic}, colorful, didactic, simple diagram`;
  }
};
