package middleware

import (
	"net/http"
	"strings"

	"relatorios-backend/internal/services"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(authService *services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token de autorização não fornecido"})
			c.Abort()
			return
		}

		// Verificar se o header começa com "Bearer "
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Formato de token inválido"})
			c.Abort()
			return
		}

		// Validar token
		user, err := authService.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
			c.Abort()
			return
		}

		// Adicionar informações do usuário ao contexto
		c.Set("user_id", user.ID)
		c.Set("user_email", user.Email)
		c.Set("user_role", user.Role)

		c.Next()
	}
}
