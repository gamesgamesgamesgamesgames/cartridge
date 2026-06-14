'use client'

// Module import
import {
	faBook,
	faCircleCheck,
	faClipboardList,
	faGavel,
	faHandshake,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { useStore } from 'statery'

// Local imports
import { isAdmin } from '@/helpers/admin'
import { store } from '@/store/store'
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
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar'

export function DashboardNavigation() {
	const { user } = useStore(store)

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
							<SidebarMenuButton asChild>
								<Link href={'/dashboard/claims'}>
									<FontAwesomeIcon icon={faClipboardList} />
									<span>{'My Claims'}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link href={'/dashboard/contributions'}>
									<FontAwesomeIcon icon={faHandshake} />
									<span>{'My Contributions'}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link href={'/verify'}>
									<FontAwesomeIcon icon={faCircleCheck} />
									<span>{'Verification'}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarGroupContent>
				</SidebarGroup>

				{isAdmin(user?.did) && (
					<SidebarGroup>
						<SidebarGroupLabel>{'Admin'}</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link href={'/admin/claims'}>
										<FontAwesomeIcon icon={faGavel} />
										<span>{'Claims'}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>

							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link href={'/admin/contributions'}>
										<FontAwesomeIcon icon={faHandshake} />
										<span>{'Contributions'}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>

							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link href={'/admin/verification-requests'}>
										<FontAwesomeIcon icon={faCircleCheck} />
										<span>{'Verification'}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarGroupContent>
					</SidebarGroup>
				)}
			</SidebarContent>

			<SidebarFooter>
				<DashboardNavigationUserMenu />
			</SidebarFooter>
		</Sidebar>
	)
}
