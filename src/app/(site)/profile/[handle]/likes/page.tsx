import { notFound } from 'next/navigation'

import * as API from '@/helpers/API'
import { ProfileLikesTab } from '@/components/ProfilePage/ProfileLikesTab'

type Props = Readonly<{
	params: Promise<{ handle: string }>
}>

export default async function ProfileLikesPage(props: Props) {
	const { handle } = await props.params

	const result = await API.getProfileByHandle(handle)
	if (!result.profile) notFound()

	return <ProfileLikesTab profileDid={result.profile.did} />
}
