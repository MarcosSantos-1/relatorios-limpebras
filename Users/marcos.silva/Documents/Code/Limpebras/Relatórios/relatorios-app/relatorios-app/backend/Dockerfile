# Dockerfile para o backend Go
FROM golang:1.21-alpine AS builder

# Instalar dependências necessárias
RUN apk add --no-cache git

# Definir diretório de trabalho
WORKDIR /app

# Copiar go.mod e go.sum
COPY go.mod go.sum ./

# Baixar dependências
RUN go mod download

# Copiar código fonte
COPY . .

# Compilar aplicação
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Imagem final
FROM alpine:latest

# Instalar Node.js e npm para Puppeteer
RUN apk add --no-cache \
    nodejs \
    npm \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Instalar Puppeteer
RUN npm install -g puppeteer

# Definir variáveis de ambiente para Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Criar usuário não-root
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Criar diretório de trabalho
WORKDIR /app

# Copiar binário compilado
COPY --from=builder /app/main .

# Criar diretório temporário
RUN mkdir -p /tmp && chown -R appuser:appgroup /tmp

# Mudar para usuário não-root
USER appuser

# Expor porta
EXPOSE 8080

# Comando para iniciar aplicação
CMD ["./main"]
