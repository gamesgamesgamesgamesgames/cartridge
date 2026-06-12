import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import * as API from '@/helpers/API'
import { ListDetailContent } from '@/components/ListPage/ListDetailContent'
import { getBlobUrl } from '@/helpers/getBlobUrl'
import { resolvePds } from '@/helpers/resolvePds'

type Props = Readonly<{
	params: Promise<{ handle: string; rkey: string }>
}>

async function resolveCreatorAvatarUrl(
	avatar: unknown,
	did: string,
): Promise<string | undefined> {
	try {
		if (!avatar) return undefined

		const ref = (avatar as { ref?: { $link: string } | string | unknown })?.ref
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

export async function generateMetadata(props: Props): Promise<Metadata> {
	const { handle: rawHandle, rkey } = await props.params
	const handle = decodeURIComponent(rawHandle)

	const profileResult = await API.getProfileByHandle(handle)
	if (!profileResult.profile) return {}

	const listUri = `at://${profileResult.profile.did}/games.gamesgamesgamesgames.feed.list/${rkey}`
	const result = await API.getList(listUri)
	if (!result?.list) return {}

	return {
		title: result.list.name,
		description: result.list.description,
	}
}

export default async function ListDetailPage(props: Props) {
	const { handle: rawHandle, rkey } = await props.params
	const handle = decodeURIComponent(rawHandle)

	const profileResult = await API.getProfileByHandle(handle)
	if (!profileResult.profile || !profileResult.profileType) notFound()

	const did = profileResult.profile.did
	const listUri = `at://${did}/games.gamesgamesgamesgames.feed.list/${rkey}`

	const [listResult, initialItems] = await Promise.all([
		API.getList(listUri).catch(() => null),
		API.getListItems(listUri, 30).catch(() => ({ items: [] as API.ListItemView[], cursor: undefined })),
	])

	if (!listResult?.list) notFound()

	const creatorAvatarUrl = await resolveCreatorAvatarUrl(
		listResult.list.creator.avatar,
		listResult.list.creator.did,
	)

	return (
		<ListDetailContent
			list={listResult.list}
			creatorAvatarUrl={creatorAvatarUrl}
			creatorHandle={profileResult.handle ?? handle}
			initialItems={initialItems.items}
			initialCursor={initialItems.cursor}
		/>
	)
}
