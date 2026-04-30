// Module imports
import Link from 'next/link'
import { type ReactNode } from 'react'

// Types
type Props = Readonly<{
	title: string
	count: number
	href: string
	children: ReactNode
}>

export function ProfileSidebarCard(props: Props) {
	const { title, count, href, children } = props

	return (
		<div className={'rounded-xl border border-border bg-card p-4'}>
			<div className={'mb-3 flex items-center justify-between'}>
				<h3 className={'text-sm font-semibold'}>
					{title}
					<span className={'ml-1.5 text-muted-foreground'}>
						{count}
					</span>
				</h3>

				<Link
					href={href}
					className={'text-xs text-primary hover:underline'}>
					{'See all'}
				</Link>
			</div>

			{children}
		</div>
	)
}
