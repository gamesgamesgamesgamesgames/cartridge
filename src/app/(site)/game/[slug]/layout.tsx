import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import * as API from '@/helpers/API'
import { encodeGameParam, gameHref } from '@/helpers/gameRoute'
import { loadGameForRoute } from '@/helpers/loadGameForRoute'
import { GameAnalytics } from '@/components/analytics/GameAnalytics'
import { GameLayoutContent } from '@/components/GamePage/GameLayoutContent'

type Props = Readonly<{
	params: Promise<{ slug: string }>
}>

export async function generateMetadata(props: Props): Promise<Metadata> {
	const { slug } = await props.params
	// Metadata is best-effort: if the game can't be loaded right now, the
	// layout below throws and the error page explains it.
	const gameRecord = await loadGameForRoute(slug).then((r) => r.game, () => undefined)
	if (!gameRecord) return {}

	const description = gameRecord.summary
		? gameRecord.summary.length > 160
			? gameRecord.summary.slice(0, 157) + '...'
			: gameRecord.summary
		: undefined

	return {
		title: gameRecord.name,
		description,
	}
}

export default async function GameLayout(props: Props) {
	const { slug } = await props.params

	// A game that doesn't exist is a 404. A game that couldn't be loaded (a
	// rate limit, a server error) throws GameUnavailableError, which error.tsx
	// renders as a retryable error rather than a 404.
	// Also found by record key (or encoded URI) when the parameter isn't a
	// slug; page.tsx sends a game that has a slug on to its slug URL.
	const { game: gameRecord } = await loadGameForRoute(slug)
	if (!gameRecord) notFound()

	const [{ reviews }, likes, similarGames] = await Promise.all([
		API.getReviews(gameRecord.uri),
		API.getLikes(gameRecord.uri),
		API.getSimilarGames(gameRecord.uri),
	])

	// Resolve parent game if this is DLC/expansion
	let parentGame: { name: string; href: string } | null = null
	if (gameRecord.parent) {
		const parent = await API.getGame({ uri: gameRecord.parent }).catch(() => undefined)
		const parentHref = parent ? gameHref(parent) : undefined
		if (parent && parentHref) {
			parentGame = { name: parent.name, href: parentHref }
		}
	}

	return (
		<>
			<GameAnalytics gameUri={gameRecord.uri} gameSlug={slug} />
			<GameLayoutContent
				basePath={`/game/${encodeGameParam(slug)}`}
				gameRecord={gameRecord}
				likes={likes}
				parentGame={parentGame}
				reviews={reviews}
				similarGames={similarGames}
				transitionName={slug}
			/>
		</>
	)
}
