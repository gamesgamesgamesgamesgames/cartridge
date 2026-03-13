import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import * as API from '@/helpers/API'
import { getBlobUrl } from '@/helpers/getBlobUrl'
import { parseATURI } from '@/helpers/parseATURI'
import { resolvePds } from '@/helpers/resolvePds'
import { type AtUriString } from '@atproto/lex'

export const alt = 'Profile on Cartridge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function resolveImageUrl(
	uri: string,
	blob: unknown,
): Promise<string | null> {
	if (!blob || typeof blob !== 'object') return null
	const ref = (blob as { ref?: { $link?: string } }).ref
	const cid = typeof ref === 'string' ? ref : ref?.$link
	if (!cid) return null
	const { did } = parseATURI(uri as AtUriString)
	const pds = await resolvePds(did)
	return getBlobUrl(pds, did, cid)
}

export default async function ProfileOGImage({
	params,
}: {
	params: Promise<{ handle: string }>
}) {
	const { handle } = await params
	const result = await API.getProfileByHandle(handle)

	const cartridgeFont = await readFile(
		join(process.cwd(), 'public/fonts/cartridge/Cartridge-Bold.ttf'),
	)

	const readexProFont = await fetch(
		'https://fonts.gstatic.com/s/readexpro/v27/SLXnc1bJ7HE5YDoGPuzj_dh8uc7wUy8ZQQyX2KY8TL0kGZN6blTC4USmgg.ttf',
	).then((res) => res.arrayBuffer())

	const profile = result.profile
	const displayName = profile?.displayName ?? result.handle ?? handle

	let avatarUrl: string | null = null
	if (profile && 'uri' in profile && 'avatar' in profile && profile.avatar) {
		avatarUrl = await resolveImageUrl(
			(profile as { uri: string }).uri,
			profile.avatar,
		)
	}

	// Fetch 5 most recently liked games
	let likedGames: Array<{
		name: string
		coverUrl: string | null
	}> = []

	if (profile && 'did' in profile && profile.did) {
		const likesResult = await API.getLikedGames(profile.did as string, 5)
		likedGames = await Promise.all(
			likesResult.feed.map(async (item) => {
				const media = item.game.media
				let coverUrl: string | null = null
				if (media && media.length > 0 && media[0].blob) {
					coverUrl = await resolveImageUrl(item.game.uri, media[0].blob)
				}
				return { name: item.game.name, coverUrl }
			}),
		)
	}

	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					background: 'linear-gradient(135deg, #1a1a2e 0%, #0f1628 60%, #0a1020 100%)',
					padding: 60,
				}}>
				{/* Top section: avatar + name */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 36,
					}}>
					{/* Avatar */}
					{avatarUrl ? (
						<img
							src={avatarUrl}
							width={140}
							height={140}
							style={{
								borderRadius: 70,
								objectFit: 'cover',
								flexShrink: 0,
							}}
						/>
					) : (
						<div
							style={{
								width: 140,
								height: 140,
								borderRadius: 70,
								background: '#2a2a3e',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								flexShrink: 0,
							}}>
							<div style={{ color: '#6a6a80', fontSize: 48 }}>
								{displayName.charAt(0).toUpperCase()}
							</div>
						</div>
					)}

					{/* Name + handle */}
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: 4,
							flex: 1,
							overflow: 'hidden',
						}}>
						<div
							style={{
								fontSize: displayName.length > 20 ? 48 : 56,
								fontFamily: 'Cartridge',
								fontWeight: 700,
								color: '#ffffff',
								lineClamp: 1,
								overflow: 'hidden',
								lineHeight: 1.1,
							}}>
							{displayName}
						</div>

						{result.handle && (
							<div
								style={{
									fontSize: 22,
									fontFamily: 'Readex Pro',
									color: '#6a6a80',
								}}>
								@{result.handle}
							</div>
						)}
					</div>
				</div>

				{/* Liked games section */}
				{likedGames.length > 0 && (
					<div
						style={{
							display: 'flex',
							gap: 16,
							marginTop: 40,
							flex: 1,
						}}>
						{likedGames.map((game, i) => (
							<div
								key={i}
								style={{
									display: 'flex',
									position: 'relative',
									flexShrink: 0,
								}}>
								{game.coverUrl ? (
									<img
										src={game.coverUrl}
										width={140}
										height={187}
										style={{
											borderRadius: 10,
											objectFit: 'cover',
										}}
									/>
								) : (
									<div
										style={{
											width: 140,
											height: 187,
											borderRadius: 10,
											background: '#2a2a3e',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
										}}>
										<div
											style={{
												color: '#6a6a80',
												fontSize: 12,
											}}>
											No cover
										</div>
									</div>
								)}

								{/* Heart icon */}
								<div
									style={{
										position: 'absolute',
										top: -6,
										right: -6,
										width: 32,
										height: 32,
										borderRadius: 16,
										background: '#e11d48',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}>
									<svg
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="white">
										<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
									</svg>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Branding */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						marginTop: 'auto',
						gap: 12,
					}}>
					<div
						style={{
							fontSize: 28,
							fontFamily: 'Cartridge',
							fontWeight: 700,
							background: 'linear-gradient(to right, #FFC753 0%, #FF755F 43%, #FF3CAF 100%)',
							backgroundClip: 'text',
							color: 'transparent',
						}}>
						Cartridge
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
