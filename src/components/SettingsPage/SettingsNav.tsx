'use client'

// Module imports
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Constants
const SETTINGS_TABS = [
	{ label: 'Profile', href: '/settings/profile' },
] as const

export function SettingsNav() {
	const pathname = usePathname()

	return (
		<nav className={'flex gap-1 border-b border-border'}>
			{SETTINGS_TABS.map((tab) => {
				const isActive = pathname.startsWith(tab.href)
				return (
					<Link
						key={tab.href}
						href={tab.href}
						className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
							isActive
								? 'text-foreground'
								: 'text-muted-foreground hover:text-foreground'
						}`}>
						{tab.label}
						{isActive && (
							<span className={'absolute inset-x-0 bottom-0 h-0.5 bg-foreground'} />
						)}
					</Link>
				)
			})}
		</nav>
	)
}
