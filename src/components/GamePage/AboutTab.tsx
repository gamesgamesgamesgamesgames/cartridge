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
					<div className={'flex flex-col gap-3 leading-7'}>
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
					<div className={'flex flex-col gap-3 leading-7'}>
						{gameRecord.storyline?.split('\n').map((p, index) => (
							<p key={index}>{p}</p>
						))}
					</div>
				</SectionHeader>
			)}
		</>
	)
}
