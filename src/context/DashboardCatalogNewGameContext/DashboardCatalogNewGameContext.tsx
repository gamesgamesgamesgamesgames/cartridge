'use client'

// Moduile imports
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type PropsWithChildren,
} from 'react'
import { useRouter } from 'next/navigation'

// Local imports
import { type GameRecord } from '@/typedefs/GameRecord'
import { type State } from '@/typedefs/State'
import { createGame } from '@/store/actions/createGame'
import { AtUriString } from '@atproto/lex'
import { parseATURI } from '@/helpers/parseATURI'

type Props = PropsWithChildren

export const DashboardCatalogNewGameContext = createContext<
	Partial<GameRecord> & {
		isPublishable: boolean
		isSaveable: boolean
		publishGame: () => void
		saveGameDraft: () => void
		setApplicationType: (applicationType: GameRecord['applicationType']) => void
		setGenres: (genres: GameRecord['genres']) => void
		setModes: (modes: GameRecord['modes']) => void
		setName: (name: GameRecord['name']) => void
		setPlayerPerspectives: (
			playerPerspectives: GameRecord['playerPerspectives'],
		) => void
		setReleaseDates: (releaseDates: GameRecord['releaseDates']) => void
		setSummary: (summary: GameRecord['summary']) => void
		setThemes: (themes: GameRecord['themes']) => void
		state: State
	}
>({
	applicationType: 'games.gamesgamesgamesgames.applicationType#game',
	isPublishable: false,
	isSaveable: false,
	publishGame: () => {},
	saveGameDraft: () => {},
	setApplicationType: () => {},
	setGenres: () => {},
	setModes: () => {},
	setName: () => {},
	setPlayerPerspectives: () => {},
	setReleaseDates: () => {},
	setSummary: () => {},
	setThemes: () => {},
	state: 'idle',
})

export function DashboardCatalogNewGameContextProvider(props: Props) {
	const { children } = props

	const router = useRouter()

	// const gameURI: AtUriString = `at://${did}/games.gamesgamesgamesgames.game/${rkey}`

	const [state, setState] = useState<State>('idle')

	const [name, setName] = useState<GameRecord['name']>('')
	const [modes, setModes] = useState<GameRecord['modes']>([])
	const [genres, setGenres] = useState<GameRecord['genres']>([])
	const [themes, setThemes] = useState<GameRecord['themes']>([])
	const [summary, setSummary] = useState<GameRecord['summary']>('')
	const [releaseDates, setReleaseDates] = useState<GameRecord['releaseDates']>(
		[],
	)
	const [applicationType, setApplicationType] = useState<
		GameRecord['applicationType']
	>('games.gamesgamesgamesgames.applicationType#game')
	const [playerPerspectives, setPlayerPerspectives] = useState<
		GameRecord['playerPerspectives']
	>([])

	const saveGame = useCallback(
		(shouldPublish: boolean) => {
			if (state === 'idle') {
				setState('active')
				createGame(
					{
						applicationType,
						genres,
						modes,
						name,
						playerPerspectives,
						releaseDates,
						summary,
						themes,
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

	const publishGame = useCallback(() => saveGame(true), [saveGame])
	const saveGameDraft = useCallback(() => saveGame(false), [saveGame])

	const providerValue = useMemo(
		() => ({
			isPublishable:
				Boolean(name) &&
				Boolean(summary) &&
				genres!.length > 0 &&
				modes!.length > 0 &&
				playerPerspectives!.length > 0,
			isSaveable: Boolean(name),

			applicationType,
			genres,
			modes,
			name,
			playerPerspectives,
			releaseDates,
			state,
			summary,
			themes,

			publishGame,
			saveGameDraft,
			setApplicationType,
			setGenres,
			setModes,
			setName,
			setPlayerPerspectives,
			setReleaseDates,
			setSummary,
			setThemes,
		}),
		[
			publishGame,
			saveGameDraft,

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

	return (
		<DashboardCatalogNewGameContext.Provider value={providerValue}>
			{children}
		</DashboardCatalogNewGameContext.Provider>
	)
}

export const useDashboardCatalogNewGameContext = () =>
	useContext(DashboardCatalogNewGameContext)
