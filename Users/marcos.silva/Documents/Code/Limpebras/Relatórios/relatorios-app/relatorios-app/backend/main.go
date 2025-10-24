package main

import (
	"log"
	"os"

	"relatorios-backend/internal/config"
	"relatorios-backend/internal/database"
	"relatorios-backend/internal/handlers"
	"relatorios-backend/internal/middleware"
	"relatorios-backend/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
)

func main() {
	// Carregar variáveis de ambiente
	if err := config.LoadEnv(); err != nil {
		log.Fatal("Erro ao carregar variáveis de ambiente:", err)
	}

	// Conectar ao banco de dados
	db, err := database.Connect()
	if err != nil {
		log.Fatal("Erro ao conectar ao banco de dados:", err)
	}
	defer db.Close()

	// Executar migrações
	if err := database.Migrate(db); err != nil {
		log.Fatal("Erro ao executar migrações:", err)
	}

	// Configurar Gin
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	// Configurar CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "https://your-frontend-domain.com"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Inicializar serviços
	authService := services.NewAuthService(db)
	pdfService := services.NewPDFService()
	relatorioService := services.NewRelatorioService(db)

	// Inicializar handlers
	authHandler := handlers.NewAuthHandler(authService)
	relatorioHandler := handlers.NewRelatorioHandler(relatorioService, pdfService)

	// Rotas públicas
	router.POST("/api/auth/login", authHandler.Login)
	router.POST("/api/auth/register", authHandler.Register)
	router.POST("/api/auth/logout", authHandler.Logout)

	// Rotas protegidas
	protected := router.Group("/api")
	protected.Use(middleware.AuthMiddleware(authService))
	{
		// Relatórios
		protected.GET("/relatorios", relatorioHandler.GetRelatorios)
		protected.GET("/relatorios/:id", relatorioHandler.GetRelatorio)
		protected.POST("/relatorios", relatorioHandler.CreateRelatorio)
		protected.PUT("/relatorios/:id", relatorioHandler.UpdateRelatorio)
		protected.DELETE("/relatorios/:id", relatorioHandler.DeleteRelatorio)
		
		// Geração de PDF
		protected.POST("/relatorios/:id/pdf", relatorioHandler.GeneratePDF)
		protected.POST("/relatorios/pdf/batch", relatorioHandler.GenerateBatchPDF)
	}

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Servidor iniciado na porta %s", port)
	log.Fatal(router.Run(":" + port))
}
