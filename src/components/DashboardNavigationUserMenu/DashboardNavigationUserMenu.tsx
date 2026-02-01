'use client'

// Module imports
import {
	faArrowRightFromBracket,
	faBell,
	faCircleUser,
	faComputer,
	faCreditCard,
	faEllipsisVertical,
	faMoon,
	faSun,
} from '@fortawesome/free-solid-svg-icons'
import { faCircle } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { useStore } from 'statery'
import { useTheme } from 'next-themes'

// Local imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '@/components/ui/sidebar'
import { store } from '@/store/store'
import { useCallback } from 'react'

export function DashboardNavigationUserMenu() {
	const { setTheme, theme } = useTheme()

	const { quicksliceClient, user } = useStore(store)

	const { isMobile } = useSidebar()

	const handleLogoutClick = useCallback(() => {
		if (quicksliceClient) {
			quicksliceClient.logout()
		}
	}, [quicksliceClient])

	const displayName =
		user?.displayName ?? user?.handle ?? user?.did ?? 'Unknown'

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				{!user && (
					<SidebarMenuButton>
						<Link href={'/login'}>{'Login'}</Link>
					</SidebarMenuButton>
				)}

				{Boolean(user) && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size={'lg'}
								className={
									'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
								}>
								<Avatar className={'h-8 w-8 rounded-lg'}>
									<AvatarImage
										src={user?.avatarURL}
										alt={displayName}
									/>
									<AvatarFallback className={'rounded-lg'}>
										{displayName === 'Unknown' ? '?' : displayName.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<div className='grid flex-1 text-left text-sm leading-tight'>
									<span className='truncate font-medium'>{displayName}</span>
									<span className='text-muted-foreground truncate text-xs'>
										{user?.handle}
									</span>
								</div>
								<FontAwesomeIcon icon={faEllipsisVertical} />
							</SidebarMenuButton>
						</DropdownMenuTrigger>

						<DropdownMenuContent
							className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
							side={isMobile ? 'bottom' : 'right'}
							align='end'
							sideOffset={4}>
							<DropdownMenuLabel className='p-0 font-normal'>
								<div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
									<Avatar className='h-8 w-8 rounded-lg'>
										<AvatarImage
											src={user?.avatarURL}
											alt={displayName}
										/>
										<AvatarFallback className='rounded-lg'>CN</AvatarFallback>
									</Avatar>
									<div className='grid flex-1 text-left text-sm leading-tight'>
										<span className='truncate font-medium'>{displayName}</span>
										<span className='text-muted-foreground truncate text-xs'>
											{user?.handle}
										</span>
									</div>
								</div>
							</DropdownMenuLabel>

							<DropdownMenuSeparator />

							<DropdownMenuGroup>
								<DropdownMenuItem>
									<FontAwesomeIcon icon={faCircleUser} />
									{'Account'}
								</DropdownMenuItem>
								<DropdownMenuItem>
									<FontAwesomeIcon icon={faCreditCard} />
									{'Billing'}
								</DropdownMenuItem>
								<DropdownMenuItem>
									<FontAwesomeIcon icon={faBell} />
									{'Notifications'}
								</DropdownMenuItem>
							</DropdownMenuGroup>

							<DropdownMenuSeparator />

							<DropdownMenuSub>
								<DropdownMenuSubTrigger>
									<FontAwesomeIcon icon={faCircle} />
									{'Theme'}
								</DropdownMenuSubTrigger>
								<DropdownMenuPortal>
									<DropdownMenuSubContent>
										<DropdownMenuRadioGroup
											value={theme}
											onValueChange={setTheme}>
											<DropdownMenuRadioItem value={'light'}>
												<FontAwesomeIcon icon={faSun} />
												{'Light'}
											</DropdownMenuRadioItem>
											<DropdownMenuRadioItem value={'dark'}>
												<FontAwesomeIcon icon={faMoon} />
												{'Dark'}
											</DropdownMenuRadioItem>
											<DropdownMenuRadioItem value={'system'}>
												<FontAwesomeIcon icon={faComputer} />
												{'System'}
											</DropdownMenuRadioItem>
										</DropdownMenuRadioGroup>
									</DropdownMenuSubContent>
								</DropdownMenuPortal>
							</DropdownMenuSub>

							<DropdownMenuSeparator />

							<DropdownMenuItem onClick={handleLogoutClick}>
								<FontAwesomeIcon icon={faArrowRightFromBracket} />
								{'Log out'}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
