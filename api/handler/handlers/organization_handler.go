package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/kickplate/api/handler/middleware"
	"github.com/kickplate/api/lib"
	"github.com/kickplate/api/model"
	"github.com/kickplate/api/repository"
	organizationservice "github.com/kickplate/api/service/organization"
)

type OrganizationHandler struct {
	orgs   organizationservice.OrganizationService
	users  repository.UserRepository
	logger lib.Logger
}

func NewOrganizationHandler(orgs organizationservice.OrganizationService, users repository.UserRepository, logger lib.Logger) OrganizationHandler {
	return OrganizationHandler{orgs: orgs, users: users, logger: logger}
}

type orgOwnerInfo struct {
	ID          string  `json:"id"`
	Username    *string `json:"username,omitempty"`
	DisplayName *string `json:"display_name,omitempty"`
	AvatarURL   *string `json:"avatar_url,omitempty"`
}

type orgResponse struct {
	ID          uuid.UUID     `json:"id"`
	Name        string        `json:"name"`
	Description string        `json:"description"`
	LogoURL     *string       `json:"logo_url,omitempty"`
	OwnerID     uuid.UUID     `json:"owner_id"`
	Owner       *orgOwnerInfo `json:"owner,omitempty"`
	CreatedAt   interface{}   `json:"created_at"`
	UpdatedAt   interface{}   `json:"updated_at"`
}

func (h OrganizationHandler) enrichOrg(ctx context.Context, org *model.Organization) orgResponse {
	resp := orgResponse{
		ID:          org.ID,
		Name:        org.Name,
		Description: org.Description,
		LogoURL:     org.LogoURL,
		OwnerID:     org.OwnerID,
		CreatedAt:   org.CreatedAt,
		UpdatedAt:   org.UpdatedAt,
	}
	if org.Owner != nil {
		info := &orgOwnerInfo{
			ID:          org.Owner.ID.String(),
			DisplayName: org.Owner.DisplayName,
			AvatarURL:   org.Owner.AvatarURL,
		}
		if org.Owner.UserID != nil {
			user, _ := h.users.GetByID(ctx, *org.Owner.UserID)
			if user != nil {
				info.Username = &user.Username
				if user.AvatarURL != nil {
					info.AvatarURL = user.AvatarURL
				}
			}
		}
		resp.Owner = info
	}
	return resp
}

func (h OrganizationHandler) Create(w http.ResponseWriter, r *http.Request) {
	accountID, ok := middleware.GetAccountID(r.Context())
	if !ok {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var input organizationservice.CreateOrganizationInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	org, err := h.orgs.Create(r.Context(), input, accountID)
	if err != nil {
		respondServiceError(w, err)
		return
	}

	respondJSON(w, http.StatusCreated, org)
}

func (h OrganizationHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid organization id")
		return
	}

	org, err := h.orgs.GetByID(r.Context(), id)
	if err != nil {
		respondServiceError(w, err)
		return
	}

	respondJSON(w, http.StatusOK, h.enrichOrg(r.Context(), org))
}

func (h OrganizationHandler) GetByName(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	if name == "" {
		respondError(w, http.StatusBadRequest, "invalid organization name")
		return
	}

	org, err := h.orgs.GetByName(r.Context(), name)
	if err != nil {
		respondServiceError(w, err)
		return
	}

	respondJSON(w, http.StatusOK, h.enrichOrg(r.Context(), org))
}

func (h OrganizationHandler) ListMine(w http.ResponseWriter, r *http.Request) {
	accountID, ok := middleware.GetAccountID(r.Context())
	if !ok {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	orgs, err := h.orgs.ListByOwner(r.Context(), accountID)
	if err != nil {
		respondServiceError(w, err)
		return
	}

	result := make([]orgResponse, len(orgs))
	for i, org := range orgs {
		result[i] = h.enrichOrg(r.Context(), org)
	}

	respondJSON(w, http.StatusOK, result)
}

func (h OrganizationHandler) ListPublic(w http.ResponseWriter, r *http.Request) {
	limit := 20
	offset := 0

	if l := r.URL.Query().Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	if o := r.URL.Query().Get("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	orgs, total, err := h.orgs.ListPublic(r.Context(), limit, offset)
	if err != nil {
		respondServiceError(w, err)
		return
	}

	result := make([]orgResponse, len(orgs))
	for i, org := range orgs {
		result[i] = h.enrichOrg(r.Context(), org)
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"organizations": result,
		"total":         total,
		"limit":         limit,
		"offset":        offset,
	})
}

func (h OrganizationHandler) Update(w http.ResponseWriter, r *http.Request) {
	accountID, ok := middleware.GetAccountID(r.Context())
	if !ok {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid organization id")
		return
	}

	var input organizationservice.UpdateOrganizationInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	org, err := h.orgs.Update(r.Context(), id, input, accountID)
	if err != nil {
		respondServiceError(w, err)
		return
	}

	respondJSON(w, http.StatusOK, org)
}

func (h OrganizationHandler) Delete(w http.ResponseWriter, r *http.Request) {
	accountID, ok := middleware.GetAccountID(r.Context())
	if !ok {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid organization id")
		return
	}

	if err := h.orgs.Delete(r.Context(), id, accountID); err != nil {
		respondServiceError(w, err)
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "organization deleted"})
}
