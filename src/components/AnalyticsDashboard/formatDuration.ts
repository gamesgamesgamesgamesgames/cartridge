/**
 * Presentation formatters for the analytics dashboard.
 *
 * Kept dependency-free and pure so they're trivial to unit test and safe to run
 * on the server or the client.
 */

/**
 * Stand-in for a metric that has no value rather than a value of zero.
 *
 * CTR with no impressions and dwell with no pageviews are undefined, not zero;
 * printing `0.0%` or `0:00` would claim a measurement nobody took. Counts are
 * different — zero impressions really is zero — so they keep their digits.
 */
export const NO_VALUE = '—'

/**
 * Format a dwell time in milliseconds as `m:ss` (e.g. 92000 → '1:32').
 *
 * Non-finite or negative input formats as '0:00' rather than throwing — the
 * dashboard would rather show a zero than a crash.
 */
export function formatDuration(ms: number): string {
	if (!Number.isFinite(ms) || ms <= 0) {
		return '0:00'
	}

	const totalSeconds = Math.round(ms / 1000)
	const minutes = Math.floor(totalSeconds / 60)
	const seconds = totalSeconds % 60

	return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/**
 * Format a click-through rate fraction (0..1) as a percentage with one decimal
 * (e.g. 0.0345 → '3.5%').
 */
export function formatCtr(fraction: number): string {
	if (!Number.isFinite(fraction) || fraction <= 0) {
		return '0.0%'
	}

	return `${(fraction * 100).toFixed(1)}%`
}

/**
 * Compact a large number for stat tiles and axis ticks (e.g. 1200 → '1.2k',
 * 1_500_000 → '1.5M'). Values under 1,000 render with thousands separators.
 */
export function formatCompact(value: number): string {
	if (!Number.isFinite(value)) {
		return '0'
	}

	const abs = Math.abs(value)
	const sign = value < 0 ? '-' : ''

	if (abs < 1000) {
		return `${value}`
	}

	if (abs < 1_000_000) {
		return `${sign}${trimZero(abs / 1000)}k`
	}

	if (abs < 1_000_000_000) {
		return `${sign}${trimZero(abs / 1_000_000)}M`
	}

	return `${sign}${trimZero(abs / 1_000_000_000)}B`
}

/** Round to one decimal and drop a trailing `.0` (1.0 → '1', 1.2 → '1.2'). */
function trimZero(value: number): string {
	return value.toFixed(1).replace(/\.0$/, '')
}

/** Full thousands-separated number for tooltips and tables (12345 → '12,345'). */
export function formatFull(value: number): string {
	if (!Number.isFinite(value)) {
		return '0'
	}

	return value.toLocaleString('en-US')
}
