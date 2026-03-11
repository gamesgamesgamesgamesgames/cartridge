import { notFound } from 'next/navigation'
import { type PropsWithChildren } from 'react'

import * as API from '@/helpers/API'
import { GameLayoutContent } from '@/components/GamePage/GameLayoutContent'

type Props = Readonly<
	PropsWithChildren<{
		params: Promise<{ slug: string }>
	}>
>

export default async function GameLayout(props: Props) {
	const { children } = props
	const { slug } = await props.params

	const gameRecord = await API.getGame({ slug })
	if (!gameRecord) notFound()

	const [{ reviews }, likes] = await Promise.all([
		API.getReviews(gameRecord.uri),
		API.getLikes(gameRecord.uri),
	])

	return (
		<GameLayoutContent
			basePath={`/game/${slug}`}
			gameRecord={gameRecord}
			likes={likes}
			reviews={reviews}
			transitionName={slug}>
			{children}
		</GameLayoutContent>
	)
}
