// Module imports
import { ViewTransition } from 'react'
import Link from 'next/link'

// Local imports
import { AdditionalMedia } from '@/components/GamePage/AdditionalMedia'
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
import { Header } from '@/components/Header/Header'
import { ArtworkBackground } from '@/components/GamePage/ArtworkBackground'
import { LikeButton } from '@/components/GamePage/LikeButton'
import { ReleaseTimeline } from '@/components/GamePage/ReleaseTimeline'
import { ReviewsTab } from '@/components/GamePage/ReviewsTab'
import { ScreenshotGallery } from '@/components/GamePage/ScreenshotGallery'
import { SidebarMeta } from '@/components/GamePage/SidebarMeta'
import { SimilarGames } from '@/components/GamePage/SimilarGames'
import { SuggestEditButton } from '@/components/GamePage/SuggestEditButton'
import { TrailerSection } from '@/components/GamePage/TrailerSection'
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

function formatHours(seconds: number): string {
	const hours = Math.round(seconds / 3600)
	return `${hours} hr${hours !== 1 ? 's' : ''}`
}

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

	const hasMedia = Boolean(gameRecord.media?.length)
	const hasVideos = Boolean(gameRecord.videos?.length)
	const hasCredits = Boolean(gameRecord.actorCredits?.length)
	const hasExternalIds = gameRecord.externalIds && Object.entries(gameRecord.externalIds).some(([k, v]) => k !== '$type' && v != null)
	const hasMeta = hasExternalIds || Boolean(gameRecord.websites?.length) || Boolean(gameRecord.languageSupports?.length) || Boolean(gameRecord.multiplayerModes?.length)
	const hasSidebar = Boolean(gameRecord.timeToBeat) || Boolean(gameRecord.alternativeNames?.length) || Boolean(gameRecord.orgCredits?.length) || hasMeta

	return (
		<div className={'flex min-h-screen flex-col'}>
			{/* Hero */}
			<section className={'relative overflow-hidden py-10 shadow-xl/30 md:py-20'}>
				<ArtworkBackground gameRecord={gameRecord} />
				<Container className={'relative z-10'}>
					<div className={'flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-20'}>
						<div className={'w-[60%] md:min-w-[25%] md:w-[25%]'}>
							<ViewTransition name={`sr-${transitionName}`}>
								<BoxArt gameRecord={gameRecord} />
								<div className={'mt-1.5 px-0.5'}>
									<div className={'flex justify-between truncate text-xs text-muted-foreground'}>
										{firstReleaseYear && <span>{firstReleaseYear}</span>}
										{gameRecord.applicationType && (
											<span className={'ml-auto'}>
												{GAME_APPLICATION_TYPES[gameRecord.applicationType]?.name ?? gameRecord.applicationType}
											</span>
										)}
									</div>
								</div>
							</ViewTransition>
							<div className={'mt-3 flex items-center justify-start gap-4'}>
								<LikeButton
									gameUri={gameRecord.uri}
									initialCount={likes.count}
									initialLiked={likes.liked}
								/>
								{gameRecord.slug && (
									<SuggestEditButton slug={gameRecord.slug} />
								)}
							</div>
						</div>

						<div className={'flex flex-col gap-6 md:gap-10'}>
							<Header
								className={'text-center text-3xl md:text-left md:text-6xl'}
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
													<Link key={genre} href={`/search?genres=${genre}`}>
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
													<Link key={theme} href={`/search?themes=${theme}`}>
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
												items={gameRecord.playerPerspectives!.map((perspective) => (
													<Link key={perspective} href={`/search?playerPerspectives=${perspective}`}>
														{GAME_PLAYER_PERSPECTIVES[perspective]?.name ?? perspective}
													</Link>
												))}
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
													<Link key={mode} href={`/search?modes=${mode}`}>
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

			<div className={'bg-secondary flex flex-grow flex-col py-10 md:py-16'}>
				{/* Screenshots */}
				{hasMedia && (
					<section>
						<Container>
							<ScreenshotGallery
								uri={gameRecord.uri}
								gameName={gameRecord.name}
								media={gameRecord.media!}
							/>
						</Container>
					</section>
				)}

				{/* Two-column layout: main content + sidebar */}
				<section className={'mt-12 md:mt-16'}>
					<Container>
						<div className={'flex flex-col gap-12 md:flex-row md:gap-16'}>

							{/* Main column */}
							<div className={'flex min-w-0 flex-1 flex-col gap-12 md:gap-14'}>
								{/* Description */}
								{(gameRecord.summary || parentGame || franchises?.length || gameRecord.storyline) && (
									<div className={'flex flex-col gap-4'}>
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
											<p className={'text-muted-foreground'} key={franchise.uri}>
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
											<div className={'prose prose-sm dark:prose-invert max-w-none text-foreground'}>
												{gameRecord.summary?.split('\n').map((p, index) => (
													<p key={index}>{p}</p>
												))}
											</div>
										)}

										{Boolean(gameRecord.storyline) && (
											<div className={'mt-2'}>
												<Header className={'mb-3 text-lg'} level={4}>{'Storyline'}</Header>
												<div className={'prose prose-sm dark:prose-invert max-w-none text-foreground'}>
													{gameRecord.storyline?.split('\n').map((p, index) => (
														<p key={index}>{p}</p>
													))}
												</div>
											</div>
										)}
									</div>
								)}

								{/* Trailers */}
								{hasVideos && (
									<div>
										<Header className={'mb-6 text-lg'} level={4}>{'Trailers'}</Header>
										<TrailerSection videos={gameRecord.videos!} />
									</div>
								)}

								{/* Additional Media (artwork, covers, logos) */}
								{hasMedia && (
									<AdditionalMedia
										uri={gameRecord.uri}
										gameName={gameRecord.name}
										media={gameRecord.media!}
									/>
								)}

								{/* Credits */}
								{hasCredits && (
									<div className={'flex flex-col gap-10'}>
										<CreditsTab
											actorCredits={gameRecord.actorCredits}
										/>
									</div>
								)}
							</div>

							{/* Sidebar */}
							{hasSidebar && (
								<aside className={'flex w-full flex-col gap-8 md:w-72 md:shrink-0 lg:w-80'}>
									{/* Time to Beat */}
									{Boolean(gameRecord.timeToBeat) && (
										<div className={'rounded-lg border border-border bg-card p-5'}>
											<Header className={'mb-4 text-base md:text-sm'} level={5}>{'Time to Beat'}</Header>
											<div className={'flex flex-col gap-3'}>
												{gameRecord.timeToBeat?.hastily != null && (
													<div className={'flex items-center justify-between'}>
														<span className={'text-sm text-muted-foreground'}>{'Main Story'}</span>
														<span className={'font-semibold'}>{formatHours(gameRecord.timeToBeat.hastily)}</span>
													</div>
												)}
												{gameRecord.timeToBeat?.normally != null && (
													<div className={'flex items-center justify-between'}>
														<span className={'text-sm text-muted-foreground'}>{'Main + Extras'}</span>
														<span className={'font-semibold'}>{formatHours(gameRecord.timeToBeat.normally)}</span>
													</div>
												)}
												{gameRecord.timeToBeat?.completely != null && (
													<div className={'flex items-center justify-between'}>
														<span className={'text-sm text-muted-foreground'}>{'Completionist'}</span>
														<span className={'font-semibold'}>{formatHours(gameRecord.timeToBeat.completely)}</span>
													</div>
												)}
											</div>
										</div>
									)}

									{/* Alternative Names */}
									{Boolean(gameRecord.alternativeNames?.length) && (
										<div>
											<Header className={'mb-3 text-base md:text-sm'} level={5}>{'Alternative Names'}</Header>
											<ul className={'flex flex-col gap-1.5'}>
												{gameRecord.alternativeNames!.map((altName, index) => (
													<li key={index} className={'text-sm'}>
														<span>{altName.name}</span>
														{(altName.locale || altName.comment) && (
															<span className={'ml-1.5 text-xs text-muted-foreground'}>
																{[altName.locale, altName.comment].filter(Boolean).join(' — ')}
															</span>
														)}
													</li>
												))}
											</ul>
										</div>
									)}

									{/* Meta (stores, links, socials, IDs, languages, multiplayer) */}
									{hasMeta && (
										<SidebarMeta gameRecord={gameRecord} orgCredits={gameRecord.orgCredits} />
									)}
								</aside>
							)}
						</div>
					</Container>
				</section>

				{/* Release Timeline */}
				{Boolean(gameRecord.releases?.length) && (
					<section className={'mt-12 md:mt-16'}>
						<Container>
							<Header className={'mb-6 text-lg'} level={4}>{'Releases'}</Header>
							<ReleaseTimeline releases={gameRecord.releases!} />
						</Container>
					</section>
				)}

				{/* Full-width sections */}
				<div className={'mt-16 flex flex-col gap-16 md:mt-24'}>
					{reviews.length > 0 && (
						<section id={'reviews'}>
							<Container>
								<Header className={'mb-8 text-xl'} level={3}>{'Reviews'}</Header>
								<ReviewsTab reviews={reviews} />
							</Container>
						</section>
					)}

					{nonFranchiseCollections && nonFranchiseCollections.length > 0 && (
						<section id={'collections'}>
							<Container>
								<Header className={'mb-8 text-xl'} level={3}>{'Collections'}</Header>
								<CollectionsTab collections={nonFranchiseCollections} />
							</Container>
						</section>
					)}

					{similarGames.length > 0 && <SimilarGames games={similarGames} />}
				</div>
			</div>
		</div>
	)
}
