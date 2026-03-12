import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { type PropsWithChildren } from 'react'

import * as API from '@/helpers/API'
import { GameLayoutContent } from '@/components/GamePage/GameLayoutContent'

type Props = Readonly<
	PropsWithChildren<{
		params: Promise<{ slug: string }>
	}>
>

export async function generateMetadata(props: Props): Promise<Metadata> {
	const { slug } = await props.params
	const gameRecord = await API.getGame({ slug })
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
	const { children } = props
	const { slug } = await props.params

	const gameRecord = await API.getGame({ slug })
	if (!gameRecord) notFound()

	const [{ reviews }, likes, similarGames] = await Promise.all([
		API.getReviews(gameRecord.uri),
		API.getLikes(gameRecord.uri),
		API.getSimilarGames(gameRecord.uri),
	])

	return (
		<GameLayoutContent
			basePath={`/game/${slug}`}
			gameRecord={gameRecord}
			likes={likes}
			reviews={reviews}
			similarGames={similarGames}
			transitionName={slug}>
			{children}
		</GameLayoutContent>
	)
}
