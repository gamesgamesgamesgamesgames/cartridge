'use client'

import { useCallback, useState } from 'react'
import { Play } from 'lucide-react'

import { Scroller } from '@/components/ui/scroller'

type Video = {
	videoId: string
	platform: string
	title?: string
}

type Props = Readonly<{
	videos: Video[]
}>

function getEmbedUrl(videoId: string, platform: string): string | null {
	switch (platform) {
		case 'youtube':
			return `https://www.youtube.com/embed/${videoId}`
		case 'twitch':
			return `https://player.twitch.tv/?video=${videoId}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}`
		case 'vimeo':
			return `https://player.vimeo.com/video/${videoId}`
		default:
			return null
	}
}

function getThumbnailUrl(videoId: string, platform: string): string | null {
	if (platform === 'youtube') return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
	return null
}

function LazyVideo(props: { video: Video; className: string }) {
	const { video, className } = props
	const [loaded, setLoaded] = useState(false)
	const embedUrl = getEmbedUrl(video.videoId, video.platform)
	const thumbnailUrl = getThumbnailUrl(video.videoId, video.platform)

	const handleActivate = useCallback(() => setLoaded(true), [])

	if (!embedUrl) return null

	if (!loaded && thumbnailUrl) {
		return (
			<button
				type={'button'}
				className={`${className} group relative cursor-pointer overflow-hidden bg-card`}
				onClick={handleActivate}
				aria-label={`Play ${video.title ?? `${video.platform} video`}`}>
				<img
					src={thumbnailUrl}
					alt={''}
					aria-hidden={'true'}
					loading={'lazy'}
					className={'absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'}
				/>
				<div className={'absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40'}>
					<div className={'flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg'}>
						<Play className={'size-5 translate-x-0.5'} aria-hidden={'true'} />
					</div>
				</div>
			</button>
		)
	}

	return (
		<iframe
			className={className}
			src={embedUrl}
			title={video.title ?? `${video.platform} video`}
			allow={'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'}
			allowFullScreen
			loading={'lazy'}
		/>
	)
}

export function TrailerSection(props: Props) {
	const { videos } = props

	if (!videos.length) return null

	const featured = videos.slice(0, 2)
	const overflow = videos.slice(2)

	return (
		<div className={'flex flex-col gap-4'}>
			<div className={'grid gap-4 md:grid-cols-2'}>
				{featured.map((video) => (
					<LazyVideo
						key={video.videoId}
						video={video}
						className={'w-full aspect-video rounded-lg'}
					/>
				))}
			</div>

			{overflow.length > 0 && (
				<Scroller
					orientation={'horizontal'}
					hideScrollbar
					withNavigation
					scrollStep={300}
					className={'-mx-4 flex gap-3 px-4'}>
					{overflow.map((video) => (
						<LazyVideo
							key={video.videoId}
							video={video}
							className={'aspect-video w-[calc(50%-0.375rem)] shrink-0 rounded-lg md:w-[calc(25%-0.5625rem)]'}
						/>
					))}
				</Scroller>
			)}
		</div>
	)
}
