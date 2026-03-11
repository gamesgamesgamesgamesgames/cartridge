// Module imports
import { type PropsWithChildren } from 'react'

// Local imports
import { RootLayout } from '@/components/RootLayout/RootLayout'

// Types
type Props = Readonly<PropsWithChildren>

export default function DashboardLayout(props: Props) {
	const { children } = props

	return <RootLayout>{children}</RootLayout>
}
