FROM node:20-alpine AS base

WORKDIR /app

# Instala dependências nativas leves
RUN apk add --no-cache libc6-compat

# Copia arquivos de dependência e instala
COPY package.json ./
RUN npm install

# Copia todo o código-fonte da aplicação
COPY . .

# Garante que as pastas de persistência de dados e uploads existam com permissões de escrita
RUN mkdir -p data public && chmod -R 777 data public

# Executa o build de produção dos arquivos estáticos
RUN npm run build

# Define as variáveis de ambiente de produção
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

# Inicia o servidor Node.js/Express
CMD ["npm", "start"]
