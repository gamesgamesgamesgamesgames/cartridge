import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import * as API from '@/helpers/API'
import { getBlobUrl } from '@/helpers/getBlobUrl'
import { parseATURI } from '@/helpers/parseATURI'
import { resolvePds } from '@/helpers/resolvePds'
import { type AtUriString } from '@atproto/lex'

const AGE_RATING_FILES: Record<string, Record<string, string>> = {
	esrb: {
		EC: 'esrb/esrb_ec.svg',
		E: 'esrb/esrb_e.svg',
		E10: 'esrb/esrb_e10.svg',
		T: 'esrb/esrb_t.svg',
		M: 'esrb/esrb_m.svg',
		AO: 'esrb/esrb_ao.svg',
		RP: 'esrb/esrb_rp.svg',
	},
	pegi: {
		Three: 'pegi/pegi_3.svg',
		Seven: 'pegi/pegi_7.svg',
		Twelve: 'pegi/pegi_12.svg',
		Sixteen: 'pegi/pegi_16.svg',
		Eighteen: 'pegi/pegi_18.svg',
	},
	cero: {
		A: 'cero/cero_a.svg',
		B: 'cero/cero_b.svg',
		C: 'cero/cero_c.svg',
		D: 'cero/cero_d.svg',
		Z: 'cero/cero_z.svg',
	},
	usk: {
		Zero: 'usk/usk_0.svg',
		Six: 'usk/usk_6.svg',
		Twelve: 'usk/usk_12.svg',
		Sixteen: 'usk/usk_16.svg',
		Eighteen: 'usk/usk_18.svg',
	},
	grac: {
		All: 'grac/grac_all.svg',
		Twelve: 'grac/grac_12.svg',
		Fifteen: 'grac/grac_15.svg',
		Nineteen: 'grac/grac_19.svg',
	},
	classInd: {
		L: 'class_ind/class_ind_l.svg',
		Ten: 'class_ind/class_ind_10.svg',
		Twelve: 'class_ind/class_ind_12.svg',
		Fourteen: 'class_ind/class_ind_14.svg',
		Sixteen: 'class_ind/class_ind_16.svg',
		Eighteen: 'class_ind/class_ind_18.svg',
	},
	acb: {
		G: 'acb/acb_g.svg',
		PG: 'acb/acb_pg.svg',
		M: 'acb/acb_m.svg',
		MA15: 'acb/acb_ma_15.svg',
		R18: 'acb/acb_r_18.svg',
	},
}

export const alt = 'Game on Cartridge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function GameOGImage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const game = await API.getGame({ slug })

	const cartridgeFont = await readFile(
		join(process.cwd(), 'public/fonts/cartridge/Cartridge-Bold.ttf'),
	)

	const readexProFont = await fetch(
		'https://fonts.gstatic.com/s/readexpro/v27/SLXnc1bJ7HE5YDoGPuzj_dh8uc7wUy8ZQQyX2KY8TL0kGZN6blTC4USmgg.ttf',
	).then((res) => res.arrayBuffer())

	// Load age rating images as data URIs
	const ageRatingDataUris: string[] = []
	if (game?.ageRatings) {
		for (const ar of game.ageRatings) {
			const org = ar.organization
			const rating = ar.rating
			if (!org || !rating) continue
			const file = AGE_RATING_FILES[org]?.[rating]
			if (!file) continue
			try {
				let svg = await readFile(
					join(process.cwd(), 'public/images/age-ratings', file),
					'utf-8',
				)
				// Strip declarations, comments, attributes, and namespaces that satori can't handle
				svg = svg
					.replace(/<\?xml[^?]*\?>\s*/g, '')
					.replace(/<!DOCTYPE[^>]*>\s*/g, '')
					.replace(/<!--[\s\S]*?-->\s*/g, '')
					.replace(/\s+xmlns:xlink="[^"]*"/g, '')
					// Remove inkscape/sodipodi elements, then their namespace declarations and attributes
					.replace(/<sodipodi:[^>]*(?:\/>|>[\s\S]*?<\/sodipodi:[^>]*>)\s*/g, '')
					.replace(/<inkscape:[^>]*(?:\/>|>[\s\S]*?<\/inkscape:[^>]*>)\s*/g, '')
					.replace(/<defs[^>]*\/>\s*/g, '')
					.replace(/<defs[^>]*>\s*<\/defs>\s*/g, '')
					.replace(/\s+xmlns:inkscape="[^"]*"/g, '')
					.replace(/\s+xmlns:sodipodi="[^"]*"/g, '')
					.replace(/\s+(?:inkscape|sodipodi):[a-z-]+="[^"]*"/gi, '')
					.replace(/\s+enable-background="[^"]*"/g, '')
					.replace(/\s+xml:space="[^"]*"/g, '')
					.replace(/\s+version="[^"]*"/g, '')
					.replace(/\s+x="0px"/g, '')
					.replace(/\s+y="0px"/g, '')
				ageRatingDataUris.push(
					`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
				)
			} catch {
				// skip missing files
			}
		}
	}

	let coverUrl: string | null = null
	const blob = game?.media?.[0]?.blob
	if (blob && game?.uri) {
		const ref = (blob as unknown as { ref: { $link: string } }).ref
		const cid = typeof ref === 'string' ? ref : ref?.$link
		if (cid) {
			const { did } = parseATURI(game.uri as AtUriString)
			const pds = await resolvePds(did)
			coverUrl = getBlobUrl(pds, did, cid)
		}
	}

	return new ImageResponse(
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				alignItems: 'center',
				background:
					'linear-gradient(135deg, #1a1a2e 0%, #0f1628 60%, #0a1020 100%)',
				padding: 60,
				gap: 48,
			}}>
			{/* Cover art */}
			{coverUrl ? (
				<img
					src={coverUrl}
					width={330}
					height={440}
					style={{
						borderRadius: 16,
						objectFit: 'cover',
						flexShrink: 0,
					}}
				/>
			) : (
				<div
					style={{
						width: 330,
						height: 440,
						borderRadius: 16,
						background: '#2a2a3e',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0,
					}}>
					<div style={{ color: '#6a6a80', fontSize: 20 }}>No cover</div>
				</div>
			)}

			{/* Game info — relative container */}
			<div
				style={{
					display: 'flex',
					flex: 1,
					position: 'relative',
					height: '100%',
					overflow: 'hidden',
				}}>
				{/* Title + summary — full height, centered */}
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						// width: '100%',
						// height: '100%',
						gap: 16,
					}}>
					{(() => {
						const name = game?.name ?? 'Unknown Game'
						const parts = name.split(':')
						const titleStyle = {
							display: 'flex' as const,
							fontSize: name.length > 30 ? 48 : 60,
							fontFamily: 'Cartridge',
							fontWeight: 700 as const,
							color: '#ffffff',
							lineHeight: 1.3,
						}
						if (parts.length === 2) {
							return (
								<div style={{ display: 'flex', flexDirection: 'column' as const }}>
									<div style={titleStyle}>{parts[0]}:</div>
									<div style={titleStyle}>{parts[1]}</div>
								</div>
							)
						}
						return (
							<div style={{ ...titleStyle, lineClamp: 3, overflow: 'hidden' }}>
								{name}
							</div>
						)
					})()}

					{game?.summary && (
						<div
							style={{
								fontSize: 22,
								fontFamily: 'Readex Pro',
								color: '#a0a0b8',
								lineClamp: 3,
								overflow: 'hidden',
								lineHeight: 1.4,
							}}>
							{game.summary.length > 200
								? game.summary.slice(0, 197) + '...'
								: game.summary}
						</div>
					)}

					<div
						style={{
							alignItems: 'flex-end',
							display: 'flex',
							justifyContent: 'space-between',
							marginTop: '50px',
						}}>
						{ageRatingDataUris.length > 0 && (
							<div
								style={{
									alignItems: 'flex-end',
									display: 'flex',
									gap: 10,
									marginBottom: '5px',
								}}>
								{ageRatingDataUris.map((dataUri, i) => (
									<img
										key={i}
										height={48}
										src={dataUri}
										style={{ objectFit: 'contain' }}
									/>
								))}
							</div>
						)}

						<div
							style={{
								background:
									'linear-gradient(to right, #FFC753 0%, #FF755F 43%, #FF3CAF 100%)',
								backgroundClip: 'text',
								fontFamily: 'Cartridge',
								fontSize: 28,
								fontWeight: 700,
								color: 'transparent',
								marginLeft: 'auto',
							}}>
							Cartridge
						</div>
					</div>
				</div>
			</div>
		</div>,
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
