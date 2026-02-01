'use client'

// Module imports
import { PropsWithChildren } from 'react'

// Local imports

// Types
type Props = Readonly<PropsWithChildren>

export function RootLayout(props: Props) {
	const { children } = props

	return children
}
