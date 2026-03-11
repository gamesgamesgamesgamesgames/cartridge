// Module imports
import { type PropsWithChildren } from 'react'
import { ViewTransition } from 'react'

// Local imports
import { BoxArt } from '@/components/BoxArt/BoxArt'
import { CommaSeparatedList } from '@/components/CommaSeparatedList/CommaSeparatedList'
import { Container } from '@/components/Container/Container'
import {
	DataList,
	DataListLabel,
	DataListValue,
} from '@/components/DataList/DataList'
import {
	GamePageSubnav,
	type SubnavConfig,
} from '@/components/GamePage/GamePageSubnav'
import { Header } from '@/components/Header/Header'
import { ArtworkBackground } from '@/components/GamePage/ArtworkBackground'
import { Badge } from '@/components/ui/badge'
import { LikeButton } from '@/components/GamePage/LikeButton'
import { GAME_APPLICATION_TYPES } from '@/constants/GAME_APPLICATION_TYPES'
import { GAME_GENRES } from '@/constants/GAME_GENRES'
import { GAME_MODES } from '@/constants/GAME_MODES'
import { GAME_PLAYER_PERSPECTIVES } from '@/constants/GAME_PLAYER_PERSPECTIVES'
import { GAME_THEMES } from '@/constants/GAME_THEMES'
import {
	ALL_CATEGORIZED_TYPES,
	ARTWORK_TYPES,
	COVER_TYPES,
	LOGO_TYPES,
	SCREENSHOT_TYPES,
} from '@/constants/MEDIA_CATEGORIES'
import { type GameRecord } from '@/typedefs/GameRecord'
import { type PopfeedReview } from '@/helpers/lexicons/games/gamesgamesgamesgames/getReviews.defs'
import Link from 'next/link'

// Types
type Props = Readonly<
	PropsWithChildren<{
		basePath: string
		gameRecord: GameRecord
		likes: { count: number; liked: boolean }
		reviews: PopfeedReview[]
		transitionName: string
	}>
>

export function GameLayoutContent(props: Props) {
	const { basePath, children, gameRecord, likes, reviews, transitionName } =
		props

	const aboutSections: SubnavConfig['about'] = []
	if (gameRecord.summary)
		aboutSections.push({ id: 'about-summary', label: 'Summary' })
	if (gameRecord.storyline)
		aboutSections.push({ id: 'about-storyline', label: 'Storyline' })

	const mediaItems = gameRecord.media ?? []
	const mediaSections: SubnavConfig['media'] = []
	if (mediaItems.some((i) => SCREENSHOT_TYPES.includes(i.mediaType as never))) {
		mediaSections.push({ id: 'media-screenshots', label: 'Screenshots' })
	}
	if (gameRecord.videos?.length) {
		mediaSections.push({ id: 'media-trailers', label: 'Trailers' })
	}
	if (mediaItems.some((i) => ARTWORK_TYPES.includes(i.mediaType as never))) {
		mediaSections.push({ id: 'media-artwork', label: 'Artwork' })
	}
	if (mediaItems.some((i) => COVER_TYPES.includes(i.mediaType as never))) {
		mediaSections.push({ id: 'media-covers', label: 'Covers' })
	}
	if (mediaItems.some((i) => LOGO_TYPES.includes(i.mediaType as never))) {
		mediaSections.push({ id: 'media-logos', label: 'Logos' })
	}
	if (
		mediaItems.some((i) => !ALL_CATEGORIZED_TYPES.has(i.mediaType as never))
	) {
		mediaSections.push({ id: 'media-other', label: 'Other' })
	}

	const subnavConfig: SubnavConfig = {
		about: aboutSections,
		media: mediaSections,
		reviews: reviews.length > 0 ? ['Popfeed'] : [],
	}

	return (
		<div className={'flex min-h-screen flex-col'}>
			<section className={'relative overflow-hidden py-20 shadow-xl/30'}>
				<ArtworkBackground gameRecord={gameRecord} />
				<Container className={'relative z-10'}>
					<div className={'flex gap-20 items-center'}>
						<ViewTransition name={`sr-${transitionName}`}>
							<BoxArt
								className={'min-w-[25%] w-[25%]'}
								gameRecord={gameRecord}
							/>
						</ViewTransition>

						<div className={'flex flex-col gap-10'}>
							<div className={'flex items-center gap-6'}>
								<Header
									className={'text-6xl'}
									level={2}>
									{gameRecord.name}
								</Header>
								{gameRecord.applicationType && (
									<Badge variant={'secondary'}>
										{GAME_APPLICATION_TYPES[gameRecord.applicationType]?.name ??
											gameRecord.applicationType}
									</Badge>
								)}
								<LikeButton
									gameUri={gameRecord.uri}
									initialCount={likes.count}
									initialLiked={likes.liked}
								/>
							</div>

							<DataList className={'gap-x-10 gap-y-6'}>
								{Boolean(gameRecord.genres?.length) && (
									<>
										<DataListLabel>{'Genres'}</DataListLabel>
										<DataListValue>
											<CommaSeparatedList
												items={gameRecord.genres!.map((genre) => (
													<Link
														key={genre}
														href={`/theme/${GAME_GENRES[genre]?.id ?? genre}`}>
														{GAME_GENRES[genre]?.name ?? genre}
													</Link>
												))}
											/>
										</DataListValue>
									</>
								)}

								{Boolean(gameRecord.themes?.length) && (
									<>
										<DataListLabel>{'Themes'}</DataListLabel>
										<DataListValue>
											<CommaSeparatedList
												items={gameRecord.themes!.map((theme) => (
													<Link
														key={theme}
														href={`/theme/${GAME_THEMES[theme]?.id ?? theme}`}>
														{GAME_THEMES[theme]?.name ?? theme}
													</Link>
												))}
											/>
										</DataListValue>
									</>
								)}

								{Boolean(gameRecord.playerPerspectives?.length) && (
									<>
										<DataListLabel>{'Perspectives'}</DataListLabel>
										<DataListValue>
											<CommaSeparatedList
												items={gameRecord.playerPerspectives!.map(
													(perspective) => (
														<Link
															key={perspective}
															href={`/player-perspective/${GAME_PLAYER_PERSPECTIVES[perspective]?.id ?? perspective}`}>
															{GAME_PLAYER_PERSPECTIVES[perspective]?.name ??
																perspective}
														</Link>
													),
												)}
											/>
										</DataListValue>
									</>
								)}

								{Boolean(gameRecord.modes?.length) && (
									<>
										<DataListLabel>{'Modes'}</DataListLabel>
										<DataListValue>
											<CommaSeparatedList
												items={gameRecord.modes!.map((mode) => (
													<Link
														key={mode}
														href={`/mode/${GAME_MODES[mode]?.id ?? mode}`}>
														{GAME_MODES[mode]?.name ?? mode}
													</Link>
												))}
											/>
										</DataListValue>
									</>
								)}
							</DataList>
						</div>
					</div>
				</Container>
			</section>

			<section className={'flex-1 bg-secondary py-20'}>
				<Container className={'overflow-visible'}>
					<div className={'flex gap-20'}>
						<div className={'sticky top-20 self-start'}>
							<GamePageSubnav
								basePath={basePath}
								subnavConfig={subnavConfig}
							/>
						</div>

						<div className={'flex flex-1 flex-col gap-10'}>{children}</div>
					</div>
				</Container>
			</section>
		</div>
	)
}
