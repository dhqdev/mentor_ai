# 🔐 Configuração da API Key

## Como configurar a OpenAI API Key

1. **Copie o arquivo de exemplo:**
   ```bash
   cp .env.example .env
   ```

2. **Obtenha sua API Key:**
   - Acesse: https://platform.openai.com/api-keys
   - Crie uma nova chave ou use uma existente

3. **Edite o arquivo `.env`:**
   ```
   OPENAI_API_KEY=sua-chave-aqui
   ```

4. **Importante:**
   - O arquivo `.env` está no `.gitignore` e NÃO será enviado ao GitHub
   - Sua chave estará segura localmente
   - Nunca compartilhe sua API key publicamente

## Estrutura

- `.env` - Suas chaves reais (não vai pro GitHub)
- `.env.example` - Modelo de exemplo (vai pro GitHub)
- `src/config/env.js` - Configuração centralizada

## Fallback

Se o `.env` não funcionar, a chave está temporariamente no arquivo `src/config/env.js` como fallback.
