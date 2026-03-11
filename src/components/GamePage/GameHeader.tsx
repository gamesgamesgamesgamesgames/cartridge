// Module imports
import {
	faBusinessTime,
	faCalendar,
	faStarHalfAlt,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// Local imports
import { Badge } from '@/components/ui/badge'
import { BoxArt } from '@/components/BoxArt/BoxArt'
import { Card } from '@/components/ui/card'
import { GAME_GENRES } from '@/constants/GAME_GENRES'
import { type GameRecord } from '@/typedefs/GameRecord'
import { Header } from '@/components/Header/Header'

// Types
type Props = Readonly<{ gameRecord: GameRecord }>

export function GameHeader(props: Props) {
	const { gameRecord } = props

	return (
		<section>
			<Card className={'p-4'}>
				<div className={'flex gap-4'}>
					<BoxArt
						className={'min-w-[140px] w-[140px]'}
						gameRecord={gameRecord}
					/>

					<div className={'flex flex-col'}>
						<Header>{gameRecord.name}</Header>

						<div>
							<p>{gameRecord.summary}</p>
						</div>
					</div>
				</div>

				<div className={'flex flex-col gap-2'}>
					<div className={'flex flex-wrap gap-2'}>
						<Badge variant={'outline'}>
							<FontAwesomeIcon icon={faBusinessTime} />
							{'Developer Studio, LLC'}
						</Badge>

						<Badge variant={'outline'}>
							<FontAwesomeIcon icon={faCalendar} />
							{'2017'}
						</Badge>

						<Badge variant={'outline'}>
							<FontAwesomeIcon icon={faStarHalfAlt} />
							{'9.3'}
						</Badge>
					</div>

					<div className={'flex flex-wrap gap-2'}>
						<Badge variant={'outline'}>{'Nintendo Switch'}</Badge>
					</div>

					<div className={'flex flex-wrap gap-2'}>
						{Boolean(gameRecord.genres) &&
							gameRecord.genres!.map((genre) => (
								<Badge
									key={genre}
									variant={'outline'}>
									{GAME_GENRES[genre]?.name ?? genre}
								</Badge>
							))}
					</div>
				</div>
			</Card>
		</section>
	)
}
