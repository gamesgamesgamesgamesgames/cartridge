import { Gamepad2, Monitor, FolderOpen, Cog, User } from 'lucide-react'
import Link from 'next/link'

import { type SearchResultItem } from '@/typedefs/PentaractAPISearchResult'

type Props = {
	item: SearchResultItem
}

export function SearchResult({ item }: Props) {
	switch (item.$type) {
		case 'games.gamesgamesgamesgames.defs#gameSummaryView': {
			const gameHref = `/game/${item.slug}`
			return (
				<Link
					href={gameHref}
					className={'flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent'}>
					<div className={'flex size-10 shrink-0 items-center justify-center rounded-md bg-muted'}>
						<Gamepad2 className={'size-5 text-muted-foreground'} />
					</div>
					<div className={'min-w-0 flex-1'}>
						<p className={'truncate font-medium'}>{item.name}</p>
						{item.summary && (
							<p className={'truncate text-sm text-muted-foreground'}>{item.summary}</p>
						)}
					</div>
					<span className={'shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground'}>
						Game
					</span>
				</Link>
			)
		}

		case 'games.gamesgamesgamesgames.defs#profileSummaryView': {
			return (
				<div className={'flex items-center gap-4 rounded-lg border border-border bg-card p-4'}>
					<div className={'flex size-10 shrink-0 items-center justify-center rounded-full bg-muted'}>
						<User className={'size-5 text-muted-foreground'} />
					</div>
					<div className={'min-w-0 flex-1'}>
						<p className={'truncate font-medium'}>{item.displayName ?? item.did}</p>
						{item.slug && (
							<p className={'truncate text-sm text-muted-foreground'}>@{item.slug}</p>
						)}
					</div>
					<span className={'shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground'}>
						{item.profileType === 'org' ? 'Organization' : 'Player'}
					</span>
				</div>
			)
		}

		case 'games.gamesgamesgamesgames.defs#platformSummaryView': {
			return (
				<div className={'flex items-center gap-4 rounded-lg border border-border bg-card p-4'}>
					<div className={'flex size-10 shrink-0 items-center justify-center rounded-md bg-muted'}>
						<Monitor className={'size-5 text-muted-foreground'} />
					</div>
					<div className={'min-w-0 flex-1'}>
						<p className={'truncate font-medium'}>
							{item.name}
							{item.abbreviation && (
								<span className={'ml-2 text-sm text-muted-foreground'}>({item.abbreviation})</span>
							)}
						</p>
						{item.category && (
							<p className={'truncate text-sm text-muted-foreground capitalize'}>{item.category}</p>
						)}
					</div>
					<span className={'shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground'}>
						Platform
					</span>
				</div>
			)
		}

		case 'games.gamesgamesgamesgames.defs#collectionSummaryView': {
			return (
				<div className={'flex items-center gap-4 rounded-lg border border-border bg-card p-4'}>
					<div className={'flex size-10 shrink-0 items-center justify-center rounded-md bg-muted'}>
						<FolderOpen className={'size-5 text-muted-foreground'} />
					</div>
					<div className={'min-w-0 flex-1'}>
						<p className={'truncate font-medium'}>{item.name}</p>
					</div>
					<span className={'shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground capitalize'}>
						{item.type ?? 'Collection'}
					</span>
				</div>
			)
		}

		case 'games.gamesgamesgamesgames.defs#engineSummaryView': {
			return (
				<div className={'flex items-center gap-4 rounded-lg border border-border bg-card p-4'}>
					<div className={'flex size-10 shrink-0 items-center justify-center rounded-md bg-muted'}>
						<Cog className={'size-5 text-muted-foreground'} />
					</div>
					<div className={'min-w-0 flex-1'}>
						<p className={'truncate font-medium'}>{item.name}</p>
					</div>
					<span className={'shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground'}>
						Engine
					</span>
				</div>
			)
		}
	}
}
