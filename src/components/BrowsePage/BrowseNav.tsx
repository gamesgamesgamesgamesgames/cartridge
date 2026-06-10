'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

export type BrowseNavItem = {
	id: string
	label: string
}

type Props = Readonly<{
	items: BrowseNavItem[]
}>

export function BrowseNav({ items }: Props) {
	const [activeId, setActiveId] = useState<string | null>(null)
	const [isSticky, setIsSticky] = useState(false)
	const sentinelRef = useRef<HTMLDivElement>(null)
	const navRef = useRef<HTMLElement>(null)
	const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

	const stableItems = useMemo(() => items.map((i) => i.id), [items])

	useEffect(() => {
		const visibleSections = new Map<string, number>()

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						visibleSections.set(entry.target.id, entry.intersectionRatio)
					} else {
						visibleSections.delete(entry.target.id)
					}
				}

				let bestId: string | null = null
				let bestRatio = 0
				for (const [id, ratio] of visibleSections) {
					if (ratio > bestRatio) {
						bestId = id
						bestRatio = ratio
					}
				}
				if (bestId) setActiveId(bestId)
			},
			{ rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
		)

		for (const id of stableItems) {
			const el = document.getElementById(id)
			if (el) observer.observe(el)
		}

		return () => observer.disconnect()
	}, [stableItems])

	useEffect(() => {
		const sentinel = sentinelRef.current
		if (!sentinel) return

		const observer = new IntersectionObserver(
			([entry]) => setIsSticky(!entry!.isIntersecting),
			{ threshold: 0 },
		)
		observer.observe(sentinel)
		return () => observer.disconnect()
	}, [])

	useEffect(() => {
		if (!activeId) return
		const btn = buttonRefs.current.get(activeId)
		btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
	}, [activeId])

	const scrollTo = (id: string) => {
		const el = document.getElementById(id)
		if (!el) return
		const siteHeaderHeight = 80
		const navHeight = navRef.current?.offsetHeight ?? 0
		const y = el.getBoundingClientRect().top + window.scrollY - siteHeaderHeight - navHeight - 16
		window.scrollTo({ top: y, behavior: 'smooth' })
	}

	if (items.length === 0) return null

	return (
		<>
			<div ref={sentinelRef} className={'h-0'} aria-hidden={'true'} />
			<nav
				ref={navRef}
				aria-label={'Browse sections'}
				className={cn(
					'sticky top-20 z-30 transition-colors duration-200',
					isSticky
						? 'border-b border-border/40 bg-background/95 shadow-sm backdrop-blur-sm'
						: 'bg-transparent',
				)}>
				<div className={'flex gap-1 overflow-x-auto px-4 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:px-10 lg:px-16'}>
					{items.map(({ id, label }) => (
						<button
							key={id}
							ref={(el) => {
								if (el) buttonRefs.current.set(id, el)
							}}
							type={'button'}
							onClick={() => scrollTo(id)}
							className={cn(
								'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
								activeId === id
									? 'bg-primary text-primary-foreground'
									: 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
							)}>
							{label}
						</button>
					))}
				</div>
			</nav>
		</>
	)
}
