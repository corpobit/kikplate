package routes

import (
	"github.com/go-chi/chi/v5"
	"github.com/kickplate/api/handler/handlers"
	"github.com/kickplate/api/handler/middleware"
	"github.com/kickplate/api/lib"
)

type BillingRoutes struct {
	handler handlers.BillingHandler
	rh      lib.RequestHandler
}

func NewBillingRoutes(handler handlers.BillingHandler, rh lib.RequestHandler) BillingRoutes {
	return BillingRoutes{handler: handler, rh: rh}
}

func (r BillingRoutes) Setup() {
	r.rh.Mux.Route("/billing", func(m chi.Router) {
		m.Get("/pricing", r.handler.Pricing)
		m.Post("/stripe/webhook", r.handler.StripeWebhook)

		m.Group(func(private chi.Router) {
			private.Use(middleware.RequireAuth)
			private.Get("/me", r.handler.Me)
			private.Post("/checkout/session", r.handler.CreateCheckoutSession)
			private.Post("/portal/session", r.handler.CreatePortalSession)
		})
	})
}
