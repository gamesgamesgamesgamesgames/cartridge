'use client'

// Module imports
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStore } from 'statery'
import { twMerge } from 'tailwind-merge'

// Local imports
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { isAdmin } from '@/helpers/admin'
import { store } from '@/store/store'

// Constants
const NAV_ITEMS = [
	{ label: 'Overview', href: '/studio', exact: true },
	{ label: 'Catalog', href: '/studio/catalog', exact: false },
	{ label: 'Analytics', href: '/studio/analytics', exact: false },
	{ label: 'Claims', href: '/studio/claims', exact: false },
	{ label: 'Contributions', href: '/studio/contributions', exact: false },
] as const

// The review queues carry the same nouns as the studio's own sections, so they
// are labelled as queues to keep the two readings apart.
const ADMIN_ITEMS = [
	{ label: 'Claim queue', href: '/admin/claims' },
	{ label: 'Contribution queue', href: '/admin/contributions' },
	{ label: 'Verification queue', href: '/admin/verification-requests' },
] as const

const ITEM_CLASS =
	'flex shrink-0 items-center border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'
const INACTIVE_CLASS =
	'border-transparent text-muted-foreground hover:text-foreground'
const ACTIVE_CLASS = 'border-primary text-foreground'

/** True when `pathname` is inside the studio section rooted at `href`. */
export function isNavItemActive(
	pathname: string,
	href: string,
	exact: boolean,
): boolean {
	if (exact) {
		return pathname === href
	}

	return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * Primary studio navigation.
 *
 * Section identity rests on the amber underline plus the foreground text
 * colour, never on colour alone, and the active item is announced with
 * `aria-current`. Admins get the review queues in a trailing menu rather than
 * inline, so the studio's own sections stay the wider reading.
 */
export function StudioNav() {
	const { user } = useStore(store)
	const pathname = usePathname()

	const showAdmin = isAdmin(user)
	const isAdminRoute = pathname.startsWith('/admin')

	return (
		<nav
			aria-label={'Studio'}
			className={twMerge(
				'flex items-stretch gap-1 overflow-x-auto md:ml-auto md:h-full md:overflow-visible',
				// Below md the row scrolls; fade the trailing edge so a clipped item
				// reads as "there's more" rather than as a rendering mistake.
				'[mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)]',
				'md:[mask-image:none]',
			)}>
			{NAV_ITEMS.map((item) => {
				const isActive = !isAdminRoute && isNavItemActive(pathname, item.href, item.exact)

				return (
					<Link
						key={item.href}
						href={item.href}
						aria-current={isActive ? 'page' : undefined}
						className={twMerge(
							ITEM_CLASS,
							isActive ? ACTIVE_CLASS : INACTIVE_CLASS,
						)}>
						{item.label}
					</Link>
				)
			})}

			{showAdmin && (
				<>
					<div
						aria-hidden={'true'}
						className={'my-auto ml-2 mr-1 h-5 w-px shrink-0 bg-border'}
					/>

					<DropdownMenu>
						<DropdownMenuTrigger
							className={twMerge(
								ITEM_CLASS,
								'cursor-pointer gap-1.5',
								isAdminRoute ? ACTIVE_CLASS : INACTIVE_CLASS,
							)}>
							{'Admin'}
							<ChevronDown className={'size-3.5'} aria-hidden={'true'} />
						</DropdownMenuTrigger>

						<DropdownMenuContent align={'end'}>
							{ADMIN_ITEMS.map((item) => (
								<DropdownMenuItem
									key={item.href}
									asChild>
									<Link href={item.href}>{item.label}</Link>
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</>
			)}
		</nav>
	)
}
