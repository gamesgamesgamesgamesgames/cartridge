// Module imports
import { ViewTransition } from 'react'

// Local imports
import { AboutTab } from '@/components/GamePage/AboutTab'
import { AgeRatingBadge } from '@/components/GamePage/AgeRatingBadge'
import { BoxArt } from '@/components/BoxArt/BoxArt'
import { CollectionsTab } from '@/components/GamePage/CollectionsTab'
import { CommaSeparatedList } from '@/components/CommaSeparatedList/CommaSeparatedList'
import { Container } from '@/components/Container/Container'
import { CreditsTab } from '@/components/GamePage/CreditsTab'
import {
	DataList,
	DataListLabel,
	DataListValue,
} from '@/components/DataList/DataList'
import { GameTabPanel } from '@/components/GamePage/GameTabPanel'
import { GameTabs } from '@/components/GamePage/GameTabs'
import { Header } from '@/components/Header/Header'
import { ArtworkBackground } from '@/components/GamePage/ArtworkBackground'
import { LikeButton } from '@/components/GamePage/LikeButton'
import { MediaTab } from '@/components/GamePage/MediaTab'
import { MetaTab } from '@/components/GamePage/MetaTab'
import { ReviewsTab } from '@/components/GamePage/ReviewsTab'
import { GAME_APPLICATION_TYPES } from '@/constants/GAME_APPLICATION_TYPES'
import { GAME_GENRES } from '@/constants/GAME_GENRES'
import { GAME_MODES } from '@/constants/GAME_MODES'
import { GAME_PLAYER_PERSPECTIVES } from '@/constants/GAME_PLAYER_PERSPECTIVES'
import { GAME_THEMES } from '@/constants/GAME_THEMES'
import {
	type AgeRating,
	type CollectionSummaryView,
} from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { type GameFeedGame } from '@/helpers/API'
import { type GameRecord } from '@/typedefs/GameRecord'
import { type PopfeedReview } from '@/helpers/lexicons/games/gamesgamesgamesgames/getReviews.defs'
import { SimilarGames } from '@/components/GamePage/SimilarGames'
import Link from 'next/link'

type CollectionWithGames = {
	collection: CollectionSummaryView
	games: GameFeedGame[]
}

const AGE_RATING_ORG_DIRS: Record<string, string> = {
	esrb: 'esrb',
	pegi: 'pegi',
	cero: 'cero',
	usk: 'usk',
	grac: 'grac',
	classInd: 'class_ind',
	acb: 'acb',
}

/** Maps rating string values (from IGDB) to image filename suffixes. */
const AGE_RATING_FILE_SUFFIXES: Record<string, Record<string, string>> = {
	pegi: { Three: '3', Seven: '7', Twelve: '12', Sixteen: '16', Eighteen: '18' },
	esrb: { RP: 'rp', EC: 'ec', E: 'e', E10: 'e10', T: 't', M: 'm', AO: 'ao' },
	cero: { A: 'a', B: 'b', C: 'c', D: 'd', Z: 'z' },
	usk: { Zero: '0', Six: '6', Twelve: '12', Sixteen: '16', Eighteen: '18' },
	grac: { All: 'all', Twelve: '12', Fifteen: '15', Nineteen: '19' },
	classInd: {
		L: 'l',
		Ten: '10',
		Twelve: '12',
		Fourteen: '14',
		Sixteen: '16',
		Eighteen: '18',
	},
	acb: { G: 'g', PG: 'pg', M: 'm', MA15: 'ma_15', R18: 'r_18' },
}

function ageRatingImagePath(rating: AgeRating): string | null {
	const dir = AGE_RATING_ORG_DIRS[rating.organization]
	if (!dir) return null
	const suffix = AGE_RATING_FILE_SUFFIXES[rating.organization]?.[rating.rating]
	if (!suffix) return null
	return `/images/age-ratings/${dir}/${dir}_${suffix}.svg`
}

// Types
type Props = Readonly<{
	basePath: string
	franchises?: CollectionSummaryView[]
	gameRecord: GameRecord
	likes: { count: number; liked: boolean }
	nonFranchiseCollections?: CollectionWithGames[]
	parentGame?: { name: string; slug: string } | null
	reviews: PopfeedReview[]
	similarGames: GameFeedGame[]
	transitionName: string
}>

export function GameLayoutContent(props: Props) {
	const {
		basePath,
		franchises,
		gameRecord,
		likes,
		nonFranchiseCollections,
		parentGame,
		reviews,
		similarGames,
		transitionName,
	} = props

	const firstReleaseYear = (() => {
		let earliest: string | undefined
		for (const release of gameRecord.releases ?? []) {
			for (const rd of release.releaseDates ?? []) {
				if (rd.releasedAt && (!earliest || rd.releasedAt < earliest)) {
					earliest = rd.releasedAt
				}
			}
		}
		return earliest?.slice(0, 4)
	})()

	const visibleTabs: { id: string; label: string }[] = [
		{ id: 'about', label: 'About' },
	]

	// Check for media content
	const hasMedia = Boolean(gameRecord.media?.length) || Boolean(gameRecord.videos?.length)
	if (hasMedia) visibleTabs.push({ id: 'media', label: 'Media' })

	// Check for credits
	const hasCredits = Boolean(gameRecord.orgCredits?.length) || Boolean(gameRecord.actorCredits?.length)
	if (hasCredits) visibleTabs.push({ id: 'credits', label: 'Credits' })

	// Check for reviews
	if (reviews.length > 0) visibleTabs.push({ id: 'reviews', label: 'Reviews' })

	// Check for collections
	if (nonFranchiseCollections && nonFranchiseCollections.length > 0) {
		visibleTabs.push({ id: 'collections', label: 'Collections' })
	}

	// Check for meta content
	const hasExternalIds = gameRecord.externalIds && Object.entries(gameRecord.externalIds).some(([k, v]) => k !== '$type' && v != null)
	const hasMeta = hasExternalIds || Boolean(gameRecord.websites?.length) || Boolean(gameRecord.languageSupports?.length) || Boolean(gameRecord.multiplayerModes?.length)
	if (hasMeta) visibleTabs.push({ id: 'meta', label: 'Meta' })

	return (
		<div className={'flex min-h-screen flex-col'}>
			<section className={'relative overflow-hidden py-10 md:py-20 shadow-xl/30'}>
				<ArtworkBackground gameRecord={gameRecord} />
				<Container className={'relative z-10'}>
					<div className={'flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-20'}>
						<div className={'w-[60%] md:min-w-[25%] md:w-[25%]'}>
							<ViewTransition name={`sr-${transitionName}`}>
								<div className={'relative'}>
									<BoxArt gameRecord={gameRecord} />
									<LikeButton
										className={
											'absolute top-2 right-2 z-10 rounded-full bg-black/40 p-1.5'
										}
										gameUri={gameRecord.uri}
										initialCount={likes.count}
										initialLiked={likes.liked}
									/>
								</div>
								<div className={'mt-1.5 px-0.5'}>
									<div
										className={
											'flex justify-between truncate text-xs text-muted-foreground'
										}>
										{firstReleaseYear && <span>{firstReleaseYear}</span>}
										{gameRecord.applicationType && (
											<span className={'ml-auto'}>
												{GAME_APPLICATION_TYPES[gameRecord.applicationType]
													?.name ?? gameRecord.applicationType}
											</span>
										)}
									</div>
								</div>
							</ViewTransition>
						</div>

						<div className={'flex flex-col gap-6 md:gap-10'}>
							<Header
								className={'text-3xl md:text-6xl text-center md:text-left'}
								level={2}>
								{gameRecord.name}
							</Header>

							<DataList className={'gap-x-6 gap-y-4 md:gap-x-10 md:gap-y-6'}>
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

							{Boolean(gameRecord.ageRatings?.length) && (
								<div className={'mt-4 flex flex-wrap items-center justify-center gap-4 md:mt-10 md:justify-start'}>
									{gameRecord.ageRatings!.map((rating) => {
										const src = ageRatingImagePath(rating)
										if (!src) return null
										return (
											<AgeRatingBadge
												key={`${rating.organization}-${rating.rating}`}
												organization={rating.organization}
												rating={rating.rating}
												src={src}
											/>
										)
									})}
								</div>
							)}
						</div>
					</div>
				</Container>
			</section>

			<div className={'bg-secondary flex flex-grow flex-col gap-10 py-10 md:gap-20 md:py-20'}>
				<section>
					<Container>
						<GameTabs tabs={visibleTabs}>
							<GameTabPanel tab="about">
								<AboutTab
									gameRecord={gameRecord}
									parentGame={parentGame}
									franchises={franchises}
								/>
							</GameTabPanel>

							{hasMedia && (
								<GameTabPanel tab="media">
									<MediaTab gameRecord={gameRecord} />
								</GameTabPanel>
							)}

							{hasCredits && (
								<GameTabPanel tab="credits">
									<CreditsTab
										orgCredits={gameRecord.orgCredits}
										actorCredits={gameRecord.actorCredits}
									/>
								</GameTabPanel>
							)}

							{reviews.length > 0 && (
								<GameTabPanel tab="reviews">
									<ReviewsTab reviews={reviews} />
								</GameTabPanel>
							)}

							{nonFranchiseCollections && nonFranchiseCollections.length > 0 && (
								<GameTabPanel tab="collections">
									<CollectionsTab collections={nonFranchiseCollections} />
								</GameTabPanel>
							)}

							{hasMeta && (
								<GameTabPanel tab="meta">
									<MetaTab gameRecord={gameRecord} />
								</GameTabPanel>
							)}
						</GameTabs>
					</Container>
				</section>

				{similarGames.length > 0 && <SimilarGames games={similarGames} />}
			</div>
		</div>
	)
}
