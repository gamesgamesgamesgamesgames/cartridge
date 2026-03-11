// Local imports
import { ReviewsTab } from '@/components/GamePage/ReviewsTab'
import { type PopfeedReview } from '@/helpers/lexicons/games/gamesgamesgamesgames/getReviews.defs'

// Types
type Props = Readonly<{
	reviews: PopfeedReview[]
}>

export async function ProfileReviewsTab(props: Props) {
	const { reviews } = props

	if (!reviews.length) {
		return (
			<p className={'text-muted-foreground'}>
				{'This user hasn\'t written any reviews yet.'}
			</p>
		)
	}

	return <ReviewsTab reviews={reviews} />
}
