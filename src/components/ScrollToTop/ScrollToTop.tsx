'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

function smoothScrollToTop(duration = 400) {
	const start = window.scrollY
	if (start === 0) return

	const startTime = performance.now()

	function step(currentTime: number) {
		const elapsed = currentTime - startTime
		const progress = Math.min(elapsed / duration, 1)
		const eased = 1 - Math.pow(1 - progress, 3)

		window.scrollTo(0, start * (1 - eased))

		if (progress < 1) {
			requestAnimationFrame(step)
		}
	}

	requestAnimationFrame(step)
}

export function ScrollToTop() {
	const pathname = usePathname()
	const previousPathname = useRef(pathname)

	useEffect(() => {
		if (previousPathname.current === pathname) return
		previousPathname.current = pathname

		smoothScrollToTop()
	}, [pathname])

	return null
}
