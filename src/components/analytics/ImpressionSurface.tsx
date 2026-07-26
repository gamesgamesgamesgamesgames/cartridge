'use client'

// Module imports
import {
	createContext,
	useContext,
	useEffect,
	useRef,
	type ReactNode,
} from 'react'

// Local imports
import { track } from '@/helpers/analytics/client'
import { type ClientEvent } from '@/helpers/analytics/schema'
import { type Surface } from '@/helpers/analytics/constants'

/**
 * Describes the context a game card is rendered in, so an impression/click can
 * be attributed to the right surface (search vs feed), feed, and query. Provided
 * once around a grid; consumed by {@link useImpressionOnce} and TrackedGameLink.
 */
export type ImpressionSurface = {
	surface: Surface
	feedName?: string
	query?: string
}

const ImpressionSurfaceContext = createContext<ImpressionSurface | null>(null)

export function ImpressionSurfaceProvider(props: {
	value: ImpressionSurface
	children: ReactNode
}) {
	return (
		<ImpressionSurfaceContext.Provider value={props.value}>
			{props.children}
		</ImpressionSurfaceContext.Provider>
	)
}

export function useImpressionSurface(): ImpressionSurface | null {
	return useContext(ImpressionSurfaceContext)
}

const VISIBLE_RATIO = 0.5
const VISIBLE_DWELL_MS = 1_000

/**
 * Fires a single impression event when the referenced element has been at least
 * {@link VISIBLE_RATIO} visible for {@link VISIBLE_DWELL_MS}. Returns a ref to
 * attach to the card. `makeEvent` may return null to skip (e.g. no surface).
 */
export function useImpressionOnce(makeEvent: () => ClientEvent | null) {
	const ref = useRef<HTMLElement | null>(null)
	const makeEventRef = useRef(makeEvent)
	const firedRef = useRef(false)

	// Keep the latest factory without re-running the observer effect.
	useEffect(() => {
		makeEventRef.current = makeEvent
	})

	useEffect(() => {
		const el = ref.current
		if (!el || typeof IntersectionObserver === 'undefined') return

		let timer: ReturnType<typeof setTimeout> | null = null

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const visible =
						entry.isIntersecting &&
						entry.intersectionRatio >= VISIBLE_RATIO
					if (visible && !timer && !firedRef.current) {
						timer = setTimeout(() => {
							timer = null
							if (firedRef.current) return
							const event = makeEventRef.current()
							if (event) {
								track(event)
								firedRef.current = true
								observer.disconnect()
							}
						}, VISIBLE_DWELL_MS)
					} else if (!visible && timer) {
						clearTimeout(timer)
						timer = null
					}
				}
			},
			{ threshold: [0, VISIBLE_RATIO, 1] },
		)

		observer.observe(el)
		return () => {
			if (timer) clearTimeout(timer)
			observer.disconnect()
		}
	}, [])

	return ref
}
