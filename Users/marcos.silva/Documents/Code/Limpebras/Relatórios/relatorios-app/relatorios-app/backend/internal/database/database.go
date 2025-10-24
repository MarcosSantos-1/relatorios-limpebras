package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func Connect() (*sql.DB, error) {
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}

	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "5432"
	}

	user := os.Getenv("DB_USER")
	if user == "" {
		user = "postgres"
	}

	password := os.Getenv("DB_PASSWORD")
	if password == "" {
		password = "postgres"
	}

	dbname := os.Getenv("DB_NAME")
	if dbname == "" {
		dbname = "relatorios"
	}

	sslmode := os.Getenv("DB_SSLMODE")
	if sslmode == "" {
		sslmode = "disable"
	}

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("erro ao abrir conexão com o banco: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("erro ao conectar com o banco: %w", err)
	}

	log.Println("Conectado ao banco de dados PostgreSQL")
	return db, nil
}

func Migrate(db *sql.DB) error {
	// Criar tabela de usuários
	createUsersTable := `
	CREATE TABLE IF NOT EXISTS users (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		email VARCHAR(255) UNIQUE NOT NULL,
		password_hash VARCHAR(255) NOT NULL,
		name VARCHAR(255) NOT NULL,
		role VARCHAR(50) DEFAULT 'user',
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	// Criar tabela de relatórios
	createRelatoriosTable := `
	CREATE TABLE IF NOT EXISTS relatorios (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID REFERENCES users(id) ON DELETE CASCADE,
		tipo_servico VARCHAR(50) NOT NULL,
		title VARCHAR(255) NOT NULL,
		data VARCHAR(50),
		data_inicio VARCHAR(50),
		data_termino VARCHAR(50),
		sub VARCHAR(10),
		local VARCHAR(255),
		endereco VARCHAR(255),
		descricao TEXT,
		assunto VARCHAR(255),
		frequencia VARCHAR(100),
		peso VARCHAR(100),
		quantitativo JSONB,
		secoes JSONB,
		fotos JSONB,
		servicos JSONB,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	// Criar índices
	createIndexes := `
	CREATE INDEX IF NOT EXISTS idx_relatorios_user_id ON relatorios(user_id);
	CREATE INDEX IF NOT EXISTS idx_relatorios_tipo_servico ON relatorios(tipo_servico);
	CREATE INDEX IF NOT EXISTS idx_relatorios_data ON relatorios(data);
	CREATE INDEX IF NOT EXISTS idx_relatorios_sub ON relatorios(sub);
	`

	queries := []string{
		createUsersTable,
		createRelatoriosTable,
		createIndexes,
	}

	for _, query := range queries {
		if _, err := db.Exec(query); err != nil {
			return fmt.Errorf("erro ao executar migração: %w", err)
		}
	}

	log.Println("Migrações executadas com sucesso")
	return nil
}
