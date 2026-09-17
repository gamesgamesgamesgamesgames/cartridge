import { type Metadata } from 'next'

// Local imports
import { GameAnalyticsView } from '@/components/AnalyticsDashboard/GameAnalyticsView'

export const metadata: Metadata = { title: 'Game Analytics' }

type Props = Readonly<{
	params: Promise<{ slug: string }>
}>

export default async function GameAnalyticsPage(props: Props) {
	const { slug } = await props.params

	return <GameAnalyticsView slug={slug} />
}
