import { type Metadata } from 'next'

import * as API from '@/helpers/API'
import { Header } from '@/components/Header/Header'
import { UpcomingReleasesContent } from '@/components/UpcomingReleasesPage/UpcomingReleasesContent'

export const metadata: Metadata = {
	title: 'Upcoming Releases',
	description: 'Browse upcoming game releases by month and year.',
}

const INITIAL_LIMIT = 100

export default async function UpcomingReleasesPage() {
	const now = API.getLocalNow()
	const result = await API.getUpcomingReleases(INITIAL_LIMIT, undefined, now)

	return (
		<div className={'flex flex-col gap-8 px-4 pb-16 pt-8 md:px-10 lg:px-16'}>
			<Header level={1}>
				{'Upcoming Releases'}
			</Header>

			<UpcomingReleasesContent
				initialGames={result.feed}
				initialCursor={result.cursor}
				now={now}
			/>
		</div>
	)
}
