/**
 * Catalog completeness and release-status checks.
 *
 * A studio's catalog page is the one place where "this game's listing is
 * missing something" is both visible and fixable, so the grid surfaces the gap
 * rather than leaving the studio to click through every title to find it.
 *
 * Deliberately narrow: only fields whose absence measurably hurts a game's
 * public page, and only ones the owner can fix themselves.
 */

import { type GameRecord } from '@/typedefs/GameRecord'

export type CatalogIssue = 'cover' | 'summary'

export const CATALOG_ISSUE_LABELS: Record<CatalogIssue, string> = {
	cover: 'Needs cover art',
	summary: 'Needs a summary',
}

/** Why each gap is worth fixing — shown where there's room to motivate it. */
export const CATALOG_ISSUE_HINTS: Record<CatalogIssue, string> = {
	cover: 'Cover art is what players see in every feed and search result.',
	summary: 'The summary is the first thing players read on your game page.',
}

/**
 * The single most consequential gap in a game's listing, or `null` when it's
 * complete.
 *
 * Returns one issue rather than a list: a grid tile has room for one line, and
 * a studio fixing the cover will see the next gap on their following visit.
 * Cover art outranks the summary because it's what a player sees first in
 * every feed and search result.
 */
export function gameCompletenessIssue(
	record: Pick<GameRecord, 'media' | 'summary'> | null | undefined,
): CatalogIssue | null {
	if (!record) {
		return null
	}

	const hasCover = Boolean(
		record.media?.some((item) => item.mediaType === 'cover'),
	)

	if (!hasCover) {
		return 'cover'
	}

	if (!record.summary?.trim()) {
		return 'summary'
	}

	return null
}

/**
 * Resolve a possibly-partial release date to the start of the period it names.
 *
 * `releasedAt` is paired with a `releasedAtFormat` that may be as coarse as a
 * year or a quarter, or `TBD`. Taking the *start* of the period matches how
 * `getUpcomingReleasesFeed` indexes `firstReleaseDate` (a year-only date lands
 * on January 1), so this surface and that feed agree on what "upcoming" means.
 *
 * Returns `null` for `TBD`, absent, or unparseable dates — an unknown date is
 * not a future one.
 */
export function resolveReleaseDate(
	releasedAt: string | undefined,
	releasedAtFormat: string | undefined,
): Date | null {
	if (!releasedAt || releasedAtFormat === 'TBD') {
		return null
	}

	const quarter = releasedAtFormat?.match(/^YYYY-Q([1-4])$/)

	if (quarter) {
		const year = Number(releasedAt.slice(0, 4))

		if (!Number.isFinite(year)) {
			return null
		}

		// Q1 -> January, Q2 -> April, and so on.
		return new Date(Date.UTC(year, (Number(quarter[1]) - 1) * 3, 1))
	}

	// 'YYYY' and 'YYYY-MM' are not reliably parsed as UTC by every engine, so
	// build them explicitly rather than trusting Date.parse.
	const yearOnly = releasedAt.match(/^(\d{4})$/)

	if (yearOnly) {
		return new Date(Date.UTC(Number(yearOnly[1]), 0, 1))
	}

	const yearMonth = releasedAt.match(/^(\d{4})-(\d{2})$/)

	if (yearMonth) {
		return new Date(Date.UTC(Number(yearMonth[1]), Number(yearMonth[2]) - 1, 1))
	}

	const parsed = new Date(releasedAt)

	return Number.isNaN(parsed.getTime()) ? null : parsed
}

/**
 * The earliest non-cancelled release date across every platform, or `null`
 * when the game has no dated, uncancelled release.
 */
export function earliestReleaseDate(
	record: Pick<GameRecord, 'releases'> | null | undefined,
	): Date | null {
	if (!record?.releases?.length) {
		return null
	}

	let earliest: Date | null = null

	for (const release of record.releases) {
		for (const releaseDate of release?.releaseDates ?? []) {
			// A cancelled date is not a release; ignore it entirely.
			if (releaseDate?.status === 'cancelled') {
				continue
			}

			const resolved = resolveReleaseDate(
				releaseDate?.releasedAt,
				releaseDate?.releasedAtFormat,
			)

			if (resolved && (!earliest || resolved < earliest)) {
				earliest = resolved
			}
		}
	}

	return earliest
}

/**
 * Whether a listing is still a draft — saved to the repo but not published, so
 * no player can see it.
 *
 * This is what `publishedAt` actually records: when the record was marked ready
 * for public viewing. It says nothing about whether the game has shipped — see
 * {@link isUpcoming} for that.
 */
export function isDraft(
	record: Pick<GameRecord, 'publishedAt'> | null | undefined,
): boolean {
	return Boolean(record) && !record?.publishedAt
}

/**
 * Whether a game has not released yet.
 *
 * Mirrors `getUpcomingReleasesFeed`, which selects on
 * `firstReleaseDate > today` over non-cancelled releases — so a game reads as
 * "Upcoming" here exactly when it would appear in that feed.
 *
 * `now` is a parameter so this stays pure: the catalog renders on the client,
 * where the ambient date is a moving target between renders.
 *
 * Note that this is **not** `publishedAt`. That field records when the listing
 * was made publicly visible, not when the game ships.
 */
export function isUpcoming(
	record: Pick<GameRecord, 'releases'> | null | undefined,
	now: Date,
): boolean {
	const earliest = earliestReleaseDate(record)

	if (!earliest) {
		return false
	}

	return earliest.getTime() > now.getTime()
}
