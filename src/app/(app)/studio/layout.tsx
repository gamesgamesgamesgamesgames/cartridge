import { type PropsWithChildren, Suspense } from 'react'

import { ReauthBanner } from '@/components/ReauthBanner/ReauthBanner'
import { ScrollToTop } from '@/components/ScrollToTop/ScrollToTop'
import { SearchProvider } from '@/context/SearchContext/SearchContext'
import { SiteFooter } from '@/components/SiteFooter/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader/SiteHeader'
import { StudioBar } from '@/components/StudioShell/StudioBar'

type Props = Readonly<PropsWithChildren>

export default function StudioLayout(props: Props) {
	const { children } = props

	return (
		<Suspense>
			<SearchProvider>
				<ScrollToTop />
				<div className={'flex flex-col'}>
					<div className={'flex min-h-screen flex-col justify-stretch'}>
						<SiteHeader />
						<ReauthBanner />
						<StudioBar />
						{children}
					</div>
					<SiteFooter />
				</div>
			</SearchProvider>
		</Suspense>
	)
}
