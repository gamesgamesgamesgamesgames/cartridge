// Module imports
import { type PropsWithChildren, Suspense } from 'react'

// Local imports
import { ScrollToTop } from '@/components/ScrollToTop/ScrollToTop'
import { SearchProvider } from '@/context/SearchContext/SearchContext'
import { SiteFooter } from '@/components/SiteFooter/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader/SiteHeader'

// Types
type Props = Readonly<PropsWithChildren>

export default function SiteLayout(props: Props) {
	const { children } = props

	return (
		<Suspense>
			<SearchProvider>
				<ScrollToTop />
				<div className={'flex flex-col'}>
					<div className={'flex flex-col justify-stretch min-h-screen'}>
						<SiteHeader />

						{children}
					</div>
					<SiteFooter />
				</div>
			</SearchProvider>
		</Suspense>
	)
}
