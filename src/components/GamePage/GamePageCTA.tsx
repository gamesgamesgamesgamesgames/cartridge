'use client'

import { ListPlus, Share2, Shield } from 'lucide-react'
import Link from 'next/link'
import { useCallback } from 'react'
import { useStore } from 'statery'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Container } from '@/components/Container/Container'
import { store } from '@/store/store'

type Props = Readonly<{
	gameName: string
	gameUri: string
	ownerDid?: string
	slug?: string
}>

export function GamePageCTA(props: Props) {
	const { gameName, gameUri, ownerDid, slug } = props
	const { user } = useStore(store)

	const isCatalogOwned = !ownerDid || ownerDid === 'did:web:gamesgamesgamesgames.games'
	const isSignedIn = Boolean(user?.did)

	const handleShare = useCallback(async () => {
		const url = `${window.location.origin}/game/${slug ?? gameUri}`
		try {
			if (navigator.share) {
				await navigator.share({ title: gameName, url })
			} else {
				await navigator.clipboard.writeText(url)
				toast.success('Link copied')
			}
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') return
			toast.error('Couldn\'t share this game.')
		}
	}, [gameName, gameUri, slug])

	return (
		<section
			className={'border-t border-border bg-background py-12 md:py-16'}
			aria-label={'Get involved'}>
			<Container isScrollable={false}>
				<div className={'flex flex-col items-center gap-4 text-center'}>
					<p className={'text-lg font-medium'}>
						{'Enjoying '}
						<span className={'text-primary'}>{gameName}</span>
						{'?'}
					</p>

					<div className={'flex flex-wrap justify-center gap-3'}>
						<Button
							asChild
							size={'lg'}>
							<a href={'#collections'}>
								<ListPlus className={'size-4'} aria-hidden={'true'} />
								{'Add to a list'}
							</a>
						</Button>

						<Button
							onClick={handleShare}
							variant={'outline'}
							size={'lg'}>
							<Share2 className={'size-4'} aria-hidden={'true'} />
							{'Share this game'}
						</Button>

						{isSignedIn && isCatalogOwned && (
							<Button
								asChild
								variant={'outline'}
								size={'lg'}>
								<Link href={`/claim?game=${encodeURIComponent(gameUri)}`}>
									<Shield className={'size-4'} aria-hidden={'true'} />
									{'Claim this game'}
								</Link>
							</Button>
						)}
					</div>
				</div>
			</Container>
		</section>
	)
}
