'use client'

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

export function TrailerSection(props: Props) {
	const { videos } = props

	if (!videos.length) return null

	const featured = videos.slice(0, 2)
	const overflow = videos.slice(2)

	return (
		<div className={'flex flex-col gap-4'}>
			<div className={'grid gap-4 md:grid-cols-2'}>
				{featured.map((video) => {
					const embedUrl = getEmbedUrl(video.videoId, video.platform)
					if (!embedUrl) return null
					return (
						<iframe
							key={video.videoId}
							className={'w-full aspect-video rounded-lg'}
							src={embedUrl}
							title={video.title ?? `${video.platform} video`}
							allow={'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'}
							allowFullScreen
						/>
					)
				})}
			</div>

			{overflow.length > 0 && (
				<Scroller
					orientation={'horizontal'}
					hideScrollbar
					withNavigation
					scrollStep={300}
					className={'-mx-4 flex gap-3 px-4'}>
					{overflow.map((video) => {
						const embedUrl = getEmbedUrl(video.videoId, video.platform)
						if (!embedUrl) return null
						return (
							<iframe
								key={video.videoId}
								className={'aspect-video w-[calc(50%-0.375rem)] shrink-0 rounded-lg md:w-[calc(25%-0.5625rem)]'}
								src={embedUrl}
								title={video.title ?? `${video.platform} video`}
								allow={'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'}
								allowFullScreen
							/>
						)
					})}
				</Scroller>
			)}
		</div>
	)
}
