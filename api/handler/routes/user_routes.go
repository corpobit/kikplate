package routes

import (
	"github.com/go-chi/chi/v5"
	"github.com/kickplate/api/handler/handlers"
	"github.com/kickplate/api/lib"
)

type UserRoutes struct {
	handler handlers.UserHandler
	rh      lib.RequestHandler
}

func NewUserRoutes(handler handlers.UserHandler, rh lib.RequestHandler) UserRoutes {
	return UserRoutes{handler: handler, rh: rh}
}

func (r UserRoutes) Setup() {
	r.rh.Mux.Route("/users", func(m chi.Router) {
		m.Get("/{username}", r.handler.GetByUsername)
	})
}
