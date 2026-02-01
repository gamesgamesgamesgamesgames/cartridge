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
import { ModeError } from '@/context/DashboardCatalogNewGameContext/ModeError'
import { NameError } from '@/context/DashboardCatalogNewGameContext/NameError'
import { PlayerPerspectiveError } from '@/context/DashboardCatalogNewGameContext/PlayerPerspectiveError'
import { parseATURI } from '@/helpers/parseATURI'
import { type State } from '@/typedefs/State'
import { type StepperStep } from '@/typedefs/StepperStep'
import { SummaryError } from '@/context/DashboardCatalogNewGameContext/SummaryError'

// Types
type Props = Readonly<
	PropsWithChildren<{
		steps: StepperStep[]
	}>
>

// publishErrors: [
// 	name ? null : 'Name is required.',
// 	summary ? null : 'Summary is required.',
// 	genres!.size ? null : 'At least 1 Genre is required.',
// 	modes!.size ? null : 'At least 1 Mode is required.',
// 	playerPerspectives!.size
// 		? null
// 		: 'At least 1 Player Perspective is required.',
// ].filter(Boolean) as string[],
// saveErrors: [name ? null : 'Name is required.'].filter(
// 	Boolean,
// ) as string[],

export const DashboardCatalogNewGameContext = createContext<
	Partial<
		Omit<GameRecord, 'genres' | 'modes' | 'playerPerspectives' | 'themes'>
	> & {
		genres: Set<Genre>
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
	}
>({
	genres: new Set(),
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
})

export function DashboardCatalogNewGameContextProvider(props: Props) {
	const { children, steps } = props

	const router = useRouter()

	const [currentStepIndex, setCurrentStepIndex] = useState(0)
	const [state, setState] = useState<State>('idle')

	const [name, setName] = useState<GameRecord['name']>('')
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

	const nextStep = useCallback(
		() => setCurrentStepIndex(currentStepIndex + 1),
		[currentStepIndex],
	)
	const previousStep = useCallback(
		() => setCurrentStepIndex(currentStepIndex - 1),
		[currentStepIndex],
	)
	const goToStepIndex = useCallback(
		(stepIndex: number) => setCurrentStepIndex(stepIndex),
		[],
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
