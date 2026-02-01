'use client'

// Module imports
import { Container } from '@radix-ui/themes'
import { type CSSProperties, type PropsWithChildren } from 'react'

// Local imports
import { DashboardNavigation } from '@/components/DashboardNavigation/DashboardNavigation'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/blocks/site-header'

// Types
type Props = Readonly<PropsWithChildren>

export function DashboardLayout(props: Props) {
	const { children } = props

	return (
		<SidebarProvider
			style={
				{
					'--sidebar-width': 'calc(var(--spacing) * 72)',
					'--header-height': 'calc(var(--spacing) * 12)',
				} as CSSProperties
			}>
			<DashboardNavigation />

			<SidebarInset>{children}</SidebarInset>
		</SidebarProvider>
	)
}
