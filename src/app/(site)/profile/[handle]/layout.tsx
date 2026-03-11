import { notFound } from 'next/navigation'
import { type PropsWithChildren } from 'react'

import * as API from '@/helpers/API'
import { ProfileLayoutContent } from '@/components/ProfilePage/ProfileLayoutContent'

type Props = Readonly<
	PropsWithChildren<{
		params: Promise<{ handle: string }>
	}>
>

export default async function ProfileLayout(props: Props) {
	const { children } = props
	const { handle } = await props.params

	const result = await API.getProfileByHandle(handle)
	if (!result.profile || !result.profileType) notFound()

	return (
		<ProfileLayoutContent
			basePath={`/profile/${handle}`}
			handle={result.handle ?? handle}
			profile={result.profile}
			profileType={result.profileType}>
			{children}
		</ProfileLayoutContent>
	)
}
