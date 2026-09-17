'use client'

// Module imports
import { useCallback, useEffect, useRef } from 'react'

// Local imports
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

// Types
export type StatusFilterOption = Readonly<{
	value: string
	label: string
}>

type Props = Readonly<{
	options: readonly StatusFilterOption[]
	value: string
	onValueChange: (value: string) => void
	/** Names the control for assistive tech, e.g. 'Filter claims by status'. */
	label: string
	disabled?: boolean
}>

/**
 * The one status filter used across every studio and admin list.
 *
 * A segmented control rather than tabs, for two reasons:
 *
 * 1. **Hierarchy.** `StudioNav` and `AdminNav` already mark the current section
 *    with an amber underline on a bottom-bordered row. An underlined tab strip
 *    directly beneath repeats that exact language one level down, leaving two
 *    "you are here" markers competing a few pixels apart.
 * 2. **Semantics.** These controls narrow one list; they don't switch between
 *    different content. Tabs are for the latter — see the profile's
 *    Activity/Games/Reviews tabs, which genuinely swap views.
 *
 * It scrolls rather than overflowing: five options with a label as long as
 * "Needs Revision" run past a phone's viewport, and a segmented control has no
 * natural wrap point.
 */
export function StatusFilterBar(props: Props) {
	const { disabled, label, onValueChange, options, value } = props

	const scrollerRef = useRef<HTMLDivElement>(null)
	const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

	const handleValueChange = useCallback(
		(next: string) => {
			// Radix emits '' when the active item is re-pressed; a filter always
			// has exactly one selection, so ignore the deselect.
			if (next) {
				onValueChange(next)
			}
		},
		[onValueChange],
	)

	// Keep the active option in view when it starts off-screen — on a phone the
	// selected filter can otherwise sit outside the visible strip.
	useEffect(() => {
		const item = itemRefs.current.get(value)
		const scroller = scrollerRef.current

		if (!item || !scroller || scroller.scrollWidth <= scroller.clientWidth) {
			return
		}

		item.scrollIntoView({ block: 'nearest', inline: 'nearest' })
	}, [value])

	// No edge fade here, unlike StudioNav: a segmented control's item borders
	// make a half-clipped option self-evidently scrollable, and a static
	// trailing fade dims the last option's own label when it's selected.
	return (
		<div
			ref={scrollerRef}
			className={'-mx-1 overflow-x-auto px-1 py-0.5'}>
			{/* Radix gives the root `role="group"` while its single-select items get
			    `role="radio"`, which is invalid — radios must live in a radiogroup.
			    Overriding the root role makes the pairing valid for screen readers. */}
			<ToggleGroup
				type={'single'}
				role={'radiogroup'}
				value={value}
				onValueChange={handleValueChange}
				variant={'outline'}
				size={'sm'}
				disabled={disabled}
				aria-label={label}>
				{options.map((option) => (
					<ToggleGroupItem
						key={option.value}
						value={option.value}
						ref={(element) => {
							if (element) {
								itemRefs.current.set(option.value, element)
							} else {
								itemRefs.current.delete(option.value)
							}
						}}>
						{option.label}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	)
}

/** Statuses shared by claims and verification requests. */
export const REVIEW_STATUS_OPTIONS = [
	{ value: 'all', label: 'All' },
	{ value: 'pending', label: 'Pending' },
	{ value: 'approved', label: 'Approved' },
	{ value: 'denied', label: 'Denied' },
] as const satisfies readonly StatusFilterOption[]

/** Contributions add a revision state on top of the review statuses. */
export const CONTRIBUTION_STATUS_OPTIONS = [
	...REVIEW_STATUS_OPTIONS,
	{ value: 'needsRevision', label: 'Needs Revision' },
] as const satisfies readonly StatusFilterOption[]
