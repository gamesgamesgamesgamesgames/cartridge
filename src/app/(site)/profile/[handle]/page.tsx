import { notFound } from 'next/navigation'

import * as API from '@/helpers/API'
import { ProfileAboutTab } from '@/components/ProfilePage/ProfileAboutTab'

type Props = Readonly<{
	params: Promise<{ handle: string }>
}>

export default async function ProfileAboutPage(props: Props) {
	const { handle } = await props.params

	const result = await API.getProfileByHandle(handle)
	if (!result.profile) notFound()

	return <ProfileAboutTab profile={result.profile} />
}
