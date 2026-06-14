'use client'

import {
	BadgeCheck,
	BookOpen,
	ChevronDown,
	ClipboardList,
	Gavel,
	Handshake,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStore } from 'statery'
import { twMerge } from 'tailwind-merge'

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { isAdmin } from '@/helpers/admin'
import { store } from '@/store/store'

const NAV_ITEMS = [
	{ label: 'Catalog', href: '/dashboard/catalog', icon: BookOpen },
	{ label: 'Claims', href: '/dashboard/claims', icon: ClipboardList },
	{ label: 'Contributions', href: '/dashboard/contributions', icon: Handshake },
	{ label: 'Verification', href: '/verify', icon: BadgeCheck },
] as const

const ADMIN_ITEMS = [
	{ label: 'Claims', href: '/admin/claims', icon: Gavel },
	{ label: 'Contributions', href: '/admin/contributions', icon: Handshake },
	{ label: 'Verification', href: '/admin/verification-requests', icon: BadgeCheck },
] as const

export function DashboardNav() {
	const { user } = useStore(store)
	const pathname = usePathname()
	const showAdmin = isAdmin(user?.did)
	const isAdminRoute = pathname.startsWith('/dashboard/admin')

	return (
		<nav className={'border-b border-border bg-card/50'}>
			<div className={'mx-auto flex max-w-6xl items-center gap-1 px-4'}>
				{NAV_ITEMS.map((item) => {
					const isActive = pathname.startsWith(item.href) && !isAdminRoute
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

				{showAdmin && (
					<>
						<div className={'mx-2 h-5 w-px bg-border'} aria-hidden={'true'} />

						<DropdownMenu>
							<DropdownMenuTrigger
								className={twMerge(
									'flex items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-medium transition-colors outline-none',
									isAdminRoute
										? 'border-primary text-foreground'
										: 'border-transparent text-muted-foreground hover:text-foreground',
								)}>
								{'Admin'}
								<ChevronDown className={'size-3.5'} />
							</DropdownMenuTrigger>

							<DropdownMenuContent align={'start'}>
								{ADMIN_ITEMS.map((item) => (
									<DropdownMenuItem key={item.href} asChild>
										<Link href={item.href} className={'flex items-center gap-2'}>
											<item.icon className={'size-4'} />
											{item.label}
										</Link>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</>
				)}
			</div>
		</nav>
	)
}
