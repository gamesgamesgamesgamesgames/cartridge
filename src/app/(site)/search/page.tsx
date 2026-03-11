'use client'

import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, ViewTransition } from 'react'

import { BoxArt } from '@/components/BoxArt/BoxArt'
import { useSearchContext } from '@/context/SearchContext/SearchContext'
import { TiltCard } from '@/components/TiltCard/TiltCard'
import { useSearch } from '@/hooks/use-search'
import { type SearchResultItem } from '@/typedefs/PentaractAPISearchResult'

const MAX_STAGGER = 20
const SEARCH_TYPES = ['game']
const APPLICATION_TYPES = ['game', 'remake', 'remaster', 'standaloneExpansion']

const APPLICATION_TYPE_LABELS: Record<string, string> = {
	addon: 'Addon',
	bundle: 'Bundle',
	dlc: 'DLC',
	episode: 'Episode',
	expandedGame: 'Expanded Game',
	expansion: 'Expansion',
	fork: 'Fork',
	game: 'Game',
	mod: 'Mod',
	port: 'Port',
	remake: 'Remake',
	remaster: 'Remaster',
	season: 'Season',
	standaloneExpansion: 'Standalone Expansion',
	update: 'Update',
}

function SearchPageContent() {
	const { query } = useSearchContext()
	const prevUrisRef = useRef<Set<string>>(new Set())

	const sentinelRef = useRef<HTMLDivElement>(null)

	const { results, cursor, isLoading, loadMore } = useSearch(query, {
		limit: 25,
		types: SEARCH_TYPES,
		applicationTypes: APPLICATION_TYPES,
	})

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
