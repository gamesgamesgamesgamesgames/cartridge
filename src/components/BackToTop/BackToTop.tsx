'use client'

import { ArrowUp } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

export function BackToTop() {
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		function onScroll() {
			setVisible(window.scrollY > 600)
		}

		window.addEventListener('scroll', onScroll, { passive: true })
		return () => window.removeEventListener('scroll', onScroll)
	}, [])

	const scrollToTop = useCallback(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}, [])

	return (
		<Button
			aria-label={'Back to top'}
			className={`fixed bottom-6 right-6 z-40 size-10 rounded-full shadow-lg transition-all ${visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
			onClick={scrollToTop}
			size={'icon'}
			variant={'secondary'}>
			<ArrowUp className={'size-4'} aria-hidden={'true'} />
		</Button>
	)
}
