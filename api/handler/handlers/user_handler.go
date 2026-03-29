package handlers

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/kickplate/api/lib"
	"github.com/kickplate/api/repository"
)

type UserHandler struct {
	users    repository.UserRepository
	accounts repository.AccountRepository
	orgs     repository.OrganizationRepository
	logger   lib.Logger
}

func NewUserHandler(
	users repository.UserRepository,
	accounts repository.AccountRepository,
	orgs repository.OrganizationRepository,
	logger lib.Logger,
) UserHandler {
	return UserHandler{users: users, accounts: accounts, orgs: orgs, logger: logger}
}

func (h UserHandler) GetByUsername(w http.ResponseWriter, r *http.Request) {
	username := chi.URLParam(r, "username")
	if username == "" {
		respondError(w, http.StatusBadRequest, "username is required")
		return
	}

	user, err := h.users.GetByUsername(r.Context(), username)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "internal error")
		return
	}
	if user == nil {
		respondError(w, http.StatusNotFound, "user not found")
		return
	}

	account, err := h.accounts.GetByUserID(r.Context(), user.ID)
	if err != nil || account == nil {
		respondError(w, http.StatusNotFound, "user not found")
		return
	}

	orgs, err := h.orgs.ListByOwner(r.Context(), account.ID)
	if err != nil {
		orgs = nil
	}

	type ownerInfo struct {
		ID          string  `json:"id"`
		Username    *string `json:"username,omitempty"`
		DisplayName *string `json:"display_name,omitempty"`
		AvatarURL   *string `json:"avatar_url,omitempty"`
	}
	type orgInfo struct {
		ID          string      `json:"id"`
		Name        string      `json:"name"`
		Description string      `json:"description"`
		LogoURL     *string     `json:"logo_url,omitempty"`
		OwnerID     string      `json:"owner_id"`
		Owner       *ownerInfo  `json:"owner,omitempty"`
		CreatedAt   interface{} `json:"created_at"`
		UpdatedAt   interface{} `json:"updated_at"`
	}

	enrichedOrgs := make([]orgInfo, 0, len(orgs))
	for _, org := range orgs {
		o := orgInfo{
			ID:          org.ID.String(),
			Name:        org.Name,
			Description: org.Description,
			LogoURL:     org.LogoURL,
			OwnerID:     org.OwnerID.String(),
			CreatedAt:   org.CreatedAt,
			UpdatedAt:   org.UpdatedAt,
		}
		if org.Owner != nil {
			oi := &ownerInfo{
				ID:          org.Owner.ID.String(),
				DisplayName: org.Owner.DisplayName,
				AvatarURL:   org.Owner.AvatarURL,
			}
			if org.Owner.UserID != nil {
				u, _ := h.users.GetByID(r.Context(), *org.Owner.UserID)
				if u != nil {
					oi.Username = &u.Username
					if u.AvatarURL != nil {
						oi.AvatarURL = u.AvatarURL
					}
				}
			}
			o.Owner = oi
		}
		enrichedOrgs = append(enrichedOrgs, o)
	}

	respondJSON(w, http.StatusOK, map[string]any{
		"username":      user.Username,
		"display_name":  account.DisplayName,
		"avatar_url":    account.AvatarURL,
		"account_id":    account.ID,
		"created_at":    user.CreatedAt,
		"organizations": enrichedOrgs,
	})
}
