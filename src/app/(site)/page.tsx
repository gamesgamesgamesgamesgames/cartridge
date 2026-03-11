// Local imports
import { HomeSearchInput } from '@/components/HomeSearchInput/HomeSearchInput'
import { Logo } from '@/components/Logo/Logo'

export default function Home() {
	return (
		<div
			className={
				'flex flex-1 flex-col items-center justify-center bg-background px-4'
			}>
			<main className={'flex flex-col gap-10 items-center w-full'}>
				<Logo />

				<HomeSearchInput />
			</main>
		</div>
	)
}
