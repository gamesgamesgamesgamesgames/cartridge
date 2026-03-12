import { notFound } from 'next/navigation'

import * as API from '@/helpers/API'
import { MetaTab } from '@/components/GamePage/MetaTab'

type Props = Readonly<{
	params: Promise<{ slug: string }>
}>

export default async function GameMetaPage(props: Props) {
	const { slug } = await props.params

	const gameRecord = await API.getGame({ slug })
	if (!gameRecord) notFound()

	return <MetaTab gameRecord={gameRecord} />
}
