'use client'

// Module imports
import { useSyncExternalStore } from 'react'

// Constants
const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void) {
	const mediaQuery = window.matchMedia(QUERY)

	mediaQuery.addEventListener('change', onChange)

	return () => mediaQuery.removeEventListener('change', onChange)
}

function getSnapshot(): boolean {
	return window.matchMedia(QUERY).matches
}

function getServerSnapshot(): boolean {
	// No media queries during SSR. Reporting `true` would ship a motionless
	// first paint to everyone, so anything driven by this must look right in
	// both states and never rely on a transition to reveal content.
	return false
}

/**
 * Whether the user has asked the system to reduce motion.
 *
 * Subscribes to the media query rather than mirroring it into state, so a
 * mid-session preference change is picked up and no render cascade is
 * triggered on mount.
 */
export function usePrefersReducedMotion(): boolean {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
