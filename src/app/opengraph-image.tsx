import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'Cartridge — Every game, loaded.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage() {
	const logoSvg = await readFile(
		join(process.cwd(), 'public/images/branding/logomark.color.svg'),
		'utf-8',
	)

	const cartridgeFont = await readFile(
		join(process.cwd(), 'public/fonts/cartridge/Cartridge-Bold.ttf'),
	)

	const readexProFont = await fetch(
		'https://fonts.gstatic.com/s/readexpro/v27/SLXnc1bJ7HE5YDoGPuzj_dh8uc7wUy8ZQQyX2KY8TL0kGZN6blTC4USmgg.ttf',
	).then((res) => res.arrayBuffer())

	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					background: 'linear-gradient(135deg, #1a1a2e 0%, #0f1628 60%, #0a1020 100%)',
					gap: 32,
				}}>
				<img
					src={`data:image/svg+xml,${encodeURIComponent(logoSvg)}`}
					width={180}
					height={180}
				/>

				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: 8,
					}}>
					<div
						style={{
							fontSize: 72,
							fontFamily: 'Cartridge',
							fontWeight: 700,
							background: 'linear-gradient(to right, #FFC753 0%, #FF755F 43%, #FF3CAF 100%)',
							backgroundClip: 'text',
							color: 'transparent',
						}}>
						Cartridge
					</div>

					<div
						style={{
							fontSize: 24,
							fontFamily: 'Readex Pro',
							color: '#a0a0b8',
						}}>
						Every game, loaded.
					</div>
				</div>
			</div>
		),
		{
			...size,
			fonts: [
				{
					name: 'Cartridge',
					data: cartridgeFont,
					weight: 700,
					style: 'normal',
				},
				{
					name: 'Readex Pro',
					data: readexProFont,
					weight: 400,
					style: 'normal',
				},
			],
		},
	)
}
