'use client'

import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import {
	useCallback,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Link } from '@/components/Link/Link'
import { Spinner } from '@/components/ui/spinner'
import { type State } from '@/typedefs/State'
import {
	consumePendingHandle,
	isAuthenticated,
	loginWithRedirect,
	restoreSession,
} from '@/helpers/oauth'

const HANDLE_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9.-]+[a-zA-Z0-9]$/

const TYPEAHEAD_URL = 'https://typeahead.waow.tech'
const BSKY_CDN_PREFIX = 'https://cdn.bsky.app/img/'
const BLUEAT_CDN_PREFIX = 'https://cdn.blueat.net/img/'

function toBlueatAvatar(url: string): string {
	if (!url.startsWith(BSKY_CDN_PREFIX)) return url
	const path = url.slice(BSKY_CDN_PREFIX.length)
	return `${BLUEAT_CDN_PREFIX}${path}@jpeg`
}

type TypeaheadActor = {
	did: string
	handle: string
	displayName?: string
	avatar?: string
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function subscribeToReducedMotion(callback: () => void): () => void {
	const mql = window.matchMedia(REDUCED_MOTION_QUERY)
	mql.addEventListener('change', callback)
	return () => mql.removeEventListener('change', callback)
}

function getReducedMotionSnapshot(): boolean {
	return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

function getReducedMotionServerSnapshot(): boolean {
	return false
}

function useReducedMotion(): boolean {
	return useSyncExternalStore(
		subscribeToReducedMotion,
		getReducedMotionSnapshot,
		getReducedMotionServerSnapshot,
	)
}

const ROW_COUNT = 5
const COVER_W = 80
const COVER_H = 107
const COVER_GAP = 5
const MIN_PER_ROW = 22
const COPY_WIDTH = MIN_PER_ROW * (COVER_W + COVER_GAP)
const ROW_DURATIONS = [80, 92, 68, 85, 76]

function CoverWall({
	coverUrls,
	reducedMotion,
}: {
	coverUrls: string[]
	reducedMotion: boolean
}) {
	if (coverUrls.length === 0) return null

	const rows: string[][] = Array.from({ length: ROW_COUNT }, () => [])

	coverUrls.forEach((url, i) => {
		rows[i % ROW_COUNT].push(url)
	})

	for (const row of rows) {
		const base = [...row]
		while (row.length < MIN_PER_ROW) {
			row.push(base[row.length % base.length])
		}
	}

	return (
		<div
			className={'absolute inset-0'}
			style={{
				perspective: '900px',
				perspectiveOrigin: '90% 50%',
			}}>
			<div
				className={
					'absolute -left-[60%] bottom-0 right-0 top-0 flex flex-col items-start justify-center'
				}
				style={{
					gap: `${COVER_GAP}px`,
					transform: 'rotateY(22deg)',
					transformOrigin: '100% 50%',
				}}>
				{rows.map((row, rowIndex) => (
					<div
						key={rowIndex}
						className={'flex'}
						style={{
							gap: `${COVER_GAP}px`,
							paddingLeft:
								rowIndex % 2 === 1 ? `${COVER_W / 2 + COVER_GAP / 2}px` : '0',
							animation: reducedMotion
								? 'none'
								: `login-wall-scroll ${ROW_DURATIONS[rowIndex]}s linear infinite`,
						}}>
						{[...row, ...row, ...row].map((url, i) => (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								key={`${rowIndex}-${i}`}
								src={url}
								alt={''}
								aria-hidden={'true'}
								className={'flex-shrink-0 rounded-sm object-cover'}
								style={{
									width: `${COVER_W}px`,
									height: `${COVER_H}px`,
								}}
							/>
						))}
					</div>
				))}
			</div>
		</div>
	)
}

type Props = Readonly<{
	coverUrls?: string[]
}>

export function LoginPage({ coverUrls = [] }: Props) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const inputRef = useRef<HTMLInputElement>(null)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const [state, setState] = useState<State>('idle')
	const [error, setError] = useState<string | null>(null)
	const [isRestoring, setIsRestoring] = useState(true)
	const [handleValue, setHandleValue] = useState('')
	const [suggestions, setSuggestions] = useState<TypeaheadActor[]>([])
	const [selectedIndex, setSelectedIndex] = useState(-1)
	const [showSuggestions, setShowSuggestions] = useState(false)
	const reducedMotion = useReducedMotion()

	const setFormError = useCallback((message: string) => {
		setState('error')
		setError(message)
		inputRef.current?.focus()
	}, [])

	useEffect(() => {
		const returnTo = searchParams.get('returnTo') ?? '/'

		if (isAuthenticated()) {
			router.replace(returnTo)
			return
		}

		restoreSession().then((session) => {
			if (session) {
				router.replace(returnTo)
				return
			}

			const handle = consumePendingHandle()
			if (handle) {
				setState('active')
				loginWithRedirect(
					handle,
					returnTo !== '/' ? returnTo : undefined,
				).catch((err) => {
					setFormError(
						err instanceof Error
							? err.message
							: 'Something went wrong. Please try again.',
					)
					setIsRestoring(false)
				})
				return
			}

			setIsRestoring(false)
		})
	}, [router, searchParams, setFormError])

	useEffect(() => {
		const query = handleValue.trim()
		if (state === 'active' || query.length < 2) {
			setSuggestions([])
			setShowSuggestions(false)
			return
		}

		const controller = new AbortController()
		const timer = setTimeout(async () => {
			try {
				const res = await fetch(
					`${TYPEAHEAD_URL}/xrpc/app.bsky.actor.searchActorsTypeahead?q=${encodeURIComponent(query)}&limit=8`,
					{
						headers: { 'X-Client': 'kart.sh' },
						signal: controller.signal,
					},
				)
				if (!res.ok) return
				const data = await res.json()
				const actors: TypeaheadActor[] = data.actors ?? []
				setSuggestions(actors)
				setSelectedIndex(-1)
				if (actors.length > 0) setShowSuggestions(true)
			} catch {
				// AbortError or network failure
			}
		}, 200)

		return () => {
			clearTimeout(timer)
			controller.abort()
		}
	}, [handleValue, state])

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node) &&
				inputRef.current &&
				!inputRef.current.contains(e.target as Node)
			) {
				setShowSuggestions(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const selectSuggestion = useCallback((actor: TypeaheadActor) => {
		setHandleValue(actor.handle)
		setShowSuggestions(false)
		setSuggestions([])
		inputRef.current?.focus()
	}, [])

	const handleInputKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (!showSuggestions || suggestions.length === 0) return

			if (e.key === 'ArrowDown') {
				e.preventDefault()
				setSelectedIndex((prev) =>
					Math.min(prev + 1, suggestions.length - 1),
				)
			} else if (e.key === 'ArrowUp') {
				e.preventDefault()
				setSelectedIndex((prev) => Math.max(prev - 1, -1))
			} else if (e.key === 'Enter' && selectedIndex >= 0) {
				e.preventDefault()
				selectSuggestion(suggestions[selectedIndex])
			} else if (e.key === 'Escape') {
				setShowSuggestions(false)
			}
		},
		[showSuggestions, suggestions, selectedIndex, selectSuggestion],
	)

	const handleSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault()
			setState('active')
			setError(null)
			setShowSuggestions(false)

			const formData = new FormData(event.currentTarget)
			const handle = (formData.get('handle') as string).trim()

			if (!handle) {
				setFormError('Enter your handle to sign in.')
				return
			}

			if (!HANDLE_PATTERN.test(handle)) {
				setFormError(
					'Handles can only contain letters, numbers, hyphens, and dots.',
				)
				return
			}

			const returnTo = searchParams.get('returnTo') ?? undefined

			try {
				await loginWithRedirect(handle, returnTo)
			} catch (err) {
				const message = err instanceof Error ? err.message : ''

				if (message === 'Handle is required for login') {
					setFormError('Enter your handle to sign in.')
				} else if (
					message.includes('resolve') ||
					message.includes('not found') ||
					message.includes('Unable to resolve')
				) {
					setFormError(
						"We couldn't find that handle. Double-check the spelling.",
					)
				} else {
					setFormError(
						'Something went wrong on our end. Try again in a moment.',
					)
				}
			}
		},
		[searchParams, setFormError],
	)

	if (isRestoring) {
		return (
			<div
				aria-live={'polite'}
				className={'flex flex-1 items-center justify-center'}>
				<Spinner className={'size-6'} />
			</div>
		)
	}

	const hasError = state === 'error' && error
	const dn = 'oklch(0.254 0.070 266.5)'

	return (
		<div
			className={
				'grid flex-1 grid-rows-[14rem_1fr] md:grid-rows-[18rem_1fr] lg:grid-rows-none lg:grid-cols-[2fr_3fr]'
			}>
			<style>{`
				@keyframes login-wall-scroll {
					from { transform: translateX(-${COPY_WIDTH}px); }
					to { transform: translateX(0); }
				}
			`}</style>

			{/* Brand panel — angled box art wall */}
			<div
				aria-hidden={'true'}
				className={'relative overflow-hidden bg-deep-navy'}>
				<CoverWall
					coverUrls={coverUrls}
					reducedMotion={reducedMotion}
				/>

				{/* Tint overlay to subdue the covers */}
				<div
					className={'pointer-events-none absolute inset-0'}
					style={{
						background: 'oklch(0.254 0.070 266.5 / 0.45)',
					}}
				/>

				{/* Depth-of-field blur on far (right) side */}
				<div
					className={'pointer-events-none absolute inset-0'}
					style={{
						backdropFilter: 'blur(5px)',
						WebkitBackdropFilter: 'blur(5px)',
						maskImage:
							'linear-gradient(to left, transparent 0%, transparent 10%, rgba(0,0,0,0.4) 35%, black 65%)',
						WebkitMaskImage:
							'linear-gradient(to left, transparent 0%, transparent 10%, rgba(0,0,0,0.4) 35%, black 65%)',
					}}
				/>

				{/* Edge fade to deep navy */}
				<div
					className={'pointer-events-none absolute inset-0'}
					style={{
						background: [
							`linear-gradient(to right, ${dn} 0%, transparent 40%, transparent 85%, ${dn} 100%)`,
							`linear-gradient(to bottom, ${dn} 0%, transparent 15%, transparent 85%, ${dn} 100%)`,
						].join(', '),
					}}
				/>

				{/* Warm brand glow */}
				<div
					className={'pointer-events-none absolute inset-0'}
					style={{
						background:
							'radial-gradient(ellipse at 70% 85%, oklch(0.859 0.145 82.6 / 0.06) 0%, transparent 50%)',
					}}
				/>

				{/* Logo overlay with readable backdrop */}
				<div
					className={
						'absolute inset-0 z-10 flex items-center justify-center'
					}>
					<div
						className={'pointer-events-none absolute inset-0'}
						style={{
							background:
								'radial-gradient(ellipse at 50% 50%, oklch(0.254 0.070 266.5 / 0.7) 0%, oklch(0.254 0.070 266.5 / 0.2) 30%, transparent 55%)',
						}}
					/>
					<Image
						src={'/images/branding/logo.color.svg'}
						alt={'Cartridge'}
						width={1000}
						height={1000}
						className={'relative size-32 md:size-36 lg:size-56 xl:size-72 2xl:size-[30rem]'}
						style={{
							filter: 'drop-shadow(0 8px 24px oklch(0.859 0.145 82.6 / 0.2))',
						}}
						priority
					/>
				</div>
			</div>

			{/* Form area */}
			<div
				className={
					'flex flex-col items-center px-4 pt-8 pb-10 md:justify-center md:pt-0 md:pb-0 lg:px-16 lg:py-16 xl:px-24'
				}>
				<div className={'w-full max-w-md'}>
					<div className={'flex flex-col gap-2'}>
						<h1
							className={
								'font-[family-name:var(--font-cartridge)] text-4xl font-black md:text-5xl [text-wrap:balance]'
							}>
							{'Sign in'}
						</h1>
						<p className={'text-base text-muted-foreground md:text-lg'}>
							{'Use your Bluesky, Tangled, or AT Protocol handle.'}
						</p>
					</div>

					<form
						noValidate
						onSubmit={handleSubmit}
						className={'mt-10 flex flex-col gap-4'}>
						<div>
							<label
								htmlFor={'handle'}
								className={'sr-only'}>
								{'Handle'}
							</label>
							<div className={'relative'}>
								<span
									className={
										'absolute left-4 top-1/2 -translate-y-1/2 select-none text-base font-semibold text-primary'
									}>
									{'@'}
								</span>
								<input
									aria-activedescendant={
										selectedIndex >= 0
											? `suggestion-${selectedIndex}`
											: undefined
									}
									aria-autocomplete={'list'}
									aria-controls={'handle-suggestions'}
									aria-expanded={showSuggestions}
									aria-invalid={hasError ? true : undefined}
									autoComplete={'off'}
									autoFocus
									className={
										'w-full rounded-xl border border-input bg-background py-4 pl-10 pr-4 text-base shadow-sm ring-0 ring-ring transition-[box-shadow,border-color] duration-200 placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:shadow-[0_0_0_4px_oklch(0.859_0.145_82.6_/_0.12)] disabled:opacity-50'
									}
									disabled={state === 'active'}
									id={'handle'}
									name={'handle'}
									onChange={(e) => {
										setHandleValue(e.target.value)
										setError(null)
									}}
									onFocus={() => {
										if (suggestions.length > 0) setShowSuggestions(true)
									}}
									onKeyDown={handleInputKeyDown}
									placeholder={'you.bsky.social'}
									ref={inputRef}
									required
									role={'combobox'}
									value={handleValue}
								/>

								{showSuggestions && suggestions.length > 0 && (
									<div
										ref={dropdownRef}
										role={'listbox'}
										id={'handle-suggestions'}
										className={
											'absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-input bg-popover shadow-lg'
										}>
										{suggestions.map((actor, index) => (
											<button
												key={actor.did}
												type={'button'}
												role={'option'}
												id={`suggestion-${index}`}
												aria-selected={index === selectedIndex}
												className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
													index === selectedIndex
														? 'bg-accent text-accent-foreground'
														: 'hover:bg-accent/50'
												}`}
												onMouseDown={(e) => {
													e.preventDefault()
													selectSuggestion(actor)
												}}
												onMouseEnter={() => setSelectedIndex(index)}>
												{actor.avatar ? (
													// eslint-disable-next-line @next/next/no-img-element
													<img
														src={toBlueatAvatar(actor.avatar)}
														alt={''}
														className={
															'size-8 flex-shrink-0 rounded-full object-cover'
														}
													/>
												) : (
													<div
														className={
															'size-8 flex-shrink-0 rounded-full bg-muted'
														}
													/>
												)}
												<div className={'min-w-0 flex-1'}>
													{actor.displayName && (
														<div
															className={
																'truncate text-sm font-medium'
															}>
															{actor.displayName}
														</div>
													)}
													<div
														className={
															'truncate text-sm text-muted-foreground'
														}>
														{'@'}
														{actor.handle}
													</div>
												</div>
											</button>
										))}
									</div>
								)}
							</div>
							{hasError && (
								<p
									className={'mt-2 text-sm text-destructive'}
									role={'alert'}>
									{error}
								</p>
							)}
						</div>

						<Button
							className={
								'min-h-12 w-full rounded-xl text-base font-semibold shadow-md shadow-primary/20 transition-shadow hover:shadow-lg hover:shadow-primary/25'
							}
							disabled={state === 'active'}
							type={'submit'}>
							{state === 'active' && <Spinner data-icon={'inline-start'} />}
							{'Sign In'}
						</Button>
					</form>

					<div className={'mt-12 flex flex-col gap-4'}>
						<Collapsible>
							<CollapsibleTrigger
								className={
									'group flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground'
								}>
								{'Where does my handle come from?'}
								<ChevronDown
									className={
										'size-3.5 motion-safe:transition-transform group-data-[state=open]:rotate-180'
									}
								/>
							</CollapsibleTrigger>
							<CollapsibleContent>
								<p
									className={
										'mt-3 max-w-md text-sm text-muted-foreground [text-wrap:pretty]'
									}>
									{'Your handle works across apps built on the '}
									<Link
										href={'https://atproto.com'}
										target={'_blank'}
										rel={'noopener noreferrer'}>
										{'AT Protocol'}
									</Link>
									{'. If you use '}
									<Link
										href={'https://bsky.app'}
										target={'_blank'}
										rel={'noopener noreferrer'}>
										{'Bluesky'}
									</Link>
									{', '}
									<Link
										href={'https://tangled.org'}
										target={'_blank'}
										rel={'noopener noreferrer'}>
										{'Tangled'}
									</Link>
									{
										', or any other AT Protocol app, sign in with the same handle.'
									}
								</p>
							</CollapsibleContent>
						</Collapsible>

						<div className={'flex flex-wrap gap-2'}>
							<a
								href={'https://bsky.app'}
								target={'_blank'}
								rel={'noopener noreferrer'}
								className={
									'rounded-full border border-input px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
								}>
								{'Create a handle on Bluesky'}
							</a>
							<a
								href={'https://discord.gg/BUPnjaBwRZ'}
								target={'_blank'}
								rel={'noopener noreferrer'}
								className={
									'rounded-full border border-input px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
								}>
								{'Get help on Discord'}
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
