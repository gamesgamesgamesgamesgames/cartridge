'use client'

import { useEffect, useMemo, useState } from 'react'
import { type GameRecord } from '@/typedefs/GameRecord'
import { type MediaItem } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { useBlobUrl } from '@/hooks/use-blob-url'

type GameMediaItem = NonNullable<GameRecord['media']>[number]

const ARTWORK_TYPES = new Set(['artwork', 'conceptArt', 'keyArt', 'keyArtLogo'])
const SCREENSHOT_TYPES = new Set(['screenshot', 'gameplayImage'])

const PAN_DIRECTIONS = [
	{
		from: 'scale(1.15) translate(-3%, -3%)',
		to: 'scale(1.15) translate(3%, 3%)',
	},
	{
		from: 'scale(1.15) translate(3%, -3%)',
		to: 'scale(1.15) translate(-3%, 3%)',
	},
	{
		from: 'scale(1.15) translate(-3%, 3%)',
		to: 'scale(1.15) translate(3%, -3%)',
	},
	{
		from: 'scale(1.15) translate(3%, 3%)',
		to: 'scale(1.15) translate(-3%, -3%)',
	},
] as const

function shuffled<T>(arr: T[]): T[] {
	const copy = [...arr]
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[copy[i], copy[j]] = [copy[j], copy[i]]
	}
	return copy
}

function BackgroundImage({
	uri,
	mediaItem,
	isActive,
	pan,
}: {
	uri: string
	mediaItem: GameMediaItem
	isActive: boolean
	pan: (typeof PAN_DIRECTIONS)[number]
}) {
	const blobUrl = useBlobUrl(uri, mediaItem.blob as MediaItem['blob'])
	const [animating, setAnimating] = useState(false)

	useEffect(() => {
		if (isActive) {
			// Snap to start position (invisible — opacity is still 0)
			setAnimating(false)
			// Next frame: begin transitioning to end position
			let inner: number
			const outer = requestAnimationFrame(() => {
				inner = requestAnimationFrame(() => {
					setAnimating(true)
				})
			})
			return () => {
				cancelAnimationFrame(outer)
				cancelAnimationFrame(inner)
			}
		}
	}, [isActive])

	if (!blobUrl) return null

	return (
		<img
			alt={''}
			className={`absolute inset-0 h-full w-full object-cover blur-sm ${isActive ? 'opacity-20' : 'opacity-0'}`}
			src={blobUrl}
			style={{
				transform: animating ? pan.to : pan.from,
				transitionProperty: 'opacity, transform',
				transitionDuration: `1000ms, ${animating ? '6000ms' : '0ms'}`,
				transitionTimingFunction: 'ease, linear',
			}}
		/>
	)
}

export function ArtworkBackground({
	gameRecord,
}: {
	gameRecord: GameRecord
}) {
	const media = gameRecord.media ?? []
	const artworks = media.filter((item) => ARTWORK_TYPES.has(item.mediaType ?? ''))
	const screenshots = media.filter((item) => SCREENSHOT_TYPES.has(item.mediaType ?? ''))
	const images: GameMediaItem[] = artworks.length > 0 ? artworks : screenshots

	// Assign a random pan direction to each artwork on mount
	const panDirections = useMemo(() => {
		const pool: (typeof PAN_DIRECTIONS)[number][] = []
		while (pool.length < images.length) {
			pool.push(...shuffled([...PAN_DIRECTIONS]))
		}
		return pool.slice(0, images.length)
	}, [images.length])

	const [activeIndex, setActiveIndex] = useState(0)

	useEffect(() => {
		if (images.length <= 1) return
		const interval = setInterval(() => {
			setActiveIndex((prev) => (prev + 1) % images.length)
		}, 5000)
		return () => clearInterval(interval)
	}, [images.length])

	if (images.length === 0) return null

	return (
		<div className={'absolute inset-0 overflow-hidden'}>
			{images.map((item, i) => (
				<BackgroundImage
					key={i}
					isActive={i === activeIndex}
					mediaItem={item}
					pan={panDirections[i]}
					uri={gameRecord.uri}
				/>
			))}
		</div>
	)
}
