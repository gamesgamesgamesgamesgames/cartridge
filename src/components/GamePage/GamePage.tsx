// Module imports
import { notFound } from 'next/navigation'
import { ViewTransition } from 'react'

// Local imports
import * as API from '@/helpers/API'
import { About } from '@/components/GamePage/About'
import { Achievements } from '@/components/GamePage/Achievements'
import { BoxArt } from '@/components/BoxArt/BoxArt'
import {
	DataList,
	DataListLabel,
	DataListValue,
} from '@/components/DataList/DataList'
import { Container } from '@/components/Container/Container'
import { Credits } from './Credits'
import { GameHeader } from '@/components/GamePage/GameHeader'
import { Header } from '@/components/Header/Header'
import { AboutTab } from './AboutTab'
import { ArtworkBackground } from './ArtworkBackground'
import { GamePageSubnav } from './GamePageSubnav'
import { Media } from './Media'
import { MediaTab } from './MediaTab'
import { ReviewsTab } from './ReviewsTab'
import { RelatedContent } from '@/components/GamePage/RelatedContent'
import { ReleaseTimeline } from '@/components/GamePage/ReleaseTimeline'
import { GAME_GENRES } from '@/constants/GAME_GENRES'
import { GAME_MODES } from '@/constants/GAME_MODES'
import { GAME_PLAYER_PERSPECTIVES } from '@/constants/GAME_PLAYER_PERSPECTIVES'
import { GAME_THEMES } from '@/constants/GAME_THEMES'
import Link from 'next/link'
import { CommaSeparatedList } from '../CommaSeparatedList/CommaSeparatedList'
import {
	ALL_CATEGORIZED_TYPES,
	ARTWORK_TYPES,
	COVER_TYPES,
	LOGO_TYPES,
	SCREENSHOT_TYPES,
} from '@/constants/MEDIA_CATEGORIES'
import { type SubnavConfig } from './GamePageSubnav'

// Types
type Props = Readonly<{
	params: Promise<{ slug: string }>
}>

export async function GamePage(props: Props) {
	const { slug } = await props.params

	const gameRecord = await API.getGame({ slug })
	if (!gameRecord) notFound()

	const basePath = `/game/${slug}`
	const { reviews } = await API.getReviews(gameRecord.uri)

	// Compute subnav config from game data
	const aboutSections: SubnavConfig['about'] = []
	if (gameRecord.summary) aboutSections.push({ id: 'about-summary', label: 'Summary' })
	if (gameRecord.storyline) aboutSections.push({ id: 'about-storyline', label: 'Storyline' })

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
	if (mediaItems.some((i) => !ALL_CATEGORIZED_TYPES.has(i.mediaType as never))) {
		mediaSections.push({ id: 'media-other', label: 'Other' })
	}

	const subnavConfig: SubnavConfig = {
		about: aboutSections,
		media: mediaSections,
		reviews: reviews.length > 0 ? ['Popfeed'] : [],
	}

	return (
		<>
			<section className={'relative overflow-hidden py-20 shadow-xl/30'}>
				<ArtworkBackground gameRecord={gameRecord} />
				<Container className={'relative z-10'}>
					<div className={'flex gap-20 items-center'}>
						<ViewTransition
							name={`sr-${slug}`}>
							<BoxArt
								className={'min-w-[25%] w-[25%]'}
								gameRecord={gameRecord}
							/>
						</ViewTransition>

						<div className={'flex flex-col gap-10'}>
							<Header
								className={'text-6xl'}
								level={2}>
								{gameRecord.name}
							</Header>

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

			<section className={'bg-deep-navy py-20'}>
				<Container>
					<div className={'flex gap-20'}>
						<div className={'sticky top-20 self-start'}>
							<GamePageSubnav basePath={basePath} subnavConfig={subnavConfig} />
						</div>

						<div className={'flex flex-1 flex-col gap-16'}>
							<section id={'about'}>
								<Header level={2}>{'About'}</Header>
								<div className={'flex flex-col gap-10 mt-4'}>
									<AboutTab gameRecord={gameRecord} />
								</div>
							</section>

							<section id={'media'}>
								<Header level={2}>{'Media'}</Header>
								<div className={'flex flex-col gap-10 mt-4'}>
									<MediaTab gameRecord={gameRecord} />
								</div>
							</section>

							<section id={'reviews'}>
								<Header level={2}>{'Reviews'}</Header>
								<div className={'flex flex-col gap-10 mt-4'}>
									<ReviewsTab reviews={reviews} />
								</div>
							</section>
						</div>
					</div>
				</Container>
			</section>

			<Container>
				<div className={'gap-4 grid grid-cols-3 max-w-full'}>
					<div className={'col-span-2 flex flex-col gap-4'}>
						<GameHeader gameRecord={gameRecord} />

						<Media gameRecord={gameRecord} />

						<Credits gameRecord={gameRecord} />

						<Achievements gameRecord={gameRecord} />
					</div>

					<div className={'flex flex-col gap-4'}>
						<About gameRecord={gameRecord} />

						<ReleaseTimeline gameRecord={gameRecord} />

						<RelatedContent gameRecord={gameRecord} />
					</div>
				</div>
			</Container>

			{/* <pre>{JSON.stringify({ params, gameRecord }, null, 2)}</pre> */}
		</>
	)
}
