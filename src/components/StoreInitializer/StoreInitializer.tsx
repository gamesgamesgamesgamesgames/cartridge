'use client'

// Module imports
import { useEffect, useRef } from 'react'

// Local imports
import { initialize } from '@/store/initialize'

export function StoreInitializer() {
	const initialized = useRef(false)

	useEffect(() => {
		if (!initialized.current) {
			initialized.current = true
			initialize()
		}
	}, [])

	return null
}
