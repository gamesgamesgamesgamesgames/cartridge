// Local imports
import { HomeSearchInput } from '@/components/HomeSearchInput/HomeSearchInput'

export default function Home() {
	return (
		<div
			className={
				'flex flex-1 flex-col items-center justify-center bg-background px-4'
			}>
			<main className={'flex w-full max-w-xl flex-col items-center'}>
				<div className={'mb-5 relative'}>
					<h1
						className={
							'font-[family-name:var(--font-cartridge)] text-8xl sm:text-9xl  leading-[1.2] pb-2'
						}
						style={{
							background:
								'linear-gradient(to right, #FFC753 0%, #FF755F 43%, #FF3CAF 100%)',
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
							backgroundClip: 'text',
						}}>
						{'Cartridge'}
					</h1>

					<span className={'absolute bottom-1 text-xl left-55'}>
						{'Every game, loaded.'}
					</span>
				</div>

				<HomeSearchInput />
			</main>
		</div>
	)
}
