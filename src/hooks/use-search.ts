import { startTransition, useEffect, useRef, useState } from 'react'

import { search } from '@/helpers/API'
import { type SearchResultItem } from '@/typedefs/PentaractAPISearchResult'

type UseSearchOptions = {
	limit?: number
	types?: string[]
	applicationTypes?: string[]
	sort?: string
	genres?: string[]
	themes?: string[]
	modes?: string[]
	playerPerspectives?: string[]
	ageRatings?: string[]
	includeUnrated?: boolean
	includeCancelled?: boolean
	minLength?: number
}

export function useSearch(
	query: string,
	options: UseSearchOptions = {},
) {
	const { limit, types, applicationTypes, sort, genres, themes, modes, playerPerspectives, ageRatings, includeUnrated, includeCancelled, minLength = 1 } = options

	const [results, setResults] = useState<SearchResultItem[]>([])
	const [totalResults, setTotalResults] = useState<number | undefined>(undefined)
	const [cursor, setCursor] = useState<string | undefined>(undefined)
	const [isLoading, setIsLoading] = useState(false)
	const abortRef = useRef<AbortController | null>(null)
	const loadMoreAbortRef = useRef<AbortController | null>(null)

	// Cancel all in-flight search requests (primary + loadMore)
	const cancelAll = () => {
		abortRef.current?.abort()
		abortRef.current = null
		loadMoreAbortRef.current?.abort()
		loadMoreAbortRef.current = null
	}

	useEffect(() => {
		// Cancel any previous request
		cancelAll()

		if (query.length < minLength) {
			setResults([])
			setTotalResults(undefined)
			setCursor(undefined)
			setIsLoading(false)
			return
		}

		const controller = new AbortController()
		abortRef.current = controller

		setIsLoading(true)

		search(query, { limit, types, applicationTypes, sort, genres, themes, modes, playerPerspectives, ageRatings, includeUnrated, includeCancelled, signal: controller.signal })
			.then((result) => {
				if (!controller.signal.aborted) {
					startTransition(() => {
						setResults(result.results)
						setTotalResults(result.totalResults)
						setCursor(result.cursor)
					})
				}
			})
			.catch((err) => {
				if (err instanceof DOMException && err.name === 'AbortError') return
				if (!controller.signal.aborted) {
					startTransition(() => {
						setResults([])
						setTotalResults(undefined)
						setCursor(undefined)
					})
				}
			})
			.finally(() => {
				if (!controller.signal.aborted) {
					setIsLoading(false)
				}
			})

		return () => {
			controller.abort()
		}
	}, [query, limit, types, applicationTypes, sort, genres, themes, modes, playerPerspectives, ageRatings, includeUnrated, includeCancelled, minLength])

	const loadMore = () => {
		if (!cursor || isLoading) return

		// Cancel any previous loadMore request
		loadMoreAbortRef.current?.abort()

		const controller = new AbortController()
		loadMoreAbortRef.current = controller

		setIsLoading(true)
		search(query, { limit, types, applicationTypes, sort, genres, themes, modes, playerPerspectives, ageRatings, includeUnrated, includeCancelled, cursor, signal: controller.signal })
			.then((result) => {
				if (!controller.signal.aborted) {
					setResults((prev) => [...prev, ...result.results])
					setCursor(result.cursor)
				}
			})
			.catch((err) => {
				if (err instanceof DOMException && err.name === 'AbortError') return
				// keep existing results on error
			})
			.finally(() => {
				if (!controller.signal.aborted) {
					setIsLoading(false)
				}
			})
	}

	return { results, totalResults, cursor, isLoading, loadMore, cancelAll }
}
