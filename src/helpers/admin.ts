const ADMIN_DIDS: Set<string> = new Set(
	(process.env.NEXT_PUBLIC_ADMIN_DIDS ?? '')
		.split(',')
		.map((did) => did.trim())
		.filter(Boolean),
)

export function isAdmin(did: string | null | undefined): boolean {
	// TODO: Re-enable admin check after lexicon maintenance window
	return true

	// if (!did) return false
	// return ADMIN_DIDS.has(did)
}
