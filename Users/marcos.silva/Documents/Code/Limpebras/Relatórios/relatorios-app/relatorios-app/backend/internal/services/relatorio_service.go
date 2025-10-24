package services

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"relatorios-backend/internal/models"

	"github.com/google/uuid"
)

type RelatorioService struct {
	db *sql.DB
}

func NewRelatorioService(db *sql.DB) *RelatorioService {
	return &RelatorioService{db: db}
}

func (s *RelatorioService) CreateRelatorio(userID string, req models.CreateRelatorioRequest) (*models.Relatorio, error) {
	relatorio := &models.Relatorio{
		ID:           uuid.New().String(),
		UserID:       userID,
		TipoServico:  req.TipoServico,
		Title:        req.Title,
		Data:         req.Data,
		DataInicio:   req.DataInicio,
		DataTermino:  req.DataTermino,
		Sub:          req.Sub,
		Local:        req.Local,
		Endereco:     req.Endereco,
		Descricao:    req.Descricao,
		Assunto:      req.Assunto,
		Frequencia:   req.Frequencia,
		Peso:         req.Peso,
		Quantitativo: req.Quantitativo,
		Secoes:       req.Secoes,
		Fotos:        req.Fotos,
		Servicos:     req.Servicos,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// Converter campos JSON para string
	quantitativoJSON, _ := json.Marshal(relatorio.Quantitativo)
	secoesJSON, _ := json.Marshal(relatorio.Secoes)
	fotosJSON, _ := json.Marshal(relatorio.Fotos)
	servicosJSON, _ := json.Marshal(relatorio.Servicos)

	query := `INSERT INTO relatorios (
		id, user_id, tipo_servico, title, data, data_inicio, data_termino, 
		sub, local, endereco, descricao, assunto, frequencia, peso,
		quantitativo, secoes, fotos, servicos, created_at, updated_at
	) VALUES (
		$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
	)`

	_, err := s.db.Exec(query,
		relatorio.ID, relatorio.UserID, relatorio.TipoServico, relatorio.Title,
		relatorio.Data, relatorio.DataInicio, relatorio.DataTermino,
		relatorio.Sub, relatorio.Local, relatorio.Endereco, relatorio.Descricao,
		relatorio.Assunto, relatorio.Frequencia, relatorio.Peso,
		string(quantitativoJSON), string(secoesJSON), string(fotosJSON), string(servicosJSON),
		relatorio.CreatedAt, relatorio.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("erro ao criar relatório: %w", err)
	}

	return relatorio, nil
}

func (s *RelatorioService) GetRelatorio(id string) (*models.Relatorio, error) {
	var relatorio models.Relatorio
	var quantitativoJSON, secoesJSON, fotosJSON, servicosJSON string

	query := `SELECT id, user_id, tipo_servico, title, data, data_inicio, data_termino,
		sub, local, endereco, descricao, assunto, frequencia, peso,
		quantitativo, secoes, fotos, servicos, created_at, updated_at
		FROM relatorios WHERE id = $1`

	err := s.db.QueryRow(query, id).Scan(
		&relatorio.ID, &relatorio.UserID, &relatorio.TipoServico, &relatorio.Title,
		&relatorio.Data, &relatorio.DataInicio, &relatorio.DataTermino,
		&relatorio.Sub, &relatorio.Local, &relatorio.Endereco, &relatorio.Descricao,
		&relatorio.Assunto, &relatorio.Frequencia, &relatorio.Peso,
		&quantitativoJSON, &secoesJSON, &fotosJSON, &servicosJSON,
		&relatorio.CreatedAt, &relatorio.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("relatório não encontrado")
		}
		return nil, fmt.Errorf("erro ao buscar relatório: %w", err)
	}

	// Converter JSON de volta para structs
	json.Unmarshal([]byte(quantitativoJSON), &relatorio.Quantitativo)
	json.Unmarshal([]byte(secoesJSON), &relatorio.Secoes)
	json.Unmarshal([]byte(fotosJSON), &relatorio.Fotos)
	json.Unmarshal([]byte(servicosJSON), &relatorio.Servicos)

	return &relatorio, nil
}

func (s *RelatorioService) GetAllRelatorios() ([]models.Relatorio, error) {
	query := `SELECT id, user_id, tipo_servico, title, data, data_inicio, data_termino,
		sub, local, endereco, descricao, assunto, frequencia, peso,
		quantitativo, secoes, fotos, servicos, created_at, updated_at
		FROM relatorios ORDER BY created_at DESC`

	rows, err := s.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar relatórios: %w", err)
	}
	defer rows.Close()

	var relatorios []models.Relatorio
	for rows.Next() {
		var relatorio models.Relatorio
		var quantitativoJSON, secoesJSON, fotosJSON, servicosJSON string

		err := rows.Scan(
			&relatorio.ID, &relatorio.UserID, &relatorio.TipoServico, &relatorio.Title,
			&relatorio.Data, &relatorio.DataInicio, &relatorio.DataTermino,
			&relatorio.Sub, &relatorio.Local, &relatorio.Endereco, &relatorio.Descricao,
			&relatorio.Assunto, &relatorio.Frequencia, &relatorio.Peso,
			&quantitativoJSON, &secoesJSON, &fotosJSON, &servicosJSON,
			&relatorio.CreatedAt, &relatorio.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("erro ao escanear relatório: %w", err)
		}

		// Converter JSON de volta para structs
		json.Unmarshal([]byte(quantitativoJSON), &relatorio.Quantitativo)
		json.Unmarshal([]byte(secoesJSON), &relatorio.Secoes)
		json.Unmarshal([]byte(fotosJSON), &relatorio.Fotos)
		json.Unmarshal([]byte(servicosJSON), &relatorio.Servicos)

		relatorios = append(relatorios, relatorio)
	}

	return relatorios, nil
}

func (s *RelatorioService) GetRelatorios(userID string) ([]models.Relatorio, error) {
	query := `SELECT id, user_id, tipo_servico, title, data, data_inicio, data_termino,
		sub, local, endereco, descricao, assunto, frequencia, peso,
		quantitativo, secoes, fotos, servicos, created_at, updated_at
		FROM relatorios WHERE user_id = $1 ORDER BY created_at DESC`

	rows, err := s.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar relatórios: %w", err)
	}
	defer rows.Close()

	var relatorios []models.Relatorio
	for rows.Next() {
		var relatorio models.Relatorio
		var quantitativoJSON, secoesJSON, fotosJSON, servicosJSON string

		err := rows.Scan(
			&relatorio.ID, &relatorio.UserID, &relatorio.TipoServico, &relatorio.Title,
			&relatorio.Data, &relatorio.DataInicio, &relatorio.DataTermino,
			&relatorio.Sub, &relatorio.Local, &relatorio.Endereco, &relatorio.Descricao,
			&relatorio.Assunto, &relatorio.Frequencia, &relatorio.Peso,
			&quantitativoJSON, &secoesJSON, &fotosJSON, &servicosJSON,
			&relatorio.CreatedAt, &relatorio.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("erro ao escanear relatório: %w", err)
		}

		// Converter JSON de volta para structs
		json.Unmarshal([]byte(quantitativoJSON), &relatorio.Quantitativo)
		json.Unmarshal([]byte(secoesJSON), &relatorio.Secoes)
		json.Unmarshal([]byte(fotosJSON), &relatorio.Fotos)
		json.Unmarshal([]byte(servicosJSON), &relatorio.Servicos)

		relatorios = append(relatorios, relatorio)
	}

	return relatorios, nil
}

func (s *RelatorioService) UpdateRelatorio(id, userID string, req models.UpdateRelatorioRequest) (*models.Relatorio, error) {
	// Buscar relatório existente
	relatorio, err := s.GetRelatorio(id)
	if err != nil {
		return nil, err
	}

	// Verificar se o usuário é o dono do relatório
	if relatorio.UserID != userID {
		return nil, fmt.Errorf("não autorizado")
	}

	// Atualizar campos fornecidos
	if req.TipoServico != "" {
		relatorio.TipoServico = req.TipoServico
	}
	if req.Title != "" {
		relatorio.Title = req.Title
	}
	if req.Data != "" {
		relatorio.Data = req.Data
	}
	if req.DataInicio != "" {
		relatorio.DataInicio = req.DataInicio
	}
	if req.DataTermino != "" {
		relatorio.DataTermino = req.DataTermino
	}
	if req.Sub != "" {
		relatorio.Sub = req.Sub
	}
	if req.Local != "" {
		relatorio.Local = req.Local
	}
	if req.Endereco != "" {
		relatorio.Endereco = req.Endereco
	}
	if req.Descricao != "" {
		relatorio.Descricao = req.Descricao
	}
	if req.Assunto != "" {
		relatorio.Assunto = req.Assunto
	}
	if req.Frequencia != "" {
		relatorio.Frequencia = req.Frequencia
	}
	if req.Peso != "" {
		relatorio.Peso = req.Peso
	}
	if req.Quantitativo != nil {
		relatorio.Quantitativo = req.Quantitativo
	}
	if req.Secoes != nil {
		relatorio.Secoes = req.Secoes
	}
	if req.Fotos != nil {
		relatorio.Fotos = req.Fotos
	}
	if req.Servicos != nil {
		relatorio.Servicos = req.Servicos
	}

	relatorio.UpdatedAt = time.Now()

	// Converter campos JSON para string
	quantitativoJSON, _ := json.Marshal(relatorio.Quantitativo)
	secoesJSON, _ := json.Marshal(relatorio.Secoes)
	fotosJSON, _ := json.Marshal(relatorio.Fotos)
	servicosJSON, _ := json.Marshal(relatorio.Servicos)

	query := `UPDATE relatorios SET 
		tipo_servico = $1, title = $2, data = $3, data_inicio = $4, data_termino = $5,
		sub = $6, local = $7, endereco = $8, descricao = $9, assunto = $10,
		frequencia = $11, peso = $12, quantitativo = $13, secoes = $14,
		fotos = $15, servicos = $16, updated_at = $17
		WHERE id = $18 AND user_id = $19`

	_, err = s.db.Exec(query,
		relatorio.TipoServico, relatorio.Title, relatorio.Data, relatorio.DataInicio, relatorio.DataTermino,
		relatorio.Sub, relatorio.Local, relatorio.Endereco, relatorio.Descricao, relatorio.Assunto,
		relatorio.Frequencia, relatorio.Peso, string(quantitativoJSON), string(secoesJSON),
		string(fotosJSON), string(servicosJSON), relatorio.UpdatedAt,
		relatorio.ID, userID,
	)

	if err != nil {
		return nil, fmt.Errorf("erro ao atualizar relatório: %w", err)
	}

	return relatorio, nil
}

func (s *RelatorioService) DeleteRelatorio(id, userID string) error {
	query := `DELETE FROM relatorios WHERE id = $1 AND user_id = $2`
	result, err := s.db.Exec(query, id, userID)
	if err != nil {
		return fmt.Errorf("erro ao deletar relatório: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("erro ao verificar linhas afetadas: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("relatório não encontrado ou não autorizado")
	}

	return nil
}
