package report

import (
	"context"
	"fmt"
	"pos-system/internal/db"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

// numericToString converts pgtype.Numeric to string
func numericToString(n pgtype.Numeric) string {
	if !n.Valid {
		return "0"
	}
	val, err := n.Value()
	if err != nil {
		return "0"
	}
	return fmt.Sprintf("%v", val)
}

// numericFromInterface converts interface{} to string (for aggregated results)
func numericFromInterface(v interface{}) string {
	if v == nil {
		return "0"
	}
	if numeric, ok := v.(pgtype.Numeric); ok && numeric.Valid {
		return numericToString(numeric)
	}
	return fmt.Sprintf("%v", v)
}

type Service struct {
	queries *db.Queries
}

func NewService(queries *db.Queries) *Service {
	return &Service{queries: queries}
}

type SalesByDateResponse struct {
	SaleDate         string  `json:"sale_date"`
	TotalTransactions int64   `json:"total_transactions"`
	TotalRevenue      string  `json:"total_revenue"`
}

type TopProductResponse struct {
	ProductID    int32   `json:"product_id"`
	ProductName  string  `json:"product_name"`
	SKU          *string `json:"sku"`
	TotalQtySold int64   `json:"total_qty_sold"`
	TotalRevenue string  `json:"total_revenue"`
}

type PaymentMethodStats struct {
	PaymentMethod    string `json:"payment_method"`
	TransactionCount int64  `json:"transaction_count"`
	TotalAmount      string `json:"total_amount"`
}

type SalesStatsResponse struct {
	TotalSales    int64  `json:"total_sales"`
	TotalRevenue  string `json:"total_revenue"`
	AvgSaleAmount string `json:"avg_sale_amount"`
}

func (s *Service) GetSalesByDate(ctx context.Context, from, to time.Time) ([]SalesByDateResponse, error) {
	fromPg := pgtype.Timestamptz{Time: from, Valid: true}
	toPg := pgtype.Timestamptz{Time: to, Valid: true}
	results, err := s.queries.SalesByDate(ctx, db.SalesByDateParams{
		CreatedAt:   fromPg,
		CreatedAt_2: toPg,
	})
	if err != nil {
		return nil, err
	}

	response := make([]SalesByDateResponse, len(results))
	for i, r := range results {
		var saleDate string
		if r.SaleDate.Valid {
			saleDate = r.SaleDate.Time.Format("2006-01-02")
		}

		var totalRevenue string
		if r.TotalRevenue != nil {
			totalRevenue = numericFromInterface(r.TotalRevenue)
		}

		response[i] = SalesByDateResponse{
			SaleDate:          saleDate,
			TotalTransactions: r.TotalTransactions,
			TotalRevenue:      totalRevenue,
		}
	}

	return response, nil
}

func (s *Service) GetTopProducts(ctx context.Context, from, to time.Time, limit int32) ([]TopProductResponse, error) {
	fromPg := pgtype.Timestamptz{Time: from, Valid: true}
	toPg := pgtype.Timestamptz{Time: to, Valid: true}
	results, err := s.queries.TopProducts(ctx, db.TopProductsParams{
		CreatedAt:   fromPg,
		CreatedAt_2: toPg,
		Limit:       limit,
	})
	if err != nil {
		return nil, err
	}

	response := make([]TopProductResponse, len(results))
	for i, r := range results {
		var sku *string
		if r.Sku.Valid {
			sku = &r.Sku.String
		}

		var totalRevenue string
		if r.TotalRevenue != nil {
			totalRevenue = numericFromInterface(r.TotalRevenue)
		}

		response[i] = TopProductResponse{
			ProductID:    r.ID,
			ProductName:  r.Name,
			SKU:          sku,
			TotalQtySold: r.TotalQtySold,
			TotalRevenue: totalRevenue,
		}
	}

	return response, nil
}

func (s *Service) GetSalesStats(ctx context.Context, from, to time.Time) (*SalesStatsResponse, error) {
	fromPg := pgtype.Timestamptz{Time: from, Valid: true}
	toPg := pgtype.Timestamptz{Time: to, Valid: true}
	stats, err := s.queries.GetSalesStats(ctx, db.GetSalesStatsParams{
		CreatedAt:   fromPg,
		CreatedAt_2: toPg,
	})
	if err != nil {
		return nil, err
	}

	var totalRevenue string
	if stats.TotalRevenue != nil {
		totalRevenue = numericFromInterface(stats.TotalRevenue)
	}

	var avgSaleAmount string
	if stats.AvgSaleAmount != nil {
		avgSaleAmount = numericFromInterface(stats.AvgSaleAmount)
	}

	return &SalesStatsResponse{
		TotalSales:    stats.TotalSales,
		TotalRevenue:  totalRevenue,
		AvgSaleAmount: avgSaleAmount,
	}, nil
}

func (s *Service) GetSalesByPaymentMethod(ctx context.Context, from, to time.Time) ([]PaymentMethodStats, error) {
	fromPg := pgtype.Timestamptz{Time: from, Valid: true}
	toPg := pgtype.Timestamptz{Time: to, Valid: true}
	results, err := s.queries.SalesByPaymentMethod(ctx, db.SalesByPaymentMethodParams{
		CreatedAt:   fromPg,
		CreatedAt_2: toPg,
	})
	if err != nil {
		return nil, err
	}

	response := make([]PaymentMethodStats, len(results))
	for i, r := range results {
		var method string
		if r.PaymentMethod.Valid {
			method = r.PaymentMethod.String
		}

		var totalAmount string
		if r.TotalAmount != nil {
			totalAmount = numericFromInterface(r.TotalAmount)
		}

		response[i] = PaymentMethodStats{
			PaymentMethod:    method,
			TransactionCount: r.TransactionCount,
			TotalAmount:      totalAmount,
		}
	}

	return response, nil
}

