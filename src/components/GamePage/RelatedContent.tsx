// Local imports
import { BoxArt } from '@/components/BoxArt/BoxArt'
import { Card } from '@/components/ui/card'
import { type GameRecord } from '@/typedefs/GameRecord'
import { Header } from '@/components/Header/Header'

// Types
type Props = Readonly<{ gameRecord: GameRecord }>

// Constants
// const FAXE_GAME_RECORD: GameRecord = {
// 	$type: 'games.gamesgamesgamesgames.game',
// 	media: [],
// 	name: '',
// 	summary: '',
// 	uri: 'at://did:plc:foobar',
// }

export function RelatedContent(props: Props) {
	const { gameRecord } = props

	return (
		<section>
			<Card className={'flex p-4'}>
				<Header level={3}>{'Related Content'}</Header>

				<div className={'col-span-2 gap-4 grid grid-cols-3'}>
					{/* <BoxArt gameRecord={FAXE_GAME_RECORD} />
					<BoxArt gameRecord={FAXE_GAME_RECORD} />
					<BoxArt gameRecord={FAXE_GAME_RECORD} />
					<BoxArt gameRecord={FAXE_GAME_RECORD} />
					<BoxArt gameRecord={FAXE_GAME_RECORD} />
					<BoxArt gameRecord={FAXE_GAME_RECORD} /> */}
				</div>
			</Card>
		</section>
	)
}
