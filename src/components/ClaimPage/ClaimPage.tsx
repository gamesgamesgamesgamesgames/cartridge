'use client'

import Link from 'next/link'
import {
	type ChangeEventHandler,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useStore } from 'statery'
import {
	Building2,
	Check,
	ChevronLeft,
	ChevronRight,
	Gamepad2,
	Search,
	X,
} from 'lucide-react'

import * as API from '@/helpers/API'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { BoxArt } from '@/components/BoxArt/BoxArt'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Container } from '@/components/Container/Container'
import { Header } from '@/components/Header/Header'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { TiltCard } from '@/components/TiltCard/TiltCard'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
	type GameSummaryView,
	type ProfileSummaryView,
} from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { store } from '@/store/store'

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

const STEPS = ['select', 'details', 'review'] as const
type Step = (typeof STEPS)[number]

const STEP_LABELS: Record<Step, string> = {
	select: 'Select',
	details: 'Details',
	review: 'Review',
}

const CONTACT_PATTERN = /^([^\s@]+@[^\s@]+\.[^\s@]{2,}|@?[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?){1,})$/

const DRAFT_KEY = 'cartridge-claim-draft'

function StepIndicator({ currentStep, onStepClick }: { currentStep: Step; onStepClick: (step: Step) => void }) {
	const currentIndex = STEPS.indexOf(currentStep)

	return (
		<nav aria-label={'Claim progress'}>
			<ol className={'flex items-center justify-center gap-1 sm:gap-2'}>
				{STEPS.map((step, index) => {
					const isComplete = index < currentIndex
					const isCurrent = index === currentIndex

					const indicator = (
						<div className={'flex items-center gap-1.5'}>
							<div
								aria-current={isCurrent ? 'step' : undefined}
								aria-label={`Step ${index + 1}: ${STEP_LABELS[step]}${isComplete ? ' (complete)' : isCurrent ? ' (current)' : ''}`}
								className={[
									'flex size-7 items-center justify-center rounded-full text-xs font-medium transition-colors',
									isComplete
										? 'bg-primary text-primary-foreground'
										: '',
									isCurrent
										? 'border-2 border-primary text-primary'
										: '',
									!isComplete && !isCurrent
										? 'border border-border text-muted-foreground'
										: '',
								].join(' ')}>
								{isComplete ? (
									<Check className={'size-3.5'} />
								) : (
									index + 1
								)}
							</div>

							<span
								className={`text-xs sm:text-sm ${isCurrent ? 'font-medium' : 'text-muted-foreground'}`}>
								{STEP_LABELS[step]}
							</span>
						</div>
					)

					return (
						<li
							key={step}
							className={'flex items-center gap-1 sm:gap-2'}>
							{index > 0 && (
								<div
									className={`h-px w-6 sm:w-10 transition-colors ${isComplete ? 'bg-primary' : 'bg-border'}`}
								/>
							)}

							{isComplete ? (
								<button
									className={'cursor-pointer'}
									onClick={() => onStepClick(step)}
									type={'button'}>
									{indicator}
								</button>
							) : (
								<div>{indicator}</div>
							)}
						</li>
					)
				})}
			</ol>
		</nav>
	)
}

function StepShell({
	children,
	description,
	title,
}: {
	children: ReactNode
	description: string
	title: string
}) {
	return (
		<div className={'flex flex-col gap-6'}>
			<div className={'flex flex-col gap-1'}>
				<Header level={4}>{title}</Header>
				<p className={'text-sm text-muted-foreground'}>{description}</p>
			</div>

			{children}
		</div>
	)
}

function SelectionSummary({
	mode,
	selectedGames,
	selectedOrg,
}: {
	mode: ClaimMode
	selectedGames: SelectedGame[]
	selectedOrg: SelectedOrg | null
}) {
	if (mode === 'game' && selectedGames.length > 0) {
		const shown = selectedGames.slice(0, 4)
		const remaining = selectedGames.length - shown.length

		return (
			<div className={'flex items-center gap-3 rounded-lg bg-muted/50 p-3'}>
				<div className={'flex -space-x-2'}>
					{shown.map((game) => (
						<div
							key={game.uri}
							className={'w-8 overflow-hidden rounded border border-background'}>
							<BoxArt gameRecord={game as GameSummaryView} />
						</div>
					))}
				</div>
				<span className={'text-sm'}>
					{selectedGames.length === 1
						? selectedGames[0].name
						: `${selectedGames.map((g) => g.name).slice(0, 4).join(', ')}${remaining > 0 ? ` +${remaining} more` : ''}`}
				</span>
			</div>
		)
	}

	if (mode === 'org' && selectedOrg) {
		return (
			<div className={'flex items-center gap-3 rounded-lg bg-muted/50 p-3'}>
				<Avatar size={'sm'}>
					<AvatarFallback>
						<Building2 className={'size-3'} />
					</AvatarFallback>
				</Avatar>
				<span className={'text-sm'}>{selectedOrg.displayName ?? selectedOrg.did}</span>
			</div>
		)
	}

	return null
}

export function ClaimPage() {
	const { user } = useStore(store)
	const searchParams = useSearchParams()
	const router = useRouter()

	const [step, setStep] = useState<Step>('select')
	const [isSuccess, setIsSuccess] = useState(false)
	const [successVisible, setSuccessVisible] = useState(false)

	const [mode, setMode] = useState<ClaimMode>(() => {
		return searchParams.get('org') ? 'org' : 'game'
	})
	const [pendingMode, setPendingMode] = useState<ClaimMode | null>(null)
	const [selectedGames, setSelectedGames] = useState<SelectedGame[]>([])
	const [selectedOrg, setSelectedOrg] = useState<SelectedOrg | null>(null)
	const [contact, setContact] = useState('')
	const [justification, setJustification] = useState('')

	const [searchQuery, setSearchQuery] = useState('')
	const [searchResults, setSearchResults] = useState<
		Array<GameSummaryView | ProfileSummaryView>
	>([])
	const [isSearching, setIsSearching] = useState(false)
	const [isLoadingMore, setIsLoadingMore] = useState(false)
	const [searchCursor, setSearchCursor] = useState<string | undefined>(
		undefined,
	)

	const [isSubmitting, setIsSubmitting] = useState(false)
	const [submitError, setSubmitError] = useState<string | null>(null)
	const [submitConfirmed, setSubmitConfirmed] = useState(false)
	const [contactTouched, setContactTouched] = useState(false)
	const [searchError, setSearchError] = useState(false)
	const [isPreloading, setIsPreloading] = useState(
		() => !!searchParams.get('game') || !!searchParams.get('org'),
	)
	const [nextAttempted, setNextAttempted] = useState(false)
	const [draftRestored, setDraftRestored] = useState(false)

	const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const searchAbortRef = useRef<AbortController | null>(null)
	const announcerRef = useRef<HTMLDivElement>(null)
	const stepRef = useRef<HTMLDivElement>(null)

	const announce = useCallback((message: string) => {
		if (announcerRef.current) {
			announcerRef.current.textContent = message
		}
	}, [])

	// --- Search ---

	const runSearch = useCallback(
		async (q: string, currentMode: ClaimMode) => {
			if (q.trim().length < 2) {
				setSearchResults([])
				setSearchCursor(undefined)
				return
			}

			if (searchAbortRef.current) {
				searchAbortRef.current.abort()
			}
			const controller = new AbortController()
			searchAbortRef.current = controller

			setIsSearching(true)
			setSearchError(false)

			try {
				const types = currentMode === 'game' ? ['game'] : ['profile']
				const result = await API.search(q, { types, limit: 25, signal: controller.signal })
				const filtered = result.results.filter((item) => {
					if (currentMode === 'game') {
						return (
							item.$type ===
							'games.gamesgamesgamesgames.defs#gameSummaryView'
						)
					}
					return (
						item.$type ===
							'games.gamesgamesgamesgames.defs#profileSummaryView' &&
						(item as ProfileSummaryView).profileType === 'org'
					)
				}) as Array<GameSummaryView | ProfileSummaryView>
				setSearchResults(filtered)
				setSearchCursor(result.cursor)
				announce(`${filtered.length} ${currentMode === 'game' ? 'games' : 'organizations'} found.`)
			} catch (error) {
				if (error instanceof DOMException && error.name === 'AbortError') {
					return
				}
				setSearchResults([])
				setSearchCursor(undefined)
				setSearchError(true)
			} finally {
				setIsSearching(false)
			}
		},
		[announce],
	)

	const loadMore = useCallback(async () => {
		if (!searchQuery.trim() || !searchCursor || isLoadingMore) return

		setIsLoadingMore(true)

		try {
			const types = mode === 'game' ? ['game'] : ['profile']
			const result = await API.search(searchQuery, {
				types,
				limit: 25,
				cursor: searchCursor,
			})
			const filteredResults = result.results.filter((item) => {
				if (mode === 'game') {
					return (
						item.$type ===
						'games.gamesgamesgamesgames.defs#gameSummaryView'
					)
				}
				return (
					item.$type ===
						'games.gamesgamesgamesgames.defs#profileSummaryView' &&
					(item as ProfileSummaryView).profileType === 'org'
				)
			}) as Array<GameSummaryView | ProfileSummaryView>

			setSearchResults((prev) => [...prev, ...filteredResults])
			setSearchCursor(result.cursor)
		} catch {
			// Keep existing results
		} finally {
			setIsLoadingMore(false)
		}
	}, [searchQuery, searchCursor, isLoadingMore, mode])

	const handleSearchChange = useCallback<
		ChangeEventHandler<HTMLInputElement>
	>(
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

	// --- Selection ---

	const handleGameToggle = useCallback(
		(game: GameSummaryView) => {
			setSelectedGames((prev) => {
				const isSelected = prev.some((g) => g.uri === game.uri)
				const next = isSelected
					? prev.filter((g) => g.uri !== game.uri)
					: [
							...prev,
							{
								uri: game.uri,
								name: game.name,
								slug: game.slug,
								media: game.media,
							},
						]

				announce(
					isSelected
						? `${game.name} removed. ${next.length} games selected.`
						: `${game.name} added. ${next.length} games selected.`,
				)

				return next
			})
		},
		[announce],
	)

	const handleOrgSelect = useCallback(
		(profile: ProfileSummaryView) => {
			setSelectedOrg((prev) => {
				const deselecting = prev?.did === profile.did
				announce(
					deselecting
						? 'Organization deselected.'
						: `${profile.displayName ?? profile.did} selected.`,
				)
				if (deselecting) return null
				return {
					uri: profile.uri,
					did: profile.did,
					displayName: profile.displayName,
				}
			})
		},
		[announce],
	)

	const handleRemoveGame = useCallback(
		(game: SelectedGame) => {
			setSelectedGames((prev) => {
				const next = prev.filter((g) => g.uri !== game.uri)
				announce(`${game.name} removed. ${next.length} games selected.`)
				return next
			})
		},
		[announce],
	)

	// --- Mode ---

	const hasSelectionRef = useRef(false)
	hasSelectionRef.current = selectedGames.length > 0 || selectedOrg !== null

	const handleModeChangeRequest = useCallback((value: string) => {
		if (!value) return
		const newMode = value as ClaimMode
		if (newMode === mode) return

		if (hasSelectionRef.current) {
			setPendingMode(newMode)
			return
		}

		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current)
		}
		if (searchAbortRef.current) {
			searchAbortRef.current.abort()
		}
		setMode(newMode)
		setSearchResults([])
		setSearchQuery('')
		setSearchCursor(undefined)
		setSelectedGames([])
		setSelectedOrg(null)
		setPendingMode(null)
	}, [mode])

	const confirmModeSwitch = useCallback(() => {
		if (!pendingMode) return
		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current)
		}
		if (searchAbortRef.current) {
			searchAbortRef.current.abort()
		}
		setMode(pendingMode)
		setSearchResults([])
		setSearchQuery('')
		setSearchCursor(undefined)
		setSelectedGames([])
		setSelectedOrg(null)
		setPendingMode(null)
	}, [pendingMode])

	const cancelModeSwitch = useCallback(() => {
		setPendingMode(null)
	}, [])

	// --- Form ---

	const handleContactChange = useCallback<
		ChangeEventHandler<HTMLInputElement>
	>((event) => setContact(event.target.value), [])

	const handleContactBlur = useCallback(() => setContactTouched(true), [])

	const handleJustificationChange = useCallback<
		ChangeEventHandler<HTMLTextAreaElement>
	>((event) => setJustification(event.target.value), [])

	// --- Validation ---

	const contactError =
		(contactTouched || nextAttempted) && contact.trim().length === 0
			? 'Contact is required so we can follow up on your claim.'
			: contactTouched && contact.trim().length > 0 && !CONTACT_PATTERN.test(contact.trim())
				? 'Enter an email address or handle, e.g. you@example.com or @you.bsky.social'
				: null

	const canProceedFrom = useCallback(
		(fromStep: Step): boolean => {
			switch (fromStep) {
				case 'select':
					return mode === 'game'
						? selectedGames.length > 0
						: selectedOrg !== null
				case 'details':
					return (
						contact.trim().length > 0 &&
						CONTACT_PATTERN.test(contact.trim())
					)
				case 'review':
					return true
				default:
					return false
			}
		},
		[mode, selectedGames, selectedOrg, contact],
	)

	// --- Navigation ---

	const goNext = useCallback(() => {
		const currentIndex = STEPS.indexOf(step)
		if (!canProceedFrom(step)) {
			setNextAttempted(true)
			if (step === 'details') setContactTouched(true)
			return
		}
		if (currentIndex < STEPS.length - 1) {
			setNextAttempted(false)
			setStep(STEPS[currentIndex + 1])
			stepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
		}
	}, [step, canProceedFrom])

	const goBack = useCallback(() => {
		const currentIndex = STEPS.indexOf(step)
		if (currentIndex > 0) {
			setNextAttempted(false)
			setSubmitConfirmed(false)
			setStep(STEPS[currentIndex - 1])
			stepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
		}
	}, [step])

	const goToStep = useCallback((target: Step) => {
		const targetIndex = STEPS.indexOf(target)
		const currentIndex = STEPS.indexOf(step)
		if (targetIndex < currentIndex) {
			setSubmitConfirmed(false)
			setStep(target)
		}
	}, [step])

	// --- Submit ---

	const handleSubmit = useCallback(async () => {
		if (!submitConfirmed) {
			setSubmitConfirmed(true)
			return
		}

		if (!canProceedFrom('details')) return
		if (mode === 'game' && selectedGames.length === 0) return
		if (mode === 'org' && !selectedOrg) return

		setIsSubmitting(true)
		setSubmitError(null)

		try {
			await API.createClaim({
				type: mode,
				...(mode === 'game'
					? { games: selectedGames.map((g) => g.uri) }
					: { org: selectedOrg!.uri }),
				contact: contact.trim(),
				...(justification.trim()
					? { message: justification.trim() }
					: {}),
			})

			try {
				sessionStorage.removeItem(DRAFT_KEY)
			} catch {}

			setIsSuccess(true)
			setTimeout(() => setSuccessVisible(true), 50)
		} catch (error) {
			setSubmitError(
				error instanceof Error
					? error.message
					: 'Something went wrong while submitting your claim. Please try again.',
			)
			setSubmitConfirmed(false)
		} finally {
			setIsSubmitting(false)
		}
	}, [canProceedFrom, contact, justification, mode, selectedGames, selectedOrg, submitConfirmed])

	// --- Effects ---

	useEffect(() => {
		const gameUri = searchParams.get('game')
		const orgParam = searchParams.get('org')

		if (!gameUri && !orgParam) {
			setIsPreloading(false)
			return
		}

		if (gameUri) {
			API.getGame({ uri: gameUri })
				.then((game) => {
					if (!game) return
					setSelectedGames([
						{
							uri: game.uri,
							name: game.name,
							slug: game.slug,
							media: game.media,
						},
					])
				})
				.catch(() => {})
				.finally(() => setIsPreloading(false))
		} else if (orgParam) {
			API.search(orgParam, { types: ['profile'], limit: 1 })
				.then((result) => {
					const org = result.results.find(
						(item) =>
							item.$type === 'games.gamesgamesgamesgames.defs#profileSummaryView' &&
							(item as ProfileSummaryView).profileType === 'org',
					) as ProfileSummaryView | undefined
					if (org) {
						setSelectedOrg({
							uri: org.uri,
							did: org.did,
							displayName: org.displayName,
						})
					}
				})
				.catch(() => {})
				.finally(() => setIsPreloading(false))
		}
	}, [searchParams])

	useEffect(() => {
		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current)
			}
			if (searchAbortRef.current) {
				searchAbortRef.current.abort()
			}
		}
	}, [])

	// Draft restoration on mount
	useEffect(() => {
		try {
			const raw = sessionStorage.getItem(DRAFT_KEY)
			if (!raw) return
			const draft = JSON.parse(raw)
			const hasMeaningfulDraft =
				draft.selectedGames?.length > 0 ||
				draft.selectedOrg ||
				draft.contact ||
				draft.justification ||
				(draft.step && draft.step !== 'select')
			if (!hasMeaningfulDraft) return
			if (draft.mode) setMode(draft.mode)
			if (draft.selectedGames?.length) setSelectedGames(draft.selectedGames)
			if (draft.selectedOrg) setSelectedOrg(draft.selectedOrg)
			if (draft.contact) setContact(draft.contact)
			if (draft.justification) setJustification(draft.justification)
			if (draft.step && STEPS.includes(draft.step)) setStep(draft.step)
			setDraftRestored(true)
		} catch {}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Draft persistence
	useEffect(() => {
		if (isSuccess) return
		try {
			sessionStorage.setItem(
				DRAFT_KEY,
				JSON.stringify({ mode, selectedGames, selectedOrg, contact, justification, step }),
			)
		} catch {}
	}, [mode, selectedGames, selectedOrg, contact, justification, step, isSuccess])

	// Reset submit confirmation when leaving review step
	useEffect(() => {
		if (step !== 'review') {
			setSubmitConfirmed(false)
		}
	}, [step])

	// --- Gate: preloading ---

	if (isPreloading) {
		return (
			<Container>
				<div className={'flex items-center justify-center py-16'}>
					<Spinner className={'size-6'} />
				</div>
			</Container>
		)
	}

	// --- Gate: not signed in ---

	if (!user) {
		return (
			<Container>
				<div className={'flex max-w-lg flex-col gap-4'}>
					<Header level={3}>{'Claim Ownership'}</Header>
					<p className={'text-muted-foreground'}>
						{'Sign in with your ATProto identity to submit ownership claims.'}
					</p>
					<Button asChild>
						<Link href={'/login?returnTo=/claim'}>{'Sign In'}</Link>
					</Button>
				</div>
			</Container>
		)
	}

	// --- Gate: not verified ---

	if (!user.verifiedAccountType) {
		return (
			<Container>
				<div className={'flex max-w-lg flex-col gap-4'}>
					<Header level={3}>{'Claim Ownership'}</Header>
					<p className={'text-muted-foreground'}>
						{'Ownership claims are available to verified developers and publishers. Verification confirms your identity and usually takes 1–2 business days.'}
					</p>
					<Button asChild>
						<Link href={'/verify'}>{'Get Verified'}</Link>
					</Button>
				</div>
			</Container>
		)
	}

	// --- Success ---

	if (isSuccess) {
		const claimedLabel =
			mode === 'game'
				? selectedGames.length === 1
					? selectedGames[0].name
					: `${selectedGames.length} games`
				: selectedOrg?.displayName ?? 'your organization'

		return (
			<Container>
				<div
					className={`mx-auto flex max-w-lg flex-col items-center gap-8 py-12 text-center transition-all duration-500 ${successVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
					{mode === 'game' && selectedGames.length === 1 && (
						<div className={'w-32 overflow-hidden rounded-lg'}>
							<BoxArt
								gameRecord={
									selectedGames[0] as GameSummaryView
								}
							/>
						</div>
					)}

					{mode === 'game' && selectedGames.length > 1 && (
						<div className={'flex -space-x-4'}>
							{selectedGames.slice(0, 4).map((game) => (
								<div
									key={game.uri}
									className={
										'w-16 overflow-hidden rounded-lg border-2 border-background'
									}>
									<BoxArt
										gameRecord={
											game as GameSummaryView
										}
									/>
								</div>
							))}
							{selectedGames.length > 4 && (
								<div
									className={
										'flex w-16 items-center justify-center rounded-lg border-2 border-background bg-card text-sm font-medium'
									}>
									{`+${selectedGames.length - 4}`}
								</div>
							)}
						</div>
					)}

					<div
						className={
							'flex size-14 items-center justify-center rounded-full bg-success/15'
						}>
						<Check className={'size-7 text-success'} />
					</div>

					<div className={'flex flex-col gap-2'}>
						<h2 className={'text-xl font-semibold'}>
							{"You're in the queue!"}
						</h2>
						<p className={'text-muted-foreground'}>
							{`We've got your claim for ${claimedLabel} and we're on it.`}
						</p>
					</div>

					<div
						className={
							'w-full rounded-lg border border-border bg-card/50 px-5 py-4 text-left'
						}>
						<p className={'text-sm font-medium'}>
							{"What's next"}
						</p>
						<ul
							className={
								'mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground'
							}>
							<li>
								{
									'We review most claims within 2–3 business days.'
								}
							</li>
							<li>
								{`We'll reach out to you at ${contact} if we need anything.`}
							</li>
							<li>
								{
									"Once approved, you'll be listed as the verified owner."
								}
							</li>
						</ul>
					</div>

					<div className={'flex gap-3'}>
						<Button asChild>
							<Link href={'/dashboard/claims'}>
								{'View My Claims'}
							</Link>
						</Button>

						<Button
							onClick={() => {
								setIsSuccess(false)
								setSuccessVisible(false)
								setStep('select')
								setSelectedGames([])
								setSelectedOrg(null)
								setContact('')
								setJustification('')
								setContactTouched(false)
								setNextAttempted(false)
								setSearchQuery('')
								setSearchResults([])
								setSearchError(false)
								setSubmitError(null)
								setSubmitConfirmed(false)
							}}
							variant={'outline'}>
							{'Submit Another Claim'}
						</Button>
					</div>
				</div>
			</Container>
		)
	}

	// --- Wizard ---

	const hasSelection =
		mode === 'game' ? selectedGames.length > 0 : selectedOrg !== null

	const gameChipsToShow = selectedGames.length > 8 ? selectedGames.slice(0, 6) : selectedGames
	const hiddenGameCount = selectedGames.length > 8 ? selectedGames.length - 6 : 0

	return (
		<>
			<div
				ref={announcerRef}
				aria-live={'polite'}
				className={'sr-only'}
				role={'status'}
			/>

			<Container>
				<div
					ref={stepRef}
					className={'mx-auto flex max-w-2xl flex-col gap-8'}>
					<div className={'flex flex-col gap-4'}>
						<Header level={3}>{'Claim Ownership'}</Header>
						<p className={'text-sm text-muted-foreground'}>
							{'Claim ownership to manage your game or organization’s page on Cartridge. Claims are reviewed within 2–3 business days.'}
						</p>
						<StepIndicator
							currentStep={step}
							onStepClick={goToStep}
						/>
					</div>

					{draftRestored && (
						<div className={'flex items-center justify-between rounded-md border border-border bg-muted/50 px-4 py-2'}>
							<span className={'text-sm text-muted-foreground'}>{'Restored your in-progress claim.'}</span>
							<Button
								onClick={() => {
									setDraftRestored(false)
									try {
										sessionStorage.removeItem(DRAFT_KEY)
									} catch {}
								}}
								size={'sm'}
								variant={'ghost'}>
								{'Clear'}
							</Button>
						</div>
					)}

					{/* Step 1: Select */}
					{step === 'select' && (
						<StepShell
							description={
								mode === 'game'
									? 'Find and select the games you want to claim. You can select as many as you need.'
									: 'Find and select your organization.'
							}
							title={
								mode === 'game'
									? 'Select your games'
									: 'Select your organization'
							}>
							{/* Mode toggle */}
							<div className={'flex flex-col gap-2'}>
								<ToggleGroup
									className={'justify-start'}
									onValueChange={handleModeChangeRequest}
									type={'single'}
									value={mode}>
									<ToggleGroupItem
										className={'flex gap-2 px-5 py-3'}
										value={'game'}>
										<Gamepad2 className={'size-4'} />
										{'Games'}
									</ToggleGroupItem>

									<ToggleGroupItem
										className={'flex gap-2 px-5 py-3'}
										value={'org'}>
										<Building2 className={'size-4'} />
										{'Organization'}
									</ToggleGroupItem>
								</ToggleGroup>

								{pendingMode && (
									<div className={'flex items-center gap-3 rounded-md border border-border bg-muted/50 px-4 py-2.5 text-sm'}>
										<span className={'text-muted-foreground'}>
											{`Switching to ${pendingMode === 'org' ? 'Organization' : 'Games'} will clear your current selection. Continue?`}
										</span>
										<div className={'flex shrink-0 gap-2'}>
											<Button
												onClick={confirmModeSwitch}
												size={'sm'}
												variant={'destructive'}>
												{'Switch'}
											</Button>
											<Button
												onClick={cancelModeSwitch}
												size={'sm'}
												variant={'ghost'}>
												{'Keep current'}
											</Button>
										</div>
									</div>
								)}
							</div>

							{/* Selected games summary */}
							{mode === 'game' && selectedGames.length > 0 && (
								<div className={'flex flex-col gap-2'}>
									<div className={'flex items-center gap-2'}>
										<span
											className={
												'text-sm font-medium'
											}>
											{'Selected'}
										</span>
										<span
											className={
												'text-xs text-muted-foreground'
											}>
											({selectedGames.length})
										</span>
									</div>

									<div
										className={
											'flex max-h-36 flex-wrap gap-2 overflow-y-auto'
										}>
										{gameChipsToShow.map((game) => (
											<div
												key={game.uri}
												className={
													'group relative flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5'
												}>
												<div
													className={
														'w-6 overflow-hidden rounded'
													}>
													<BoxArt
														gameRecord={
															game as GameSummaryView
														}
													/>
												</div>
												<span
													className={
														'max-w-[12rem] truncate text-sm'
													}>
													{game.name}
												</span>
												<button
													aria-label={`Remove ${game.name}`}
													className={
														'flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground'
													}
													onClick={() =>
														handleRemoveGame(
															game,
														)
													}
													type={'button'}>
													<X
														className={
															'size-3'
														}
													/>
												</button>
											</div>
										))}
										{hiddenGameCount > 0 && (
											<div className={'flex items-center rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground'}>
												{`+${hiddenGameCount} more`}
											</div>
										)}
									</div>
								</div>
							)}

							{/* Selected org summary */}
							{mode === 'org' && selectedOrg && (
								<div
									className={
										'flex items-center justify-between gap-3 rounded-md border border-primary/30 bg-primary/5 px-4 py-3'
									}>
									<div
										className={
											'flex flex-col gap-0.5'
										}>
										<span
											className={
												'text-sm font-medium'
											}>
											{selectedOrg.displayName ??
												selectedOrg.did}
										</span>
										<span
											className={
												'font-mono text-xs text-muted-foreground'
											}>
											{selectedOrg.did}
										</span>
									</div>
									<button
										aria-label={`Remove ${selectedOrg.displayName ?? 'selected organization'}`}
										className={
											'flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground'
										}
										onClick={() => setSelectedOrg(null)}
										type={'button'}>
										<X className={'size-3.5'} />
									</button>
								</div>
							)}

							{/* Search */}
							<div className={'flex flex-col gap-2'}>
								<Label htmlFor={'claim-search'}>
									{mode === 'game'
										? 'Search games'
										: 'Search organizations'}
								</Label>
								<div className={'relative'}>
									<Search
										className={
											'absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
										}
									/>
									<Input
										className={'pl-9'}
										id={'claim-search'}
										onChange={handleSearchChange}
										placeholder={
											mode === 'game'
												? 'Type a game name…'
												: 'Type an organization name…'
										}
										value={searchQuery}
									/>
									{isSearching && (
										<div
											className={
												'absolute right-3 top-1/2 -translate-y-1/2'
											}>
											<Spinner
												className={'size-4'}
											/>
										</div>
									)}
								</div>
							</div>

							{/* Game results grid */}
							{mode === 'game' &&
								searchResults.length > 0 && (
									<div
										className={
											'animate-in fade-in-0 duration-200 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5'
										}>
										{(
											searchResults as GameSummaryView[]
										).map((game) => {
											const isSelected =
												selectedGames.some(
													(g) =>
														g.uri === game.uri,
												)
											return (
												<button
													key={game.uri}
													aria-label={`${isSelected ? 'Deselect' : 'Select'} ${game.name}`}
													aria-pressed={isSelected}
													className={
														'group text-left'
													}
													onClick={() =>
														handleGameToggle(
															game,
														)
													}
													type={'button'}>
													<div
														className={`relative overflow-hidden rounded-lg ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
														<TiltCard>
															<BoxArt
																gameRecord={
																	game
																}
															/>
														</TiltCard>
														{isSelected && (
															<div
																className={
																	'absolute inset-0 flex items-center justify-center bg-black/60'
																}>
																<Check
																	className={
																		'size-6 text-primary'
																	}
																/>
															</div>
														)}
													</div>
													<div
														className={
															'mt-1.5 px-0.5'
														}>
														<div
															className={
																'truncate text-sm font-medium'
															}>
															{game.name}
														</div>
													</div>
												</button>
											)
										})}
									</div>
								)}

							{/* Org results list */}
							{mode === 'org' && searchResults.length > 0 && (
								<div className={'animate-in fade-in-0 duration-200 flex flex-col gap-2'}>
									{(
										searchResults as ProfileSummaryView[]
									).map((profile) => {
										const isSelected =
											selectedOrg?.did === profile.did
										return (
											<button
												key={profile.did}
												aria-pressed={isSelected}
												className={cn(
													'flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent',
													isSelected ? 'border-primary bg-primary/5' : 'border-border',
												)}
												onClick={() =>
													handleOrgSelect(profile)
												}
												type={'button'}>
												<Avatar size={'sm'}>
													<AvatarFallback>
														<Building2 className={'size-3'} />
													</AvatarFallback>
												</Avatar>
												<div className={'flex min-w-0 flex-col gap-0.5'}>
													<span className={'truncate text-sm font-medium'}>
														{profile.displayName ??
															profile.did}
													</span>
													<span className={'truncate font-mono text-xs text-muted-foreground'}>
														{profile.did}
													</span>
												</div>
												{isSelected && (
													<Check
														className={
															'ml-auto size-4 shrink-0 text-primary'
														}
													/>
												)}
											</button>
										)
									})}
								</div>
							)}

							{/* Load more */}
							{searchCursor && searchResults.length > 0 && (
								<Button
									disabled={isLoadingMore}
									onClick={loadMore}
									variant={'outline'}>
									{isLoadingMore ? (
										<>
											<Spinner className={'size-4'} />
											{'Loading…'}
										</>
									) : (
										'Load more results'
									)}
								</Button>
							)}

							{/* Search error */}
							{searchError && !isSearching && (
								<p
									className={
										'py-4 text-center text-sm text-destructive'
									}
									role={'alert'}>
									{'Search failed. Check your connection and try again.'}
								</p>
							)}

							{/* Empty state */}
							{searchQuery.trim().length >= 2 &&
								!isSearching &&
								!searchError &&
								searchResults.length === 0 && (
									<div className={'flex flex-col items-center gap-2 py-4'}>
										<p
											className={
												'text-center text-sm text-muted-foreground'
											}>
											{mode === 'game'
												? 'No games found. Try a different name or check the spelling.'
												: 'No organizations found. Try a different name or check the spelling.'}
										</p>
										<p className={'text-center text-xs text-muted-foreground'}>
											{mode === 'game'
												? "Can't find your game? "
												: "Can't find your organization? "}
											<a
												className={'underline hover:text-foreground'}
												href={'https://bsky.app/profile/kart.sh'}
												rel={'noopener noreferrer'}
												target={'_blank'}>
												{'Let us know on Bluesky'}
											</a>
											{" and we'll help."}
										</p>
									</div>
								)}

							{/* Hint when search is empty */}
							{searchQuery.trim().length < 2 &&
								!hasSelection && (
									<p
										className={
											'py-4 text-center text-sm text-muted-foreground'
										}>
										{mode === 'game'
											? 'Type at least 2 characters to search for games.'
											: 'Type at least 2 characters to search for organizations.'}
									</p>
								)}
						</StepShell>
					)}

					{/* Step 2: Details */}
					{step === 'details' && (
						<StepShell
							description={
								'Almost there. Tell us how to reach you and any supporting information for your claim.'
							}
							title={'Your information'}>
							<SelectionSummary
								mode={mode}
								selectedGames={selectedGames}
								selectedOrg={selectedOrg}
							/>

							<div className={'flex flex-col gap-6'}>
								<div className={'flex flex-col gap-2'}>
									<Label htmlFor={'claim-contact'}>
										{'Contact'}
										<span
											className={
												'ml-1 text-destructive'
											}>
											{'*'}
										</span>
									</Label>
									<Input
										aria-describedby={'contact-hint'}
										aria-invalid={
											contactError ? true : undefined
										}
										id={'claim-contact'}
										onBlur={handleContactBlur}
										onChange={handleContactChange}
										placeholder={
											'you@example.com or @you.bsky.social'
										}
										value={contact}
									/>
									{contactError ? (
										<p
											className={
												'text-xs text-destructive'
											}
											id={'contact-hint'}
											role={'alert'}>
											{contactError}
										</p>
									) : (
										<p
											className={
												'text-xs text-muted-foreground'
											}
											id={'contact-hint'}>
											{
												"We'll use this to follow up on your claim. Not displayed publicly."
											}
										</p>
									)}
								</div>

								<div className={'flex flex-col gap-2'}>
									<Label htmlFor={'claim-justification'}>
										{'Supporting information'}
										<span
											className={
												'ml-1 text-xs text-muted-foreground'
											}>
											{'(optional)'}
										</span>
									</Label>
									<Textarea
										aria-describedby={
											'justification-hint'
										}
										id={'claim-justification'}
										maxLength={3000}
										onChange={
											handleJustificationChange
										}
										placeholder={
											mode === 'game'
												? "Links to store pages, social profiles, or anything that shows you're the rights holder."
												: "Links to your organization's website, social profiles, or other verification."
										}
										rows={4}
										value={justification}
									/>
									<div
										className={
											'flex items-center justify-between'
										}
										id={'justification-hint'}>
										<p
											className={
												'text-xs text-muted-foreground'
											}>
											{'Include links or evidence like: Steam/itch.io store page, official website, social media profiles, or press coverage.'}
										</p>
										{justification.length >= 2500 && (
											<span
												className={
													'text-xs text-muted-foreground'
												}>
												{`${justification.length}/3000`}
											</span>
										)}
									</div>
								</div>
							</div>
						</StepShell>
					)}

					{/* Step 3: Review */}
					{step === 'review' && (
						<StepShell
							description={
								'Review your claim before submitting. You can go back to change anything.'
							}
							title={'Review your claim'}>
							<div
								className={
									'flex flex-col gap-4 rounded-lg border border-border bg-card/50 p-5'
								}>
								{/* Type */}
								<div
									className={
										'flex items-center justify-between'
									}>
									<div className={'flex flex-col gap-0.5'}>
										<span
											className={
												'text-xs text-muted-foreground'
											}>
											{'Claim type'}
										</span>
										<span className={'text-sm font-medium'}>
											{mode === 'game'
												? 'Games'
												: 'Organization'}
										</span>
									</div>
									<Button
										onClick={() => goToStep('select')}
										size={'sm'}
										variant={'ghost'}>
										{'Edit'}
									</Button>
								</div>

								<div className={'h-px bg-border'} />

								{/* Selection */}
								<div
									className={
										'flex items-start justify-between gap-4'
									}>
									<div className={'flex flex-col gap-1.5'}>
										<span
											className={
												'text-xs text-muted-foreground'
											}>
											{mode === 'game'
												? 'Selected games'
												: 'Selected organization'}
										</span>
										{mode === 'game' ? (
											<div
												className={
													'flex flex-col gap-1'
												}>
												{selectedGames.map(
													(game) => (
														<span
															key={game.uri}
															className={
																'text-sm'
															}>
															{game.name}
														</span>
													),
												)}
											</div>
										) : (
											<span className={'text-sm'}>
												{selectedOrg?.displayName ??
													selectedOrg?.did}
											</span>
										)}
									</div>
									<Button
										onClick={() => goToStep('select')}
										size={'sm'}
										variant={'ghost'}>
										{'Edit'}
									</Button>
								</div>

								<div className={'h-px bg-border'} />

								{/* Contact */}
								<div
									className={
										'flex items-center justify-between'
									}>
									<div className={'flex flex-col gap-0.5'}>
										<span
											className={
												'text-xs text-muted-foreground'
											}>
											{'Contact'}
										</span>
										<span className={'text-sm'}>
											{contact}
										</span>
									</div>
									<Button
										onClick={() => goToStep('details')}
										size={'sm'}
										variant={'ghost'}>
										{'Edit'}
									</Button>
								</div>

								{/* Justification */}
								{justification.trim() && (
									<>
										<div className={'h-px bg-border'} />
										<div
											className={
												'flex items-start justify-between gap-4'
											}>
											<div
												className={
													'flex flex-col gap-0.5'
												}>
												<span
													className={
														'text-xs text-muted-foreground'
													}>
													{
														'Supporting information'
													}
												</span>
												<p
													className={
														'whitespace-pre-wrap text-sm'
													}>
													{justification}
												</p>
											</div>
											<Button
												onClick={() =>
													goToStep('details')
												}
												size={'sm'}
												variant={'ghost'}>
												{'Edit'}
											</Button>
										</div>
									</>
								)}
							</div>

							{submitError && (
								<div
									className={
										'rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3'
									}>
									<p
										className={
											'text-sm text-destructive'
										}>
										{submitError}
									</p>
									<p
										className={
											'mt-1 text-xs text-destructive/70'
										}>
										{'Check your connection and try again. If this keeps happening, '}
										<a
											className={'underline hover:text-destructive'}
											href={'https://bsky.app/profile/kart.sh'}
											rel={'noopener noreferrer'}
											target={'_blank'}>
											{'let us know on Bluesky'}
										</a>
										{'.'}
									</p>
								</div>
							)}
						</StepShell>
					)}

					{/* Navigation */}
					<div className={'border-t border-border pt-6'}>
						{nextAttempted && !canProceedFrom(step) && (
							<p className={'mb-3 text-sm text-destructive'} role={'alert'}>
								{step === 'select'
									? mode === 'game'
										? 'Select at least one game to continue.'
										: 'Select an organization to continue.'
									: 'Complete the required fields to continue.'}
							</p>
						)}

						<div className={'flex items-center justify-between'}>
							<div className={'flex items-center gap-2'}>
								{step !== 'select' ? (
									<Button
										onClick={goBack}
										variant={'ghost'}>
										<ChevronLeft className={'size-4'} />
										{'Back'}
									</Button>
								) : (
									<Button
										onClick={() => router.back()}
										variant={'ghost'}>
										{'Cancel'}
									</Button>
								)}
							</div>

							<div className={'flex flex-col items-end gap-1'}>
								{step === 'review' ? (
									<>
										<div className={'flex items-center gap-2'}>
											{submitConfirmed && !isSubmitting && (
												<Button
													onClick={() => setSubmitConfirmed(false)}
													variant={'ghost'}>
													{'Cancel'}
												</Button>
											)}
											<Button
												disabled={isSubmitting}
												onClick={handleSubmit}>
												{isSubmitting ? (
													<>
														<Spinner className={'size-4'} />
														{'Submitting…'}
													</>
												) : submitConfirmed
													? 'Confirm submission'
													: 'Submit Claim'}
											</Button>
										</div>
										{submitConfirmed && !isSubmitting && (
											<span className={'text-xs text-muted-foreground'}>
												{'This submits your claim for manual review.'}
											</span>
										)}
									</>
								) : (
									<Button
										disabled={!canProceedFrom(step)}
										onClick={goNext}>
										{'Next'}
										<ChevronRight className={'size-4'} />
									</Button>
								)}
							</div>
						</div>
					</div>
				</div>
			</Container>
		</>
	)
}
