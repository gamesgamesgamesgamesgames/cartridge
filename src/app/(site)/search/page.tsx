'use client'

import { ChevronDown, Loader2 } from 'lucide-react'
import Link from 'next/link'
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	ViewTransition,
} from 'react'

import { BoxArt } from '@/components/BoxArt/BoxArt'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Scroller } from '@/components/ui/scroller'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useSearchContext } from '@/context/SearchContext/SearchContext'
import { TiltCard } from '@/components/TiltCard/TiltCard'
import { useSearch } from '@/hooks/use-search'
import { type SearchResultItem } from '@/typedefs/PentaractAPISearchResult'

const MAX_STAGGER = 20
const SEARCH_TYPES = ['game']
const DEFAULT_APPLICATION_TYPES = [
	'game',
	'remake',
	'remaster',
	'standaloneExpansion',
]

const APPLICATION_TYPE_LABELS: Record<string, string> = {
	game: 'Game',
	remake: 'Remake',
	remaster: 'Remaster',
	dlc: 'DLC',
	expansion: 'Expansion',
	standaloneExpansion: 'Standalone Expansion',
	expandedGame: 'Expanded Game',
	episode: 'Episode',
	season: 'Season',
	update: 'Update',
	mod: 'Mod',
	fork: 'Fork',
	port: 'Port',
	addon: 'Addon',
	pack: 'Pack',
	bundle: 'Bundle',
}

const ALL_APPLICATION_TYPES = Object.keys(APPLICATION_TYPE_LABELS)

const GENRE_LABELS: Record<string, string> = {
	fighting: 'Fighting',
	music: 'Music',
	platform: 'Platform',
	pointAndClick: 'Point & Click',
	puzzle: 'Puzzle',
	racing: 'Racing',
	rpg: 'RPG',
	rts: 'RTS',
	shooter: 'Shooter',
	simulator: 'Simulator',
}

const THEME_LABELS: Record<string, string> = {
	action: 'Action',
	business: 'Business',
	comedy: 'Comedy',
	drama: 'Drama',
	educational: 'Educational',
	erotic: 'Erotic',
	fantasy: 'Fantasy',
	historical: 'Historical',
	horror: 'Horror',
	kids: 'Kids',
	mystery: 'Mystery',
	nonfiction: 'Non-Fiction',
	openWorld: 'Open World',
	party: 'Party',
	romance: 'Romance',
	sandbox: 'Sandbox',
	scifi: 'Sci-Fi',
	stealth: 'Stealth',
	survival: 'Survival',
	thriller: 'Thriller',
	warfare: 'Warfare',
	xxxx: 'Adult',
}

const MODE_LABELS: Record<string, string> = {
	battleRoyale: 'Battle Royale',
	cooperative: 'Cooperative',
	mmo: 'MMO',
	multiplayer: 'Multiplayer',
	singlePlayer: 'Single Player',
	splitScreen: 'Split Screen',
}

const PERSPECTIVE_LABELS: Record<string, string> = {
	auditory: 'Auditory',
	firstPerson: 'First Person',
	isometric: 'Isometric',
	sideView: 'Side View',
	text: 'Text',
	thirdPerson: 'Third Person',
	topDown: 'Top Down',
	vr: 'VR',
}

const SORT_OPTIONS = [
	{ value: 'relevance', label: 'Relevance' },
	{ value: 'name_asc', label: 'Name A\u2013Z' },
	{ value: 'name_desc', label: 'Name Z\u2013A' },
	{ value: 'published_desc', label: 'Newest' },
	{ value: 'published_asc', label: 'Oldest' },
]

function FilterDropdown({
	label,
	labels,
	selected,
	onToggle,
}: {
	label: string
	labels: Record<string, string>
	selected: string[]
	onToggle: (value: string) => void
}) {
	const count = selected.length
	return (
		<div className={'flex items-center gap-1.5'}>
			<span className={'text-xs font-medium text-muted-foreground'}>
				{label}
			</span>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant={'outline'}
						size={'sm'}
						className={'h-8 gap-1'}>
						{count > 0 ? `${label} (${count})` : 'All'}
						<ChevronDown className={'size-3 opacity-50'} />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align={'start'}>
					{Object.entries(labels).map(([value, displayName]) => (
						<DropdownMenuCheckboxItem
							key={value}
							checked={selected.includes(value)}
							onCheckedChange={() => onToggle(value)}
							onSelect={(e) => e.preventDefault()}>
							{displayName}
						</DropdownMenuCheckboxItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}

function SearchPageContent() {
	const { query } = useSearchContext()
	const prevUrisRef = useRef<Set<string>>(new Set())
	const sentinelRef = useRef<HTMLDivElement>(null)

	const [applicationTypes, setApplicationTypes] = useState<string[]>(
		DEFAULT_APPLICATION_TYPES,
	)
	const [sort, setSort] = useState('relevance')
	const [genres, setGenres] = useState<string[]>([])
	const [themes, setThemes] = useState<string[]>([])
	const [modes, setModes] = useState<string[]>([])
	const [playerPerspectives, setPlayerPerspectives] = useState<string[]>([])
	const [includeCancelled, setIncludeCancelled] = useState(false)

	const { results, cursor, isLoading, loadMore } = useSearch(query, {
		limit: 25,
		types: SEARCH_TYPES,
		applicationTypes,
		sort: sort !== 'relevance' ? sort : undefined,
		genres: genres.length > 0 ? genres : undefined,
		themes: themes.length > 0 ? themes : undefined,
		modes: modes.length > 0 ? modes : undefined,
		playerPerspectives:
			playerPerspectives.length > 0 ? playerPerspectives : undefined,
		includeCancelled: includeCancelled || undefined,
	})

	function toggleArrayValue(
		setter: React.Dispatch<React.SetStateAction<string[]>>,
	) {
		return (value: string) => {
			setter((prev) => {
				if (prev.includes(value)) {
					return prev.filter((v) => v !== value)
				}
				return [...prev, value]
			})
		}
	}

	const gameResults = useMemo(
		() =>
			results.filter(
				(
					item,
				): item is Extract<
					SearchResultItem,
					{ $type: 'games.gamesgamesgamesgames.defs#gameSummaryView' }
				> => item.$type === 'games.gamesgamesgamesgames.defs#gameSummaryView',
			),
		[results],
	)

	const staggerMap = useMemo(() => {
		const prevUris = prevUrisRef.current
		const map = new Map<string, number>()
		let newIndex = 0

		for (const item of gameResults) {
			if (!prevUris.has(item.uri)) {
				map.set(item.uri, Math.min(newIndex++, MAX_STAGGER - 1))
			}
		}

		return map
	}, [gameResults])

	useEffect(() => {
		prevUrisRef.current = new Set(gameResults.map((item) => item.uri))
	}, [gameResults])

	const stableLoadMore = useCallback(loadMore, [loadMore])

	useEffect(() => {
		const el = sentinelRef.current
		if (!el || !cursor || isLoading) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					stableLoadMore()
				}
			},
			{ rootMargin: '600px' },
		)

		observer.observe(el)
		return () => observer.disconnect()
	}, [cursor, isLoading, stableLoadMore])

	return (
		<ViewTransition enter='search-results-fade-in'>
			<main className={'mx-auto w-full max-w-6xl flex-1 px-4 py-6'}>
				{query.trim() && (
					<div
						className={
							'flex flex-wrap items-center gap-3 border-b border-border pb-4 mb-4'
						}>
						<div className={'flex w-full items-center gap-1.5 overflow-hidden'}>
							<span
								className={
									'text-xs font-medium text-muted-foreground shrink-0'
								}>
								Type
							</span>
							<Scroller
								orientation={'horizontal'}
								hideScrollbar>
								<ToggleGroup
									type={'multiple'}
									variant={'outline'}
									size={'sm'}
									value={applicationTypes}
									onValueChange={(value) => {
										if (value.length > 0) {
											setApplicationTypes(value)
										}
									}}
									className={'w-max'}>
									{ALL_APPLICATION_TYPES.map((appType) => (
										<ToggleGroupItem
											key={appType}
											value={appType}
											className={'text-xs'}>
											{APPLICATION_TYPE_LABELS[appType]}
										</ToggleGroupItem>
									))}
								</ToggleGroup>
							</Scroller>
						</div>

						<FilterDropdown
							label={'Genre'}
							labels={GENRE_LABELS}
							selected={genres}
							onToggle={toggleArrayValue(setGenres)}
						/>

						<FilterDropdown
							label={'Theme'}
							labels={THEME_LABELS}
							selected={themes}
							onToggle={toggleArrayValue(setThemes)}
						/>

						<FilterDropdown
							label={'Mode'}
							labels={MODE_LABELS}
							selected={modes}
							onToggle={toggleArrayValue(setModes)}
						/>

						<FilterDropdown
							label={'Perspective'}
							labels={PERSPECTIVE_LABELS}
							selected={playerPerspectives}
							onToggle={toggleArrayValue(setPlayerPerspectives)}
						/>

						<div className={'ml-auto flex items-center gap-3'}>
							<label className={'flex items-center gap-1.5 cursor-pointer'}>
								<Checkbox
									checked={includeCancelled}
									onCheckedChange={(checked) => setIncludeCancelled(checked === true)}
								/>
								<span className={'text-xs font-medium text-muted-foreground'}>
									Include cancelled
								</span>
							</label>

							<span className={'text-xs font-medium text-muted-foreground'}>
								Sort
							</span>
							<Select
								value={sort}
								onValueChange={setSort}>
								<SelectTrigger size={'sm'}>
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
						</div>
					</div>
				)}

				{isLoading && results.length === 0 && (
					<div className={'flex items-center justify-center py-12'}>
						<Loader2 className={'size-6 animate-spin text-muted-foreground'} />
					</div>
				)}

				{!isLoading && query.trim() && gameResults.length === 0 && (
					<p className={'py-12 text-center text-muted-foreground'}>
						No results found for &ldquo;{query}&rdquo;
					</p>
				)}

				{gameResults.length > 0 && (
					<>
						<div
							className={
								'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
							}>
							{gameResults.map((item) => {
								const staggerIndex = staggerMap.get(item.uri)
								const gameHref = `/game/${item.slug}`
								const transitionName = item.slug ?? item.uri.split('/').pop()!
								return (
									<ViewTransition
										key={item.uri}
										name={`sr-${transitionName}`}
										share={'search-result-move'}
										enter={
											staggerIndex !== undefined
												? `search-result-enter-${staggerIndex}`
												: 'search-result-enter-0'
										}
										exit={'search-result-exit'}>
										<Link
											href={gameHref}
											className={'block'}>
											<TiltCard>
												<BoxArt gameRecord={item} />
											</TiltCard>
											<div className={'mt-1.5 px-0.5'}>
												<div className={'truncate text-sm font-medium'}>
													{item.name}
												</div>
												<div
													className={
														'flex justify-between truncate text-xs text-muted-foreground'
													}>
													{typeof item.firstReleaseDate !== 'undefined' && (
														<span>
															{Math.floor(item.firstReleaseDate / 10000)}
														</span>
													)}

													{typeof item.applicationType !== 'undefined' && (
														<span className={'ml-auto'}>
															{APPLICATION_TYPE_LABELS[item.applicationType] ??
																item.applicationType}
														</span>
													)}
												</div>
											</div>
										</Link>
									</ViewTransition>
								)
							})}
						</div>

						<div ref={sentinelRef} />

						{isLoading && (
							<div className={'mt-4 flex justify-center py-4'}>
								<Loader2
									className={'size-6 animate-spin text-muted-foreground'}
								/>
							</div>
						)}
					</>
				)}

				{!query.trim() && (
					<p className={'py-12 text-center text-muted-foreground'}>
						Start typing to search
					</p>
				)}
			</main>
		</ViewTransition>
	)
}

export default function SearchPage() {
	return <SearchPageContent />
}
