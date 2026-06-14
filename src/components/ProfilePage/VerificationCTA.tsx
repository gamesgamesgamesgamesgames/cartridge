'use client'

import { BadgeCheck, Clock } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import * as API from '@/helpers/API'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Props = Readonly<{
	isOwnProfile: boolean
	isVerified: boolean
}>

export function VerificationCTA(props: Props) {
	const { isOwnProfile, isVerified } = props
	const [hasPendingRequest, setHasPendingRequest] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	const checkRequest = useCallback(async () => {
		if (!isOwnProfile || isVerified) return
		try {
			const result = await API.getVerificationRequest()
			setHasPendingRequest(result?.status === 'pending')
		} catch {
			// Non-critical
		} finally {
			setIsLoading(false)
		}
	}, [isOwnProfile, isVerified])

	useEffect(() => {
		checkRequest()
	}, [checkRequest])

	if (!isOwnProfile || isVerified || isLoading) return null

	if (hasPendingRequest) {
		return (
			<Badge variant={'outline'} className={'gap-1 text-xs'}>
				<Clock className={'size-3'} />
				{'Verification pending'}
			</Badge>
		)
	}

	return (
		<Button asChild size={'sm'} variant={'ghost'} className={'gap-1.5 text-muted-foreground'}>
			<Link href={'/verify'}>
				<BadgeCheck className={'size-4'} />
				{'Get verified'}
			</Link>
		</Button>
	)
}
