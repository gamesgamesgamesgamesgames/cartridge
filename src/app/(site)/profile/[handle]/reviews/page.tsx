import { notFound } from 'next/navigation'

import * as API from '@/helpers/API'
import { ProfileReviewsTab } from '@/components/ProfilePage/ProfileReviewsTab'

type Props = Readonly<{
	params: Promise<{ handle: string }>
}>

export default async function ProfileReviewsPage(props: Props) {
	const { handle } = await props.params

	const result = await API.getProfileByHandle(handle)
	if (!result.profile) notFound()

	const { reviews } = await API.getReviews(result.profile.uri)

	return <ProfileReviewsTab reviews={reviews} />
}
