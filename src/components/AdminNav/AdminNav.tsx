'use client'

import { BadgeCheck, Gavel, Handshake, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStore } from 'statery'
import { twMerge } from 'tailwind-merge'

import { isSuperAdmin } from '@/helpers/admin'
import { store } from '@/store/store'

const ADMIN_ITEMS = [
	{ label: 'Claims', href: '/admin/claims', icon: Gavel },
	{ label: 'Contributions', href: '/admin/contributions', icon: Handshake },
	{ label: 'Verification', href: '/admin/verification-requests', icon: BadgeCheck },
] as const

export function AdminNav() {
	const pathname = usePathname()
	const { user } = useStore(store)

	return (
		<nav className={'border-b border-border bg-card/50'}>
			<div className={'mx-auto flex max-w-6xl items-center gap-1 px-4'}>
				<span className={'mr-3 text-sm font-semibold text-muted-foreground'}>
					{'Admin'}
				</span>

				{ADMIN_ITEMS.map((item) => {
					const isActive = pathname.startsWith(item.href)
					return (
						<Link
							key={item.href}
							href={item.href}
							className={twMerge(
								'flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors',
								isActive
									? 'border-primary text-foreground'
									: 'border-transparent text-muted-foreground hover:text-foreground',
							)}>
							<item.icon className={'size-4'} />
							{item.label}
						</Link>
					)
				})}

				{isSuperAdmin(user) && (
					<Link
						href={'/admin/users'}
						className={twMerge(
							'flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors',
							pathname.startsWith('/admin/users')
								? 'border-primary text-foreground'
								: 'border-transparent text-muted-foreground hover:text-foreground',
						)}>
						<Users className={'size-4'} />
						{'Users'}
					</Link>
				)}
			</div>
		</nav>
	)
}
