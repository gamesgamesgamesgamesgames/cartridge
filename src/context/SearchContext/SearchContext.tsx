'use client'

import {
	createContext,
	type PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type SearchContextValue = {
	query: string
	setQuery: (value: string) => void
}

const SearchContext = createContext<SearchContextValue>({
	query: '',
	setQuery: () => {},
})

const URL_DEBOUNCE_MS = 300

export function SearchProvider({ children }: PropsWithChildren) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const urlQuery = searchParams.get('q') ?? ''

	const [query, setQueryState] = useState(urlQuery)
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	// Sync from URL → state only when no pending debounce
	// (i.e. user navigated via browser back/forward, not typing)
	useEffect(() => {
		if (!debounceRef.current) {
			setQueryState(urlQuery)
		}
	}, [urlQuery])

	const setQuery = useCallback((value: string) => {
		setQueryState(value)

		if (debounceRef.current) {
			clearTimeout(debounceRef.current)
		}

		debounceRef.current = setTimeout(() => {
			debounceRef.current = null
			const params = new URLSearchParams()
			if (value.trim()) {
				params.set('q', value)
			}
			router.replace(`/search?${params}`)
		}, URL_DEBOUNCE_MS)
	}, [router])

	return (
		<SearchContext value={{ query, setQuery }}>
			{children}
		</SearchContext>
	)
}

export function useSearchContext() {
	return useContext(SearchContext)
}
