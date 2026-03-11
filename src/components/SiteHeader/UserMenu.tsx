'use client'

// Module imports
import { ChevronDown, LogOut, Monitor, Moon, Sun, User } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useStore } from 'statery'

// Local imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { isAuthenticated } from '@/helpers/oauth'
import { logout } from '@/store/actions/logout'
import { store } from '@/store/store'

export function UserMenu() {
	const { user } = useStore(store)
	const { theme, setTheme } = useTheme()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const [authed, setAuthed] = useState(false)

	useEffect(() => {
		setAuthed(isAuthenticated())
	}, [user])

	if (!authed) {
		const currentUrl =
			pathname + (searchParams.toString() ? `?${searchParams}` : '')
		const loginHref = `/login?returnTo=${encodeURIComponent(currentUrl)}`

		return (
			<Link
				href={loginHref}
				className={
					'flex items-center self-stretch px-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors'
				}>
				{'Log in'}
			</Link>
		)
	}

	const displayName = user?.displayName ?? user?.handle ?? user?.did ?? ''
	const handle = user?.handle ?? user?.did ?? ''
	const initials = displayName ? displayName.slice(0, 2).toUpperCase() : '??'

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className={
					'flex items-center gap-1.5 self-stretch px-3 outline-none cursor-pointer hover:bg-accent transition-colors'
				}>
				<Avatar size={'sm'}>
					<AvatarImage
						src={user?.avatarURL}
						alt={displayName}
					/>
					<AvatarFallback>{initials}</AvatarFallback>
				</Avatar>
				<ChevronDown className={'size-3.5 text-muted-foreground'} />
			</DropdownMenuTrigger>

			<DropdownMenuContent
				className={'w-56'}
				align={'end'}
				sideOffset={0}>
				<DropdownMenuLabel className={'p-0 font-normal'}>
					<div
						className={'flex items-center gap-2 px-1 py-1.5 text-left text-sm'}>
						<Avatar
							size={'sm'}
							className={'rounded-lg'}>
							<AvatarImage
								src={user?.avatarURL}
								alt={displayName}
							/>
							<AvatarFallback className={'rounded-lg'}>
								{initials}
							</AvatarFallback>
						</Avatar>
						<div className={'grid flex-1 text-left text-sm leading-tight'}>
							<span className={'truncate font-medium'}>{displayName}</span>
							<span className={'truncate text-xs text-muted-foreground'}>
								{'@'}
								{handle}
							</span>
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{(user?.handle ?? user?.did) && (
					<>
						<DropdownMenuItem asChild>
							<Link href={`/profile/${user.handle ?? user.did}`}>
								<User className={'size-4'} />
								{'View Profile'}
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
					</>
				)}
				<DropdownMenuGroup
					className={'items-center flex justify-between px-2 py-1.5'}>
					<span className={'text-xs text-muted-foreground'}>{'Theme'}</span>
					<ButtonGroup>
						<Button
							variant={theme === 'light' ? 'default' : 'outline'}
							size={'icon-sm'}
							onClick={() => setTheme('light')}>
							<Sun className={'size-4'} />
						</Button>
						<Button
							variant={theme === 'dark' ? 'default' : 'outline'}
							size={'icon-sm'}
							onClick={() => setTheme('dark')}>
							<Moon className={'size-4'} />
						</Button>
						<Button
							variant={theme === 'system' ? 'default' : 'outline'}
							size={'icon-sm'}
							onClick={() => setTheme('system')}>
							<Monitor className={'size-4'} />
						</Button>
					</ButtonGroup>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => logout()}>
					<LogOut className={'size-4'} />
					{'Log out'}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
