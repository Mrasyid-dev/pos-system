package category

import (
	"context"
	"database/sql"
	"errors"
	"pos-system/internal/db"
)

type Service struct {
	queries *db.Queries
}

func NewService(queries *db.Queries) *Service {
	return &Service{queries: queries}
}

type CreateCategoryRequest struct {
	Name string `json:"name" binding:"required"`
}

type UpdateCategoryRequest struct {
	Name string `json:"name" binding:"required"`
}

type CategoryResponse struct {
	ID        int32  `json:"id"`
	Name      string `json:"name"`
	CreatedAt string `json:"created_at"`
}

func (s *Service) List(ctx context.Context) ([]CategoryResponse, error) {
	categories, err := s.queries.ListCategories(ctx)
	if err != nil {
		return nil, err
	}

	result := make([]CategoryResponse, len(categories))
	for i, cat := range categories {
		var createdAt string
		if cat.CreatedAt.Valid {
			createdAt = cat.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00")
		}
		result[i] = CategoryResponse{
			ID:        cat.ID,
			Name:      cat.Name,
			CreatedAt: createdAt,
		}
	}

	return result, nil
}

func (s *Service) Create(ctx context.Context, req CreateCategoryRequest) (*CategoryResponse, error) {
	// Validate name is not empty
	if req.Name == "" {
		return nil, errors.New("category name is required")
	}

	category, err := s.queries.CreateCategory(ctx, req.Name)
	if err != nil {
		return nil, err
	}

	var createdAt string
	if category.CreatedAt.Valid {
		createdAt = category.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00")
	}

	return &CategoryResponse{
		ID:        category.ID,
		Name:      category.Name,
		CreatedAt: createdAt,
	}, nil
}

func (s *Service) Update(ctx context.Context, id int32, req UpdateCategoryRequest) (*CategoryResponse, error) {
	// Validate name is not empty
	if req.Name == "" {
		return nil, errors.New("category name is required")
	}

	// Check if category exists
	_, err := s.queries.GetCategoryByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("category not found")
		}
		return nil, err
	}

	category, err := s.queries.UpdateCategory(ctx, db.UpdateCategoryParams{
		ID:   id,
		Name: req.Name,
	})
	if err != nil {
		return nil, err
	}

	var createdAt string
	if category.CreatedAt.Valid {
		createdAt = category.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00")
	}

	return &CategoryResponse{
		ID:        category.ID,
		Name:      category.Name,
		CreatedAt: createdAt,
	}, nil
}

func (s *Service) Delete(ctx context.Context, id int32) error {
	// Check if category exists
	_, err := s.queries.GetCategoryByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return errors.New("category not found")
		}
		return err
	}

	// Delete category (products.category_id will be set to NULL automatically by ON DELETE SET NULL)
	return s.queries.DeleteCategory(ctx, id)
}

