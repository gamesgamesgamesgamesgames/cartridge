// Module imports
import { type Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Credits' }

export default function CreditsPage() {
	return (
		<div
			className={
				'flex min-h-screen flex-col items-center justify-center bg-background px-4'
			}>
			<main className={'flex w-full max-w-xl flex-col items-center'}>
				<h1 className={'text-4xl font-bold mb-8'}>{'Credits'}</h1>

				<dl className={'w-full space-y-4'}>
					<div>
						<dt className={'font-semibold'}>{'Cartridge Logo Font'}</dt>
						<dd className={'text-muted-foreground'}>
							{'The Cartridge font is made by the '}
							<Link
								className={'underline hover:text-foreground'}
								href={'https://simplebits.shop/products/cartridge'}
								rel={'noopener noreferrer'}
								target={'_blank'}>
								{'SimpleBits'}
							</Link>
							{' type foundry.'}
						</dd>
					</div>
				</dl>
			</main>
		</div>
	)
}
