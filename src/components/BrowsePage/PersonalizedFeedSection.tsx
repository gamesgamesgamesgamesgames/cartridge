'use client'

// Module imports
import { useEffect, useState } from 'react'

// Local imports
import { type GameFeedGame } from '@/helpers/API'
import * as API from '@/helpers/API'
import { isAuthenticated } from '@/helpers/oauth'
import { FeedSection } from './FeedSection'

export function PersonalizedFeedSection() {
	const [games, setGames] = useState<GameFeedGame[]>([])

	useEffect(() => {
		if (!isAuthenticated()) return

		API.getPersonalizedGames(20).then(setGames)
	}, [])

	return (
		<FeedSection
			title={'For You'}
			games={games}
		/>
	)
}
