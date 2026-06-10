'use client'

import { ArrowLeft, Loader2, ListChecks, TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BoxArt } from '@/components/BoxArt/BoxArt'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/Container/Container'
import { Header } from '@/components/Header/Header'
import * as API from '@/helpers/API'
import { type ListDetailView, type ListItemView } from '@/helpers/API'

type Props = Readonly<{
	list: ListDetailView
	creatorAvatarUrl?: string
	creatorHandle: string
	initialItems: ListItemView[]
	initialCursor?: string
}>

export function ListDetailContent(props: Props) {
	const {
		list,
		creatorAvatarUrl,
		creatorHandle,
		initialItems,
		initialCursor,
	} = props

	const [items, setItems] = useState<ListItemView[]>(initialItems)
	const [cursor, setCursor] = useState<string | undefined>(initialCursor)
	const [isLoadingMore, setIsLoadingMore] = useState(false)
	const [loadMoreFailed, setLoadMoreFailed] = useState(false)
	const sentinelRef = useRef<HTMLDivElement>(null)
	const loadingRef = useRef(false)

	const loadMore = useCallback(() => {
		if (!cursor || loadingRef.current) return
		loadingRef.current = true
		setIsLoadingMore(true)
		setLoadMoreFailed(false)
		API.getListItems(list.uri, 30, cursor)
			.then((result) => {
				setItems((prev) => [...prev, ...result.items])
				setCursor(result.cursor)
				loadingRef.current = false
				setIsLoadingMore(false)
			})
			.catch(() => {
				loadingRef.current = false
				setIsLoadingMore(false)
				setLoadMoreFailed(true)
			})
	}, [list.uri, cursor])

	useEffect(() => {
		const el = sentinelRef.current
		if (!el || !cursor) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					loadMore()
				}
			},
			{ rootMargin: '600px' },
		)

		observer.observe(el)
		return () => observer.disconnect()
	}, [cursor, loadMore])

	const creatorDisplayName = list.creator.displayName ?? creatorHandle
	const creatorInitial = creatorDisplayName.charAt(0).toUpperCase()

	return (
		<div className={'flex min-h-screen flex-col'}>
			<a
				href={'#list-content'}
				className={'sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg'}>
				{'Skip to content'}
			</a>

			<section className={'border-b border-border bg-gradient-to-b from-card to-background'} aria-label={'List details'}>
				<Container className={'overflow-visible'} isScrollable={false}>
					<div className={'flex flex-col gap-4 py-8'}>
						<Link
							href={`/profile/${creatorHandle}`}
							className={'inline-flex min-h-11 w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground'}>
							<ArrowLeft className={'size-4'} aria-hidden={'true'} />
							{'Back to profile'}
						</Link>

						<div className={'flex flex-col gap-3'}>
							<Header className={'text-balance text-2xl sm:text-3xl'} level={1}>
								{list.name}
							</Header>

							{list.description && (
								<p className={'max-w-prose text-pretty text-sm leading-relaxed text-muted-foreground'}>
									{list.description}
								</p>
							)}

							<div className={'flex items-center gap-3'}>
								<Link
									href={`/profile/${creatorHandle}`}
									className={'group flex min-h-11 items-center gap-2 rounded-md py-1 outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50'}>
									<Avatar className={'size-6 border border-border/40'}>
										{creatorAvatarUrl && (
											<AvatarImage
												src={creatorAvatarUrl}
												alt={creatorDisplayName}
											/>
										)}
										<AvatarFallback className={'text-xs'}>
											{creatorInitial}
										</AvatarFallback>
									</Avatar>
									<span className={'text-sm text-muted-foreground transition-colors group-hover:text-foreground'}>
										{creatorDisplayName}
									</span>
								</Link>

								<span className={'text-sm text-muted-foreground'}>
									{list.itemCount} {list.itemCount === 1 ? 'game' : 'games'}
								</span>
							</div>
						</div>
					</div>
				</Container>
			</section>

			<section id={'list-content'} className={'flex-1 bg-background py-6'} aria-label={'List games'}>
				<Container className={'overflow-visible'} isScrollable={false}>
					<div aria-live={'polite'}>
						{items.length === 0 ? (
							<div className={'flex flex-col items-center gap-3 py-16'}>
								<div className={'flex size-10 items-center justify-center rounded-lg bg-muted'}>
									<ListChecks className={'size-5 text-muted-foreground'} aria-hidden={'true'} />
								</div>
								<p className={'text-sm text-muted-foreground'}>
									{'This list is empty'}
								</p>
							</div>
						) : (
							<>
								<div className={'grid grid-cols-2 gap-4 min-[400px]:grid-cols-3 sm:grid-cols-4 sm:gap-5 md:grid-cols-5 lg:grid-cols-6'}>
									{items.map((item) => (
										<Link
											key={item.uri}
											href={`/game/${item.game.slug ?? item.game.uri}`}
											className={'group flex flex-col gap-2 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'}>
											<BoxArt gameRecord={item.game} className={'rounded-md transition-shadow group-hover:shadow-lg'} />
											<span className={'line-clamp-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary'}>
												{item.game.name}
											</span>
										</Link>
									))}
								</div>

								<div ref={sentinelRef} />

								{isLoadingMore && (
									<div className={'flex justify-center py-8'} role={'status'}>
										<Loader2
											className={'size-5 animate-spin motion-reduce:animate-none text-muted-foreground'}
											aria-hidden={'true'}
										/>
										<span className={'sr-only'}>{'Loading more games'}</span>
									</div>
								)}

								{loadMoreFailed && !isLoadingMore && (
									<div className={'flex flex-col items-center gap-2 py-8'} role={'alert'}>
										<div className={'flex size-10 items-center justify-center rounded-lg bg-destructive/10'}>
											<TriangleAlert className={'size-5 text-destructive'} aria-hidden={'true'} />
										</div>
										<p className={'text-xs text-muted-foreground'}>{'Couldn\'t load more'}</p>
										<Button variant={'outline'} size={'sm'} onClick={loadMore}>
											{'Try again'}
										</Button>
									</div>
								)}

								{!cursor && items.length > 0 && (
									<p className={'py-8 text-center text-xs text-muted-foreground'} role={'status'}>
										{'That\'s everything'}
									</p>
								)}
							</>
						)}
					</div>
				</Container>
			</section>
		</div>
	)
}
