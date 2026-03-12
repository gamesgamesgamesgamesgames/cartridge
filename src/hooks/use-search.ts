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
	const lastRenderedSeqRef = useRef(0)

	useEffect(() => {
		if (query.length < minLength) {
			seqRef.current++
			lastRenderedSeqRef.current = seqRef.current
			setResults([])
			setTotalResults(undefined)
			setCursor(undefined)
			setIsLoading(false)
			return
		}

		const seq = ++seqRef.current

		setIsLoading(true)

		search(query, { limit, types, applicationTypes, sort, genres, themes, modes, playerPerspectives, ageRatings, includeUnrated, includeCancelled })
			.then((result) => {
				if (seq > lastRenderedSeqRef.current) {
					lastRenderedSeqRef.current = seq
					startTransition(() => {
						setResults(result.results)
						setTotalResults(result.totalResults)
						setCursor(result.cursor)
					})
				}
			})
			.catch(() => {
				if (seq > lastRenderedSeqRef.current) {
					lastRenderedSeqRef.current = seq
					startTransition(() => {
						setResults([])
						setTotalResults(undefined)
						setCursor(undefined)
					})
				}
			})
			.finally(() => {
				if (seq >= seqRef.current) {
					setIsLoading(false)
				}
			})
	}, [query, limit, types, applicationTypes, sort, genres, themes, modes, playerPerspectives, ageRatings, includeUnrated, includeCancelled, minLength])

	const loadMore = () => {
		if (!cursor || isLoading) return

		setIsLoading(true)
		search(query, { limit, types, applicationTypes, sort, genres, themes, modes, playerPerspectives, ageRatings, includeUnrated, includeCancelled, cursor })
			.then((result) => {
				setResults((prev) => [...prev, ...result.results])
				setCursor(result.cursor)
			})
			.catch(() => {
				// keep existing results on error
			})
			.finally(() => {
				setIsLoading(false)
			})
	}

	return { results, totalResults, cursor, isLoading, loadMore }
}
