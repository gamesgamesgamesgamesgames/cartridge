// Local imports
import { CommunityActivity } from '@/components/HomePage/CommunityActivity'
import { CommunityFire } from '@/components/CommunityFire/CommunityFire'
import { GenrePills } from '@/components/HomePage/GenrePills'
import { PopularRightNow } from '@/components/HomePage/PopularRightNow'
import { HomeSearchInput } from '@/components/HomeSearchInput/HomeSearchInput'
import { SuggestedQueries } from '@/components/HomeSearchInput/SuggestedQueries'
import { Logo } from '@/components/Logo/Logo'
import { UpcomingReleases } from '@/components/UpcomingReleases/UpcomingReleases'
import * as API from '@/helpers/API'

export default async function Home() {
	const [popularResult, statsResult, genreResult, communityResult] = await Promise.all([
		API.getPopularGames(20),
		API.getStats(),
		API.getGenreCounts(),
		API.getCommunityFeed(20),
	])

	const feed = communityResult.feed
	const unresolvedDids = [...new Set(
		feed
			.filter((item) => !item.actor.handle)
			.map((item) => item.actor.did),
	)]

	if (unresolvedDids.length > 0) {
		const resolved = await Promise.all(
			unresolvedDids.map((did) =>
				API.getProfileByHandle(did)
					.then((r) => ({ did, handle: r.handle ?? null }))
					.catch(() => ({ did, handle: null })),
			),
		)
		const handleMap = new Map(
			resolved.filter((r) => r.handle).map((r) => [r.did, r.handle!]),
		)
		for (const item of feed) {
			if (!item.actor.handle && handleMap.has(item.actor.did)) {
				item.actor.handle = handleMap.get(item.actor.did)
			}
		}
	}

	return (
		<>
			<div
				className={
					'relative flex flex-col flex-grow items-center justify-center bg-background px-4 h-[calc(100dvh-5rem)]'
				}>
				<main className={'flex flex-col gap-6 items-center w-full'}>
					<Logo />

					<HomeSearchInput />

					<SuggestedQueries />
				</main>

				<CommunityFire />
			</div>

			<UpcomingReleases />
			<PopularRightNow games={popularResult.games} />
			<GenrePills genreCounts={genreResult.genres} />
			<CommunityActivity feed={feed} stats={statsResult} />
		</>
	)
}
