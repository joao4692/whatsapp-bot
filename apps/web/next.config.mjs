/** @type {import('next').NextConfig} */
const config = {
  // Gera uma pasta standalone com tudo para rodar sem node_modules
  // Necessário para o Dockerfile funcionar corretamente
  output: 'standalone',
}

export default config
