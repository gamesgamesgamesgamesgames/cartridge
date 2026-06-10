'use client'

// Module imports
import { useCallback, useEffect, useRef } from 'react'
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
	const dialogRef = useRef<HTMLDivElement>(null)
	const previousFocusRef = useRef<HTMLElement | null>(null)

	const hasPrev = currentIndex > 0
	const hasNext = currentIndex < images.length - 1

	const goToPrev = useCallback(() => {
		if (hasPrev) onNavigate(currentIndex - 1)
	}, [hasPrev, currentIndex, onNavigate])

	const goToNext = useCallback(() => {
		if (hasNext) onNavigate(currentIndex + 1)
	}, [hasNext, currentIndex, onNavigate])

	useEffect(() => {
		previousFocusRef.current = document.activeElement as HTMLElement
		dialogRef.current?.focus()

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
				case 'Tab': {
					const dialog = dialogRef.current
					if (!dialog) break
					const focusable = dialog.querySelectorAll<HTMLElement>(
						'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
					)
					if (focusable.length === 0) {
						e.preventDefault()
						break
					}
					const first = focusable[0]
					const last = focusable[focusable.length - 1]
					if (e.shiftKey && document.activeElement === first) {
						e.preventDefault()
						last.focus()
					} else if (!e.shiftKey && document.activeElement === last) {
						e.preventDefault()
						first.focus()
					}
					break
				}
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		document.body.style.overflow = 'hidden'

		return () => {
			document.removeEventListener('keydown', handleKeyDown)
			document.body.style.overflow = ''
			previousFocusRef.current?.focus()
		}
	}, [onClose, goToPrev, goToNext])

	const current = images[currentIndex]
	if (!current) return null

	return createPortal(
		<div
			ref={dialogRef}
			role={'dialog'}
			aria-modal={'true'}
			aria-label={`${sectionLabel} viewer, image ${currentIndex + 1} of ${images.length}`}
			tabIndex={-1}
			className={'fixed inset-0 z-50 flex items-center justify-center bg-black/90 outline-none'}
			onClick={onClose}>
			<div
				className={'absolute top-4 left-4 flex items-center gap-3'}
				onClick={(e) => e.stopPropagation()}>
				<span className={'text-sm font-medium text-white'}>
					{sectionLabel}
				</span>

				{images.length > 1 && (
					<span className={'text-sm text-white/60'} aria-live={'polite'}>
						{currentIndex + 1} / {images.length}
					</span>
				)}
			</div>

			<button
				type={'button'}
				aria-label={'Close lightbox'}
				className={'absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20'}
				onClick={onClose}>
				<X className={'size-6'} aria-hidden={'true'} />
			</button>

			{hasPrev && (
				<button
					type={'button'}
					aria-label={'Previous image'}
					className={'absolute left-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20'}
					onClick={(e) => {
						e.stopPropagation()
						goToPrev()
					}}>
					<ChevronLeft className={'size-6'} aria-hidden={'true'} />
				</button>
			)}

			{hasNext && (
				<button
					type={'button'}
					aria-label={'Next image'}
					className={'absolute right-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20'}
					onClick={(e) => {
						e.stopPropagation()
						goToNext()
					}}>
					<ChevronRight className={'size-6'} aria-hidden={'true'} />
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
