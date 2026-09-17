import { describe, expect, it } from 'vitest'

import {
	earliestReleaseDate,
	gameCompletenessIssue,
	isDraft,
	isUpcoming,
	resolveReleaseDate,
} from '@/components/DashboardCatalog/completeness'

const COVER = { mediaType: 'cover' } as never
const SCREENSHOT = { mediaType: 'screenshot' } as never

/** Build a `releases` array tersely: one platform per date tuple. */
function releases(
	...dates: { at?: string; format?: string; status?: string }[]
) {
	return [
		{
			platform: 'PC',
			releaseDates: dates.map((date) => ({
				releasedAt: date.at,
				releasedAtFormat: date.format,
				status: date.status,
			})),
		},
	] as never
}

describe('gameCompletenessIssue', () => {
	it('reports a missing cover when there is no media at all', () => {
		expect(gameCompletenessIssue({ summary: 'A game.' })).toBe('cover')
	})

	it('reports a missing cover when media exists but none of it is a cover', () => {
		expect(
			gameCompletenessIssue({ media: [SCREENSHOT], summary: 'A game.' }),
		).toBe('cover')
	})

	it('prioritises the cover over the summary when both are missing', () => {
		expect(gameCompletenessIssue({})).toBe('cover')
	})

	it('reports a missing summary once the cover is present', () => {
		expect(gameCompletenessIssue({ media: [COVER] })).toBe('summary')
	})

	it('treats a whitespace-only summary as missing', () => {
		expect(gameCompletenessIssue({ media: [COVER], summary: '   ' })).toBe(
			'summary',
		)
	})

	it('reports nothing for a complete listing', () => {
		expect(
			gameCompletenessIssue({ media: [COVER, SCREENSHOT], summary: 'A game.' }),
		).toBeNull()
	})

	it('reports nothing for a missing record rather than throwing', () => {
		expect(gameCompletenessIssue(null)).toBeNull()
		expect(gameCompletenessIssue(undefined)).toBeNull()
	})
})

describe('resolveReleaseDate', () => {
	it('parses a full date', () => {
		expect(resolveReleaseDate('2027-03-14', 'YYYY-MM-DD')?.toISOString()).toBe(
			'2027-03-14T00:00:00.000Z',
		)
	})

	it('resolves a year to its first day', () => {
		// Matches how getUpcomingReleasesFeed indexes a year-only firstReleaseDate.
		expect(resolveReleaseDate('2027', 'YYYY')?.toISOString()).toBe(
			'2027-01-01T00:00:00.000Z',
		)
	})

	it('resolves a month to its first day', () => {
		expect(resolveReleaseDate('2027-06', 'YYYY-MM')?.toISOString()).toBe(
			'2027-06-01T00:00:00.000Z',
		)
	})

	it.each([
		['YYYY-Q1', '2027-01-01T00:00:00.000Z'],
		['YYYY-Q2', '2027-04-01T00:00:00.000Z'],
		['YYYY-Q3', '2027-07-01T00:00:00.000Z'],
		['YYYY-Q4', '2027-10-01T00:00:00.000Z'],
	])('resolves %s to the start of the quarter', (format, expected) => {
		expect(resolveReleaseDate('2027', format)?.toISOString()).toBe(expected)
	})

	it('returns null for TBD', () => {
		expect(resolveReleaseDate('2027', 'TBD')).toBeNull()
	})

	it('returns null for an absent or unparseable date', () => {
		expect(resolveReleaseDate(undefined, 'YYYY')).toBeNull()
		expect(resolveReleaseDate('someday', 'YYYY-MM-DD')).toBeNull()
	})
})

describe('earliestReleaseDate', () => {
	it('returns null when the game has no releases', () => {
		expect(earliestReleaseDate({})).toBeNull()
		expect(earliestReleaseDate(null)).toBeNull()
	})

	it('picks the earliest date across several', () => {
		const earliest = earliestReleaseDate({
			releases: releases(
				{ at: '2027-05-01', format: 'YYYY-MM-DD' },
				{ at: '2026-02-01', format: 'YYYY-MM-DD' },
				{ at: '2028-01-01', format: 'YYYY-MM-DD' },
			),
		})

		expect(earliest?.toISOString()).toBe('2026-02-01T00:00:00.000Z')
	})

	it('ignores cancelled release dates', () => {
		// The cancelled 2026 date must not win over the real 2027 one.
		const earliest = earliestReleaseDate({
			releases: releases(
				{ at: '2026-02-01', format: 'YYYY-MM-DD', status: 'cancelled' },
				{ at: '2027-05-01', format: 'YYYY-MM-DD' },
			),
		})

		expect(earliest?.toISOString()).toBe('2027-05-01T00:00:00.000Z')
	})

	it('returns null when every release date is cancelled', () => {
		expect(
			earliestReleaseDate({
				releases: releases({
					at: '2026-02-01',
					format: 'YYYY-MM-DD',
					status: 'cancelled',
				}),
			}),
		).toBeNull()
	})

	it('skips TBD dates without discarding real ones', () => {
		const earliest = earliestReleaseDate({
			releases: releases(
				{ at: '2025-01-01', format: 'TBD' },
				{ at: '2027-05-01', format: 'YYYY-MM-DD' },
			),
		})

		expect(earliest?.toISOString()).toBe('2027-05-01T00:00:00.000Z')
	})
})

describe('isUpcoming', () => {
	const now = new Date('2026-07-25T12:00:00.000Z')

	it('is true for a future release date', () => {
		expect(
			isUpcoming({ releases: releases({ at: '2027-03-01', format: 'YYYY-MM-DD' }) }, now),
		).toBe(true)
	})

	it('is false for a past release date', () => {
		expect(
			isUpcoming({ releases: releases({ at: '2025-03-01', format: 'YYYY-MM-DD' }) }, now),
		).toBe(false)
	})

	it('is false once any platform has already shipped', () => {
		// Earliest wins: a game out on PC isn't "Upcoming" because a console
		// port is still pending.
		expect(
			isUpcoming(
				{
					releases: releases(
						{ at: '2025-03-01', format: 'YYYY-MM-DD' },
						{ at: '2027-03-01', format: 'YYYY-MM-DD' },
					),
				},
				now,
			),
		).toBe(false)
	})

	it('is true when the only uncancelled date is in the future', () => {
		// The cancelled 2025 date is ignored, so the 2027 date decides.
		expect(
			isUpcoming(
				{
					releases: releases(
						{ at: '2025-03-01', format: 'YYYY-MM-DD', status: 'cancelled' },
						{ at: '2027-03-01', format: 'YYYY-MM-DD' },
					),
				},
				now,
			),
		).toBe(true)
	})

	it('is false when the release date is unknown', () => {
		expect(isUpcoming({ releases: releases({ format: 'TBD' }) }, now)).toBe(false)
		expect(isUpcoming({}, now)).toBe(false)
		expect(isUpcoming(null, now)).toBe(false)
	})

	it('does not consult publishedAt, which records listing visibility', () => {
		// A listing scheduled to become public in 2027 for a game that shipped
		// in 2025 is not upcoming.
		expect(
			isUpcoming(
				{
					publishedAt: '2027-01-01T00:00:00.000Z',
					releases: releases({ at: '2025-03-01', format: 'YYYY-MM-DD' }),
				} as never,
				now,
			),
		).toBe(false)
	})
})

describe('isDraft', () => {
	it('is true when the listing has never been published', () => {
		expect(isDraft({})).toBe(true)
	})

	it('is false once the listing has a publish timestamp', () => {
		expect(isDraft({ publishedAt: '2025-01-01T00:00:00.000Z' as never })).toBe(
			false,
		)
	})

	it('is false for a missing record rather than reporting a phantom draft', () => {
		expect(isDraft(null)).toBe(false)
		expect(isDraft(undefined)).toBe(false)
	})

	it('is independent of release dates', () => {
		// publishedAt is listing visibility; releases are when the game ships.
		// A published listing for an unreleased game is not a draft.
		const record = {
			publishedAt: '2025-01-01T00:00:00.000Z',
			releases: [
				{
					platform: 'PC',
					releaseDates: [
						{ releasedAt: '2027-01-01', releasedAtFormat: 'YYYY-MM-DD' },
					],
				},
			],
		} as never

		expect(isDraft(record)).toBe(false)
		expect(isUpcoming(record, new Date('2026-07-26T00:00:00.000Z'))).toBe(true)
	})
})
