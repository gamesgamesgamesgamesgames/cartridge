'use client'

import { useCallback, useEffect, useRef } from 'react'

import { ActionBarButtons } from '@/components/GamePage/ActionBarButtons'
import { Container } from '@/components/Container/Container'
import { useBlobUrl } from '@/hooks/use-blob-url'

type BlobRefLike = {
	ref: unknown
}

type Props = Readonly<{
	coverBlob?: BlobRefLike
	gameName: string
	gameUri: string
	slug?: string
}>

export function ActionBar(props: Props) {
	const { coverBlob, gameName, gameUri, slug } = props
	const barRef = useRef<HTMLDivElement>(null)
	const coverUrl = useBlobUrl(gameUri, coverBlob)

	const updateVisibility = useCallback((aboveViewport: boolean) => {
		const el = barRef.current
		if (!el) return

		if (aboveViewport) {
			el.classList.remove('translate-y-full')
			el.classList.add('translate-y-0')
			el.removeAttribute('inert')
		} else {
			el.classList.remove('translate-y-0')
			el.classList.add('translate-y-full')
			el.setAttribute('inert', '')
		}
	}, [])

	useEffect(() => {
		const heroActions = document.getElementById('hero-actions')
		if (!heroActions) return

		const observer = new IntersectionObserver(
			([entry]) => {
				const aboveViewport = !entry.isIntersecting && entry.boundingClientRect.bottom < 0
				updateVisibility(aboveViewport)
			},
			{ rootMargin: '0px' },
		)

		observer.observe(heroActions)
		return () => observer.disconnect()
	}, [updateVisibility])

	return (
		<div
			ref={barRef}
			className={'sticky bottom-0 z-40 translate-y-full border-t border-border bg-card/95 backdrop-blur motion-safe:transition-transform motion-safe:duration-200 supports-[backdrop-filter]:bg-card/80'}
			inert
			role={'group'}
			aria-label={'Game actions'}>
			<Container isScrollable={false}>
				<div className={'flex items-center gap-2 py-2.5 md:gap-3 md:py-3'}>
					<div className={'flex min-w-0 items-center gap-2.5 pr-1 md:pr-3'}>
						<div className={'size-9 shrink-0 overflow-hidden rounded-sm bg-muted md:size-10'}>
							{coverUrl ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img
									alt={''}
									aria-hidden={'true'}
									className={'size-full object-cover'}
									src={coverUrl}
								/>
							) : (
								// eslint-disable-next-line @next/next/no-img-element
								<img
									alt={''}
									aria-hidden={'true'}
									className={'size-full p-1.5 opacity-30'}
									src={'/images/branding/logomark.color.svg'}
								/>
							)}
						</div>
						<span className={'hidden truncate font-medium sm:inline md:text-lg'}>
							{gameName}
						</span>
					</div>

					<div className={'ml-auto'}>
						<ActionBarButtons
							gameName={gameName}
							gameUri={gameUri}
							slug={slug}
						/>
					</div>
				</div>
			</Container>
		</div>
	)
}
