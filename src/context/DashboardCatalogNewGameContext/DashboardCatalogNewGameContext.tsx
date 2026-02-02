'use client'

// Moduile imports
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
	type PropsWithChildren,
} from 'react'
import { useRouter } from 'next/navigation'

// Local imports
import { type AtUriString } from '@atproto/lex'
import { createGame } from '@/store/actions/createGame'
import { type GameRecord } from '@/typedefs/GameRecord'
import {
	type Genre,
	type Mode,
	type PlayerPerspective,
	type Theme,
} from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { GenreError } from '@/context/DashboardCatalogNewGameContext/GenreError'
import { type MediaItem } from '@/typedefs/MediaItem'
import { ModeError } from '@/context/DashboardCatalogNewGameContext/ModeError'
import { NameError } from '@/context/DashboardCatalogNewGameContext/NameError'
import { NEW_GAME_STEPS } from '@/constants/NEW_GAME_STEPS'
import { PlayerPerspectiveError } from '@/context/DashboardCatalogNewGameContext/PlayerPerspectiveError'
import { parseATURI } from '@/helpers/parseATURI'
import { type State } from '@/typedefs/State'
import { type StepperStep } from '@/typedefs/StepperStep'
import { SummaryError } from '@/context/DashboardCatalogNewGameContext/SummaryError'

// Types
type Props = Readonly<PropsWithChildren>

export const DashboardCatalogNewGameContext = createContext<
	Partial<
		Omit<GameRecord, 'genres' | 'modes' | 'playerPerspectives' | 'themes'>
	> & {
		genres: Set<Genre>
		media: Map<File, MediaItem>
		modes: Set<Mode>
		playerPerspectives: Set<PlayerPerspective>
		themes: Set<Theme>

		addGenre: (genre: Genre) => void
		addMode: (mode: Mode) => void
		addPlayerPerspective: (playerPerspective: PlayerPerspective) => void
		addTheme: (theme: Theme) => void
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
		removeMode: (mode: Mode) => void
		removePlayerPerspective: (playerPerspective: PlayerPerspective) => void
		removeTheme: (theme: Theme) => void
		saveErrors: ReactNode[]
		saveGameDraft: () => void
		setApplicationType: (applicationType: GameRecord['applicationType']) => void
		setName: (name: GameRecord['name']) => void
		setReleaseDates: (releaseDates: GameRecord['releaseDates']) => void
		setSummary: (summary: GameRecord['summary']) => void
		state: State
		steps: StepperStep[]
		updateAllMedia: (files: File[]) => void
		updateMedia: (mediaItem: MediaItem) => void
	}
>({
	genres: new Set(),
	media: new Map(),
	modes: new Set(),
	playerPerspectives: new Set(),
	themes: new Set(),

	addGenre: () => {},
	addMode: () => {},
	addPlayerPerspective: () => {},
	addTheme: () => {},
	applicationType: 'games.gamesgamesgamesgames.applicationType#game',
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
	removeMode: () => {},
	removePlayerPerspective: () => {},
	removeTheme: () => {},
	saveErrors: [],
	saveGameDraft: () => {},
	setApplicationType: () => {},
	setName: () => {},
	setReleaseDates: () => {},
	setSummary: () => {},
	state: 'idle',
	steps: [],
	updateAllMedia: () => {},
	updateMedia: () => {},
})

export function DashboardCatalogNewGameContextProvider(props: Props) {
	const { children } = props

	const router = useRouter()

	const [steps] = useState(NEW_GAME_STEPS)

	const [currentStepIndex, setCurrentStepIndex] = useState(0)
	const [state, setState] = useState<State>('idle')

	const [name, setName] = useState<GameRecord['name']>('')
	const [media, setMedia] = useState<Map<File, MediaItem>>(new Map())
	const [genres, setGenres] = useState<Set<Genre>>(new Set())
	const [modes, setModes] = useState<Set<Mode>>(new Set())
	const [themes, setThemes] = useState<Set<Theme>>(new Set())
	const [summary, setSummary] = useState<GameRecord['summary']>('')
	const [releaseDates, setReleaseDates] = useState<GameRecord['releaseDates']>(
		[],
	)
	const [applicationType, setApplicationType] = useState<
		GameRecord['applicationType']
	>('games.gamesgamesgamesgames.applicationType#game')
	const [playerPerspectives, setPlayerPerspectives] = useState<
		Set<PlayerPerspective>
	>(new Set())

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

	const saveGame = useCallback(
		(shouldPublish: boolean) => {
			if (state === 'idle') {
				setState('active')
				createGame(
					{
						applicationType,
						genres: Array.from(genres || []),
						modes: Array.from(modes || []),
						name,
						playerPerspectives: Array.from(playerPerspectives || []),
						releaseDates,
						summary,
						themes: Array.from(themes || []),
					},
					{ shouldPublish },
				).then((recordURI: AtUriString) => {
					const { did, rkey } = parseATURI(recordURI)
					router.push(`/dashboard/catalog/${did}/${rkey}/overview`)
				})
			}
		},
		[
			applicationType,
			genres,
			modes,
			name,
			playerPerspectives,
			releaseDates,
			state,
			summary,
			themes,
		],
	)

	const updateAllMedia = useCallback(
		(files: File[]) => {
			setMedia((previousState) => {
				const newState = new Map(previousState)

				files.forEach((file) => {
					if (!newState.has(file)) {
						newState.set(file, {
							description: '',
							dimensions: null,
							file,
							mediaType: null,
							title: '',
						})
					}
				})

				return newState
			})
		},
		[media],
	)

	const updateMedia = useCallback(
		(mediaItem: MediaItem) => {
			setMedia((previousState) => {
				const newState = new Map(previousState)

				newState.set(mediaItem.file, mediaItem)

				return newState
			})
		},
		[media],
	)

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

	const providerValue = useMemo(
		() => ({
			currentStep: steps[currentStepIndex],
			hasNext: currentStepIndex < steps.length - 1,
			hasPrevious: currentStepIndex !== 0,
			publishErrors: [
				name ? null : <NameError />,
				summary ? null : <SummaryError />,
				genres!.size ? null : <GenreError />,
				modes!.size ? null : <ModeError />,
				playerPerspectives!.size ? null : <PlayerPerspectiveError />,
			].filter(Boolean) as ReactNode[],
			saveErrors: [name ? null : <NameError />].filter(Boolean) as ReactNode[],

			applicationType,
			currentStepIndex,
			genres,
			media,
			modes,
			name,
			playerPerspectives,
			releaseDates,
			state,
			steps,
			summary,
			themes,

			addGenre,
			addMode,
			addPlayerPerspective,
			addTheme,
			goToStepIndex,
			nextStep,
			previousStep,
			publishGame,
			removeGenre,
			removeMode,
			removePlayerPerspective,
			removeTheme,
			saveGameDraft,
			setApplicationType,
			setCurrentStepIndex,
			setName,
			setReleaseDates,
			setSummary,
			updateAllMedia,
			updateMedia,
		}),
		[
			applicationType,
			currentStepIndex,
			genres,
			modes,
			name,
			playerPerspectives,
			releaseDates,
			state,
			steps,
			summary,
			themes,

			addGenre,
			addMode,
			addPlayerPerspective,
			addTheme,
			goToStepIndex,
			nextStep,
			previousStep,
			publishGame,
			removeGenre,
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
		<DashboardCatalogNewGameContext.Provider value={providerValue}>
			{children}
		</DashboardCatalogNewGameContext.Provider>
	)
}

export const useDashboardCatalogNewGameContext = () =>
	useContext(DashboardCatalogNewGameContext)
