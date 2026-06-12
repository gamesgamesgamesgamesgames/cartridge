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

	const { games } = await API.listGames(100, undefined, undefined, undefined, result.profile.did)

	return <ProfileGamesTab games={games} />
}
