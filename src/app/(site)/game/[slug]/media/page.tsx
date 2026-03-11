import { notFound } from 'next/navigation'

import * as API from '@/helpers/API'
import { MediaTab } from '@/components/GamePage/MediaTab'

type Props = Readonly<{
	params: Promise<{ slug: string }>
}>

export default async function GameMediaPage(props: Props) {
	const { slug } = await props.params

	const gameRecord = await API.getGame({ slug })
	if (!gameRecord) notFound()

	return <MediaTab gameRecord={gameRecord} />
}
