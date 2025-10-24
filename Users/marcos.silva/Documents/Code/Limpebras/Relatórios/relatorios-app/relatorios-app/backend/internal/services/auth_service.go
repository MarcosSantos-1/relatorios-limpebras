package services

import (
	"database/sql"
	"fmt"
	"time"

	"relatorios-backend/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	db *sql.DB
}

func NewAuthService(db *sql.DB) *AuthService {
	return &AuthService{db: db}
}

func (s *AuthService) Register(req models.RegisterRequest) (*models.User, error) {
	// Verificar se o usuário já existe
	var count int
	err := s.db.QueryRow("SELECT COUNT(*) FROM users WHERE email = $1", req.Email).Scan(&count)
	if err != nil {
		return nil, fmt.Errorf("erro ao verificar usuário existente: %w", err)
	}
	if count > 0 {
		return nil, fmt.Errorf("usuário já existe")
	}

	// Hash da senha
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("erro ao gerar hash da senha: %w", err)
	}

	// Criar usuário
	user := &models.User{
		ID:           uuid.New().String(),
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		Name:         req.Name,
		Role:         "user",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	query := `INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at) 
			  VALUES ($1, $2, $3, $4, $5, $6, $7)`
	
	_, err = s.db.Exec(query, user.ID, user.Email, user.PasswordHash, user.Name, user.Role, user.CreatedAt, user.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("erro ao criar usuário: %w", err)
	}

	return user, nil
}

func (s *AuthService) Login(req models.LoginRequest) (*models.LoginResponse, error) {
	// Buscar usuário
	var user models.User
	query := `SELECT id, email, password_hash, name, role, created_at, updated_at FROM users WHERE email = $1`
	
	err := s.db.QueryRow(query, req.Email).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.Name, &user.Role, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("credenciais inválidas")
		}
		return nil, fmt.Errorf("erro ao buscar usuário: %w", err)
	}

	// Verificar senha
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
	if err != nil {
		return nil, fmt.Errorf("credenciais inválidas")
	}

	// Gerar token JWT
	token, err := s.generateToken(user.ID, user.Email, user.Role)
	if err != nil {
		return nil, fmt.Errorf("erro ao gerar token: %w", err)
	}

	return &models.LoginResponse{
		Token: token,
		User:  user,
	}, nil
}

func (s *AuthService) generateToken(userID, email, role string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"email":   email,
		"role":    role,
		"exp":     time.Now().Add(time.Hour * 24).Unix(), // 24 horas
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	
	secret := "your-secret-key" // Em produção, usar variável de ambiente
	return token.SignedString([]byte(secret))
}

func (s *AuthService) ValidateToken(tokenString string) (*models.User, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de assinatura inválido")
		}
		return []byte("your-secret-key"), nil // Em produção, usar variável de ambiente
	})

	if err != nil {
		return nil, fmt.Errorf("token inválido: %w", err)
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID, ok := claims["user_id"].(string)
		if !ok {
			return nil, fmt.Errorf("user_id inválido no token")
		}

		// Buscar usuário no banco
		var user models.User
		query := `SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = $1`
		
		err := s.db.QueryRow(query, userID).Scan(
			&user.ID, &user.Email, &user.Name, &user.Role, &user.CreatedAt, &user.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("usuário não encontrado: %w", err)
		}

		return &user, nil
	}

	return nil, fmt.Errorf("token inválido")
}
