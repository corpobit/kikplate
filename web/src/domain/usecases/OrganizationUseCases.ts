import type { IOrganizationRepository } from "@/src/domain/repositories/IOrganizationRepository"

export class GetMyOrganizationsUseCase {
  constructor(private readonly repo: IOrganizationRepository) {}
  execute() {
    return this.repo.listMine()
  }
}

export class CreateOrganizationUseCase {
  constructor(private readonly repo: IOrganizationRepository) {}
  execute(input: { name: string; description: string }) {
    return this.repo.create(input)
  }
}

export class UpdateOrganizationUseCase {
  constructor(private readonly repo: IOrganizationRepository) {}
  execute(id: string, input: { name?: string; description?: string }) {
    return this.repo.update(id, input)
  }
}

export class RemoveOrganizationUseCase {
  constructor(private readonly repo: IOrganizationRepository) {}
  execute(id: string) {
    return this.repo.remove(id)
  }
}

export class LeaveOrganizationUseCase {
  constructor(private readonly repo: IOrganizationRepository) {}
  execute(id: string) {
    return this.repo.leave(id)
  }
}

export class InviteOrganizationMemberUseCase {
  constructor(private readonly repo: IOrganizationRepository) {}
  execute(organizationId: string, input: { email: string; role: "admin" | "member" }) {
    return this.repo.inviteMember(organizationId, input)
  }
}

export class ListOrganizationMembersUseCase {
  constructor(private readonly repo: IOrganizationRepository) {}
  execute(organizationId: string) {
    return this.repo.listMembers(organizationId)
  }
}

export class ListOrganizationInvitationsUseCase {
  constructor(private readonly repo: IOrganizationRepository) {}
  execute(organizationId: string) {
    return this.repo.listInvitations(organizationId)
  }
}

export class RemoveOrganizationMemberUseCase {
  constructor(private readonly repo: IOrganizationRepository) {}
  execute(organizationId: string, accountId: string) {
    return this.repo.removeMember(organizationId, accountId)
  }
}

export class RevokeOrganizationInvitationUseCase {
  constructor(private readonly repo: IOrganizationRepository) {}
  execute(organizationId: string, invitationId: string) {
    return this.repo.revokeInvitation(organizationId, invitationId)
  }
}

export class ListMyOrganizationInvitationsUseCase {
  constructor(private readonly repo: IOrganizationRepository) {}
  execute() {
    return this.repo.listMyInvitations()
  }
}

export class AcceptOrganizationInvitationUseCase {
  constructor(private readonly repo: IOrganizationRepository) {}
  execute(invitationId: string) {
    return this.repo.acceptInvitation(invitationId)
  }
}

export class DeclineOrganizationInvitationUseCase {
  constructor(private readonly repo: IOrganizationRepository) {}
  execute(invitationId: string) {
    return this.repo.declineInvitation(invitationId)
  }
}
