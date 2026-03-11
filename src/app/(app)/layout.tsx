// Module imports
import { type PropsWithChildren } from 'react'

// Types
type Props = Readonly<PropsWithChildren>

export default function AppLayout(props: Props) {
	const { children } = props

	return children
}
