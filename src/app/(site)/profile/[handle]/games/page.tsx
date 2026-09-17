import { notFound } from 'next/navigation'

import * as API from '@/helpers/API'
import { ProfileGamesTab } from '@/components/ProfilePage/ProfileGamesTab'

type Props = Readonly<{
	params: Promise<{ handle: string }>
}>

export default async function ProfileGamesPage(props: Props) {
	const { handle: rawHandle } = await props.params
	const handle = decodeURIComponent(rawHandle)

	const result = await API.getProfileByHandle(handle)
	if (!result.profile) notFound()

	// Public surface: published games only, so no `includeUnpublished`.
	const { games } = await API.listGames({
		limit: 100,
		did: result.profile.did,
	})

	return <ProfileGamesTab games={games} />
}
