// Configuração de variáveis de ambiente
// Como React Native não tem suporte nativo a .env, 
// use o arquivo .env na raiz do projeto

const config = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'sua-chave-openai-aqui',
};

export default config;
