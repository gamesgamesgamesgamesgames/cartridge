'use client'

import { useCallback, useState } from 'react'
import { useStore } from 'statery'

import { Button } from '@/components/ui/button'
import * as API from '@/helpers/API'
import { store } from '@/store/store'

type Props = Readonly<{
	profileDid: string
	initialIsFollowing: boolean
	initialIsFollowedBy: boolean
	initialFollowerCount: number
	onFollowerCountChange?: (delta: number) => void
}>

export function FollowButton(props: Props) {
	const {
		profileDid,
		initialIsFollowing,
		initialIsFollowedBy,
		initialFollowerCount,
		onFollowerCountChange,
	} = props

	const { user } = useStore(store)
	const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
	const [isPending, setIsPending] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const isOwnProfile = user?.did === profileDid

	const handleToggle = useCallback(async () => {
		if (isPending || !user?.did) return

		setIsPending(true)
		setError(null)

		const wasFollowing = isFollowing
		setIsFollowing(!wasFollowing)
		onFollowerCountChange?.(wasFollowing ? -1 : 1)

		try {
			await API.toggleFollow(profileDid)
		} catch {
			setIsFollowing(wasFollowing)
			onFollowerCountChange?.(wasFollowing ? 1 : -1)
			setError('Could not update follow status')
		} finally {
			setIsPending(false)
		}
	}, [isPending, isFollowing, profileDid, user?.did, onFollowerCountChange])

	if (isOwnProfile || !user?.did) return null

	return (
		<div className={'flex flex-col items-end gap-1'}>
			<Button
				variant={isFollowing ? 'secondary' : 'default'}
				size={'sm'}
				disabled={isPending}
				onClick={handleToggle}
				aria-label={isFollowing ? `Unfollow this user` : `Follow this user`}
				className={'group min-w-24'}>
				{isFollowing ? (
					<>
						<span className={'group-hover:hidden'}>{'Following'}</span>
						<span className={'hidden text-destructive group-hover:inline'}>{'Unfollow'}</span>
					</>
				) : (
					'Follow'
				)}
			</Button>

			{initialIsFollowedBy && !isFollowing && (
				<span className={'text-xs text-muted-foreground'}>
					{'Follows you'}
				</span>
			)}

			{error && (
				<span className={'text-xs text-destructive'} role={'alert'}>
					{error}
				</span>
			)}
		</div>
	)
}
