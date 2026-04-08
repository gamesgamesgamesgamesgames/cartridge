'use client'

// Module imports
import { useEffect, useState } from 'react'

// Local imports
import * as API from '@/helpers/API'
import { type GameFeedGame } from '@/helpers/API'
import { FeedSection } from './FeedSection'
import { PersonalizedFeedSection } from './PersonalizedFeedSection'
import { RecentlyReleased } from '@/components/RecentlyReleased/RecentlyReleased'

export function BrowseFeedSections() {
	const [hotGames, setHotGames] = useState<GameFeedGame[]>([])
	const [upcomingGames, setUpcomingGames] = useState<GameFeedGame[]>([])
	const [recentlyReleasedGames, setRecentlyReleasedGames] = useState<GameFeedGame[]>([])
	const [recentGames, setRecentGames] = useState<GameFeedGame[]>([])

	useEffect(() => {
		const now = API.getLocalNow()

		Promise.all([
			API.getHotGames(20),
			API.getUpcomingReleases(20, undefined, now),
			API.getRecentlyReleased(20, undefined, now),
			API.getRecentlyUpdatedGames(20),
		]).then(([hot, upcoming, recentlyReleased, recent]) => {
			setHotGames(hot)
			setUpcomingGames(upcoming.feed)
			setRecentlyReleasedGames(recentlyReleased.feed)
			setRecentGames(recent)
		})
	}, [])

	return (
		<>
			<PersonalizedFeedSection />

			<FeedSection
				title={'Hot This Week'}
				games={hotGames}
			/>

			<FeedSection
				title={'Upcoming'}
				games={upcomingGames}
			/>

			<RecentlyReleased games={recentlyReleasedGames} />

			<FeedSection
				title={'Recently Updated'}
				games={recentGames}
			/>
		</>
	)
}
