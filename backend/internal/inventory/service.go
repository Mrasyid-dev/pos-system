package inventory

import (
	"context"
	"database/sql"
	"errors"
	"pos-system/internal/db"

	"github.com/jackc/pgx/v5/pgtype"
)

type Service struct {
	queries *db.Queries
}

func NewService(queries *db.Queries) *Service {
	return &Service{queries: queries}
}

type InventoryResponse struct {
	ID        int32  `json:"id"`
	ProductID int32  `json:"product_id"`
	ProductName string `json:"product_name"`
	SKU       *string `json:"sku"`
	Qty       int32  `json:"qty"`
	Unit      string `json:"unit"`
	UpdatedAt string `json:"updated_at"`
}

type AdjustInventoryRequest struct {
	ProductID int32  `json:"product_id" binding:"required"`
	Delta     int32  `json:"delta" binding:"required"`
	Reason    string `json:"reason"`
}

func (s *Service) GetByProductID(ctx context.Context, productID int32) (*InventoryResponse, error) {
	productIDPg := pgtype.Int4{Int32: productID, Valid: true}
	inv, err := s.queries.GetInventoryByProduct(ctx, productIDPg)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("inventory not found")
		}
		return nil, err
	}

	// Get product info
	product, _ := s.queries.GetProductByID(ctx, productID)
	
	var invProductID int32
	if inv.ProductID.Valid {
		invProductID = inv.ProductID.Int32
	}

	var sku *string
	if product.Sku.Valid {
		sku = &product.Sku.String
	}

	var unit string
	if product.Unit.Valid {
		unit = product.Unit.String
	}

	var updatedAt string
	if inv.UpdatedAt.Valid {
		updatedAt = inv.UpdatedAt.Time.Format("2006-01-02T15:04:05Z07:00")
	}
	
	return &InventoryResponse{
		ID:          inv.ID,
		ProductID:   invProductID,
		ProductName: product.Name,
		SKU:         sku,
		Qty:         inv.Qty,
		Unit:        unit,
		UpdatedAt:   updatedAt,
	}, nil
}

func (s *Service) Adjust(ctx context.Context, req AdjustInventoryRequest) (*InventoryResponse, error) {
	productIDPg := pgtype.Int4{Int32: req.ProductID, Valid: true}
	// Check if inventory exists
	_, err := s.queries.GetInventoryByProduct(ctx, productIDPg)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// Create inventory if it doesn't exist
			_, err = s.queries.CreateInventory(ctx, db.CreateInventoryParams{
				ProductID: productIDPg,
				Qty:       0,
			})
			if err != nil {
				return nil, err
			}
		} else {
			return nil, err
		}
	}

	inv, err := s.queries.AdjustInventoryQty(ctx, db.AdjustInventoryQtyParams{
		ProductID: productIDPg,
		Qty:       req.Delta,
	})
	if err != nil {
		return nil, err
	}

	product, _ := s.queries.GetProductByID(ctx, req.ProductID)
	
	var invProductID int32
	if inv.ProductID.Valid {
		invProductID = inv.ProductID.Int32
	}

	var sku *string
	if product.Sku.Valid {
		sku = &product.Sku.String
	}

	var unit string
	if product.Unit.Valid {
		unit = product.Unit.String
	}

	var updatedAt string
	if inv.UpdatedAt.Valid {
		updatedAt = inv.UpdatedAt.Time.Format("2006-01-02T15:04:05Z07:00")
	}
	
	return &InventoryResponse{
		ID:          inv.ID,
		ProductID:   invProductID,
		ProductName: product.Name,
		SKU:         sku,
		Qty:         inv.Qty,
		Unit:        unit,
		UpdatedAt:   updatedAt,
	}, nil
}

func (s *Service) List(ctx context.Context) ([]InventoryResponse, error) {
	items, err := s.queries.ListInventory(ctx)
	if err != nil {
		return nil, err
	}

	result := make([]InventoryResponse, len(items))
	for i, item := range items {
		var productID int32
		if item.ProductID.Valid {
			productID = item.ProductID.Int32
		}

		var sku *string
		if item.Sku.Valid {
			sku = &item.Sku.String
		}

		var unit string
		if item.Unit.Valid {
			unit = item.Unit.String
		}

		var updatedAt string
		if item.UpdatedAt.Valid {
			updatedAt = item.UpdatedAt.Time.Format("2006-01-02T15:04:05Z07:00")
		}

		result[i] = InventoryResponse{
			ID:          item.ID,
			ProductID:   productID,
			ProductName: item.ProductName,
			SKU:         sku,
			Qty:         item.Qty,
			Unit:        unit,
			UpdatedAt:   updatedAt,
		}
	}

	return result, nil
}

