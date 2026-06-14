'use client'

import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	useSyncExternalStore,
} from 'react'
import {
	ChevronLeft,
	ChevronRight,
	Heart,
	Info,
	Pause,
	Play,
} from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { GAME_GENRES } from '@/constants/GAME_GENRES'
import * as API from '@/helpers/API'
import { type GameFeedGame } from '@/helpers/API'
import { formatLikeCount } from '@/helpers/formatLikeCount'
import { type MediaItem } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { useBlobUrl } from '@/hooks/use-blob-url'

export type HeroSlide = {
	game: GameFeedGame
	category: string
}

type Props = Readonly<{
	slides: HeroSlide[]
}>

type GameMediaItem = NonNullable<GameFeedGame['media']>[number]

const AUTO_ADVANCE_MS = 12_000
const SLIDE_FADE_MS = 700
const IMAGE_CYCLE_MS = 5_000
const IMAGE_PAN_MS = 6_000
const IMAGE_FADE_MS = 1_000

export const ARTWORK_TYPES = new Set(['artwork'])
export const SCREENSHOT_TYPES = new Set(['screenshot', 'gameplayImage'])

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

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function subscribeToReducedMotion(callback: () => void): () => void {
	const mql = window.matchMedia(REDUCED_MOTION_QUERY)
	mql.addEventListener('change', callback)
	return () => mql.removeEventListener('change', callback)
}

function getReducedMotionSnapshot(): boolean {
	return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

function getReducedMotionServerSnapshot(): boolean {
	return false
}

function useReducedMotion(): boolean {
	return useSyncExternalStore(
		subscribeToReducedMotion,
		getReducedMotionSnapshot,
		getReducedMotionServerSnapshot,
	)
}

function useGameDescription(game: GameFeedGame): string | undefined {
	const [description, setDescription] = useState(game.summary)

	useEffect(() => {
		if (game.summary) return

		let cancelled = false
		API.getGame({ uri: game.uri }).then((full) => {
			if (cancelled) return
			const text = full?.summary ?? full?.description
			if (text) setDescription(text)
		})
		return () => {
			cancelled = true
		}
	}, [game.uri, game.summary])

	return description
}

// ---------------------------------------------------------------------------
// SlideImage — single image with Ken Burns pan
// ---------------------------------------------------------------------------

function SlideImage({
	uri,
	mediaItem,
	isVisible,
	pan,
	reducedMotion,
}: {
	uri: string
	mediaItem: GameMediaItem
	isVisible: boolean
	pan: (typeof PAN_DIRECTIONS)[number]
	reducedMotion: boolean
}) {
	const blobUrl = useBlobUrl(uri, mediaItem.blob as MediaItem['blob'])
	const imgRef = useRef<HTMLImageElement>(null)
	const animRef = useRef<Animation | null>(null)

	useEffect(() => {
		if (!isVisible || reducedMotion || !imgRef.current) return

		animRef.current?.cancel()
		animRef.current = imgRef.current.animate(
			[{ transform: pan.from }, { transform: pan.to }],
			{ duration: IMAGE_PAN_MS, easing: 'linear', fill: 'forwards' },
		)
	}, [isVisible, reducedMotion, pan, blobUrl])

	useEffect(
		() => () => {
			animRef.current?.cancel()
		},
		[],
	)

	if (!blobUrl) return null

	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			ref={imgRef}
			alt={''}
			aria-hidden={'true'}
			loading={isVisible ? undefined : 'lazy'}
			className={'col-start-1 row-start-1 size-full object-cover'}
			style={{
				opacity: isVisible ? 1 : 0,
				transform: reducedMotion ? undefined : pan.from,
				transitionProperty: 'opacity',
				transitionDuration: `${IMAGE_FADE_MS}ms`,
				transitionTimingFunction: 'ease',
			}}
			src={blobUrl}
		/>
	)
}

// ---------------------------------------------------------------------------
// SlideBackgrounds — cycles through artwork/screenshots for one game
// ---------------------------------------------------------------------------

function SlideBackgrounds({
	game,
	isSlideActive,
	reducedMotion,
}: {
	game: GameFeedGame
	isSlideActive: boolean
	reducedMotion: boolean
}) {
	const media = game.media ?? []
	const artworks = media.filter((item) =>
		ARTWORK_TYPES.has(item.mediaType ?? ''),
	)
	const screenshots = media.filter((item) =>
		SCREENSHOT_TYPES.has(item.mediaType ?? ''),
	)
	const images: GameMediaItem[] =
		artworks.length >= 2 ? artworks : [...artworks, ...screenshots]

	const coverMedia = media.find((item) => item.mediaType === 'cover')
	const coverUrl = useBlobUrl(game.uri, coverMedia?.blob as MediaItem['blob'])

	const panDirections = useMemo(() => {
		return images.map((_, i) => PAN_DIRECTIONS[i % PAN_DIRECTIONS.length])
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [images.length])

	const [activeImageIndex, setActiveImageIndex] = useState(0)

	useEffect(() => {
		if (!isSlideActive || images.length <= 1) return
		const interval = setInterval(() => {
			setActiveImageIndex((prev) => (prev + 1) % images.length)
		}, IMAGE_CYCLE_MS)
		return () => clearInterval(interval)
	}, [isSlideActive, images.length])

	if (images.length === 0) {
		if (!coverUrl) return null
		return (
			// eslint-disable-next-line @next/next/no-img-element
			<img
				alt={''}
				aria-hidden={'true'}
				className={'col-start-1 row-start-1 size-full object-cover blur-xl'}
				style={{
					opacity: isSlideActive ? 0.5 : 0,
					transitionProperty: 'opacity',
					transitionDuration: `${SLIDE_FADE_MS}ms`,
					transitionTimingFunction: 'ease',
				}}
				src={coverUrl}
			/>
		)
	}

	return (
		<>
			{images.map((item, i) => (
				<SlideImage
					key={i}
					uri={game.uri}
					mediaItem={item}
					isVisible={isSlideActive && i === activeImageIndex}
					pan={panDirections[i]}
					reducedMotion={reducedMotion}
				/>
			))}
		</>
	)
}

// ---------------------------------------------------------------------------
// SlideContent — game info per slide
// ---------------------------------------------------------------------------

function SlideContent({
	slide,
	isActive,
}: {
	slide: HeroSlide
	isActive: boolean
}) {
	const { game, category } = slide
	const description = useGameDescription(game)
	const likeCount = game.likeCount ?? 0
	const href = game.slug ? `/game/${game.slug}` : undefined

	return (
		<div
			className={`col-start-1 row-start-1 transition-opacity ${
				isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
			}`}
			style={{ transitionDuration: `${SLIDE_FADE_MS}ms` }}
			aria-hidden={!isActive}>
			<span
				className={
					'block text-xs font-semibold uppercase tracking-wider text-primary md:text-sm'
				}>
				{category}
			</span>

			{href ? (
				<Link
					href={href}
					tabIndex={isActive ? undefined : -1}
					className={
						'mt-1 inline-block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary'
					}>
					<span
						className={
							'block text-3xl font-black text-white [text-wrap:balance] md:text-5xl lg:text-6xl'
						}>
						{game.name}
					</span>
				</Link>
			) : (
				<span
					className={
						'mt-1 block text-3xl font-black text-white [text-wrap:balance] md:text-5xl lg:text-6xl'
					}>
					{game.name}
				</span>
			)}

			{(Boolean(game.genres?.length) || likeCount > 0) && (
				<div className={'mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5'}>
					{game.genres?.slice(0, 4).map((genre) => (
						<span
							key={genre}
							className={
								'rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white/90'
							}>
							{GAME_GENRES[genre]?.name ?? genre}
						</span>
					))}
					{likeCount > 0 && (
						<span className={'flex items-center gap-1 text-sm text-liked'}>
							<Heart
								className={'size-3.5 fill-current'}
								aria-hidden={'true'}
							/>
							{formatLikeCount(likeCount)}
						</span>
					)}
				</div>
			)}

			{description && (
				<p
					className={
						'mt-4 line-clamp-3 max-w-xl text-sm text-white/90 [text-wrap:pretty] md:text-base'
					}>
					{description}
				</p>
			)}

			{href && (
				<div className={'mt-5'}>
					<Button
						asChild
						size={'lg'}
						tabIndex={isActive ? undefined : -1}>
						<Link href={href}>
							<Info
								className={'size-4'}
								aria-hidden={'true'}
							/>
							{'View details'}
						</Link>
					</Button>
				</div>
			)}
		</div>
	)
}

// ---------------------------------------------------------------------------
// DotIndicator — active dot morphs into a pill with progress fill
// ---------------------------------------------------------------------------

function DotIndicator({
	isActive,
	duration,
	reducedMotion,
}: {
	isActive: boolean
	duration: number
	reducedMotion: boolean
}) {
	const fillRef = useRef<HTMLSpanElement>(null)
	const animRef = useRef<Animation | null>(null)

	useEffect(() => {
		animRef.current?.cancel()
		if (!isActive || reducedMotion || !fillRef.current) return

		animRef.current = fillRef.current.animate(
			[{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
			{ duration, easing: 'linear', fill: 'forwards' },
		)

		return () => {
			animRef.current?.cancel()
		}
	}, [isActive, duration, reducedMotion])

	useEffect(
		() => () => {
			animRef.current?.cancel()
		},
		[],
	)

	return (
		<span className={'relative block h-2 w-full overflow-hidden rounded-full'}>
			<span
				className={`absolute inset-0 rounded-full transition-colors duration-300 ${
					isActive
						? reducedMotion
							? 'bg-primary'
							: 'bg-white/20'
						: 'bg-white/15 group-hover:bg-white/30'
				}`}
			/>
			{isActive && !reducedMotion && (
				<span
					ref={fillRef}
					className={'absolute inset-0 rounded-full bg-primary'}
					style={{ transformOrigin: 'left', transform: 'scaleX(0)' }}
				/>
			)}
		</span>
	)
}

// ---------------------------------------------------------------------------
// HeroCarousel
// ---------------------------------------------------------------------------

function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
	const reducedMotion = useReducedMotion()
	const [activeIndex, setActiveIndex] = useState(0)
	const [paused, setPaused] = useState(false)
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
	const count = slides.length

	const clearTimer = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current)
			timerRef.current = null
		}
	}, [])

	const startTimer = useCallback(() => {
		clearTimer()
		if (count <= 1 || reducedMotion) return
		timerRef.current = setInterval(() => {
			setActiveIndex((prev) => (prev + 1) % count)
		}, AUTO_ADVANCE_MS)
	}, [count, reducedMotion, clearTimer])

	useEffect(() => {
		if (!paused) startTimer()
		return clearTimer
	}, [paused, startTimer, clearTimer])

	const goTo = useCallback((index: number) => {
		setActiveIndex(index)
		setPaused(true)
	}, [])

	const goPrev = useCallback(() => {
		setActiveIndex((prev) => (prev - 1 + count) % count)
		setPaused(true)
	}, [count])

	const goNext = useCallback(() => {
		setActiveIndex((prev) => (prev + 1) % count)
		setPaused(true)
	}, [count])

	const togglePause = useCallback(() => {
		setPaused((prev) => !prev)
	}, [])

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'ArrowLeft') {
				e.preventDefault()
				goPrev()
			}
			if (e.key === 'ArrowRight') {
				e.preventDefault()
				goNext()
			}
		},
		[goPrev, goNext],
	)

	return (
		<div
			className={'relative grid grid-cols-1 overflow-hidden bg-card'}
			role={'region'}
			aria-roledescription={'carousel'}
			aria-label={'Featured games'}
			onKeyDown={count > 1 ? handleKeyDown : undefined}>
			{/* Spacer — sets preferred height via aspect ratio; grid cell grows if content is taller */}
			<div
				className={
					'col-start-1 row-start-1 aspect-[16/9] max-h-[80dvh] md:aspect-[21/9]'
				}
				aria-hidden={'true'}
			/>

			{/* Backgrounds — absolute so they don't affect grid sizing */}
			<div className={'absolute inset-0 grid overflow-hidden'}>
				{slides.map((slide, i) => (
					<SlideBackgrounds
						key={slide.game.uri}
						game={slide.game}
						isSlideActive={i === activeIndex}
						reducedMotion={reducedMotion}
					/>
				))}
			</div>

			{/* Gradient overlays */}
			<div
				className={
					'absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20'
				}
			/>
			<div
				className={
					'absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/60 to-transparent'
				}
			/>

			{/* Content — grid item, self-end; competes with spacer for row height */}
			<div
				className={
					'col-start-1 row-start-1 z-10 min-w-0 self-end px-4 md:px-16 lg:px-20'
				}>
				<div className={'pt-20 pb-5 md:pb-14'}>
					<div className={'min-w-0 max-w-2xl'}>
						<div className={'grid'}>
							{slides.map((slide, i) => (
								<SlideContent
									key={slide.game.uri}
									slide={slide}
									isActive={i === activeIndex}
								/>
							))}
						</div>

						{count > 1 && (
							<div className={'mt-2 flex items-center gap-1.5 md:mt-4'}>
								{slides.map((_, i) => (
									<button
										key={i}
										type={'button'}
										aria-label={`Go to slide ${i + 1} of ${count}`}
										className={
											'group flex min-h-11 w-8 items-center justify-center'
										}
										onClick={() => goTo(i)}>
										<DotIndicator
											isActive={i === activeIndex}
											duration={AUTO_ADVANCE_MS}
											reducedMotion={reducedMotion || paused}
										/>
									</button>
								))}
								{!reducedMotion && (
									<button
										type={'button'}
										aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
										className={
											'ml-1 flex min-h-11 min-w-11 items-center justify-center rounded-full text-white/50 transition-colors hover:text-white'
										}
										onClick={togglePause}>
										{paused ? (
											<Play className={'size-4'} />
										) : (
											<Pause className={'size-4'} />
										)}
									</button>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Prev / Next arrows — hidden on mobile where dots + swipe suffice */}
			{count > 1 && (
				<>
					<button
						type={'button'}
						aria-label={'Previous slide'}
						className={
							'absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-black/30 p-3 text-white/60 transition-colors hover:bg-black/50 hover:text-white md:block'
						}
						onClick={goPrev}>
						<ChevronLeft className={'size-6'} />
					</button>
					<button
						type={'button'}
						aria-label={'Next slide'}
						className={
							'absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-black/30 p-3 text-white/60 transition-colors hover:bg-black/50 hover:text-white md:block'
						}
						onClick={goNext}>
						<ChevronRight className={'size-6'} />
					</button>
				</>
			)}
		</div>
	)
}

// ---------------------------------------------------------------------------
// HeroFeedSection — public export
// ---------------------------------------------------------------------------

export function HeroFeedSection(props: Props) {
	const { slides } = props

	if (slides.length === 0) return null

	return (
		<section>
			<HeroCarousel slides={slides} />
		</section>
	)
}
