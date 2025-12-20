package category

import (
	"context"
	"pos-system/internal/db"
)

type Service struct {
	queries *db.Queries
}

func NewService(queries *db.Queries) *Service {
	return &Service{queries: queries}
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

