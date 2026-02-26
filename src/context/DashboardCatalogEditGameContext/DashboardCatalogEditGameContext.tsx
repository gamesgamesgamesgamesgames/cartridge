'use client'

// Module imports
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type PropsWithChildren,
} from 'react'
import { type AtUriString } from '@atproto/lex'
import { useParams, useRouter } from 'next/navigation'

// Local imports
import { createGame } from '@/store/actions/createGame'
import { type DID } from '@/typedefs/DID'
import { getGame } from '@/store/actions/getGame'
import { isDID } from '@/helpers/isDID'
import { putGame } from '@/store/actions/putGame'
import { resolveHandle } from '@/helpers/API'
import { type GameRecord } from '@/typedefs/GameRecord'
import {
	type Genre,
	type Mode,
	type PlayerPerspective,
	type Release,
	type Theme,
} from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { GenreError } from '@/context/DashboardCatalogEditGameContext/GenreError'
import { type MediaItem } from '@/typedefs/MediaItem'
import { ModeError } from '@/context/DashboardCatalogEditGameContext/ModeError'
import { NameError } from '@/context/DashboardCatalogEditGameContext/NameError'
import { EDIT_GAME_STEPS } from '@/constants/EDIT_GAME_STEPS'
import { PlayerPerspectiveError } from '@/context/DashboardCatalogEditGameContext/PlayerPerspectiveError'
import { ReleaseError } from '@/context/DashboardCatalogEditGameContext/ReleaseError'
import { parseATURI } from '@/helpers/parseATURI'
import { type State } from '@/typedefs/State'
import { type StepperStep } from '@/typedefs/StepperStep'
import { SummaryError } from '@/context/DashboardCatalogEditGameContext/SummaryError'
import { generateUUID } from '@/helpers/generateUUID'
import { uploadBlob } from '@/store/actions/uploadBlob'

// Types
type Props = Readonly<PropsWithChildren>

export const DashboardCatalogEditGameContext = createContext<
	Partial<
		Omit<GameRecord, 'genres' | 'media' | 'modes' | 'playerPerspectives' | 'themes'>
	> & {
		genres: Set<Genre>
		media: MediaItem[]
		modes: Set<Mode>
		playerPerspectives: Set<PlayerPerspective>
		themes: Set<Theme>

		addGenre: (genre: Genre) => void
		addMode: (mode: Mode) => void
		addPlayerPerspective: (playerPerspective: PlayerPerspective) => void
		addTheme: (theme: Theme) => void
		isEditMode: boolean
		currentStep: null | StepperStep
		currentStepIndex: number
		goToStepIndex: (stepIndex: number) => void
		hasNext: boolean
		hasPrevious: boolean
		nextStep: () => void
		previousStep: () => void
		publishGame: () => void
		publishErrors: ReactNode[]
		removeGenre: (genre: Genre) => void
		removeMedia: (mediaItem: MediaItem) => void
		removeMode: (mode: Mode) => void
		removePlayerPerspective: (playerPerspective: PlayerPerspective) => void
		removeTheme: (theme: Theme) => void
		saveErrors: ReactNode[]
		saveGameDraft: () => void
		releases: Release[]
		setApplicationType: (applicationType: GameRecord['applicationType']) => void
		setName: (name: GameRecord['name']) => void
		setReleases: (releases: Release[]) => void
		setSummary: (summary: GameRecord['summary']) => void
		state: State
		steps: StepperStep[]
		updateAllMedia: (files: File[]) => void
		updateMedia: (mediaItem: MediaItem) => void
		uploadProgress: null | number
		uploadTotal: null | number
	}
>({
	genres: new Set(),
	media: [],
	modes: new Set(),
	playerPerspectives: new Set(),
	themes: new Set(),

	addGenre: () => {},
	addMode: () => {},
	addPlayerPerspective: () => {},
	addTheme: () => {},
	isEditMode: false,
	applicationType: 'game',
	currentStep: null,
	currentStepIndex: 0,
	goToStepIndex: () => {},
	hasNext: false,
	hasPrevious: false,
	nextStep: () => {},
	previousStep: () => {},
	publishGame: () => {},
	publishErrors: [],
	removeGenre: () => {},
	removeMedia: () => {},
	removeMode: () => {},
	removePlayerPerspective: () => {},
	releases: [],
	removeTheme: () => {},
	saveErrors: [],
	saveGameDraft: () => {},
	setApplicationType: () => {},
	setName: () => {},
	setReleases: () => {},
	setSummary: () => {},
	state: 'idle',
	steps: [],
	updateAllMedia: () => {},
	updateMedia: () => {},
	uploadProgress: null,
	uploadTotal: null,
})

export function DashboardCatalogEditGameContextProvider(props: Props) {
	const { children } = props

	const router = useRouter()
	const params = useParams<{ slug?: string[] }>()

	// Derive gameURI and rkey from catch-all slug params
	// slug = ['new-game'] → create mode
	// slug = [did, rkey] → edit mode
	const slug = params?.slug ?? []
	const gameRkey = slug.length === 2 ? decodeURIComponent(slug[1]) : null
	const rawDIDOrHandle = slug.length === 2 ? decodeURIComponent(slug[0]) : null
	const isEditMode = Boolean(gameRkey)

	const [gameDID, setGameDID] = useState<DID | null>(
		rawDIDOrHandle && isDID(rawDIDOrHandle) ? rawDIDOrHandle : null,
	)

	const [steps] = useState(EDIT_GAME_STEPS)

	const [currentStepIndex, setCurrentStepIndex] = useState(0)
	const [state, setState] = useState<State>(isEditMode ? 'active' : 'idle')

	useEffect(() => {
		if (!rawDIDOrHandle || isDID(rawDIDOrHandle)) return

		resolveHandle(rawDIDOrHandle).then((resolved) => {
			if (resolved) {
				setGameDID(resolved)
			} else {
				setState('error')
			}
		})
	}, [rawDIDOrHandle])

	const gameURI: AtUriString | null =
		gameRkey && gameDID
			? (`at://${gameDID}/games.gamesgamesgamesgames.game/${gameRkey}` as AtUriString)
			: null
	const [uploadProgress, setUploadProgress] = useState<null | number>(null)
	const [uploadTotal, setUploadTotal] = useState<null | number>(null)
	const [createdAt, setCreatedAt] = useState<GameRecord['createdAt'] | null>(null)

	const [name, setName] = useState<GameRecord['name']>('')
	const [media, setMedia] = useState<MediaItem[]>([])
	const [genres, setGenres] = useState<Set<Genre>>(new Set())
	const [modes, setModes] = useState<Set<Mode>>(new Set())
	const [themes, setThemes] = useState<Set<Theme>>(new Set())
	const [summary, setSummary] = useState<GameRecord['summary']>('')
	const [releases, setReleases] = useState<Release[]>([
		{
			platform: '',
			releaseDates: [
				{
					releasedAt: '',
					releasedAtFormat: 'TBD',
					region: '',
					status: 'release',
				},
			],
		},
	])
	const [applicationType, setApplicationType] = useState<
		GameRecord['applicationType']
	>('game')
	const [playerPerspectives, setPlayerPerspectives] = useState<
		Set<PlayerPerspective>
	>(new Set())

	// Fetch existing game data when in edit mode
	useEffect(() => {
		if (!gameURI) return

		getGame(gameURI).then((game) => {
			if (!game?.record) {
				setState('error')
				return
			}

			const record = game.record

			setName(record.name ?? '')
			setSummary(record.summary ?? '')
			setApplicationType(
				record.applicationType ??
					'game',
			)
			setGenres(new Set((record.genres as Genre[]) ?? []))
			setModes(new Set((record.modes as Mode[]) ?? []))
			setThemes(new Set((record.themes as Theme[]) ?? []))
			setPlayerPerspectives(
				new Set((record.playerPerspectives as PlayerPerspective[]) ?? []),
			)
			setCreatedAt(record.createdAt ?? null)

			if (record.media?.length) {
				setMedia(
					record.media.map((item) => ({
						blob: item.blob ?? null,
						description: item.description ?? '',
						height: item.height ?? null,
						id: generateUUID(),
						locale: (item.locale as MediaItem['locale']) ?? null,
						mediaType: (item.mediaType as MediaItem['mediaType']) ?? null,
						title: item.title ?? '',
						width: item.width ?? null,
					})),
				)
			}

			if (record.releases?.length) {
				setReleases(record.releases)
			}

			setState('idle')
		})
	}, [gameURI])

	const addGenre = useCallback((genre: Genre) => {
		setGenres((previousState) => {
			const newState = new Set(previousState)
			newState.add(genre)
			return newState
		})
	}, [])

	const removeGenre = useCallback((genre: Genre) => {
		setGenres((previousState) => {
			const newState = new Set(previousState)
			newState.delete(genre)
			return newState
		})
	}, [])

	const addMode = useCallback((mode: Mode) => {
		setModes((previousState) => {
			const newState = new Set(previousState)
			newState.add(mode)
			return newState
		})
	}, [])

	const removeMode = useCallback((mode: Mode) => {
		setModes((previousState) => {
			const newState = new Set(previousState)
			newState.delete(mode)
			return newState
		})
	}, [])

	const addPlayerPerspective = useCallback(
		(playerPerspective: PlayerPerspective) => {
			setPlayerPerspectives((previousState) => {
				const newState = new Set(previousState)
				newState.add(playerPerspective)
				return newState
			})
		},
		[],
	)

	const removePlayerPerspective = useCallback(
		(playerPerspective: PlayerPerspective) => {
			setPlayerPerspectives((previousState) => {
				const newState = new Set(previousState)
				newState.delete(playerPerspective)
				return newState
			})
		},
		[],
	)

	const addTheme = useCallback((theme: Theme) => {
		setThemes((previousState) => {
			const newState = new Set(previousState)
			newState.add(theme)
			return newState
		})
	}, [])

	const removeTheme = useCallback((theme: Theme) => {
		setThemes((previousState) => {
			const newState = new Set(previousState)
			newState.delete(theme)
			return newState
		})
	}, [])

	const uploadMedia = useCallback(async () => {
		const newMediaItems = media.filter((item) => item.file && !item.blob)

		if (!newMediaItems.length) return

		setUploadTotal(
			newMediaItems.reduce(
				(accumulator, mediaItem) => accumulator + mediaItem.file!.size,
				0,
			),
		)
		setUploadProgress(0)

		for (const mediaItem of newMediaItems) {
			const result = await uploadBlob(mediaItem.file!)
			mediaItem.blob = result as MediaItem['blob']
			setUploadProgress(
				(previousState) => previousState! + mediaItem.file!.size,
			)
		}
	}, [media])

	const saveGame = useCallback(
		async (shouldPublish: boolean) => {
			if (state === 'idle') {
				setState('active')

				await uploadMedia()

				const gameData = {
					applicationType,
					createdAt: createdAt ?? undefined,
					genres: Array.from(genres || []),
					media,
					modes: Array.from(modes || []),
					name,
					playerPerspectives: Array.from(playerPerspectives || []),
					releases,
					summary,
					themes: Array.from(themes || []),
				}

				if (gameURI) {
					// Edit mode
					await putGame(gameURI, gameData, { shouldPublish })
					router.push(`/game/${gameDID}/${gameRkey}`)
				} else {
					// Create mode
					const recordURI = await createGame(gameData, { shouldPublish })
					const { did, rkey } = parseATURI(recordURI)
					router.push(`/game/${did}/${rkey}`)
				}
			}
		},
		[
			applicationType,
			createdAt,
			gameDID,
			gameRkey,
			gameURI,
			genres,
			media,
			modes,
			name,
			playerPerspectives,
			releases,
			state,
			summary,
			themes,
			uploadMedia,
		],
	)

	const updateAllMedia = useCallback((files: File[]) => {
		setMedia((previousState) => {
			const existingFiles = new Set(
				previousState
					.filter((m) => m.file)
					.map((m) => `${m.file!.name}:${m.file!.size}`),
			)

			const newItems: MediaItem[] = files
				.filter((file) => !existingFiles.has(`${file.name}:${file.size}`))
				.map((file) => ({
					blob: null,
					description: '',
					height: null,
					id: generateUUID(),
					file,
					locale: null,
					mediaType: null,
					title: '',
					width: null,
				}))

			return [...previousState, ...newItems]
		})
	}, [])

	const updateMedia = useCallback((mediaItem: MediaItem) => {
		setMedia((previousState) =>
			previousState.map((item) =>
				item.id === mediaItem.id ? mediaItem : item,
			),
		)
	}, [])

	const removeMedia = useCallback((mediaItem: MediaItem) => {
		setMedia((previousState) =>
			previousState.filter((item) => item.id !== mediaItem.id),
		)
	}, [])

	const nextStep = useCallback(
		() => setCurrentStepIndex(Math.min(steps.length - 1, currentStepIndex + 1)),
		[currentStepIndex, steps],
	)
	const previousStep = useCallback(
		() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1)),
		[currentStepIndex, steps],
	)
	const goToStepIndex = useCallback(
		(stepIndex: number) => {
			if (stepIndex < 0 || stepIndex > steps.length - 1) {
				throw new RangeError(`Step ${stepIndex} doesn't exist.`)
			}

			setCurrentStepIndex(stepIndex)
		},
		[steps],
	)

	const publishGame = useCallback(() => saveGame(true), [saveGame])
	const saveGameDraft = useCallback(() => saveGame(false), [saveGame])

	// Check if there's at least one valid release with a complete release date
	const hasValidRelease = releases.some(
		(release) =>
			release.platform &&
			release.releaseDates?.some((rd) => rd.region && rd.status),
	)

	const providerValue = useMemo(
		() => ({
			isEditMode,
			currentStep: steps[currentStepIndex],
			hasNext: currentStepIndex < steps.length - 1,
			hasPrevious: currentStepIndex !== 0,
			publishErrors: [
				name ? null : <NameError />,
				summary ? null : <SummaryError />,
				genres!.size ? null : <GenreError />,
				modes!.size ? null : <ModeError />,
				playerPerspectives!.size ? null : <PlayerPerspectiveError />,
				hasValidRelease ? null : <ReleaseError />,
			].filter(Boolean) as ReactNode[],
			saveErrors: [name ? null : <NameError />].filter(Boolean) as ReactNode[],

			applicationType,
			currentStepIndex,
			genres,
			media,
			modes,
			name,
			playerPerspectives,
			releases,
			state,
			steps,
			summary,
			themes,
			uploadProgress,
			uploadTotal,

			addGenre,
			addMode,
			addPlayerPerspective,
			addTheme,
			goToStepIndex,
			nextStep,
			previousStep,
			publishGame,
			removeGenre,
			removeMedia,
			removeMode,
			removePlayerPerspective,
			removeTheme,
			saveGameDraft,
			setApplicationType,
			setCurrentStepIndex,
			setName,
			setReleases,
			setSummary,
			updateAllMedia,
			updateMedia,
		}),
		[
			applicationType,
			currentStepIndex,
			genres,
			isEditMode,
			media,
			modes,
			name,
			playerPerspectives,
			releases,
			state,
			steps,
			summary,
			themes,
			uploadProgress,
			uploadTotal,

			addGenre,
			addMode,
			addPlayerPerspective,
			addTheme,
			goToStepIndex,
			nextStep,
			previousStep,
			publishGame,
			removeGenre,
			removeMedia,
			removeMode,
			removePlayerPerspective,
			removeTheme,
			saveGameDraft,
			setCurrentStepIndex,
			updateAllMedia,
			updateMedia,
		],
	)

	return (
		<DashboardCatalogEditGameContext.Provider value={providerValue}>
			{children}
		</DashboardCatalogEditGameContext.Provider>
	)
}

export const useDashboardCatalogEditGameContext = () =>
	useContext(DashboardCatalogEditGameContext)
