package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"relatorios-backend/internal/models"
	"relatorios-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type RelatorioHandler struct {
	relatorioService *services.RelatorioService
	pdfService       *services.PDFService
}

func NewRelatorioHandler(relatorioService *services.RelatorioService, pdfService *services.PDFService) *RelatorioHandler {
	return &RelatorioHandler{
		relatorioService: relatorioService,
		pdfService:       pdfService,
	}
}

func (h *RelatorioHandler) GetRelatorios(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	// Retornar todos os relatórios, não apenas os do usuário
	relatorios, err := h.relatorioService.GetAllRelatorios()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"relatorios": relatorios})
}

func (h *RelatorioHandler) GetRelatorio(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID do relatório é obrigatório"})
		return
	}

	relatorio, err := h.relatorioService.GetRelatorio(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, relatorio)
}

func (h *RelatorioHandler) CreateRelatorio(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	var req models.CreateRelatorioRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao processar dados: " + err.Error()})
		return
	}

	// Log para debug
	fmt.Printf("Criando relatório para usuário %s: %+v\n", userID, req)

	relatorio, err := h.relatorioService.CreateRelatorio(userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar relatório: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, relatorio)
}

func (h *RelatorioHandler) UpdateRelatorio(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID do relatório é obrigatório"})
		return
	}

	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	var req models.UpdateRelatorioRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	relatorio, err := h.relatorioService.UpdateRelatorio(id, userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, relatorio)
}

func (h *RelatorioHandler) DeleteRelatorio(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID do relatório é obrigatório"})
		return
	}

	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	err := h.relatorioService.DeleteRelatorio(id, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Relatório deletado com sucesso"})
}

func (h *RelatorioHandler) GeneratePDF(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID do relatório é obrigatório"})
		return
	}

	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	// Buscar relatório
	relatorio, err := h.relatorioService.GetRelatorio(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Removida verificação de propriedade - todos podem gerar PDF de qualquer relatório

	// Gerar PDF
	pdfBytes, err := h.pdfService.GeneratePDF(relatorio)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar PDF: " + err.Error()})
		return
	}

	// Definir headers para download
	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", "attachment; filename=relatorio_"+id+".pdf")
	c.Header("Content-Length", strconv.Itoa(len(pdfBytes)))

	c.Data(http.StatusOK, "application/pdf", pdfBytes)
}

func (h *RelatorioHandler) GenerateBatchPDF(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	var req models.GenerateBatchPDFRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Por enquanto, retornar erro pois batch PDF é mais complexo
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Geração de PDF em lote ainda não implementada"})
}
