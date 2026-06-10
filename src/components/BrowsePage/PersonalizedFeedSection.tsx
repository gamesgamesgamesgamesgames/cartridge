'use client'

import { useEffect, useReducer } from 'react'

import { type GameFeedGame } from '@/helpers/API'
import * as API from '@/helpers/API'
import { isAuthenticated } from '@/helpers/oauth'
import { FeedSection } from './FeedSection'
import { FeedSectionSkeleton } from './FeedSectionSkeleton'

type State =
	| { status: 'idle' }
	| { status: 'loading' }
	| { status: 'done'; games: GameFeedGame[] }
	| { status: 'error' }

type Action =
	| { type: 'start' }
	| { type: 'done'; games: GameFeedGame[] }
	| { type: 'error' }

function reducer(_state: State, action: Action): State {
	switch (action.type) {
		case 'start': return { status: 'loading' }
		case 'done': return { status: 'done', games: action.games }
		case 'error': return { status: 'error' }
	}
}

export function PersonalizedFeedSection() {
	const [state, dispatch] = useReducer(reducer, { status: 'idle' })

	useEffect(() => {
		if (!isAuthenticated()) return
		dispatch({ type: 'start' })
		API.getPersonalizedGames(20)
			.then((games) => dispatch({ type: 'done', games }))
			.catch(() => dispatch({ type: 'error' }))
	}, [])

	if (state.status === 'idle') return null
	if (state.status === 'loading') return <FeedSectionSkeleton cardWidth={'large'} />
	if (state.status === 'error') return null

	return (
		<FeedSection
			title={'For You'}
			games={state.games}
			cardSize={'large'}
			showGenres
		/>
	)
}
