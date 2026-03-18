const ADMIN_DIDS: Set<string> = new Set(
	(process.env.NEXT_PUBLIC_ADMIN_DIDS ?? '')
		.split(',')
		.map((did) => did.trim())
		.filter(Boolean),
)

export function isAdmin(did: string | null | undefined): boolean {
	if (!did) return false
	return ADMIN_DIDS.has(did)
}
