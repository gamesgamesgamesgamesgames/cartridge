'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ViewTransition } from 'react'

import { useSearchContext } from '@/context/SearchContext/SearchContext'

export function HomeSearchInput() {
	const router = useRouter()
	const { setQuery } = useSearchContext()

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		if (!value.trim()) return

		setQuery(value)
		router.push(`/search?q=${encodeURIComponent(value)}`)
	}

	return (
		<ViewTransition name='search-bar'>
			<div className={'relative max-w-sm w-full md:max-w-xl md:w-xl'}>
				<Search
					className={
						'absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground'
					}
				/>
				<input
					autoFocus
					type={'search'}
					placeholder={'Search games...'}
					onChange={handleChange}
					className={
						'w-full rounded-xl border border-input bg-background px-12 py-4 text-base placeholder:text-muted-foreground shadow-sm ring-0 ring-ring transition-[box-shadow,color] duration-500 focus-visible:outline-none focus-visible:ring-2'
					}
				/>
			</div>
		</ViewTransition>
	)
}
