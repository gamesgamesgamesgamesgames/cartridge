'use client'

// Module imports
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { useStore } from 'statery'

// Local imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StudioNav } from '@/components/StudioShell/StudioNav'
import { store } from '@/store/store'
import { VerifiedBadge } from '@/components/VerifiedBadge/VerifiedBadge'

/**
 * The studio's own chrome, sitting under the site header.
 *
 * The left side answers "whose studio is this" and links out to the matching
 * public profile — the studio is the private half of a pair, and the two are
 * easy to lose track of otherwise. The right side is the section navigation.
 *
 * Deliberately not sticky: the site header above it is already 80px of pinned
 * chrome, and these are data-dense pages where vertical room is worth more than
 * a nav that's always one click away.
 */
export function StudioBar() {
	const { user } = useStore(store)

	const displayName = user?.displayName ?? user?.handle ?? ''
	const initials = displayName ? displayName.slice(0, 2).toUpperCase() : '??'
	const profileHref = user?.handle ? `/profile/${user.handle}` : null

	const identity = (
		<>
			<Avatar size={'sm'}>
				<AvatarImage
					src={user?.avatarURL}
					alt={''}
				/>
				<AvatarFallback>{initials}</AvatarFallback>
			</Avatar>

			<span className={'flex min-w-0 items-center gap-1.5'}>
				<span className={'truncate text-sm font-medium'}>{displayName}</span>

				{Boolean(user?.verifiedAccountType) && (
					<VerifiedBadge
						accountType={user!.verifiedAccountType!}
						className={'shrink-0 text-xs'}
					/>
				)}
			</span>
		</>
	)

	return (
		<div className={'border-b border-border bg-card/30'}>
			<div className={'mx-auto max-w-6xl px-4'}>
				<div className={'flex flex-col md:h-14 md:flex-row md:items-center md:gap-6'}>
					{Boolean(user) && (
						profileHref ? (
							<Link
								href={profileHref}
								title={'View your public profile'}
								className={
									'group flex h-12 min-w-0 shrink items-center gap-2.5 rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-full'
								}>
								{identity}

								<ArrowUpRight
									aria-hidden={'true'}
									className={
										'size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100'
									}
								/>
							</Link>
						) : (
							<div
								className={
									'flex h-12 min-w-0 shrink items-center gap-2.5 md:h-full'
								}>
								{identity}
							</div>
						)
					)}

					<StudioNav />
				</div>
			</div>
		</div>
	)
}
