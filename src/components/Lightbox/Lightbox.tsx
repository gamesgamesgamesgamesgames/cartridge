'use client'

// Module imports
import { useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { createPortal } from 'react-dom'

// Types
type LightboxImage = {
	src: string
	alt: string
	description?: string
}

type Props = Readonly<{
	sectionLabel: string
	images: LightboxImage[]
	currentIndex: number
	onClose: () => void
	onNavigate: (index: number) => void
}>

export function Lightbox(props: Props) {
	const { sectionLabel, images, currentIndex, onClose, onNavigate } = props

	const hasPrev = currentIndex > 0
	const hasNext = currentIndex < images.length - 1

	const goToPrev = useCallback(() => {
		if (hasPrev) onNavigate(currentIndex - 1)
	}, [hasPrev, currentIndex, onNavigate])

	const goToNext = useCallback(() => {
		if (hasNext) onNavigate(currentIndex + 1)
	}, [hasNext, currentIndex, onNavigate])

	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			switch (e.key) {
				case 'Escape':
					onClose()
					break
				case 'ArrowLeft':
					goToPrev()
					break
				case 'ArrowRight':
					goToNext()
					break
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		document.body.style.overflow = 'hidden'

		return () => {
			document.removeEventListener('keydown', handleKeyDown)
			document.body.style.overflow = ''
		}
	}, [onClose, goToPrev, goToNext])

	const current = images[currentIndex]
	if (!current) return null

	return createPortal(
		<div
			className={'fixed inset-0 z-50 flex items-center justify-center bg-black/90'}
			onClick={onClose}>
			<div
				className={'absolute top-4 left-4 flex items-center gap-3'}
				onClick={(e) => e.stopPropagation()}>
				<span className={'text-sm font-medium text-white'}>
					{sectionLabel}
				</span>

				{images.length > 1 && (
					<span className={'text-sm text-white/60'}>
						{currentIndex + 1} / {images.length}
					</span>
				)}
			</div>

			<button
				type={'button'}
				className={'absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20'}
				onClick={onClose}>
				<X className={'size-6'} />
			</button>

			{hasPrev && (
				<button
					type={'button'}
					className={'absolute left-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20'}
					onClick={(e) => {
						e.stopPropagation()
						goToPrev()
					}}>
					<ChevronLeft className={'size-6'} />
				</button>
			)}

			{hasNext && (
				<button
					type={'button'}
					className={'absolute right-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20'}
					onClick={(e) => {
						e.stopPropagation()
						goToNext()
					}}>
					<ChevronRight className={'size-6'} />
				</button>
			)}

			<img
				alt={current.alt}
				className={'max-h-[80vh] max-w-[90vw] object-contain'}
				src={current.src}
				onClick={(e) => e.stopPropagation()}
			/>

			{current.description && (
				<p
					className={'absolute bottom-4 max-w-[80vw] text-center text-sm text-white/80'}
					onClick={(e) => e.stopPropagation()}>
					{current.description}
				</p>
			)}
		</div>,
		document.body,
	)
}
