package events

const (
	UserRegistered                 = "user.registered"
	UserVerificationRequested      = "user.verification_requested"
	PasswordChanged                = "user.password_changed"
	PasswordResetRequested         = "user.password_reset_requested"
	UserLiked                      = "user.liked"
	PlateSubmitted                 = "plate.submitted"
	PlateVerified                  = "plate.verified"
	PlateRated                     = "plate.rated"
	PlateSyncIssue                 = "plate.sync_issue"
	OrganizationInvitationSent     = "organization.invitation_sent"
	OrganizationInvitationAccepted = "organization.invitation_accepted"
	OrganizationMemberRemoved      = "organization.member_removed"
	OrganizationMemberLeft         = "organization.member_left"
)

type UserRegisteredPayload struct {
	Email string
	Name  string
}

type UserVerificationRequestedPayload struct {
	Email     string
	Name      string
	VerifyURL string
}

type PasswordChangedPayload struct {
	Email string
}

type PasswordResetRequestedPayload struct {
	Email    string
	Name     string
	ResetURL string
}

type UserLikedPayload struct {
	Email   string
	LikedBy string
}

type PlateSubmittedPayload struct {
	Email     string
	Name      string
	PlateName string
}

type PlateVerifiedPayload struct {
	Email     string
	Name      string
	PlateName string
}

type PlateRatedPayload struct {
	Email     string
	PlateName string
	RatedBy   string
	Rating    int16
}

type PlateSyncIssuePayload struct {
	Email     string
	PlateName string
	Issue     string
}

type OrganizationInvitationSentPayload struct {
	Email            string
	OrganizationName string
	InvitedBy        string
	Role             string
}

type OrganizationInvitationAcceptedPayload struct {
	Email            string
	OrganizationName string
	MemberName       string
	Role             string
}

type OrganizationMemberRemovedPayload struct {
	Email            string
	OrganizationName string
	MemberName       string
	RemovedBy        string
}

type OrganizationMemberLeftPayload struct {
	Email            string
	OrganizationName string
	MemberName       string
}
