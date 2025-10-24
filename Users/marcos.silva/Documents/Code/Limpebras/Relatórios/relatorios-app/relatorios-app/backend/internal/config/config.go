package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func LoadEnv() error {
	// Tentar carregar .env se existir
	if err := godotenv.Load(); err != nil {
		log.Println("Arquivo .env não encontrado, usando variáveis de ambiente do sistema")
	}
	return nil
}

func GetEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
