// Local imports
import { HomeSearchInput } from '@/components/HomeSearchInput/HomeSearchInput'
import { Logo } from '@/components/Logo/Logo'
import { UpcomingReleases } from '@/components/UpcomingReleases/UpcomingReleases'
import * as API from '@/helpers/API'

export default async function Home() {
	const { feed } = await API.getUpcomingReleases(20)
	const upcomingGames = feed.map((item) => item.game)

	return (
		<>
			<div
				className={
					'flex flex-col flex-grow items-center justify-center bg-background px-4 h-[calc(100dvh-5rem)]'
				}>
				<main className={'flex flex-col gap-10 items-center w-full'}>
					<Logo />

					<HomeSearchInput />
				</main>
			</div>

			<UpcomingReleases games={upcomingGames} />
		</>
	)
}
