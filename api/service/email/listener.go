package email

import "github.com/kickplate/api/events"

type Listener struct {
	emailService *Service
}

func NewListener(emailService *Service) *Listener {
	return &Listener{emailService: emailService}
}

func (l *Listener) Register(emitter *events.EventEmitter) {
	emitter.On(events.UserRegistered, func(payload any) {
		p := payload.(events.UserRegisteredPayload)
		l.emailService.SendWelcome(p.Email, p.Name)
	})

	emitter.On(events.UserVerificationRequested, func(payload any) {
		p := payload.(events.UserVerificationRequestedPayload)
		l.emailService.SendVerificationEmail(p.Email, p.Name, p.VerifyURL)
	})

	emitter.On(events.PasswordChanged, func(payload any) {
		p := payload.(events.PasswordChangedPayload)
		l.emailService.SendPasswordChanged(p.Email)
	})

	emitter.On(events.PasswordResetRequested, func(payload any) {
		p := payload.(events.PasswordResetRequestedPayload)
		l.emailService.SendPasswordResetEmail(p.Email, p.Name, p.ResetURL)
	})

	emitter.On(events.UserLiked, func(payload any) {
		p := payload.(events.UserLikedPayload)
		l.emailService.SendLikeNotification(p.Email, p.LikedBy)
	})

	emitter.On(events.PlateSubmitted, func(payload any) {
		p := payload.(events.PlateSubmittedPayload)
		l.emailService.SendPlateSubmitted(p.Email, p.Name, p.PlateName)
	})

	emitter.On(events.PlateVerified, func(payload any) {
		p := payload.(events.PlateVerifiedPayload)
		l.emailService.SendPlateVerified(p.Email, p.Name, p.PlateName)
	})

	emitter.On(events.PlateRated, func(payload any) {
		p := payload.(events.PlateRatedPayload)
		l.emailService.SendPlateRated(p.Email, p.PlateName, p.RatedBy, p.Rating)
	})

	emitter.On(events.PlateSyncIssue, func(payload any) {
		p := payload.(events.PlateSyncIssuePayload)
		l.emailService.SendPlateSyncIssue(p.Email, p.PlateName, p.Issue)
	})

	emitter.On(events.OrganizationInvitationSent, func(payload any) {
		p := payload.(events.OrganizationInvitationSentPayload)
		l.emailService.SendOrganizationInvitationSent(p.Email, p.OrganizationName, p.InvitedBy, p.Role)
	})

	emitter.On(events.OrganizationInvitationAccepted, func(payload any) {
		p := payload.(events.OrganizationInvitationAcceptedPayload)
		l.emailService.SendOrganizationInvitationAccepted(p.Email, p.OrganizationName, p.MemberName, p.Role)
	})

	emitter.On(events.OrganizationMemberRemoved, func(payload any) {
		p := payload.(events.OrganizationMemberRemovedPayload)
		l.emailService.SendOrganizationMemberRemoved(p.Email, p.OrganizationName, p.MemberName, p.RemovedBy)
	})

	emitter.On(events.OrganizationMemberLeft, func(payload any) {
		p := payload.(events.OrganizationMemberLeftPayload)
		l.emailService.SendOrganizationMemberLeft(p.Email, p.OrganizationName, p.MemberName)
	})
}
