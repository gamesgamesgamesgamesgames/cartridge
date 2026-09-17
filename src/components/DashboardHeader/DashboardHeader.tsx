import { type ReactNode, useMemo } from 'react'
import Link from 'next/link'

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

type Props = Readonly<{
	breadcrumbs: {
		label: string
		url: string
	}[]
	controls?: ReactNode
}>

/**
 * Breadcrumb strip for studio pages one or more levels deep.
 *
 * At the top level the studio nav already names the section, so a single-crumb
 * strip would only repeat it — that case renders nothing unless the page has
 * controls to hang here.
 */
export function DashboardHeader(props: Props) {
	const { breadcrumbs, controls } = props

	const showBreadcrumbs = breadcrumbs.length > 1

	const breadcrumbElements = useMemo(() => {
		return (
			<Breadcrumb>
				<BreadcrumbList>
					{breadcrumbs.reduce((accumulator, breadcrumbDetails, index) => {
						if (index === breadcrumbs.length - 1) {
							accumulator.push(
								<BreadcrumbItem key={index}>
									<BreadcrumbPage>{breadcrumbDetails.label}</BreadcrumbPage>
								</BreadcrumbItem>,
							)
						} else {
							accumulator.push(
								<BreadcrumbItem key={`item-${index}`}>
									<BreadcrumbLink asChild>
										<Link href={breadcrumbDetails.url}>
											{breadcrumbDetails.label}
										</Link>
									</BreadcrumbLink>
								</BreadcrumbItem>,
								<BreadcrumbSeparator key={`separator-${index}`} />,
							)
						}

						return accumulator
					}, [] as ReactNode[])}
				</BreadcrumbList>
			</Breadcrumb>
		)
	}, [breadcrumbs])

	if (!showBreadcrumbs && !controls) {
		return null
	}

	return (
		<header className={'flex h-12 shrink-0 items-center border-b'}>
			<div className={'mx-auto flex w-full max-w-6xl items-center gap-2 px-4'}>
				{showBreadcrumbs && breadcrumbElements}

				{Boolean(controls) && (
					<div className={'ml-auto flex items-center gap-2'}>{controls}</div>
				)}
			</div>
		</header>
	)
}
