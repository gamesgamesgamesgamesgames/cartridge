'use client'

// Module import
import {
	faBook,
	faChartPie,
	faGamepad,
	faPeopleGroup,
	faStar,
	faStore,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'

// Local imports
import { DashboardNavigationUserMenu } from '@/components/DashboardNavigationUserMenu/DashboardNavigationUserMenu'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar'

export function DashboardNavigation() {
	return (
		<Sidebar
			collapsible={'offcanvas'}
			variant={'inset'}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className={'data-[slot=sidebar-menu-button]:!p-1.5'}>
							<Link href='/'>
								<span className={'font-[family-name:var(--font-cartridge)] text-2xl font-bold'}>
									{'Cartridge'}
								</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>{'General'}</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								className={'text-muted-foreground'}>
								<Link href={'#'}>
									<FontAwesomeIcon icon={faStore} />
									<span>{'Store'}</span>
								</Link>
							</SidebarMenuButton>
							<SidebarMenuBadge>{'Soon!'}</SidebarMenuBadge>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								className={'text-muted-foreground'}>
								<Link href={'#'}>
									<FontAwesomeIcon icon={faGamepad} />
									<span>{'Library'}</span>
								</Link>
							</SidebarMenuButton>
							<SidebarMenuBadge>{'Soon!'}</SidebarMenuBadge>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								className={'text-muted-foreground'}>
								<Link href={'#'}>
									<FontAwesomeIcon icon={faStar} />
									<span>{'Achievements'}</span>
								</Link>
							</SidebarMenuButton>
							<SidebarMenuBadge>{'Soon!'}</SidebarMenuBadge>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								className={'text-muted-foreground'}>
								<Link href={'#'}>
									<FontAwesomeIcon icon={faChartPie} />
									<span>{'Stats'}</span>
								</Link>
							</SidebarMenuButton>
							<SidebarMenuBadge>{'Soon!'}</SidebarMenuBadge>
						</SidebarMenuItem>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>{'Manage'}</SidebarGroupLabel>

					<SidebarGroupContent>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link href={'/dashboard/catalog'}>
									<FontAwesomeIcon icon={faBook} />
									<span>{'Games Catalog'}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								className={'text-muted-foreground'}>
								<Link href={'#'}>
									<FontAwesomeIcon icon={faStar} />
									<span>{'Achievements'}</span>
								</Link>
							</SidebarMenuButton>
							<SidebarMenuBadge>{'Soon!'}</SidebarMenuBadge>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								className={'text-muted-foreground'}>
								<Link href={'#'}>
									<FontAwesomeIcon icon={faPeopleGroup} />
									<span>{'Team'}</span>
								</Link>
							</SidebarMenuButton>
							<SidebarMenuBadge>{'Soon!'}</SidebarMenuBadge>
						</SidebarMenuItem>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<DashboardNavigationUserMenu />
			</SidebarFooter>
		</Sidebar>
	)
}
