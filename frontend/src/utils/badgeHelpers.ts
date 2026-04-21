export function roleBadgeClass(role: string): string {
  const map: Record<string, string> = {
    ADMIN: 'es-badge-admin', ORGANIZER: 'es-badge-organizer',
    ATTENDEE: 'es-badge-attendee', VENDOR: 'es-badge-vendor',
    FINANCE_OFFICER: 'es-badge-finance', VENUE_MANAGER: 'es-badge-venue',
  }
  return map[role] ?? 'es-badge-draft'
}

export function userStatusBadgeClass(status: string): string {
  return status === 'ACTIVE' ? 'es-badge-active' : 'es-badge-suspended'
}

export function userInitials(name?: string): string {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}
