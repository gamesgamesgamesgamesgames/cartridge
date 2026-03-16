// Local imports
import * as API from '@/helpers/API'
import { FeedSection } from '@/components/BrowsePage/FeedSection'
import { PersonalizedFeedSection } from '@/components/BrowsePage/PersonalizedFeedSection'

export const metadata = {
	title: 'Browse Games',
}

export default async function BrowsePage() {
	const [hotGames, upcomingData, recentGames] =
		await Promise.all([
			API.getHotGames(20),
			API.getUpcomingReleases(20),
			API.getRecentlyUpdatedGames(20),
		])

	const upcomingGames = upcomingData.feed.map((item) => item.game)

	return (
		<div className={'flex flex-col gap-12 py-8'}>
			<PersonalizedFeedSection />

			<FeedSection
				title={'Hot This Week'}
				games={hotGames}
			/>

			<FeedSection
				title={'Upcoming'}
				games={upcomingGames}
			/>

			<FeedSection
				title={'Recently Updated'}
				games={recentGames}
			/>
		</div>
	)
}
