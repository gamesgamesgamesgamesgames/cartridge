/**
 * Format a 'YYYY-MM-DD' (UTC) series date as a short axis/tooltip label
 * (e.g. '2026-07-20' → 'Jul 20'). Parsed as UTC so the label doesn't drift
 * across timezones.
 */
export function shortDate(date: string): string {
	const parsed = new Date(`${date}T00:00:00Z`)

	if (Number.isNaN(parsed.getTime())) {
		return date
	}

	return parsed.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		timeZone: 'UTC',
	})
}
