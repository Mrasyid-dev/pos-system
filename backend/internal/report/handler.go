package report

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) GetSales(c *gin.Context) {
	fromStr := c.Query("from")
	toStr := c.Query("to")

	if fromStr == "" || toStr == "" {
		// Default to last 30 days
		to := time.Now()
		from := to.AddDate(0, 0, -30)
		fromStr = from.Format("2006-01-02")
		toStr = to.Format("2006-01-02")
	}

	from, err := time.Parse("2006-01-02", fromStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid 'from' date format (use YYYY-MM-DD)"})
		return
	}

	to, err := time.Parse("2006-01-02", toStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid 'to' date format (use YYYY-MM-DD)"})
		return
	}

	// Set to end of day
	to = to.Add(23*time.Hour + 59*time.Minute + 59*time.Second)

	results, err := h.service.GetSalesByDate(c.Request.Context(), from, to)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, results)
}

func (h *Handler) GetTopProducts(c *gin.Context) {
	fromStr := c.Query("from")
	toStr := c.Query("to")
	limitStr := c.DefaultQuery("limit", "10")

	if fromStr == "" || toStr == "" {
		to := time.Now()
		from := to.AddDate(0, 0, -30)
		fromStr = from.Format("2006-01-02")
		toStr = to.Format("2006-01-02")
	}

	from, err := time.Parse("2006-01-02", fromStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid 'from' date format"})
		return
	}

	to, err := time.Parse("2006-01-02", toStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid 'to' date format"})
		return
	}

	to = to.Add(23*time.Hour + 59*time.Minute + 59*time.Second)

	limit, _ := strconv.ParseInt(limitStr, 10, 32)

	results, err := h.service.GetTopProducts(c.Request.Context(), from, to, int32(limit))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, results)
}

func (h *Handler) GetStats(c *gin.Context) {
	fromStr := c.Query("from")
	toStr := c.Query("to")

	if fromStr == "" || toStr == "" {
		to := time.Now()
		from := to.AddDate(0, 0, -30)
		fromStr = from.Format("2006-01-02")
		toStr = to.Format("2006-01-02")
	}

	from, err := time.Parse("2006-01-02", fromStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid 'from' date format"})
		return
	}

	to, err := time.Parse("2006-01-02", toStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid 'to' date format"})
		return
	}

	to = to.Add(23*time.Hour + 59*time.Minute + 59*time.Second)

	stats, err := h.service.GetSalesStats(c.Request.Context(), from, to)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

