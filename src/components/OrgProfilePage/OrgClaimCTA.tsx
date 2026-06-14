'use client'

import { Shield } from 'lucide-react'
import Link from 'next/link'
import { useStore } from 'statery'

import { Button } from '@/components/ui/button'
import { store } from '@/store/store'

type Props = Readonly<{
	orgUri: string
	orgDid: string
}>

export function OrgClaimCTA(props: Props) {
	const { orgUri, orgDid } = props
	const { user } = useStore(store)

	if (!user?.did || user.did === orgDid) return null

	return (
		<Button asChild size={'sm'} variant={'ghost'} className={'gap-1.5 text-muted-foreground'}>
			<Link href={`/claim?org=${encodeURIComponent(orgUri)}`}>
				<Shield className={'size-4'} />
				{'Claim this organization'}
			</Link>
		</Button>
	)
}
