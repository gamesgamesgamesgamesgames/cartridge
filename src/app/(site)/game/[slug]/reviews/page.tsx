import { notFound } from 'next/navigation'

import * as API from '@/helpers/API'
import { ReviewsTab } from '@/components/GamePage/ReviewsTab'

type Props = Readonly<{
	params: Promise<{ slug: string }>
}>

export default async function GameReviewsPage(props: Props) {
	const { slug } = await props.params

	const gameRecord = await API.getGame({ slug })
	if (!gameRecord) notFound()

	const { reviews } = await API.getReviews(gameRecord.uri)

	return <ReviewsTab reviews={reviews} />
}
