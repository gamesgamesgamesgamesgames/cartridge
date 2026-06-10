import { notFound } from 'next/navigation'

import * as API from '@/helpers/API'
import { ProfileLayoutContent } from '@/components/ProfilePage/ProfileLayoutContent'
import { getBlobUrl } from '@/helpers/getBlobUrl'
import { resolvePds } from '@/helpers/resolvePds'

type Props = Readonly<{
	params: Promise<{ handle: string }>
}>

async function resolveAvatarUrl(
	profile: { avatar?: { ref?: { $link: string } | string | unknown } },
	did: string,
): Promise<string | undefined> {
	try {
		const avatar = profile.avatar as
			| { ref?: { $link: string } | string | unknown }
			| undefined
		if (!avatar) return undefined

		const ref = avatar.ref
		if (!ref) return undefined

		let cid: string
		if (typeof ref === 'string') {
			cid = ref
		} else if (typeof ref === 'object' && ref !== null && '$link' in (ref as Record<string, unknown>)) {
			cid = (ref as { $link: string }).$link
		} else {
			cid = String(ref)
		}

		if (!cid) return undefined

		const pdsEndpoint = await resolvePds(did)
		return getBlobUrl(pdsEndpoint, did, cid)
	} catch {
		return undefined
	}
}

export default async function ProfilePage(props: Props) {
	const { handle } = await props.params

	const result = await API.getProfileByHandle(handle)
	if (!result.profile || !result.profileType) notFound()

	const profile = result.profile
	const did = profile.did
	const resolvedHandle = result.handle ?? handle

	const [
		avatarUrl,
		{ reviews },
		{ games },
		{ count: gameCount },
		{ count: reviewCount },
		{ count: likeCount },
		{ count: listCount },
		{ lists },
		taste,
		{ count: followerCount },
		{ count: followingCount },
	] = await Promise.all([
		resolveAvatarUrl(profile, did),
		API.getReviews(profile.uri).catch(() => ({ reviews: [] as never[] })),
		API.listGames(20, undefined, undefined, undefined, did).catch(() => ({ games: [] as never[] })),
		API.getGameCount(did).catch(() => ({ count: 0 })),
		API.getReviewCount(did).catch(() => ({ count: 0 })),
		API.getLikeCount(did).catch(() => ({ count: 0 })),
		API.getListCount(did).catch(() => ({ count: 0 })),
		API.getUserLists(did).catch(() => ({ lists: [] as never[] })),
		API.getTasteProfile(did).catch(() => ({ genres: [], favorites: [] })),
		API.getFollowerCount(did).catch(() => ({ count: 0 })),
		API.getFollowingCount(did).catch(() => ({ count: 0 })),
	])

	return (
		<ProfileLayoutContent
			avatarUrl={avatarUrl}
			basePath={`/profile/${handle}`}
			favorites={taste.favorites}
			gameCount={gameCount}
			games={games}
			genres={taste.genres}
			handle={resolvedHandle}
			followerCount={followerCount}
			followingCount={followingCount}
			isFollowing={false}
			isFollowedBy={false}
			likeCount={likeCount}
			listCount={listCount}
			lists={lists}
			profile={profile}
			reviewCount={reviewCount}
			reviews={reviews}
		/>
	)
}
