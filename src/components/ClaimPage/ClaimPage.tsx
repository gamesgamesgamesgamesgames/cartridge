'use client'

// Module imports
import Link from 'next/link'
import {
	type ChangeEventHandler,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { useStore } from 'statery'

// Local imports
import * as API from '@/helpers/API'
import { BoxArt } from '@/components/BoxArt/BoxArt'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/Container/Container'
import { DashboardHeader } from '@/components/DashboardHeader/DashboardHeader'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { TiltCard } from '@/components/TiltCard/TiltCard'
import {
	type GameSummaryView,
	type ProfileSummaryView,
} from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { store } from '@/store/store'

// Types
type ClaimMode = 'game' | 'org'

type SelectedGame = {
	uri: string
	name: string
	slug?: string
	media?: GameSummaryView['media']
}

type SelectedOrg = {
	uri: string
	did: string
	displayName?: string
}

export function ClaimPage() {
	const { user } = useStore(store)

	const [mode, setMode] = useState<ClaimMode>('game')
	const [searchQuery, setSearchQuery] = useState('')
	const [searchResults, setSearchResults] = useState<
		Array<GameSummaryView | ProfileSummaryView>
	>([])
	const [isSearching, setIsSearching] = useState(false)
	const [isLoadingMore, setIsLoadingMore] = useState(false)
	const [searchCursor, setSearchCursor] = useState<string | undefined>(undefined)
	const [selectedGames, setSelectedGames] = useState<SelectedGame[]>([])
	const [selectedOrg, setSelectedOrg] = useState<SelectedOrg | null>(null)
	const [contact, setContact] = useState('')
	const [justification, setJustification] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [submitError, setSubmitError] = useState<string | null>(null)
	const [isSuccess, setIsSuccess] = useState(false)
	const [claimUri, setClaimUri] = useState<string | null>(null)

	const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const breadcrumbs = useMemo(
		() => [
			{ label: 'My Claims', url: '/dashboard/claims' },
			{ label: 'New Claim', url: '/dashboard/claim' },
		],
		[],
	)

	const runSearch = useCallback(async (q: string, currentMode: ClaimMode) => {
		if (!q.trim()) {
			setSearchResults([])
			setSearchCursor(undefined)
			return
		}

		setIsSearching(true)

		try {
			const types = currentMode === 'game' ? ['game'] : ['profile']
			const result = await API.search(q, { types, limit: 25 })
			setSearchResults(
				result.results.filter((item) => {
					if (currentMode === 'game') {
						return (
							item.$type === 'games.gamesgamesgamesgames.defs#gameSummaryView'
						)
					}
					return (
						item.$type ===
							'games.gamesgamesgamesgames.defs#profileSummaryView' &&
						(item as ProfileSummaryView).profileType === 'org'
					)
				}) as Array<GameSummaryView | ProfileSummaryView>,
			)
			setSearchCursor(result.cursor)
		} catch {
			setSearchResults([])
			setSearchCursor(undefined)
		} finally {
			setIsSearching(false)
		}
	}, [])

	const loadMore = useCallback(async () => {
		if (!searchQuery.trim() || !searchCursor || isLoadingMore) return

		setIsLoadingMore(true)

		try {
			const types = mode === 'game' ? ['game'] : ['profile']
			const result = await API.search(searchQuery, { types, limit: 25, cursor: searchCursor })
			const filteredResults = result.results.filter((item) => {
				if (mode === 'game') {
					return item.$type === 'games.gamesgamesgamesgames.defs#gameSummaryView'
				}
				return (
					item.$type === 'games.gamesgamesgamesgames.defs#profileSummaryView' &&
					(item as ProfileSummaryView).profileType === 'org'
				)
			}) as Array<GameSummaryView | ProfileSummaryView>

			setSearchResults((prev) => [...prev, ...filteredResults])
			setSearchCursor(result.cursor)
		} catch {
			// Keep existing results on error
		} finally {
			setIsLoadingMore(false)
		}
	}, [searchQuery, searchCursor, isLoadingMore, mode])

	const handleSearchChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
		(event) => {
			const q = event.target.value
			setSearchQuery(q)

			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current)
			}

			searchTimeoutRef.current = setTimeout(() => {
				runSearch(q, mode)
			}, 300)
		},
		[mode, runSearch],
	)

	const handleModeChange = useCallback((value: string) => {
		if (!value) return
		const newMode = value as ClaimMode
		setMode(newMode)
		setSearchResults([])
		setSearchQuery('')
		setSearchCursor(undefined)
		setSelectedGames([])
		setSelectedOrg(null)
	}, [])

	const handleGameToggle = useCallback((game: GameSummaryView) => {
		setSelectedGames((prev) => {
			const isSelected = prev.some((g) => g.uri === game.uri)
			if (isSelected) {
				return prev.filter((g) => g.uri !== game.uri)
			}
			return [
				...prev,
				{ uri: game.uri, name: game.name, slug: game.slug, media: game.media },
			]
		})
	}, [])

	const handleOrgSelect = useCallback((profile: ProfileSummaryView) => {
		setSelectedOrg((prev) => {
			if (prev?.did === profile.did) return null
			return {
				uri: profile.uri,
				did: profile.did,
				displayName: profile.displayName,
			}
		})
	}, [])

	const handleRemoveGame = useCallback((uri: string) => {
		setSelectedGames((prev) => prev.filter((g) => g.uri !== uri))
	}, [])

	const handleClearOrg = useCallback(() => {
		setSelectedOrg(null)
	}, [])

	const handleContactChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
		(event) => setContact(event.target.value),
		[],
	)

	const handleJustificationChange = useCallback<
		ChangeEventHandler<HTMLTextAreaElement>
	>((event) => setJustification(event.target.value), [])

	const handleSubmit = useCallback(async () => {
		if (!contact.trim()) return
		if (mode === 'game' && selectedGames.length === 0) return
		if (mode === 'org' && !selectedOrg) return

		setIsSubmitting(true)
		setSubmitError(null)

		try {
			const uri = await API.createClaim({
				type: mode,
				...(mode === 'game'
					? { games: selectedGames.map((g) => g.uri) }
					: { org: selectedOrg!.uri }),
				contact: contact.trim(),
				...(justification.trim() ? { message: justification.trim() } : {}),
			})
			setClaimUri(uri)
			setIsSuccess(true)
		} catch (error) {
			setSubmitError(
				error instanceof Error
					? error.message
					: 'An unexpected error occurred. Please try again.',
			)
		} finally {
			setIsSubmitting(false)
		}
	}, [contact, justification, mode, selectedGames, selectedOrg])

	// Clear search timeout on unmount
	useEffect(() => {
		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current)
			}
		}
	}, [])

	if (!user) {
		return (
			<>
				<DashboardHeader breadcrumbs={breadcrumbs} />
				<Container>
					<div className={'flex flex-col gap-4'}>
						<h1 className={'text-2xl font-bold'}>{'Claim Ownership'}</h1>
						<p className={'text-muted-foreground'}>
							{'You must be signed in to submit a claim.'}
						</p>
					</div>
				</Container>
			</>
		)
	}

	if (isSuccess) {
		return (
			<>
				<DashboardHeader breadcrumbs={breadcrumbs} />
				<Container>
					<div className={'flex flex-col gap-6 max-w-lg'}>
						<h1 className={'text-2xl font-bold'}>{'Claim Submitted'}</h1>

						<div
							className={
								'rounded-lg border border-border bg-card p-6 flex flex-col gap-4'
							}>
							<p className={'text-base'}>
								{
									'Your claim has been submitted successfully. Our team will review it and reach out to you via the contact information you provided.'
								}
							</p>

							{claimUri && (
								<p
									className={
										'text-sm text-muted-foreground font-mono break-all'
									}>
									{claimUri}
								</p>
							)}

							<div className={'flex gap-3 flex-wrap'}>
								<Button
									asChild
									variant={'default'}>
									<Link href={'/dashboard/claims'}>{'View My Claims'}</Link>
								</Button>

								<Button
									onClick={() => {
										setIsSuccess(false)
										setClaimUri(null)
										setSelectedGames([])
										setSelectedOrg(null)
										setContact('')
										setJustification('')
										setSearchQuery('')
										setSearchResults([])
									}}
									variant={'outline'}>
									{'Submit Another Claim'}
								</Button>
							</div>
						</div>
					</div>
				</Container>
			</>
		)
	}

	const hasSelection =
		mode === 'game' ? selectedGames.length > 0 : selectedOrg !== null
	const canSubmit = hasSelection && contact.trim().length > 0 && !isSubmitting

	return (
		<>
			<DashboardHeader breadcrumbs={breadcrumbs} />

			<Container>
				<div className={'flex flex-col gap-8'}>
					{/* Header */}
					<div className={'flex flex-col gap-2'}>
						<h1 className={'text-2xl font-bold'}>{'Claim Ownership'}</h1>
						<p className={'text-muted-foreground text-sm'}>
							{
								'Are you a developer or publisher? Submit a claim to verify your ownership of games or an organization.'
							}
						</p>
					</div>

					<div className={'flex gap-10 justify-items-stretch'}>
						{/* Left column: Mode toggle */}
						<div className={'flex flex-col gap-3'}>
							<Label>{'What would you like to claim?'}</Label>

							<RadioGroup
								value={mode}
								onValueChange={handleModeChange}>
								<div className={'flex items-center gap-3'}>
									<RadioGroupItem
										value={'game'}
										id={'claim-game'}
									/>
									<Label
										htmlFor={'claim-game'}
										className={'font-normal cursor-pointer'}>
										{'Games'}
									</Label>
								</div>
								<div className={'flex items-center gap-3'}>
									<RadioGroupItem
										value={'org'}
										id={'claim-org'}
									/>
									<Label
										htmlFor={'claim-org'}
										className={'font-normal cursor-pointer'}>
										{'Organization'}
									</Label>
								</div>
							</RadioGroup>
						</div>

						{/* Right column: Contact and Additional Info */}
						<div className={'flex flex-col flex-grow gap-6'}>
							{/* Contact field */}
							<div className={'flex flex-col gap-2'}>
								<Label htmlFor={'contact'}>
									{'Contact'}
									<span className={'text-destructive ml-1'}>{'*'}</span>
								</Label>
								<Input
									id={'contact'}
									onChange={handleContactChange}
									placeholder={'email@example.com or @handle.bsky.social'}
									value={contact}
								/>
								<p className={'text-xs text-muted-foreground'}>
									{
										'How we can reach you if we have questions. Not stored publicly.'
									}
								</p>
							</div>

							{/* Justification field */}
							<div className={'flex flex-col gap-2'}>
								<Label htmlFor={'justification'}>
									{'Additional Information'}
									<span className={'text-muted-foreground ml-1 text-xs'}>
										{'(optional)'}
									</span>
								</Label>
								<Textarea
									id={'justification'}
									onChange={handleJustificationChange}
									placeholder={
										mode === 'game'
											? 'Tell us why you are the owner or rights holder for these games…'
											: 'Tell us why you are authorized to claim this organization…'
									}
									value={justification}
								/>
							</div>
						</div>
					</div>

					{/* Selected org summary */}
					{mode === 'org' && selectedOrg && (
						<div className={'flex flex-col gap-3 max-w-lg'}>
							<Label>{'Selected Organization'}</Label>

							<div
								className={
									'flex items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-2'
								}>
								<div className={'flex flex-col gap-0.5'}>
									<span className={'text-sm font-medium'}>
										{selectedOrg.displayName ?? selectedOrg.did}
									</span>
									<span className={'text-xs text-muted-foreground font-mono'}>
										{selectedOrg.did}
									</span>
								</div>
								<Button
									onClick={handleClearOrg}
									size={'icon-xs'}
									variant={'ghost'}>
									{'×'}
								</Button>
							</div>
						</div>
					)}

					{/* Error message */}
					{submitError && (
						<div
							className={
								'rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 max-w-lg'
							}>
							<p className={'text-sm text-destructive'}>{submitError}</p>
						</div>
					)}

					{/* Submit button */}
					<div className={'flex max-w-lg'}>
						<Button
							disabled={!canSubmit}
							onClick={handleSubmit}>
							{isSubmitting ? (
								<>
									<Spinner className={'size-4'} />
									{'Submitting…'}
								</>
							) : (
								'Submit Claim'
							)}
						</Button>
					</div>

					{/* Search section */}
					<div className={'flex flex-col gap-4 border-t border-border pt-8'}>
						<div className={'flex flex-col gap-2 max-w-lg'}>
							<Label htmlFor={'search'}>
								{mode === 'game'
									? 'Search for Games'
									: 'Search for Organization'}
							</Label>

							<div className={'relative'}>
								<Input
									id={'search'}
									onChange={handleSearchChange}
									placeholder={
										mode === 'game'
											? 'Search by game name…'
											: 'Search by organization name…'
									}
									value={searchQuery}
								/>

								{isSearching && (
									<div className={'absolute right-3 top-1/2 -translate-y-1/2'}>
										<Spinner className={'size-4'} />
									</div>
								)}
							</div>
						</div>

						{/* Search results - Game grid */}
						{mode === 'game' && searchResults.length > 0 && (
							<div
								className={
									'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
								}>
								{(searchResults as GameSummaryView[]).map((game) => {
									const isSelected = selectedGames.some(
										(g) => g.uri === game.uri,
									)
									return (
										<button
											key={game.uri}
											type={'button'}
											onClick={() => handleGameToggle(game)}
											className={'text-left group'}>
											<div
												className={`relative rounded-lg overflow-hidden ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
												<TiltCard>
													<BoxArt gameRecord={game} />
												</TiltCard>
												{isSelected && (
													<div
														className={
															'absolute inset-0 bg-black/60 flex items-center justify-center'
														}>
														<span
															className={
																'bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded'
															}>
															{'Selected'}
														</span>
													</div>
												)}
											</div>
											<div className={'mt-1.5 px-0.5'}>
												<div className={'truncate text-sm font-medium'}>
													{game.name}
												</div>
												{game.summary && (
													<p
														className={
															'text-muted-foreground text-xs mt-0.5 line-clamp-1'
														}>
														{game.summary}
													</p>
												)}
											</div>
										</button>
									)
								})}
							</div>
						)}

						{/* Search results - Org list */}
						{mode === 'org' && searchResults.length > 0 && (
							<div
								className={
									'rounded-md border border-border divide-y divide-border overflow-hidden max-w-lg'
								}>
								{(searchResults as ProfileSummaryView[]).map((profile) => {
									const isSelected = selectedOrg?.did === profile.did
									return (
										<button
											key={profile.did}
											type={'button'}
											onClick={() => handleOrgSelect(profile)}
											className={[
												'w-full text-left px-4 py-3 text-sm transition-colors hover:bg-accent',
												isSelected
													? 'bg-primary/10 text-primary'
													: 'bg-background',
											].join(' ')}>
											<div
												className={'flex items-center justify-between gap-2'}>
												<span className={'font-medium'}>
													{profile.displayName ?? profile.did}
												</span>
												{isSelected && (
													<span
														className={
															'text-xs text-primary font-medium shrink-0'
														}>
														{'Selected'}
													</span>
												)}
											</div>
											<p
												className={
													'text-muted-foreground text-xs mt-0.5 font-mono'
												}>
												{profile.did}
											</p>
										</button>
									)
								})}
							</div>
						)}

						{searchQuery.trim() &&
							!isSearching &&
							searchResults.length === 0 && (
								<p className={'text-sm text-muted-foreground'}>
									{'No results found.'}
								</p>
							)}

					</div>
				</div>
			</Container>

			{/* Sticky footer with selected games and load more */}
			{mode === 'game' && (selectedGames.length > 0 || searchCursor) && (
				<div
					className={
						'sticky bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
					}>
					<Container>
						<div className={'flex items-center gap-4 py-3'}>
							{selectedGames.length > 0 && (
								<>
									<div className={'flex items-center gap-2 shrink-0'}>
										<span className={'text-sm font-medium'}>
											{'Selected'}
										</span>
										<span className={'text-xs text-muted-foreground'}>
											({selectedGames.length})
										</span>
									</div>

									<div className={'flex gap-2 overflow-x-auto scrollbar-none'}>
										{selectedGames.map((game) => (
											<div
												key={game.uri}
												className={'relative group shrink-0 w-12'}>
												<BoxArt gameRecord={game as GameSummaryView} />
												<button
													type={'button'}
													onClick={() => handleRemoveGame(game.uri)}
													className={
														'absolute -top-1 -right-1 size-4 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
													}>
													{'×'}
												</button>
											</div>
										))}
									</div>
								</>
							)}

							<div className={'ml-auto flex items-center gap-3 shrink-0'}>
								{searchCursor && searchResults.length > 0 && (
									<Button
										disabled={isLoadingMore}
										onClick={loadMore}
										size={'sm'}
										variant={'outline'}>
										{isLoadingMore ? (
											<>
												<Spinner className={'size-4'} />
												{'Loading…'}
											</>
										) : (
											'Load More'
										)}
									</Button>
								)}

								<Button
									disabled={!canSubmit}
									onClick={handleSubmit}
									size={'sm'}>
									{isSubmitting ? (
										<>
											<Spinner className={'size-4'} />
											{'Submitting…'}
										</>
									) : (
										'Submit Claim'
									)}
								</Button>
							</div>
						</div>
					</Container>
				</div>
			)}
		</>
	)
}
