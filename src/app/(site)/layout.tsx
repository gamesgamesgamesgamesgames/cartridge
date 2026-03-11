// Module imports
import { type PropsWithChildren, Suspense } from 'react'

// Local imports
import { SearchProvider } from '@/context/SearchContext/SearchContext'
import { SiteHeader } from '@/components/SiteHeader/SiteHeader'

// Types
type Props = Readonly<PropsWithChildren>

export default function SiteLayout(props: Props) {
	const { children } = props

	return (
		<Suspense>
			<SearchProvider>
				<div className={'flex min-h-screen flex-col'}>
					<SiteHeader />
					{children}
				</div>
			</SearchProvider>
		</Suspense>
	)
}
