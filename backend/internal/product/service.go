package product

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"pos-system/internal/db"
	"strconv"
	"strings"

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

type CreateProductRequest struct {
	SKU         string  `json:"sku"`
	Name        string  `json:"name" binding:"required"`
	CategoryID  *int32  `json:"category_id"`
	Price       float64 `json:"price" binding:"required"`
	CostPrice   *float64 `json:"cost_price"`
	Unit        string  `json:"unit"`
	InitialStock *int32  `json:"initial_stock"`
}

type UpdateProductRequest struct {
	SKU        string  `json:"sku"`
	Name       string  `json:"name" binding:"required"`
	CategoryID *int32  `json:"category_id"`
	Price      float64 `json:"price" binding:"required"`
	CostPrice  *float64 `json:"cost_price"`
	Unit       string  `json:"unit"`
}

type ProductResponse struct {
	ID           int32   `json:"id"`
	SKU          *string `json:"sku"`
	Name         string  `json:"name"`
	CategoryID   *int32  `json:"category_id"`
	CategoryName *string `json:"category_name"`
	Price        string  `json:"price"`
	CostPrice    *string `json:"cost_price"`
	Unit         string  `json:"unit"`
	CreatedAt    string  `json:"created_at"`
}

func (s *Service) Create(ctx context.Context, req CreateProductRequest) (*ProductResponse, error) {
	var sku *string
	if req.SKU != "" {
		sku = &req.SKU
	}

	price := strconv.FormatFloat(req.Price, 'f', 2, 64)
	var costPrice *string
	if req.CostPrice != nil {
		cp := strconv.FormatFloat(*req.CostPrice, 'f', 2, 64)
		costPrice = &cp
	}

	unit := req.Unit
	if unit == "" {
		unit = "pcs"
	}

	var skuPg pgtype.Text
	if sku != nil {
		skuPg = pgtype.Text{String: *sku, Valid: true}
	}

	var categoryIDPg pgtype.Int4
	if req.CategoryID != nil {
		// Validate that category exists
		_, err := s.queries.GetCategoryByID(ctx, *req.CategoryID)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				return nil, errors.New("category not found")
			}
			return nil, fmt.Errorf("failed to validate category: %w", err)
		}
		categoryIDPg = pgtype.Int4{Int32: *req.CategoryID, Valid: true}
	}

	var pricePg pgtype.Numeric
	if err := pricePg.Scan(price); err != nil {
		return nil, err
	}

	var costPricePg pgtype.Numeric
	if costPrice != nil {
		if err := costPricePg.Scan(*costPrice); err != nil {
			return nil, err
		}
	}

	unitPg := pgtype.Text{String: unit, Valid: true}

	// If initial_stock is provided, use transaction to create product and inventory atomically
	if req.InitialStock != nil && *req.InitialStock > 0 {
		// Start transaction
		tx, err := s.db.Begin(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to start transaction: %w", err)
		}
		defer tx.Rollback(ctx)

		qtx := s.queries.WithTx(tx)

		// Create product
		product, err := qtx.CreateProduct(ctx, db.CreateProductParams{
			Sku:        skuPg,
			Name:       req.Name,
			CategoryID: categoryIDPg,
			Price:      pricePg,
			CostPrice:  costPricePg,
			Unit:       unitPg,
		})
		if err != nil {
			return nil, fmt.Errorf("failed to create product: %w", err)
		}

		// Create inventory with initial stock
		productIDPg := pgtype.Int4{Int32: product.ID, Valid: true}
		_, err = qtx.CreateInventory(ctx, db.CreateInventoryParams{
			ProductID: productIDPg,
			Qty:       *req.InitialStock,
		})
		if err != nil {
			// Check if it's a duplicate inventory error (UNIQUE constraint)
			// Note: This should not happen in normal flow since we're creating a new product,
			// but we handle it for safety and to provide a clear error message
			errMsg := err.Error()
			if strings.Contains(errMsg, "duplicate key") && strings.Contains(errMsg, "inventory_product_id_key") {
				return nil, errors.New("inventory already exists for this product")
			}
			return nil, fmt.Errorf("failed to create inventory: %w", err)
		}

		// Commit transaction
		if err := tx.Commit(ctx); err != nil {
			return nil, fmt.Errorf("failed to commit transaction: %w", err)
		}

		// Fetch product with category name
		productWithCat, _ := s.queries.GetProductByID(ctx, product.ID)
		var categoryName *string
		if productWithCat.CategoryName.Valid {
			categoryName = &productWithCat.CategoryName.String
		}

		return s.toResponseFromProduct(&product, categoryName), nil
	}

	// No initial stock, create product only (backward compatible)
	product, err := s.queries.CreateProduct(ctx, db.CreateProductParams{
		Sku:        skuPg,
		Name:       req.Name,
		CategoryID: categoryIDPg,
		Price:      pricePg,
		CostPrice:  costPricePg,
		Unit:       unitPg,
	})
	if err != nil {
		return nil, err
	}

	// Fetch with category name
	productWithCat, _ := s.queries.GetProductByID(ctx, product.ID)
	var categoryName *string
	if productWithCat.CategoryName.Valid {
		categoryName = &productWithCat.CategoryName.String
	}

	return s.toResponseFromProduct(&product, categoryName), nil
}

func (s *Service) GetByID(ctx context.Context, id int32) (*ProductResponse, error) {
	product, err := s.queries.GetProductByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("product not found")
		}
		return nil, err
	}

	var categoryName *string
	if product.CategoryName.Valid {
		categoryName = &product.CategoryName.String
	}

	return s.toResponseFromRow(&product, categoryName), nil
}

func (s *Service) List(ctx context.Context) ([]ProductResponse, error) {
	products, err := s.queries.ListProducts(ctx)
	if err != nil {
		return nil, err
	}

	result := make([]ProductResponse, len(products))
	for i, p := range products {
		var categoryName *string
		if p.CategoryName.Valid {
			categoryName = &p.CategoryName.String
		}
		result[i] = *s.toResponseFromRow(&p, categoryName)
	}

	return result, nil
}

func (s *Service) Search(ctx context.Context, query string) ([]ProductResponse, error) {
	queryPg := pgtype.Text{String: query, Valid: true}
	products, err := s.queries.SearchProducts(ctx, queryPg)
	if err != nil {
		return nil, err
	}

	result := make([]ProductResponse, len(products))
	for i, p := range products {
		var categoryName *string
		if p.CategoryName.Valid {
			categoryName = &p.CategoryName.String
		}
		result[i] = *s.toResponseFromRow(&p, categoryName)
	}

	return result, nil
}

func (s *Service) Update(ctx context.Context, id int32, req UpdateProductRequest) (*ProductResponse, error) {
	var sku *string
	if req.SKU != "" {
		sku = &req.SKU
	}

	price := strconv.FormatFloat(req.Price, 'f', 2, 64)
	var costPrice *string
	if req.CostPrice != nil {
		cp := strconv.FormatFloat(*req.CostPrice, 'f', 2, 64)
		costPrice = &cp
	}

	unit := req.Unit
	if unit == "" {
		unit = "pcs"
	}

	var skuPg pgtype.Text
	if sku != nil {
		skuPg = pgtype.Text{String: *sku, Valid: true}
	}

	var categoryIDPg pgtype.Int4
	if req.CategoryID != nil {
		// Validate that category exists
		_, err := s.queries.GetCategoryByID(ctx, *req.CategoryID)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				return nil, errors.New("category not found")
			}
			return nil, fmt.Errorf("failed to validate category: %w", err)
		}
		categoryIDPg = pgtype.Int4{Int32: *req.CategoryID, Valid: true}
	}

	var pricePg pgtype.Numeric
	if err := pricePg.Scan(price); err != nil {
		return nil, err
	}

	var costPricePg pgtype.Numeric
	if costPrice != nil {
		if err := costPricePg.Scan(*costPrice); err != nil {
			return nil, err
		}
	}

	unitPg := pgtype.Text{String: unit, Valid: true}

	product, err := s.queries.UpdateProduct(ctx, db.UpdateProductParams{
		ID:         id,
		Sku:        skuPg,
		Name:       req.Name,
		CategoryID: categoryIDPg,
		Price:      pricePg,
		CostPrice:  costPricePg,
		Unit:       unitPg,
	})
	if err != nil {
		return nil, err
	}

	// Fetch with category name
	productWithCat, _ := s.queries.GetProductByID(ctx, id)
	var categoryName *string
	if productWithCat.CategoryName.Valid {
		categoryName = &productWithCat.CategoryName.String
	}

	return s.toResponseFromProduct(&product, categoryName), nil
}

func (s *Service) Delete(ctx context.Context, id int32) error {
	return s.queries.DeleteProduct(ctx, id)
}

func (s *Service) toResponseFromProduct(p *db.Product, categoryName *string) *ProductResponse {
	var sku *string
	if p.Sku.Valid {
		sku = &p.Sku.String
	}

	var categoryID *int32
	if p.CategoryID.Valid {
		categoryID = &p.CategoryID.Int32
	}

	var price string
	if p.Price.Valid {
		price = numericToString(p.Price)
	}

	var costPrice *string
	if p.CostPrice.Valid {
		cp := numericToString(p.CostPrice)
		costPrice = &cp
	}

	var unit string
	if p.Unit.Valid {
		unit = p.Unit.String
	}

	var createdAt string
	if p.CreatedAt.Valid {
		createdAt = p.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00")
	}

	return &ProductResponse{
		ID:           p.ID,
		SKU:          sku,
		Name:         p.Name,
		CategoryID:   categoryID,
		CategoryName: categoryName,
		Price:        price,
		CostPrice:    costPrice,
		Unit:         unit,
		CreatedAt:    createdAt,
	}
}

func (s *Service) toResponseFromRow(p interface{}, categoryName *string) *ProductResponse {
	switch row := p.(type) {
	case *db.GetProductByIDRow:
		return s.toResponseFromGetProductByIDRow(row, categoryName)
	case *db.ListProductsRow:
		return s.toResponseFromListProductsRow(row, categoryName)
	case *db.SearchProductsRow:
		return s.toResponseFromSearchProductsRow(row, categoryName)
	default:
		return nil
	}
}

func (s *Service) toResponseFromGetProductByIDRow(p *db.GetProductByIDRow, categoryName *string) *ProductResponse {
	var sku *string
	if p.Sku.Valid {
		sku = &p.Sku.String
	}

	var categoryID *int32
	if p.CategoryID.Valid {
		categoryID = &p.CategoryID.Int32
	}

	var price string
	if p.Price.Valid {
		price = numericToString(p.Price)
	}

	var costPrice *string
	if p.CostPrice.Valid {
		cp := numericToString(p.CostPrice)
		costPrice = &cp
	}

	var unit string
	if p.Unit.Valid {
		unit = p.Unit.String
	}

	var createdAt string
	if p.CreatedAt.Valid {
		createdAt = p.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00")
	}

	return &ProductResponse{
		ID:           p.ID,
		SKU:          sku,
		Name:         p.Name,
		CategoryID:   categoryID,
		CategoryName: categoryName,
		Price:        price,
		CostPrice:    costPrice,
		Unit:         unit,
		CreatedAt:    createdAt,
	}
}

func (s *Service) toResponseFromListProductsRow(p *db.ListProductsRow, categoryName *string) *ProductResponse {
	var sku *string
	if p.Sku.Valid {
		sku = &p.Sku.String
	}

	var categoryID *int32
	if p.CategoryID.Valid {
		categoryID = &p.CategoryID.Int32
	}

	var price string
	if p.Price.Valid {
		price = numericToString(p.Price)
	}

	var costPrice *string
	if p.CostPrice.Valid {
		cp := numericToString(p.CostPrice)
		costPrice = &cp
	}

	var unit string
	if p.Unit.Valid {
		unit = p.Unit.String
	}

	var createdAt string
	if p.CreatedAt.Valid {
		createdAt = p.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00")
	}

	return &ProductResponse{
		ID:           p.ID,
		SKU:          sku,
		Name:         p.Name,
		CategoryID:   categoryID,
		CategoryName: categoryName,
		Price:        price,
		CostPrice:    costPrice,
		Unit:         unit,
		CreatedAt:    createdAt,
	}
}

func (s *Service) toResponseFromSearchProductsRow(p *db.SearchProductsRow, categoryName *string) *ProductResponse {
	var sku *string
	if p.Sku.Valid {
		sku = &p.Sku.String
	}

	var categoryID *int32
	if p.CategoryID.Valid {
		categoryID = &p.CategoryID.Int32
	}

	var price string
	if p.Price.Valid {
		price = numericToString(p.Price)
	}

	var costPrice *string
	if p.CostPrice.Valid {
		cp := numericToString(p.CostPrice)
		costPrice = &cp
	}

	var unit string
	if p.Unit.Valid {
		unit = p.Unit.String
	}

	var createdAt string
	if p.CreatedAt.Valid {
		createdAt = p.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00")
	}

	return &ProductResponse{
		ID:           p.ID,
		SKU:          sku,
		Name:         p.Name,
		CategoryID:   categoryID,
		CategoryName: categoryName,
		Price:        price,
		CostPrice:    costPrice,
		Unit:         unit,
		CreatedAt:    createdAt,
	}
}

