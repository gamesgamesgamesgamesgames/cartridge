'use client'

// Module imports
import { type ReactNode } from 'react'

// Local imports
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Header } from '@/components/Header/Header'

// Types
type Props = Readonly<{
	children: ReactNode
	id: string
	title: string
}>

export function SectionHeader(props: Props) {
	const { children, id, title } = props

	return (
		<Collapsible
			asChild
			defaultOpen>
			<section id={id}>
				<CollapsibleTrigger className={'border-b-4 mb-6 pb-1 w-full'}>
					<Header level={3}>{title}</Header>
				</CollapsibleTrigger>

				<CollapsibleContent>
					{children}
				</CollapsibleContent>
			</section>
		</Collapsible>
	)
}
