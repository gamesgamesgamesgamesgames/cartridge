import type { Metadata } from 'next'
import { Suspense } from 'react'

import * as API from '@/helpers/API'
import { LoginPage } from '@/components/LoginPage/LoginPage'
import { Spinner } from '@/components/ui/spinner'

export const metadata: Metadata = {
	title: 'Sign In',
	description:
		'Sign in to Cartridge with your Bluesky, Tangled, or AT Protocol handle.',
}

function extractCoverUrl(
	game: API.GameFeedGame,
): string | null {
	const cover = game.media?.find(
		(m) => m.mediaType === 'cover',
	)
	if (!cover?.blob) return null

	const did = game.uri.replace(/^at:\/\//, '').split('/')[0]
	const ref = (cover.blob as { ref?: unknown })?.ref
	let cid: string | undefined

	if (typeof ref === 'string') cid = ref
	else if (
		ref &&
		typeof ref === 'object' &&
		'$link' in ref
	)
		cid = (ref as { $link: string }).$link
	else if (ref) cid = String(ref)

	if (!did || !cid) return null
	return `https://cdn.blueat.net/img/feed_thumbnail/plain/${did}/${cid}@jpeg`
}

export default async function Page() {
	const { games } = await API.getPopularGames(40)
	const coverUrls = games
		.map(extractCoverUrl)
		.filter((url): url is string => url !== null)

	return (
		<Suspense
			fallback={
				<div
					className={
						'flex flex-1 items-center justify-center py-20'
					}>
					<Spinner className={'size-6'} />
				</div>
			}>
			<LoginPage coverUrls={coverUrls} />
		</Suspense>
	)
}
