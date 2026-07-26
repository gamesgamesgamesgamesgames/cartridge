'use client'

// Module imports
import Link from 'next/link'
import { type ComponentProps, type MouseEvent } from 'react'

// Local imports
import { stashClickSource } from '@/helpers/analytics/attribution'
import { track } from '@/helpers/analytics/client'
import {
	useImpressionOnce,
	useImpressionSurface,
} from '@/components/analytics/ImpressionSurface'

type Props = Omit<ComponentProps<typeof Link>, 'href'> & {
	gameUri: string
	gameSlug: string
	position?: number
	/** Defaults to the game page for the slug. */
	href?: ComponentProps<typeof Link>['href']
}

/**
 * A game-card link that records a viewport impression and a click-through, and
 * stashes the click's source so the destination game page can attribute the
 * visit. Must be rendered inside an {@link ImpressionSurfaceProvider}.
 */
export function TrackedGameLink(props: Props) {
	const { gameUri, gameSlug, position, href, onClick, children, ...rest } =
		props
	const surface = useImpressionSurface()

	const ref = useImpressionOnce(() =>
		surface
			? {
					type: 'impression',
					gameUri,
					gameSlug,
					surface: surface.surface,
					feedName: surface.feedName,
					position,
					query: surface.query,
				}
			: null,
	)

	function handleClick(event: MouseEvent<HTMLAnchorElement>) {
		if (surface) {
			track({
				type: 'card_click',
				gameUri,
				gameSlug,
				surface: surface.surface,
				feedName: surface.feedName,
				position,
				query: surface.query,
			})
			stashClickSource(gameSlug, {
				surface: surface.surface,
				feedName: surface.feedName,
				query: surface.query,
				position,
			})
		}
		onClick?.(event)
	}

	return (
		<Link
			ref={ref as React.Ref<HTMLAnchorElement>}
			href={href ?? `/game/${gameSlug}`}
			onClick={handleClick}
			{...rest}
		>
			{children}
		</Link>
	)
}
