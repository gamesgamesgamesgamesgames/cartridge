// Local imports
import { type GameRecord } from '@/typedefs/GameRecord'
import { SectionHeader } from './SectionHeader'

// Types
type Props = Readonly<{ gameRecord: GameRecord }>

export function AboutTab(props: Props) {
	const { gameRecord } = props

	return (
		<>
			{Boolean(gameRecord.summary) && (
				<SectionHeader
					id={'about-summary'}
					title={'Summary'}>
					<div className={'prose prose-sm dark:prose-invert max-w-none text-muted-foreground'}>
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
					<div className={'prose prose-sm dark:prose-invert max-w-none text-muted-foreground'}>
						{gameRecord.storyline?.split('\n').map((p, index) => (
							<p key={index}>{p}</p>
						))}
					</div>
				</SectionHeader>
			)}
		</>
	)
}
