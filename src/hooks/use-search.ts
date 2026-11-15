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
	// True when the latest search failed (as opposed to finding nothing).
	const [hasError, setHasError] = useState(false)
	// Bumped by retry() to run the current search again.
	const [attempt, setAttempt] = useState(0)
	const seqRef = useRef(0)
	const controllersRef = useRef<Map<number, AbortController>>(new Map())
	const loadMoreAbortRef = useRef<AbortController | null>(null)

	// Cancel all in-flight search requests (primary + loadMore)
	const cancelAll = () => {
		for (const controller of controllersRef.current.values()) {
			controller.abort()
		}
		controllersRef.current.clear()
		loadMoreAbortRef.current?.abort()
		loadMoreAbortRef.current = null
	}

	// Cancel all requests older than the given sequence number
	const cancelOlderThan = (seq: number) => {
		for (const [s, controller] of controllersRef.current) {
			if (s < seq) {
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
			setHasError(false)
			return
		}

		const seq = ++seqRef.current
		const controller = new AbortController()
		controllersRef.current.set(seq, controller)

		setIsLoading(true)

		search(query, { limit, types, applicationTypes, sort, genres, themes, modes, playerPerspectives, ageRatings, includeUnrated, includeCancelled, signal: controller.signal })
			.then((result) => {
				if (!controller.signal.aborted) {
					// This request completed — cancel all older in-flight requests
					cancelOlderThan(seq)
					controllersRef.current.delete(seq)

					startTransition(() => {
						setHasError(false)
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
						setHasError(true)
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

	}, [query, limit, types, applicationTypes, sort, genres, themes, modes, playerPerspectives, ageRatings, includeUnrated, includeCancelled, minLength, attempt])

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

	const retry = () => setAttempt((n) => n + 1)

	return { results, totalResults, cursor, isLoading, hasError, loadMore, retry, cancelAll }
}
