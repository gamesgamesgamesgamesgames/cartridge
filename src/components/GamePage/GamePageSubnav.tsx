'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
	Collapsible,
	CollapsibleContent,
} from '@/components/ui/collapsible'

export type SubnavItem = {
	id: string
	label: string
}

export type SubnavConfig = {
	about: SubnavItem[]
	media: SubnavItem[]
	meta: SubnavItem[]
	reviews: string[]
}

type SubnavSection = {
	label: string
	href: string
	items: { id: string; label: string }[]
}

type Props = Readonly<{
	basePath: string
	subnavConfig: SubnavConfig
}>

export function GamePageSubnav(props: Props) {
	const { basePath, subnavConfig } = props
	const pathname = usePathname()

	const sections: SubnavSection[] = [
		{
			label: 'About',
			href: basePath,
			items: subnavConfig.about,
		},
		{
			label: 'Media',
			href: `${basePath}/media`,
			items: subnavConfig.media,
		},
		{
			label: 'Reviews',
			href: `${basePath}/reviews`,
			items: subnavConfig.reviews.map((source) => ({
				id: `reviews-${source.toLowerCase()}`,
				label: source,
			})),
		},
		{
			label: 'Meta',
			href: `${basePath}/meta`,
			items: subnavConfig.meta,
		},
	]

	const isActive = (href: string) => {
		if (href === basePath) {
			return pathname === basePath
		}
		return pathname.startsWith(href)
	}

	const handleScrollTo = (id: string) => {
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
	}

	return (
		<nav className={'flex flex-col gap-1'}>
			{sections.map((section) => {
				const active = isActive(section.href)
				return (
					<div key={section.label}>
						<Link
							href={section.href}
							className={`block py-1 text-sm font-semibold transition-colors ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
							{section.label}
						</Link>

						<Collapsible open={active}>
							<CollapsibleContent>
								{section.items.length > 0 && (
									<ul className={'ml-3 mt-1 mb-2 flex flex-col gap-0.5 border-l border-border pl-3'}>
										{section.items.map((item) => (
											<li key={item.id}>
												<button
													type={'button'}
													className={'text-sm text-muted-foreground hover:text-foreground transition-colors text-left'}
													onClick={() => handleScrollTo(item.id)}>
													{item.label}
												</button>
											</li>
										))}
									</ul>
								)}
							</CollapsibleContent>
						</Collapsible>
					</div>
				)
			})}
		</nav>
	)
}
