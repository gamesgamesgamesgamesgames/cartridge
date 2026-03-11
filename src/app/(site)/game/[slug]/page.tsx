import { notFound } from 'next/navigation'

import * as API from '@/helpers/API'
import { AboutTab } from '@/components/GamePage/AboutTab'

type Props = Readonly<{
	params: Promise<{ slug: string }>
}>

export default async function GameAboutPage(props: Props) {
	const { slug } = await props.params

	const gameRecord = await API.getGame({ slug })
	if (!gameRecord) notFound()

	return <AboutTab gameRecord={gameRecord} />
}
