'use client'

// Module imports
import { Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ViewTransition } from 'react'

// Local imports
import { useSearchContext } from '@/context/SearchContext/SearchContext'
import { UserMenu } from './UserMenu'

export function SiteHeader() {
	const router = useRouter()
	const pathname = usePathname()
	const { query, setQuery } = useSearchContext()
	const isHomePage = pathname === '/'
	const isSearchPage = pathname === '/search'

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value

		if (isSearchPage) {
			setQuery(value)
		} else {
			if (!value.trim()) return
			router.push(`/search?q=${encodeURIComponent(value)}`)
		}
	}

	return (
		<header
			className={
				'sticky top-0 z-50 h-20 border-b border-border bg-background/95 backdrop-blur shadow-xl/30 supports-[backdrop-filter]:bg-background/60'
			}>
			<div className={'mx-auto flex h-full max-w-6xl items-stretch gap-4 px-4'}>
				<Link
					href={'/'}
					className={'flex items-center shrink-0 py-3'}>
					<Image
						src={'/images/branding/logomark.color.svg'}
						alt={'Pentaract'}
						width={48}
						height={48}
					/>
				</Link>

				{!isHomePage && (
					<ViewTransition name={'search-bar'}>
						<div className={'relative flex-1 self-center'}>
							<Search
								className={
									'absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground'
								}
							/>
							<input
								type={'search'}
								placeholder={'Search games, studios, and players...'}
								value={query}
								onChange={handleChange}
								autoFocus={isSearchPage}
								className={
									'w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
								}
							/>
						</div>
					</ViewTransition>
				)}

				<div className={'flex items-stretch gap-4 ml-auto'}>
					{/* <Link
						href={'/about'}
						className={
							'flex items-center px-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors'
						}>
						{'About'}
					</Link> */}

					<Link
						href={'/browse'}
						className={
							'flex items-center px-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors'
						}>
						{'Browse'}
					</Link>

					<UserMenu />
				</div>
			</div>
		</header>
	)
}
