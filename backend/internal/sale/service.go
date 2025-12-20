package sale

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"pos-system/internal/db"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
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

type Service struct {
	queries *db.Queries
	db      *pgxpool.Pool
}

func NewService(queries *db.Queries, db *pgxpool.Pool) *Service {
	return &Service{queries: queries, db: db}
}

type CreateSaleRequest struct {
	Items         []SaleItemRequest `json:"items" binding:"required"`
	PaidAmount    float64           `json:"paid_amount" binding:"required"`
	PaymentMethod string            `json:"payment_method"`
}

type SaleItemRequest struct {
	ProductID int32   `json:"product_id" binding:"required"`
	Qty       int32   `json:"qty" binding:"required"`
	Price     float64 `json:"price" binding:"required"`
	Discount  float64 `json:"discount"`
}

type SaleResponse struct {
	ID            int32              `json:"id"`
	InvoiceNo     string             `json:"invoice_no"`
	UserID        *int32             `json:"user_id"`
	CashierName   *string            `json:"cashier_name"`
	TotalAmount   string             `json:"total_amount"`
	PaidAmount    string             `json:"paid_amount"`
	ChangeAmount  string             `json:"change_amount"`
	PaymentMethod *string            `json:"payment_method"`
	Items         []SaleItemResponse `json:"items"`
	CreatedAt     string             `json:"created_at"`
}

type SaleItemResponse struct {
	ID         int32  `json:"id"`
	ProductID  int32  `json:"product_id"`
	ProductName string `json:"product_name"`
	SKU        *string `json:"sku"`
	Qty        int32  `json:"qty"`
	Price      string `json:"price"`
	Discount   string `json:"discount"`
	Subtotal   string `json:"subtotal"`
}

func (s *Service) Create(ctx context.Context, userID int32, req CreateSaleRequest) (*SaleResponse, error) {
	// Calculate total
	var totalAmount float64
	for _, item := range req.Items {
		subtotal := (item.Price * float64(item.Qty)) - item.Discount
		totalAmount += subtotal
	}

	changeAmount := req.PaidAmount - totalAmount
	if changeAmount < 0 {
		return nil, errors.New("paid amount is less than total amount")
	}

	// Generate invoice number
	invoiceNo := fmt.Sprintf("INV-%s", uuid.New().String()[:8])

	// Start transaction
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	qtx := s.queries.WithTx(tx)

	// Create sale
	userIDPg := pgtype.Int4{Int32: userID, Valid: true}
	
	var totalAmountPg pgtype.Numeric
	if err := totalAmountPg.Scan(strconv.FormatFloat(totalAmount, 'f', 2, 64)); err != nil {
		return nil, err
	}
	
	var paidAmountPg pgtype.Numeric
	if err := paidAmountPg.Scan(strconv.FormatFloat(req.PaidAmount, 'f', 2, 64)); err != nil {
		return nil, err
	}
	
	var changeAmountPg pgtype.Numeric
	if err := changeAmountPg.Scan(strconv.FormatFloat(changeAmount, 'f', 2, 64)); err != nil {
		return nil, err
	}
	
	var paymentMethodPg pgtype.Text
	if req.PaymentMethod != "" {
		paymentMethodPg = pgtype.Text{String: req.PaymentMethod, Valid: true}
	}

	sale, err := qtx.CreateSale(ctx, db.CreateSaleParams{
		InvoiceNo:    invoiceNo,
		UserID:       userIDPg,
		TotalAmount:  totalAmountPg,
		PaidAmount:   paidAmountPg,
		ChangeAmount: changeAmountPg,
		PaymentMethod: paymentMethodPg,
	})
	if err != nil {
		return nil, err
	}

	// Validate stock availability for all items BEFORE creating sale items
	// This ensures atomicity: if any item has insufficient stock, entire sale is rolled back
	for _, item := range req.Items {
		productIDPg := pgtype.Int4{Int32: item.ProductID, Valid: true}
		
		// Get current inventory
		inv, err := qtx.GetInventoryByProduct(ctx, productIDPg)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				// Get product name for better error message
				product, _ := qtx.GetProductByID(ctx, item.ProductID)
				return nil, fmt.Errorf("stock not sufficient for product: %s (inventory not found)", product.Name)
			}
			return nil, fmt.Errorf("failed to check inventory for product %d: %w", item.ProductID, err)
		}

		// Check if stock is sufficient
		if inv.Qty < item.Qty {
			// Get product name for better error message
			product, _ := qtx.GetProductByID(ctx, item.ProductID)
			return nil, fmt.Errorf("stock not sufficient for product: %s (available: %d, requested: %d)", product.Name, inv.Qty, item.Qty)
		}
	}

	// Create sale items and update inventory
	items := make([]SaleItemResponse, len(req.Items))
	for i, item := range req.Items {
		subtotal := (item.Price * float64(item.Qty)) - item.Discount

		saleIDPg := pgtype.Int4{Int32: sale.ID, Valid: true}
		productIDPg := pgtype.Int4{Int32: item.ProductID, Valid: true}
		
		var pricePg pgtype.Numeric
		if err := pricePg.Scan(strconv.FormatFloat(item.Price, 'f', 2, 64)); err != nil {
			return nil, err
		}
		
		var discountPg pgtype.Numeric
		if err := discountPg.Scan(strconv.FormatFloat(item.Discount, 'f', 2, 64)); err != nil {
			return nil, err
		}
		
		var subtotalPg pgtype.Numeric
		if err := subtotalPg.Scan(strconv.FormatFloat(subtotal, 'f', 2, 64)); err != nil {
			return nil, err
		}

		// Create sale item
		saleItem, err := qtx.CreateSaleItem(ctx, db.CreateSaleItemParams{
			SaleID:    saleIDPg,
			ProductID: productIDPg,
			Qty:       item.Qty,
			Price:     pricePg,
			Discount:  discountPg,
			Subtotal:  subtotalPg,
		})
		if err != nil {
			return nil, err
		}

		// Update inventory (decrease)
		_, err = qtx.AdjustInventoryQty(ctx, db.AdjustInventoryQtyParams{
			ProductID: productIDPg,
			Qty:       -item.Qty,
		})
		if err != nil {
			return nil, fmt.Errorf("failed to update inventory for product %d: %w", item.ProductID, err)
		}

		// Get product info
		product, _ := qtx.GetProductByID(ctx, item.ProductID)

		var saleItemProductID int32
		if saleItem.ProductID.Valid {
			saleItemProductID = saleItem.ProductID.Int32
		}

		var sku *string
		if product.Sku.Valid {
			sku = &product.Sku.String
		}

		var priceStr string
		if saleItem.Price.Valid {
			priceStr = numericToString(saleItem.Price)
		}

		var discountStr string
		if saleItem.Discount.Valid {
			discountStr = numericToString(saleItem.Discount)
		}

		var subtotalStr string
		if saleItem.Subtotal.Valid {
			subtotalStr = numericToString(saleItem.Subtotal)
		}

		items[i] = SaleItemResponse{
			ID:          saleItem.ID,
			ProductID:   saleItemProductID,
			ProductName: product.Name,
			SKU:         sku,
			Qty:         saleItem.Qty,
			Price:       priceStr,
			Discount:    discountStr,
			Subtotal:    subtotalStr,
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	// Get sale with cashier name
	saleWithUser, _ := s.queries.GetSaleByID(ctx, sale.ID)
	var cashierName *string
	if saleWithUser.CashierName.Valid {
		cashierName = &saleWithUser.CashierName.String
	}

	var saleUserID *int32
	if saleWithUser.UserID.Valid {
		saleUserID = &saleWithUser.UserID.Int32
	}

	var saleTotalAmount string
	if saleWithUser.TotalAmount.Valid {
		saleTotalAmount = numericToString(saleWithUser.TotalAmount)
	}

	var salePaidAmount string
	if saleWithUser.PaidAmount.Valid {
		salePaidAmount = numericToString(saleWithUser.PaidAmount)
	}

	var saleChangeAmount string
	if saleWithUser.ChangeAmount.Valid {
		saleChangeAmount = numericToString(saleWithUser.ChangeAmount)
	}

	var paymentMethod *string
	if saleWithUser.PaymentMethod.Valid {
		paymentMethod = &saleWithUser.PaymentMethod.String
	}

	var createdAt string
	if saleWithUser.CreatedAt.Valid {
		createdAt = saleWithUser.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00")
	}

	return &SaleResponse{
		ID:            saleWithUser.ID,
		InvoiceNo:     saleWithUser.InvoiceNo,
		UserID:        saleUserID,
		CashierName:   cashierName,
		TotalAmount:   saleTotalAmount,
		PaidAmount:    salePaidAmount,
		ChangeAmount:  saleChangeAmount,
		PaymentMethod: paymentMethod,
		Items:         items,
		CreatedAt:     createdAt,
	}, nil
}

func (s *Service) GetByID(ctx context.Context, id int32) (*SaleResponse, error) {
	sale, err := s.queries.GetSaleByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("sale not found")
		}
		return nil, err
	}

	saleIDPg := pgtype.Int4{Int32: id, Valid: true}
	items, err := s.queries.GetSaleItemsBySaleID(ctx, saleIDPg)
	if err != nil {
		return nil, err
	}

	itemResponses := make([]SaleItemResponse, len(items))
	for i, item := range items {
		var productID int32
		if item.ProductID.Valid {
			productID = item.ProductID.Int32
		}

		var sku *string
		if item.Sku.Valid {
			sku = &item.Sku.String
		}

		var priceStr string
		if item.Price.Valid {
			priceStr = numericToString(item.Price)
		}

		var discountStr string
		if item.Discount.Valid {
			discountStr = numericToString(item.Discount)
		}

		var subtotalStr string
		if item.Subtotal.Valid {
			subtotalStr = numericToString(item.Subtotal)
		}

		itemResponses[i] = SaleItemResponse{
			ID:          item.ID,
			ProductID:   productID,
			ProductName: item.ProductName,
			SKU:         sku,
			Qty:         item.Qty,
			Price:       priceStr,
			Discount:    discountStr,
			Subtotal:    subtotalStr,
		}
	}

	var cashierName *string
	if sale.CashierName.Valid {
		cashierName = &sale.CashierName.String
	}

	var userID *int32
	if sale.UserID.Valid {
		userID = &sale.UserID.Int32
	}

	var totalAmount string
	if sale.TotalAmount.Valid {
		totalAmount = numericToString(sale.TotalAmount)
	}

	var paidAmount string
	if sale.PaidAmount.Valid {
		paidAmount = numericToString(sale.PaidAmount)
	}

	var changeAmount string
	if sale.ChangeAmount.Valid {
		changeAmount = numericToString(sale.ChangeAmount)
	}

	var paymentMethod *string
	if sale.PaymentMethod.Valid {
		paymentMethod = &sale.PaymentMethod.String
	}

	var createdAt string
	if sale.CreatedAt.Valid {
		createdAt = sale.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00")
	}

	return &SaleResponse{
		ID:            sale.ID,
		InvoiceNo:     sale.InvoiceNo,
		UserID:        userID,
		CashierName:   cashierName,
		TotalAmount:   totalAmount,
		PaidAmount:    paidAmount,
		ChangeAmount:  changeAmount,
		PaymentMethod: paymentMethod,
		Items:         itemResponses,
		CreatedAt:     createdAt,
	}, nil
}

func (s *Service) List(ctx context.Context, limit, offset int32) ([]SaleResponse, error) {
	sales, err := s.queries.ListSales(ctx, db.ListSalesParams{
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		return nil, err
	}

	result := make([]SaleResponse, len(sales))
	for i, sale := range sales {
		saleIDPg := pgtype.Int4{Int32: sale.ID, Valid: true}
		items, _ := s.queries.GetSaleItemsBySaleID(ctx, saleIDPg)
		itemResponses := make([]SaleItemResponse, len(items))
		for j, item := range items {
			var productID int32
			if item.ProductID.Valid {
				productID = item.ProductID.Int32
			}

			var sku *string
			if item.Sku.Valid {
				sku = &item.Sku.String
			}

			var priceStr string
			if item.Price.Valid {
				priceStr = numericToString(item.Price)
			}

			var discountStr string
			if item.Discount.Valid {
				discountStr = numericToString(item.Discount)
			}

			var subtotalStr string
			if item.Subtotal.Valid {
				subtotalStr = numericToString(item.Subtotal)
			}

			itemResponses[j] = SaleItemResponse{
				ID:          item.ID,
				ProductID:   productID,
				ProductName: item.ProductName,
				SKU:         sku,
				Qty:         item.Qty,
				Price:       priceStr,
				Discount:    discountStr,
				Subtotal:    subtotalStr,
			}
		}

		var cashierName *string
		if sale.CashierName.Valid {
			cashierName = &sale.CashierName.String
		}

		var userID *int32
		if sale.UserID.Valid {
			userID = &sale.UserID.Int32
		}

		var saleTotalAmount string
		if sale.TotalAmount.Valid {
			saleTotalAmount = numericToString(sale.TotalAmount)
		}

		var salePaidAmount string
		if sale.PaidAmount.Valid {
			salePaidAmount = numericToString(sale.PaidAmount)
		}

		var saleChangeAmount string
		if sale.ChangeAmount.Valid {
			saleChangeAmount = numericToString(sale.ChangeAmount)
		}

		var paymentMethod *string
		if sale.PaymentMethod.Valid {
			paymentMethod = &sale.PaymentMethod.String
		}

		var createdAt string
		if sale.CreatedAt.Valid {
			createdAt = sale.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00")
		}

		result[i] = SaleResponse{
			ID:            sale.ID,
			InvoiceNo:     sale.InvoiceNo,
			UserID:        userID,
			CashierName:   cashierName,
			TotalAmount:   saleTotalAmount,
			PaidAmount:    salePaidAmount,
			ChangeAmount:  saleChangeAmount,
			PaymentMethod: paymentMethod,
			Items:         itemResponses,
			CreatedAt:     createdAt,
		}
	}

	return result, nil
}

func (s *Service) ListByDateRange(ctx context.Context, from, to time.Time) ([]SaleResponse, error) {
	fromPg := pgtype.Timestamptz{Time: from, Valid: true}
	toPg := pgtype.Timestamptz{Time: to, Valid: true}
	sales, err := s.queries.ListSalesByDateRange(ctx, db.ListSalesByDateRangeParams{
		CreatedAt:   fromPg,
		CreatedAt_2: toPg,
	})
	if err != nil {
		return nil, err
	}

	result := make([]SaleResponse, len(sales))
	for i, sale := range sales {
		saleIDPg := pgtype.Int4{Int32: sale.ID, Valid: true}
		items, _ := s.queries.GetSaleItemsBySaleID(ctx, saleIDPg)
		itemResponses := make([]SaleItemResponse, len(items))
		for j, item := range items {
			var productID int32
			if item.ProductID.Valid {
				productID = item.ProductID.Int32
			}
			
			var sku *string
			if item.Sku.Valid {
				sku = &item.Sku.String
			}

			var priceStr string
			if item.Price.Valid {
				priceStr = numericToString(item.Price)
			}

			var discountStr string
			if item.Discount.Valid {
				discountStr = numericToString(item.Discount)
			}

			var subtotalStr string
			if item.Subtotal.Valid {
				subtotalStr = numericToString(item.Subtotal)
			}

			itemResponses[j] = SaleItemResponse{
				ID:          item.ID,
				ProductID:   productID,
				ProductName: item.ProductName,
				SKU:         sku,
				Qty:         item.Qty,
				Price:       priceStr,
				Discount:    discountStr,
				Subtotal:    subtotalStr,
			}
		}

		var cashierName *string
		if sale.CashierName.Valid {
			cashierName = &sale.CashierName.String
		}

		var saleUserID *int32
		if sale.UserID.Valid {
			saleUserID = &sale.UserID.Int32
		}

		var saleTotalAmount string
		if sale.TotalAmount.Valid {
			saleTotalAmount = numericToString(sale.TotalAmount)
		}

		var salePaidAmount string
		if sale.PaidAmount.Valid {
			salePaidAmount = numericToString(sale.PaidAmount)
		}

		var saleChangeAmount string
		if sale.ChangeAmount.Valid {
			saleChangeAmount = numericToString(sale.ChangeAmount)
		}

		var paymentMethod *string
		if sale.PaymentMethod.Valid {
			paymentMethod = &sale.PaymentMethod.String
		}

		var createdAt string
		if sale.CreatedAt.Valid {
			createdAt = sale.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00")
		}

		result[i] = SaleResponse{
			ID:            sale.ID,
			InvoiceNo:     sale.InvoiceNo,
			UserID:        saleUserID,
			CashierName:   cashierName,
			TotalAmount:   saleTotalAmount,
			PaidAmount:    salePaidAmount,
			ChangeAmount:  saleChangeAmount,
			PaymentMethod: paymentMethod,
			Items:         itemResponses,
			CreatedAt:     createdAt,
		}
	}

	return result, nil
}

