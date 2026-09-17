'use client'

// Module imports
import { AlertCircle, Eye, Pencil, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useStore } from 'statery'

// Local imports
import * as API from '@/helpers/API'
import { BoxArt } from '@/components/BoxArt/BoxArt'
import { Button } from '@/components/ui/button'
import {
	CATALOG_ISSUE_HINTS,
	CATALOG_ISSUE_LABELS,
	gameCompletenessIssue,
	isDraft,
	isUpcoming,
} from '@/components/DashboardCatalog/completeness'
import { Container } from '@/components/Container/Container'
import { formatCompact } from '@/components/AnalyticsDashboard/formatDuration'
import { type Game } from '@/typedefs/Game'
import { Input } from '@/components/ui/input'
import { listGames } from '@/store/actions/listGames'
import { parseATURI } from '@/helpers/parseATURI'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { store } from '@/store/store'
import { StudioPageHeader } from '@/components/StudioShell/StudioPageHeader'
import { Toggle } from '@/components/ui/toggle'

// Constants
const SKELETON_TILES = Array.from({ length: 12 })
const GRID_CLASS =
	'grid auto-rows-min grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'

/** Controls only earn their vertical space once a catalog is hard to scan. */
const CONTROLS_THRESHOLD = 6

/**
 * Ceiling on automatic paging. Five requests at {@link CATALOG_PAGE_SIZE} covers
 * any realistic studio; beyond it the surface falls back to manual paging and
 * says so rather than hammering the API.
 */
const CATALOG_AUTOLOAD_CAP = 500

const SORT_OPTIONS = [
	{ value: 'name', label: 'Name (A–Z)' },
	{ value: 'pageviews', label: 'Most viewed' },
	{ value: 'attention', label: 'Needs attention first' },
] as const

type SortKey = (typeof SORT_OPTIONS)[number]['value']

type Props = Readonly<{
	/** Injected in tests; production reads from the analytics API. */
	pageviewsBySlug?: Map<string, number>
}>

function CatalogTile(
	props: Readonly<{
		game: Game
		now: Date
		pageviews?: number
		showIssueHint?: boolean
	}>,
) {
	const { game, now, pageviews, showIssueHint } = props
	const { record } = game

	const { did, rkey } = parseATURI(record.uri)
	const issue = gameCompletenessIssue(record)
	const upcoming = isUpcoming(record, now)
	const draft = isDraft(record)
	const editHref = `/studio/catalog/${did}/${rkey}`

	return (
		<li className={'group relative flex flex-col gap-2'}>
			<div
				className={
					'relative overflow-hidden rounded-md shadow-md transition-shadow duration-200 group-hover:shadow-xl group-focus-within:shadow-xl'
				}>
				<BoxArt gameRecord={record} />

				{/* A draft has no public page to view, so the control that leads
				    there is omitted rather than shown pointing at a 404. */}
				{!draft && (
					<Link
						href={`/game/${record.slug}`}
						aria-label={`View the public page for ${record.name}`}
						className={
							'absolute right-1 top-1 z-10 flex size-11 items-center justify-center rounded-md bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
						}>
						<Eye
							aria-hidden={'true'}
							className={'size-4'}
						/>
					</Link>
				)}

				{(draft || upcoming) && (
					<span
						className={
							'absolute bottom-1.5 left-1.5 rounded bg-background/85 px-1.5 py-0.5 text-[0.6875rem] font-medium backdrop-blur'
						}>
						{/* Draft wins: "nobody can see this yet" outranks "it ships
						    later" when both are true. */}
						{draft ? 'Draft' : 'Upcoming'}
					</span>
				)}
			</div>

			<div className={'flex min-w-0 flex-col'}>
				{/* The primary action is editing, so it gets the affordance and a
				    44px hit area — not the smaller of the two controls. */}
				<Link
					href={editHref}
					title={record.name}
					className={
						'flex min-h-11 items-center gap-1.5 rounded-sm text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
					}>
					<span className={'truncate'}>{record.name}</span>

					{/* Dimmed rather than hidden: hover doesn't exist on touch, so a
					    hover-gated affordance is no affordance at all there. */}
					<Pencil
						aria-hidden={'true'}
						className={
							'size-3 shrink-0 text-muted-foreground opacity-50 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100'
						}
					/>
				</Link>

				{/* Issue and metric are separate lines: a game can be performing
				    well *and* be missing a summary, and that pairing is exactly
				    what a studio needs to see. */}
				{Boolean(issue) && (
					<span
						className={
							'flex items-center gap-1 text-xs font-medium text-attention'
						}>
						<AlertCircle
							aria-hidden={'true'}
							className={'size-3 shrink-0'}
						/>
						{CATALOG_ISSUE_LABELS[issue!]}
					</span>
				)}

				{/* Why it matters, shown only once the studio has filtered down to
				    the work — motivation is noise in the default browse view. */}
				{Boolean(issue) && showIssueHint && (
					<span className={'text-xs text-muted-foreground'}>
						{CATALOG_ISSUE_HINTS[issue!]}
					</span>
				)}

				{/* A draft has no public page, so it has no pageviews to report —
				    that's undefined, not zero. Say so instead of printing a 0 the
				    studio might read as "nobody looked". */}
				{draft ? (
					<span className={'text-xs text-muted-foreground'}>
						{'Not visible to players yet'}
					</span>
				) : (
					typeof pageviews === 'number' && (
						<span className={'text-xs tabular-nums text-muted-foreground'}>
							{formatCompact(pageviews)}
							{pageviews === 1 ? ' pageview' : ' pageviews'}
							{' · 30d'}
						</span>
					)
				)}
			</div>
		</li>
	)
}

/**
 * The studio's catalog.
 *
 * Box art is the right affordance for games — a studio recognises its own
 * covers faster than it reads its own titles — but a wall of art alone is a
 * launcher, not a management surface. Each tile carries what's missing from the
 * listing and how it's doing, and the controls above let a studio go straight
 * to the incomplete ones instead of scrolling for them.
 */
export function DashboardCatalog(props: Props) {
	const { pageviewsBySlug: injectedPageviews } = props
	const isControlled = injectedPageviews !== undefined

	const { gamesCatalog, gamesCatalogHasNextPage, user } = useStore(store)

	const [isLoading, setIsLoading] = useState(false)
	const [loadError, setLoadError] = useState<string | null>(null)
	const [hasAttempted, setHasAttempted] = useState(false)
	const [pageviewsBySlug, setPageviewsBySlug] = useState<Map<string, number>>(
		injectedPageviews ?? new Map(),
	)
	const [filter, setFilter] = useState('')
	const [sortKey, setSortKey] = useState<SortKey>('attention')
	const [attentionOnly, setAttentionOnly] = useState(false)

	// One clock for the whole render pass, so every tile agrees on "now".
	const now = useMemo(() => new Date(), [])

	const loadGames = useCallback(async () => {
		setIsLoading(true)
		setHasAttempted(true)

		try {
			await listGames()
			setLoadError(null)
		} catch {
			// Keep whatever's already loaded on screen; a stale grid the studio
			// can still act on beats an empty one it can't.
			setLoadError('Couldn’t load your catalog.')
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		if (gamesCatalog === null && !hasAttempted && user?.did) {
			loadGames()
		}
	}, [gamesCatalog, hasAttempted, loadGames, user?.did])

	// Keep pulling pages until the catalog is whole. Filtering and sorting run
	// on the client, so a partially-loaded catalog would quietly narrow both to
	// whatever happened to be fetched. The cap stops a runaway cursor; past it
	// the controls disclose their own limits.
	useEffect(() => {
		if (
			gamesCatalog !== null &&
			gamesCatalogHasNextPage &&
			!isLoading &&
			!loadError &&
			gamesCatalog.length < CATALOG_AUTOLOAD_CAP
		) {
			loadGames()
		}
	}, [gamesCatalog, gamesCatalogHasNextPage, isLoading, loadError, loadGames])

	useEffect(() => {
		if (isControlled || !user) {
			return
		}

		let isStale = false

		API.listMyGamesAnalytics('30d')
			.then((result) => {
				if (isStale) {
					return
				}

				setPageviewsBySlug(
					new Map(result.games.map((game) => [game.slug, game.pageviews])),
				)
			})
			// Metrics are a garnish here; the catalog is fully usable without them.
			.catch(() => {})

		return () => {
			isStale = true
		}
	}, [isControlled, user])

	const handleFilterChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setFilter(event.target.value)
		},
		[],
	)

	const attentionCount = useMemo(() => {
		if (!gamesCatalog) {
			return 0
		}

		return gamesCatalog.filter((game) => gameCompletenessIssue(game.record))
			.length
	}, [gamesCatalog])

	const visibleGames = useMemo(() => {
		if (!gamesCatalog) {
			return []
		}

		const needle = filter.trim().toLowerCase()

		const filtered = gamesCatalog.filter((game) => {
			if (attentionOnly && !gameCompletenessIssue(game.record)) {
				return false
			}

			if (needle && !game.record.name.toLowerCase().includes(needle)) {
				return false
			}

			return true
		})

		const pageviewsFor = (game: Game) =>
			(game.record.slug ? pageviewsBySlug.get(game.record.slug) : undefined) ?? -1

		return [...filtered].sort((a, b) => {
			if (sortKey === 'name') {
				return a.record.name.localeCompare(b.record.name)
			}

			if (sortKey === 'pageviews') {
				return pageviewsFor(b) - pageviewsFor(a)
			}

			// 'attention': incomplete listings first, then alphabetical within
			// each group so the order is stable and scannable.
			const aIssue = gameCompletenessIssue(a.record) ? 0 : 1
			const bIssue = gameCompletenessIssue(b.record) ? 0 : 1

			return aIssue - bIssue || a.record.name.localeCompare(b.record.name)
		})
	}, [attentionOnly, filter, gamesCatalog, pageviewsBySlug, sortKey])

	if (!user) {
		return (
			<Container>
				<div className={'flex flex-col items-center gap-4 py-16 text-center'}>
					<p className={'text-muted-foreground'}>
						{'You must be signed in to manage your catalog.'}
					</p>
				</div>
			</Container>
		)
	}

	const gameCount = gamesCatalog?.length ?? 0
	const isFirstLoad = gamesCatalog === null && !loadError
	const showControls = gameCount >= CONTROLS_THRESHOLD
	const isFiltered = Boolean(filter.trim()) || attentionOnly
	// Auto-paging is still working through the catalog, so every count is a
	// floor rather than a total until it finishes.
	const isPartial = gamesCatalogHasNextPage
	const isAutoLoading = isPartial && gameCount < CATALOG_AUTOLOAD_CAP && !loadError

	return (
		<Container>
			<div className={'flex flex-col gap-6'}>
				<StudioPageHeader
					title={'Catalog'}
					description={
						gameCount > 0
							? // The `+` qualifies both numbers while paging continues:
								// the attention count is drawn from loaded games too, so
								// presenting it as a total would overstate certainty.
								`${gameCount}${isPartial ? '+' : ''} ${gameCount === 1 && !isPartial ? 'game' : 'games'}${attentionCount > 0 ? ` · ${attentionCount}${isPartial ? '+' : ''} need${attentionCount === 1 && !isPartial ? 's' : ''} attention` : ''}`
							: 'The games you manage on Cartridge.'
					}
					actions={
						<Button asChild>
							<Link href={'/studio/catalog/new-game'}>
								<Plus className={'size-4'} />
								{'Add game'}
							</Link>
						</Button>
					}
				/>

				{Boolean(loadError) && (
					<div
						role={'alert'}
						className={
							'flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3'
						}>
						<p className={'text-sm'}>
							{gameCount > 0
								? 'Couldn’t load more of your catalog. The games below are from your last successful load.'
								: 'Couldn’t load your catalog.'}
						</p>

						<Button
							disabled={isLoading}
							onClick={loadGames}
							size={'sm'}
							variant={'outline'}>
							{isLoading ? 'Retrying…' : 'Try again'}
						</Button>
					</div>
				)}

				{showControls && (
					<div className={'flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center'}>
						<div className={'relative min-w-0 sm:max-w-xs sm:flex-1'}>
							<Search
								aria-hidden={'true'}
								className={
									'pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
								}
							/>

							<Input
								type={'search'}
								value={filter}
								onChange={handleFilterChange}
								placeholder={'Filter games'}
								aria-label={'Filter games by name'}
								className={'pl-9'}
							/>
						</div>

						<Select
							value={sortKey}
							onValueChange={(value) => setSortKey(value as SortKey)}>
							{/* Wide enough for "Needs attention first" — the sort and the
							    toggle share vocabulary deliberately, so the label doesn't
							    get shortened into a second word for the same idea. */}
							<SelectTrigger
								aria-label={'Sort games'}
								className={'w-full sm:w-[13.5rem]'}>
								<SelectValue />
							</SelectTrigger>

							<SelectContent>
								{SORT_OPTIONS.map((option) => (
									<SelectItem
										key={option.value}
										value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Stays mounted at zero, disabled: a control that disappears
						    as the studio clears its backlog reflows the row underneath
						    them mid-task. */}
						<Toggle
							pressed={attentionOnly}
							onPressedChange={setAttentionOnly}
							disabled={attentionCount === 0}
							variant={'outline'}
							aria-label={
								attentionCount === 0
									? 'No games need attention'
									: `Show only the ${attentionCount} games that need attention`
							}>
							<AlertCircle
								aria-hidden={'true'}
								className={'size-4'}
							/>
							{'Needs attention'}
						</Toggle>
					</div>
				)}

				{showControls && isPartial && (
					<p className={'-mt-3 text-xs text-muted-foreground'}>
						{isAutoLoading
							? `Loading the rest of your catalog — filtering and sorting cover the ${gameCount} games loaded so far.`
							: `Filtering and sorting cover the ${gameCount} games loaded so far. Load more to include the rest.`}
					</p>
				)}

				{/* A short status line rather than a live grid: wrapping the grid
				    made every filter keystroke re-announce all twelve games. */}
				<p
					aria-live={'polite'}
					className={'sr-only'}>
					{isFirstLoad
						? 'Loading your catalog'
						: isFiltered
							? `${visibleGames.length} of ${gameCount} games match your filters`
							: `${gameCount} games`}
				</p>

				<div>
					{isFirstLoad ? (
						<ul className={GRID_CLASS}>
							{SKELETON_TILES.map((_, index) => (
								<li
									key={index}
									className={'flex flex-col gap-2'}>
									<BoxArt />
									<Skeleton className={'h-4 w-3/4'} />
								</li>
							))}
						</ul>
					) : gameCount === 0 ? (
						!loadError && (
							<div
								className={
									'flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center'
								}>
								<div className={'flex max-w-sm flex-col gap-1.5'}>
									<p className={'text-base font-semibold'}>
										{'Your catalog is empty'}
									</p>

									<p className={'text-sm text-muted-foreground'}>
										{'Add a game to publish it on Cartridge, or claim one that’s already listed to take over managing it.'}
									</p>
								</div>

								<div className={'flex flex-wrap items-center justify-center gap-2'}>
									<Button asChild>
										<Link href={'/studio/catalog/new-game'}>
											<Plus className={'size-4'} />
											{'Add your first game'}
										</Link>
									</Button>

									<Button
										asChild
										variant={'outline'}>
										<Link href={'/claim'}>{'Claim existing games'}</Link>
									</Button>
								</div>
							</div>
						)
					) : visibleGames.length === 0 ? (
						<div
							className={
								'flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center'
							}>
							<p className={'text-sm text-muted-foreground'}>
								{attentionOnly && !filter.trim()
									? 'Every loaded game has cover art and a summary.'
									: `No games match “${filter.trim()}”.`}
							</p>

							<Button
								onClick={() => {
									setFilter('')
									setAttentionOnly(false)
								}}
								size={'sm'}
								variant={'outline'}>
								{'Clear filters'}
							</Button>
						</div>
					) : (
						<ul
							aria-label={
								isFiltered
									? `Games matching your filters, ${visibleGames.length} of ${gameCount}`
									: `Your games, ${visibleGames.length}`
							}
							className={GRID_CLASS}>
							{visibleGames.map((game) => (
								<CatalogTile
									key={game.record.uri}
									game={game}
									now={now}
									showIssueHint={attentionOnly}
									pageviews={
										game.record.slug
											? pageviewsBySlug.get(game.record.slug)
											: undefined
									}
								/>
							))}
						</ul>
					)}
				</div>

				{/* Only surfaced once auto-paging has bowed out at the cap; below it
				    the catalog finishes loading on its own. */}
				{isPartial && gameCount > 0 && !isAutoLoading && (
					<Button
						className={'w-full'}
						disabled={isLoading}
						onClick={loadGames}
						variant={'outline'}>
						{isLoading ? 'Loading…' : 'Load more'}
					</Button>
				)}
			</div>
		</Container>
	)
}
