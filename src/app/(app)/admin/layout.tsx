'use client'

import { type PropsWithChildren, Suspense } from 'react'
import { useStore } from 'statery'

import { AdminNav } from '@/components/AdminNav/AdminNav'
import { isAdmin } from '@/helpers/admin'
import { ScrollToTop } from '@/components/ScrollToTop/ScrollToTop'
import { SiteFooter } from '@/components/SiteFooter/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader/SiteHeader'
import { store } from '@/store/store'

type Props = Readonly<PropsWithChildren>

export default function AdminLayout(props: Props) {
	const { children } = props
	const { user } = useStore(store)

	if (!isAdmin(user?.did)) {
		return (
			<Suspense>
				<ScrollToTop />
				<div className={'flex flex-col'}>
					<div className={'flex min-h-screen flex-col justify-stretch'}>
						<SiteHeader />
						<div className={'flex flex-1 items-center justify-center'}>
							<p className={'text-muted-foreground'}>{'You do not have access to this page.'}</p>
						</div>
					</div>
					<SiteFooter />
				</div>
			</Suspense>
		)
	}

	return (
		<Suspense>
			<ScrollToTop />
			<div className={'flex flex-col'}>
				<div className={'flex min-h-screen flex-col justify-stretch'}>
					<SiteHeader />
					<AdminNav />
					{children}
				</div>
				<SiteFooter />
			</div>
		</Suspense>
	)
}
