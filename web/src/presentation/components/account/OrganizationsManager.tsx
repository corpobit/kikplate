"use client"

import { useState } from "react"
import { Building2, Plus, Loader2, Pencil, Check, X, Trash2 } from "lucide-react"
import {
  useAcceptOrganizationInvitation,
  useCreateOrganization,
  useDeclineOrganizationInvitation,
  useInviteOrganizationMember,
  useOrganizationInvitations,
  useOrganizationMembers,
  useRemoveOrganizationMember,
  useRevokeOrganizationInvitation,
  useMyOrganizationInvitations,
  useMyOrganizations,
  useLeaveOrganization,
  useRemoveOrganization,
  useUpdateOrganization,
} from "@/src/presentation/hooks/useOrganizations"
import { useConfig } from "@/src/presentation/hooks/useConfig"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import type { Organization } from "@/src/domain/entities/Organization"

function OrganizationMembersModal({
  org,
  open,
  onClose,
}: {
  org: Organization | null
  open: boolean
  onClose: () => void
}) {
  const canManage = open && !!org && (org.membership_role === "owner" || org.membership_role === "admin")
  const { data: members, isLoading: membersLoading } = useOrganizationMembers(org?.id ?? "", canManage)
  const { data: invitations, isLoading: invitationsLoading } = useOrganizationInvitations(org?.id ?? "", canManage)
  const inviteMember = useInviteOrganizationMember()
  const removeMember = useRemoveOrganizationMember()
  const revokeInvitation = useRevokeOrganizationInvitation()
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member")

  if (!open || !org || !canManage) {
    return null
  }

  async function onInvite() {
    if (!org) return
    const email = inviteEmail.trim()
    if (!email) return
    await inviteMember.mutateAsync({ organizationId: org.id, input: { email, role: inviteRole } })
    setInviteEmail("")
  }

  const inviteError = inviteMember.error instanceof Error ? inviteMember.error.message : null
  const removeError = removeMember.error instanceof Error ? removeMember.error.message : null
  const revokeError = revokeInvitation.error instanceof Error ? revokeInvitation.error.message : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-none border border-border bg-background p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-heading text-base font-medium">Manage members: {org.name}</h3>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Invite by email"
            className="w-full border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-colors"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as "admin" | "member")}
            className="border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-colors"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <Button type="button" onClick={onInvite} disabled={inviteMember.isPending || !inviteEmail.trim()}>
            {inviteMember.isPending ? "Inviting..." : "Invite"}
          </Button>
        </div>
        {inviteError && <p className="mt-2 text-xs text-destructive">{inviteError}</p>}

        <div className="mt-5 border border-border bg-muted/20 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Members</p>
          {membersLoading && <p className="text-xs text-muted-foreground">Loading members...</p>}
          {!membersLoading && (!members || members.length === 0) && (
            <p className="text-xs text-muted-foreground">No members yet.</p>
          )}
          <div className="space-y-2">
            {members?.map((member) => (
              <div key={member.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate text-foreground">
                    {member.profile?.display_name || member.profile?.username || member.account_id}
                  </p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {member.role} • {member.status}
                  </p>
                </div>
                {member.role !== "owner" && (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={removeMember.isPending}
                    onClick={() => removeMember.mutate({ organizationId: org.id, accountId: member.account_id })}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
          {removeError && <p className="mt-2 text-xs text-destructive">{removeError}</p>}
        </div>

        <div className="mt-4 border border-border bg-muted/20 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Invitations</p>
          {invitationsLoading && <p className="text-xs text-muted-foreground">Loading invitations...</p>}
          {!invitationsLoading && (!invitations || invitations.length === 0) && (
            <p className="text-xs text-muted-foreground">No invitations yet.</p>
          )}
          <div className="space-y-2">
            {invitations?.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate text-foreground">{inv.email}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {inv.role} • {inv.status}
                  </p>
                </div>
                {inv.status === "pending" && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={revokeInvitation.isPending}
                    onClick={() => revokeInvitation.mutate({ organizationId: org.id, invitationId: inv.id })}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
          {revokeError && <p className="mt-2 text-xs text-destructive">{revokeError}</p>}
        </div>
      </div>
    </div>
  )
}

export function OrganizationsManager() {
  const { data: config } = useConfig()
  const { data: organizations, isLoading } = useMyOrganizations()
  const createOrg = useCreateOrganization()
  const updateOrg = useUpdateOrganization()
  const removeOrg = useRemoveOrganization()
  const leaveOrg = useLeaveOrganization()
  const { data: invitations, isLoading: invitationsLoading } = useMyOrganizationInvitations()
  const acceptInvitation = useAcceptOrganizationInvitation()
  const declineInvitation = useDeclineOrganizationInvitation()
  
  const privateOrgEnabled = config?.features?.private_organizations_enabled ?? false

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [visibility, setVisibility] = useState<"public" | "private">("public")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editLogoUrl, setEditLogoUrl] = useState("")
  const [editVisibility, setEditVisibility] = useState<"public" | "private">("public")
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [confirmingOrg, setConfirmingOrg] = useState<{ id: string; name: string } | null>(null)
  const [confirmOrgNameInput, setConfirmOrgNameInput] = useState("")
  const [confirmingLeaveOrg, setConfirmingLeaveOrg] = useState<{ id: string; name: string } | null>(null)
  const [leavingId, setLeavingId] = useState<string | null>(null)
  const [managingMembersOrg, setManagingMembersOrg] = useState<Organization | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createOrg.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        logo_url: logoUrl.trim() || undefined,
        visibility,
      })
      setName("")
      setDescription("")
      setLogoUrl("")
      setVisibility("public")
    } catch {
    }
  }

  function startEditing(id: string, currentName: string, currentDescription: string, currentLogoUrl?: string, currentVisibility: "public" | "private" = "public") {
    setEditingId(id)
    setEditName(currentName)
    setEditDescription(currentDescription)
    setEditLogoUrl(currentLogoUrl ?? "")
    setEditVisibility(currentVisibility)
  }

  function cancelEditing() {
    setEditingId(null)
    setEditName("")
    setEditDescription("")
    setEditLogoUrl("")
    setEditVisibility("public")
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId) return

    try {
      await updateOrg.mutateAsync({
        id: editingId,
        input: {
          name: editName.trim(),
          description: editDescription.trim(),
          logo_url: editLogoUrl.trim() || "",
          visibility: editVisibility,
        },
      })
      cancelEditing()
    } catch {
    }
  }

  async function onConfirmRemoveOrganization() {
    if (!confirmingOrg) return
    setRemovingId(confirmingOrg.id)
    try {
      await removeOrg.mutateAsync(confirmingOrg.id)
      if (editingId === confirmingOrg.id) {
        cancelEditing()
      }
      setConfirmingOrg(null)
      setConfirmOrgNameInput("")
    } finally {
      setRemovingId(null)
    }
  }

  async function onConfirmLeaveOrganization() {
    if (!confirmingLeaveOrg) return
    setLeavingId(confirmingLeaveOrg.id)
    try {
      await leaveOrg.mutateAsync(confirmingLeaveOrg.id)
      if (editingId === confirmingLeaveOrg.id) {
        cancelEditing()
      }
      setConfirmingLeaveOrg(null)
    } finally {
      setLeavingId(null)
    }
  }

  const errorMsg = createOrg.error instanceof Error ? createOrg.error.message : null
  const updateErrorMsg = updateOrg.error instanceof Error ? updateOrg.error.message : null
  const removeErrorMsg = removeOrg.error instanceof Error ? removeOrg.error.message : null
  const leaveErrorMsg = leaveOrg.error instanceof Error ? leaveOrg.error.message : null
  const canRemoveOrganization = Boolean(confirmingOrg && confirmOrgNameInput === confirmingOrg.name)

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Organizations
        </p>

        <form onSubmit={handleCreate} className="space-y-3 border border-border bg-card p-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Organization name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="acme-platform"
              className="w-full border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What this organization builds"
              className="w-full border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-colors resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Logo URL</label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as "public" | "private")}
              className="w-full border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-colors"
            >
              <option value="public">Public</option>
              {privateOrgEnabled && <option value="private">Private</option>}
            </select>
            {!privateOrgEnabled && <p className="text-xs text-muted-foreground mt-1">Private organizations are disabled</p>}
          </div>

          {errorMsg && (
            <p className="text-sm text-destructive">{errorMsg}</p>
          )}

          <Button type="submit" disabled={createOrg.isPending || !name.trim()} className="gap-2">
            {createOrg.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create organization
          </Button>
        </form>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Your organizations
        </p>

        {isLoading && (
          <div className="text-sm text-muted-foreground">Loading organizations...</div>
        )}

        {!isLoading && (!organizations || organizations.length === 0) && (
          <div className="border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            You have no organizations yet. Create one above, then use it when submitting plates.
          </div>
        )}

        {organizations?.map((org) => (
          <div key={org.id} className="border border-border bg-card p-4">
            {editingId === org.id ? (
              <form onSubmit={handleUpdate} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Organization name</label>
                  <input
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    className="w-full border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-colors resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Logo URL</label>
                  <input
                    type="url"
                    value={editLogoUrl}
                    onChange={(e) => setEditLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Visibility</label>
                  <select
                    value={editVisibility}
                    onChange={(e) => setEditVisibility(e.target.value as "public" | "private")}
                    className="w-full border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-colors"
                  >
                    <option value="public">Public</option>
                    {privateOrgEnabled && <option value="private">Private</option>}
                  </select>
                  {!privateOrgEnabled && <p className="text-xs text-muted-foreground mt-1">Private organizations are disabled</p>}
                </div>

                {updateErrorMsg && (
                  <p className="text-sm text-destructive">{updateErrorMsg}</p>
                )}

                {removeErrorMsg && removingId === editingId && (
                  <p className="text-sm text-destructive">
                    {removeErrorMsg}
                    {removeErrorMsg.toLowerCase().includes("contains plates") && " Move plates out of this organization first."}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={updateOrg.isPending || !editName.trim()} className="gap-2">
                    {updateOrg.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Save changes
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      removeOrg.reset()
                      setConfirmingOrg({ id: org.id, name: org.name })
                      setConfirmOrgNameInput("")
                    }}
                    disabled={updateOrg.isPending || removeOrg.isPending}
                    className="gap-2"
                  >
                    {(removeOrg.isPending && removingId === org.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Delete
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelEditing} disabled={updateOrg.isPending} className="gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-border bg-muted">
                  {org.logo_url ? (
                    <Image
                      src={org.logo_url}
                      alt={`${org.name} logo`}
                      width={40}
                      height={40}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{org.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{org.visibility}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{org.description || "No description"}</p>
                      {org.logo_url && (
                        <p className="mt-1 truncate text-xs text-muted-foreground">{org.logo_url}</p>
                      )}
                    </div>
                    {(org.membership_role === "owner" || org.membership_role === "admin") && (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          disabled={removeOrg.isPending || leaveOrg.isPending}
                          onClick={() => setManagingMembersOrg(org)}
                        >
                          Manage members
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          disabled={removeOrg.isPending || leaveOrg.isPending}
                          onClick={() => startEditing(org.id, org.name, org.description || "", org.logo_url, org.visibility ?? "public")}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      </div>
                    )}

                    {org.membership_role === "member" && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="gap-1.5"
                        disabled={leaveOrg.isPending || removeOrg.isPending}
                        onClick={() => {
                          leaveOrg.reset()
                          setConfirmingLeaveOrg({ id: org.id, name: org.name })
                        }}
                      >
                        {leaveOrg.isPending && leavingId === org.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                        Leave
                      </Button>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pending invitations</p>
        {invitationsLoading && <div className="text-sm text-muted-foreground">Loading invitations...</div>}
        {!invitationsLoading && (!invitations || invitations.length === 0) && (
          <div className="border border-border bg-muted/20 p-4 text-sm text-muted-foreground">No pending invitations.</div>
        )}
        {invitations?.map((inv) => (
          <div key={inv.id} className="border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">Organization invitation</p>
                <p className="text-sm text-muted-foreground">Role: {inv.role}</p>
                <p className="text-xs text-muted-foreground">Expires: {new Date(inv.expires_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => acceptInvitation.mutate(inv.id)} disabled={acceptInvitation.isPending}>Accept</Button>
                <Button size="sm" variant="outline" onClick={() => declineInvitation.mutate(inv.id)} disabled={declineInvitation.isPending}>Decline</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {confirmingOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-none border border-border bg-background p-5">
            <div className="space-y-2">
              <h3 className="font-heading text-base font-medium">Delete organization</h3>
              <p className="text-sm text-muted-foreground">
                This will permanently delete &quot;{confirmingOrg.name}&quot;.
              </p>
              <p className="text-xs text-muted-foreground">
                Type the full organization name to confirm: <span className="font-medium text-foreground">{confirmingOrg.name}</span>
              </p>
              <input
                value={confirmOrgNameInput}
                onChange={(e) => setConfirmOrgNameInput(e.target.value)}
                placeholder="Enter full organization name"
                className="h-9 w-full border border-input bg-transparent px-3 text-sm outline-none transition-colors focus:border-ring"
                autoFocus
              />
            </div>

            {removeErrorMsg && (
              <p className="mt-3 text-xs text-destructive">
                {removeErrorMsg}
                {removeErrorMsg.toLowerCase().includes("contains plates") && " Move plates out of this organization first."}
              </p>
            )}

            <div className="mt-5 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={removeOrg.isPending}
                onClick={() => {
                  removeOrg.reset()
                  setConfirmingOrg(null)
                  setConfirmOrgNameInput("")
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={removeOrg.isPending || !canRemoveOrganization}
                onClick={onConfirmRemoveOrganization}
              >
                {removeOrg.isPending ? "Deleting..." : "Yes, delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {confirmingLeaveOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-none border border-border bg-background p-5">
            <div className="space-y-2">
              <h3 className="font-heading text-base font-medium">Leave organization</h3>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to leave &quot;{confirmingLeaveOrg.name}&quot;?
              </p>
            </div>

            {leaveErrorMsg && (
              <p className="mt-3 text-xs text-destructive">{leaveErrorMsg}</p>
            )}

            <div className="mt-5 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={leaveOrg.isPending}
                onClick={() => {
                  leaveOrg.reset()
                  setConfirmingLeaveOrg(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={leaveOrg.isPending}
                onClick={onConfirmLeaveOrganization}
              >
                {leaveOrg.isPending ? "Leaving..." : "Yes, leave"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <OrganizationMembersModal
        org={managingMembersOrg}
        open={!!managingMembersOrg}
        onClose={() => setManagingMembersOrg(null)}
      />
    </div>
  )
}
