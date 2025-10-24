package models

import (
	"time"
)

type User struct {
	ID           string    `json:"id" db:"id"`
	Email        string    `json:"email" db:"email"`
	PasswordHash string    `json:"-" db:"password_hash"`
	Name         string    `json:"name" db:"name"`
	Role         string    `json:"role" db:"role"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Name     string `json:"name" binding:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type QuantitativoItem struct {
	Descricao   string      `json:"descricao"`
	Quantidade  interface{} `json:"quantidade"` // pode ser int ou string
	Unidade     string      `json:"unidade,omitempty"`
	Tipo        string      `json:"tipo,omitempty"`
}

type InformacaoItem struct {
	Ordem      int    `json:"ordem"`
	Descricao  string `json:"descricao"`
}

type Foto struct {
	URL        string `json:"url"`
	Etapa      string `json:"etapa,omitempty"`
	Descricao  string `json:"descricao,omitempty"`
	Ordem      int    `json:"ordem,omitempty"`
}

type ServicoSub struct {
	Assunto     string `json:"assunto"`
	Fotos       []Foto `json:"fotos"`
	Observacao  string `json:"observacao,omitempty"`
}

type MutiraoSubSecao struct {
	Sub           string            `json:"sub"`
	Local         string            `json:"local,omitempty"`
	Descricao     string            `json:"descricao,omitempty"`
	Data          string            `json:"data"`
	EquipeFotoURL string            `json:"equipe_foto_url,omitempty"`
	MapaFotoURL   string            `json:"mapa_foto_url,omitempty"`
	Informacoes   []InformacaoItem  `json:"informacoes"`
	Servicos      []ServicoSub      `json:"servicos"`
}

type Relatorio struct {
	ID           string                 `json:"id" db:"id"`
	UserID       string                 `json:"user_id" db:"user_id"`
	TipoServico  string                 `json:"tipo_servico" db:"tipo_servico"`
	Title        string                 `json:"title" db:"title"`
	Data         string                 `json:"data,omitempty" db:"data"`
	DataInicio   string                 `json:"data_inicio,omitempty" db:"data_inicio"`
	DataTermino  string                 `json:"data_termino,omitempty" db:"data_termino"`
	Sub          string                 `json:"sub,omitempty" db:"sub"`
	Local        string                 `json:"local,omitempty" db:"local"`
	Endereco     string                 `json:"endereco,omitempty" db:"endereco"`
	Descricao    string                 `json:"descricao,omitempty" db:"descricao"`
	Assunto      string                 `json:"assunto,omitempty" db:"assunto"`
	Frequencia   string                 `json:"frequencia,omitempty" db:"frequencia"`
	Peso         string                 `json:"peso,omitempty" db:"peso"`
	Quantitativo []QuantitativoItem     `json:"quantitativo,omitempty" db:"quantitativo"`
	Secoes       []MutiraoSubSecao      `json:"secoes,omitempty" db:"secoes"`
	Fotos        []Foto                 `json:"fotos,omitempty" db:"fotos"`
	Servicos     []ServicoSub           `json:"servicos,omitempty" db:"servicos"`
	CreatedAt    time.Time              `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time              `json:"updated_at" db:"updated_at"`
}

type CreateRelatorioRequest struct {
	TipoServico  string                 `json:"tipoServico"`
	Title        string                 `json:"title" binding:"required"`
	Data         string                 `json:"data,omitempty"`
	DataInicio   string                 `json:"dataInicio,omitempty"`
	DataTermino  string                 `json:"dataTermino,omitempty"`
	Sub          string                 `json:"sub,omitempty"`
	Local        string                 `json:"local,omitempty"`
	Endereco     string                 `json:"endereco,omitempty"`
	Descricao    string                 `json:"descricao,omitempty"`
	Assunto      string                 `json:"assunto,omitempty"`
	Frequencia   string                 `json:"frequencia,omitempty"`
	Peso         string                 `json:"peso,omitempty"`
	Quantitativo []QuantitativoItem     `json:"quantitativo,omitempty"`
	Secoes       []MutiraoSubSecao      `json:"secoes,omitempty"`
	Fotos        []Foto                 `json:"fotos,omitempty"`
	Servicos     []ServicoSub           `json:"servicos,omitempty"`
}

type UpdateRelatorioRequest struct {
	TipoServico  string                 `json:"tipoServico,omitempty"`
	Title        string                 `json:"title,omitempty"`
	Data         string                 `json:"data,omitempty"`
	DataInicio   string                 `json:"dataInicio,omitempty"`
	DataTermino  string                 `json:"dataTermino,omitempty"`
	Sub          string                 `json:"sub,omitempty"`
	Local        string                 `json:"local,omitempty"`
	Endereco     string                 `json:"endereco,omitempty"`
	Descricao    string                 `json:"descricao,omitempty"`
	Assunto      string                 `json:"assunto,omitempty"`
	Frequencia   string                 `json:"frequencia,omitempty"`
	Peso         string                 `json:"peso,omitempty"`
	Quantitativo []QuantitativoItem     `json:"quantitativo,omitempty"`
	Secoes       []MutiraoSubSecao      `json:"secoes,omitempty"`
	Fotos        []Foto                 `json:"fotos,omitempty"`
	Servicos     []ServicoSub           `json:"servicos,omitempty"`
}

type GeneratePDFRequest struct {
	RelatorioID string `json:"relatorio_id" binding:"required"`
}

type GenerateBatchPDFRequest struct {
	RelatorioIDs []string `json:"relatorio_ids" binding:"required"`
	MesAno       string   `json:"mes_ano,omitempty"`
}
