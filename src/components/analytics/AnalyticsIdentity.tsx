'use client'

// Module imports
import { useEffect } from 'react'

// Local imports
import { setAnalyticsIdentity } from '@/helpers/analytics/client'
import { getSession, isAuthenticated } from '@/helpers/oauth'

/**
 * Registers how the analytics transport reads the current identity. The DID (if
 * signed in) is only used to strengthen the server-side visitor hash; it is
 * never stored. Mount once, near the app root. Renders nothing.
 */
export function AnalyticsIdentity() {
	useEffect(() => {
		setAnalyticsIdentity(() => ({
			isAuthed: isAuthenticated(),
			did: getSession()?.did,
		}))
	}, [])

	return null
}
