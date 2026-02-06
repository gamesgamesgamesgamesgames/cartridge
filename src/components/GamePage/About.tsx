// Local imports
import { Card } from '@/components/ui/card'
import { GAME_GENRES } from '@/constants/GAME_GENRES'
import { GAME_MODES } from '@/constants/GAME_MODES'
import { GAME_PLAYER_PERSPECTIVES } from '@/constants/GAME_PLAYER_PERSPECTIVES'
import { GAME_THEMES } from '@/constants/GAME_THEMES'
import { type GameRecord } from '@/typedefs/GameRecord'
import { Header } from '@/components/Header/Header'
import { Item, ItemContent, ItemTitle } from '@/components/ui/item'
import { Link } from '@/components/Link/Link'

// Types
type Props = Readonly<{ gameRecord: GameRecord }>

// Constants
const ACHIEVEMENTS = Array(12).fill(null)

export function About(props: Props) {
	const { gameRecord } = props

	return (
		<section>
			<Card className={'p-4'}>
				<Header level={3}>{'About'}</Header>

				<div className={'items-start gap-4 grid grid-cols-2'}>
					<Item>
						<ItemContent>
							<ItemTitle>{'Genres'}</ItemTitle>
							<ul className={'text-muted-foreground'}>
								{Boolean(gameRecord.genres) &&
									gameRecord.genres!.map((genre) => (
										<li key={genre}>
											<Link href={`/genre/${GAME_GENRES[genre].id}`}>
												{GAME_GENRES[genre].name}
											</Link>
										</li>
									))}
							</ul>
						</ItemContent>
					</Item>

					<Item>
						<ItemContent>
							<ItemTitle>{'Themes'}</ItemTitle>
							<ul className={'text-muted-foreground'}>
								{Boolean(gameRecord.themes) &&
									gameRecord.themes!.map((theme) => (
										<li key={theme}>
											<Link href={`/theme/${GAME_THEMES[theme].id}`}>
												{GAME_THEMES[theme].name}
											</Link>
										</li>
									))}
							</ul>
						</ItemContent>
					</Item>

					<Item>
						<ItemContent>
							<ItemTitle>{'Game Modes'}</ItemTitle>
							<ul className={'text-muted-foreground'}>
								{Boolean(gameRecord.modes) &&
									gameRecord.modes!.map((mode) => (
										<li key={mode}>
											<Link href={`/mode/${GAME_MODES[mode].id}`}>
												{GAME_MODES[mode].name}
											</Link>
										</li>
									))}
							</ul>
						</ItemContent>
					</Item>

					<Item>
						<ItemContent>
							<ItemTitle>{'Player Perspectives'}</ItemTitle>
							<ul className={'text-muted-foreground'}>
								{Boolean(gameRecord.playerPerspectives) &&
									gameRecord.playerPerspectives!.map((playerPerspective) => (
										<li key={playerPerspective}>
											<Link
												href={`/playerPerspective/${GAME_PLAYER_PERSPECTIVES[playerPerspective].id}`}>
												{GAME_PLAYER_PERSPECTIVES[playerPerspective].name}
											</Link>
										</li>
									))}
							</ul>
						</ItemContent>
					</Item>
				</div>
			</Card>
		</section>
	)
}
