// Module imports
import Link from 'next/link'

// Local imports
import { type CollectionSummaryView } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { type GameRecord } from '@/typedefs/GameRecord'
import { ReleaseTimeline } from './ReleaseTimeline'
import { SectionHeader } from './SectionHeader'

// Types
type Props = Readonly<{
	gameRecord: GameRecord
	parentGame?: { name: string; slug: string } | null
	franchises?: CollectionSummaryView[]
}>

function formatHours(seconds: number): string {
	const hours = Math.round(seconds / 3600)
	return `${hours} hr${hours !== 1 ? 's' : ''}`
}

export function AboutTab(props: Props) {
	const { gameRecord, parentGame, franchises } = props

	return (
		<>
			{parentGame && (
				<p className={'text-muted-foreground'}>
					{'DLC for '}
					<Link
						className={'text-foreground underline hover:no-underline'}
						href={`/game/${parentGame.slug}`}>
						{parentGame.name}
					</Link>
				</p>
			)}

			{Boolean(franchises?.length) && franchises!.map((franchise) => (
				<p
					className={'text-muted-foreground'}
					key={franchise.uri}>
					{'Part of the '}
					<Link
						className={'text-foreground underline hover:no-underline'}
						href={`/collection/${franchise.slug}`}>
						{franchise.name}
					</Link>
					{' franchise'}
				</p>
			))}

			{Boolean(gameRecord.summary) && (
				<SectionHeader
					id={'about-summary'}
					title={'Summary'}>
					<div className={'prose prose-sm dark:prose-invert max-w-none text-foreground'}>
						{gameRecord.summary?.split('\n').map((p, index) => (
							<p key={index}>{p}</p>
						))}
					</div>
				</SectionHeader>
			)}

			{Boolean(gameRecord.storyline) && (
				<SectionHeader
					id={'about-storyline'}
					title={'Storyline'}>
					<div className={'prose prose-sm dark:prose-invert max-w-none text-foreground'}>
						{gameRecord.storyline?.split('\n').map((p, index) => (
							<p key={index}>{p}</p>
						))}
					</div>
				</SectionHeader>
			)}

			{Boolean(gameRecord.timeToBeat) && (
				<SectionHeader
					id={'about-time-to-beat'}
					title={'Time to Beat'}>
					<div className={'grid grid-cols-3 gap-4 text-center'}>
						<div>
							<p className={'text-muted-foreground text-sm'}>{'Main Story'}</p>
							<p className={'text-lg font-semibold'}>
								{gameRecord.timeToBeat?.hastily
									? formatHours(gameRecord.timeToBeat.hastily)
									: '—'}
							</p>
						</div>
						<div>
							<p className={'text-muted-foreground text-sm'}>{'Main + Extras'}</p>
							<p className={'text-lg font-semibold'}>
								{gameRecord.timeToBeat?.normally
									? formatHours(gameRecord.timeToBeat.normally)
									: '—'}
							</p>
						</div>
						<div>
							<p className={'text-muted-foreground text-sm'}>{'Completionist'}</p>
							<p className={'text-lg font-semibold'}>
								{gameRecord.timeToBeat?.completely
									? formatHours(gameRecord.timeToBeat.completely)
									: '—'}
							</p>
						</div>
					</div>
				</SectionHeader>
			)}

			{Boolean(gameRecord.alternativeNames?.length) && (
				<SectionHeader
					id={'about-alternative-names'}
					title={'Alternative Names'}>
					<ul className={'flex flex-col gap-2'}>
						{gameRecord.alternativeNames!.map((altName, index) => (
							<li key={index}>
								<span>{altName.name}</span>
								{(altName.locale || altName.comment) && (
									<span className={'text-muted-foreground text-sm ml-2'}>
										{[altName.locale, altName.comment].filter(Boolean).join(' — ')}
									</span>
								)}
							</li>
						))}
					</ul>
				</SectionHeader>
			)}

			{Boolean(gameRecord.releases?.length) && (
				<SectionHeader
					id={'about-release-timeline'}
					title={'Release Timeline'}>
					<ReleaseTimeline releases={gameRecord.releases!} />
				</SectionHeader>
			)}
		</>
	)
}
