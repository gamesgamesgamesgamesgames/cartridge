// Local imports
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { type ReactNode, useMemo } from 'react'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import Link from 'next/link'

// Types
type Props = Readonly<{
	breadcrumbs: {
		label: string
		url: string
	}[]
	controls?: ReactNode
}>

export function DashboardHeader(props: Props) {
	const { breadcrumbs, controls } = props

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

	return (
		<header
			className={
				'flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)'
			}>
			<div className={'flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'}>
				<SidebarTrigger className={'-ml-1'} />
				<Separator
					orientation={'vertical'}
					className={'mx-2 data-[orientation=vertical]:h-4'}
				/>

				{breadcrumbElements}

				{Boolean(controls) && (
					<div className={'ml-auto flex items-center gap-2'}>{controls}</div>
				)}
			</div>
		</header>
	)
}
