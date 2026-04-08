// Local imports
import { GenrePills } from '@/components/HomePage/GenrePills'
import { PopularRightNow } from '@/components/HomePage/PopularRightNow'
import { StatsBar } from '@/components/HomePage/StatsBar'
import { HomeSearchInput } from '@/components/HomeSearchInput/HomeSearchInput'
import { SuggestedQueries } from '@/components/HomeSearchInput/SuggestedQueries'
import { Logo } from '@/components/Logo/Logo'
import { UpcomingReleases } from '@/components/UpcomingReleases/UpcomingReleases'
import * as API from '@/helpers/API'

export default async function Home() {
	const [popularResult, statsResult, genreResult] = await Promise.all([
		API.getPopularGames(20),
		API.getStats(),
		API.getGenreCounts(),
	])

	return (
		<>
			<div
				className={
					'flex flex-col flex-grow items-center justify-center bg-background px-4 h-[calc(100dvh-5rem)]'
				}>
				<main className={'flex flex-col gap-6 items-center w-full'}>
					<Logo />

					<HomeSearchInput />

					<SuggestedQueries />
				</main>
			</div>

			<UpcomingReleases />
			<PopularRightNow games={popularResult.games} />
			<GenrePills genreCounts={genreResult.genres} />
			<StatsBar stats={statsResult} />
		</>
	)
}
