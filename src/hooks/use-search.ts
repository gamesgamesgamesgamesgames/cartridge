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
	const seqRef = useRef(0)
	const controllersRef = useRef<Map<number, { controller: AbortController; query: string }>>(new Map())
	const loadMoreAbortRef = useRef<AbortController | null>(null)

	// Cancel all in-flight search requests (primary + loadMore)
	const cancelAll = () => {
		for (const [, { controller, query: q }] of controllersRef.current) {
			console.log(`[search] cancelling query: "${q}"`)
			controller.abort()
		}
		controllersRef.current.clear()
		loadMoreAbortRef.current?.abort()
		loadMoreAbortRef.current = null
	}

	// Cancel all requests older than the given sequence number
	const cancelOlderThan = (seq: number) => {
		for (const [s, { controller, query: q }] of controllersRef.current) {
			if (s < seq) {
				console.log(`[search] cancelling query: "${q}"`)
				controller.abort()
				controllersRef.current.delete(s)
			}
		}
	}

	useEffect(() => {
		if (query.length < minLength) {
			seqRef.current++
			cancelAll()
			setResults([])
			setTotalResults(undefined)
			setCursor(undefined)
			setIsLoading(false)
			return
		}

		const seq = ++seqRef.current
		const controller = new AbortController()
		controllersRef.current.set(seq, { controller, query })

		console.log(`[search] starting query: "${query}"`)
		setIsLoading(true)

		search(query, { limit, types, applicationTypes, sort, genres, themes, modes, playerPerspectives, ageRatings, includeUnrated, includeCancelled, signal: controller.signal })
			.then((result) => {
				if (!controller.signal.aborted) {
					// This request completed — cancel all older in-flight requests
					cancelOlderThan(seq)
					controllersRef.current.delete(seq)

					startTransition(() => {
						setResults(result.results)
						setTotalResults(result.totalResults)
						setCursor(result.cursor)
					})
				}
			})
			.catch((err) => {
				if (err instanceof DOMException && err.name === 'AbortError') return
				controllersRef.current.delete(seq)
				if (seq >= seqRef.current) {
					startTransition(() => {
						setResults([])
						setTotalResults(undefined)
						setCursor(undefined)
					})
				}
			})
			.finally(() => {
				if (controllersRef.current.size === 0) {
					setIsLoading(false)
				}
			})

	}, [query, limit, types, applicationTypes, sort, genres, themes, modes, playerPerspectives, ageRatings, includeUnrated, includeCancelled, minLength])

	// Cancel all on unmount
	useEffect(() => {
		return () => cancelAll()
	}, [])

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
