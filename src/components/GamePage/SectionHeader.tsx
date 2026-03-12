'use client'

// Module imports
import { ChevronDown } from 'lucide-react'
import { type ReactNode, useState } from 'react'

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
	const [open, setOpen] = useState(true)

	return (
		<Collapsible
			asChild
			open={open}
			onOpenChange={setOpen}>
			<section id={id}>
				<CollapsibleTrigger className={'flex items-center justify-between border-b-4 mb-6 pb-1 w-full cursor-pointer'}>
					<Header level={3}>{title}</Header>
					<ChevronDown
						className={`size-5 shrink-0 transition-transform ${open ? '' : '-rotate-90'}`}
					/>
				</CollapsibleTrigger>

				<CollapsibleContent>
					{children}
				</CollapsibleContent>
			</section>
		</Collapsible>
	)
}
