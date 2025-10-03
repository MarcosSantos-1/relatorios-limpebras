# Dockerfile otimizado para Render
FROM node:18-alpine

# Instalar wkhtmltopdf
RUN apk add --no-cache \
    wkhtmltopdf \
    xvfb \
    ttf-dejavu \
    ttf-droid \
    ttf-freefont \
    ttf-liberation

# Criar diretório da aplicação
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Criar diretórios necessários
RUN mkdir -p uploads generated-pdfs logs

# Expor porta
EXPOSE 3001

# Comando para iniciar
CMD ["npm", "start"]
