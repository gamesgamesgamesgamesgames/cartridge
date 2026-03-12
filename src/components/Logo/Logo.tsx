import Image from 'next/image'
import { ViewTransition } from 'react'

type Props = Readonly<{
	tagline?: string
}>

export function Logo(props: Props) {
	const { tagline = 'Every game, loaded.' } = props

	return (
		<ViewTransition name={'wordmark'}>
			<div className={'flex relative'}>
				<Image
					src={'/images/branding/logomark.color.svg'}
					alt={''}
					width={150}
					height={150}
					className={'size-20 md:size-40'}
					priority
				/>

				<div className={'relative'}>
					<h1
						className={
							'font-[family-name:var(--font-cartridge)] text-6xl md:text-9xl leading-[1.2] pb-2'
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

					<span
						className={
							'absolute bottom-0 left-16 text-sm whitespace-nowrap md:bottom-1 md:left-55 md:text-xl'
						}>
						{tagline}
					</span>
				</div>
			</div>
		</ViewTransition>
	)
}
