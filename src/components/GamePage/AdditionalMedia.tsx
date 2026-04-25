'use client'

import { useCallback, useMemo, useState } from 'react'

import { Lightbox } from '@/components/Lightbox/Lightbox'
import { type MediaItem } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { type MediaType } from '@/typedefs/MediaType'
import { useBlobUrl } from '@/hooks/use-blob-url'
import { Header } from '@/components/Header/Header'
import {
	ARTWORK_TYPES,
	COVER_TYPES,
	LOGO_TYPES,
	SCREENSHOT_TYPES,
} from '@/constants/MEDIA_CATEGORIES'

type GameMediaItem = {
	blob?: unknown
	mediaType?: string
	title?: string
	description?: string
	width?: number
	height?: number
	locale?: string
}

type MediaSection = {
	label: string
	items: GameMediaItem[]
}

type Props = Readonly<{
	uri: string
	gameName: string
	media: GameMediaItem[]
}>

function useSectionBlobUrls(uri: string, items: GameMediaItem[]) {
	const urls: (string | undefined)[] = []
	for (const item of items) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		urls.push(useBlobUrl(uri, item.blob as MediaItem['blob']))
	}
	return urls
}

function ImageSection(props: {
	section: MediaSection
	uri: string
	gameName: string
	onImageClick: (index: number) => void
}) {
	const { section, uri, gameName, onImageClick } = props
	const blobUrls = useSectionBlobUrls(uri, section.items)

	return (
		<div className={'grid grid-cols-3 gap-5'}>
			{section.items.map((mediaItem, index) => (
				<button
					key={index}
					type={'button'}
					className={'cursor-pointer text-left'}
					onClick={() => {
						if (blobUrls[index]) onImageClick(index)
					}}>
					<div className={'relative aspect-video overflow-hidden rounded'}>
						<img
							alt={''}
							aria-hidden
							className={'absolute inset-0 h-full w-full scale-110 object-cover blur-xl'}
							src={blobUrls[index] ?? 'https://placehold.co/320x180'}
						/>
						<img
							alt={`${mediaItem.mediaType} from ${gameName}`}
							className={'relative h-full w-full object-contain'}
							src={blobUrls[index] ?? 'https://placehold.co/320x180'}
						/>
					</div>
				</button>
			))}
		</div>
	)
}

function LightboxForSection(props: {
	section: MediaSection
	uri: string
	gameName: string
	imageIndex: number
	onClose: () => void
	onNavigate: (index: number) => void
}) {
	const { section, uri, gameName, imageIndex, onClose, onNavigate } = props
	const blobUrls = useSectionBlobUrls(uri, section.items)

	const images = section.items.map((item, i) => ({
		src: blobUrls[i] ?? '',
		alt: `${item.mediaType} from ${gameName}`,
		description: item.description,
	}))

	return (
		<Lightbox
			sectionLabel={section.label}
			images={images}
			currentIndex={imageIndex}
			onClose={onClose}
			onNavigate={onNavigate}
		/>
	)
}

function filterByTypes(
	items: GameMediaItem[],
	types: MediaType[],
): GameMediaItem[] {
	const typeSet = new Set<MediaType>(types)
	return items.filter((item) => typeSet.has(item.mediaType as MediaType))
}

export function AdditionalMedia(props: Props) {
	const { uri, gameName, media } = props
	const [lightbox, setLightbox] = useState<{
		sectionIndex: number
		imageIndex: number
	} | null>(null)

	const sections = useMemo(() => {
		const result: MediaSection[] = []

		const artwork = filterByTypes(media, ARTWORK_TYPES)
		if (artwork.length) result.push({ label: 'Artwork', items: artwork })

		const covers = filterByTypes(media, COVER_TYPES)
		if (covers.length) result.push({ label: 'Covers', items: covers })

		const logos = filterByTypes(media, LOGO_TYPES)
		if (logos.length) result.push({ label: 'Logos', items: logos })

		const screenshotSet = new Set<string>(SCREENSHOT_TYPES as string[])
		const artworkSet = new Set<string>(ARTWORK_TYPES as string[])
		const coverSet = new Set<string>(COVER_TYPES as string[])
		const logoSet = new Set<string>(LOGO_TYPES as string[])
		const other = media.filter(
			(item) =>
				!item.mediaType ||
				(!screenshotSet.has(item.mediaType) &&
				!artworkSet.has(item.mediaType) &&
				!coverSet.has(item.mediaType) &&
				!logoSet.has(item.mediaType)),
		)
		if (other.length) result.push({ label: 'Other Media', items: other })

		return result
	}, [media])

	const closeLightbox = useCallback(() => setLightbox(null), [])

	if (!sections.length) return null

	const lightboxSection =
		lightbox !== null ? sections[lightbox.sectionIndex] : null

	return (
		<>
			{sections.map((section, sectionIndex) => (
				<div key={section.label}>
					<Header className={'mb-6 text-lg'} level={4}>{section.label}</Header>
					<ImageSection
						section={section}
						uri={uri}
						gameName={gameName}
						onImageClick={(imageIndex) =>
							setLightbox({ sectionIndex, imageIndex })
						}
					/>
				</div>
			))}

			{lightbox !== null && lightboxSection && (
				<LightboxForSection
					section={lightboxSection}
					uri={uri}
					gameName={gameName}
					imageIndex={lightbox.imageIndex}
					onClose={closeLightbox}
					onNavigate={(imageIndex) =>
						setLightbox({ sectionIndex: lightbox.sectionIndex, imageIndex })
					}
				/>
			)}
		</>
	)
}
