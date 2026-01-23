// Moduile imports
import {
	createContext,
	useContext,
	useMemo,
	useState,
	type PropsWithChildren,
} from 'react'

// Local imports
import { type DID } from '@/typedefs/DID'
import { type GameRecord } from '@/typedefs/GameRecord'
import { useParams } from 'next/navigation'
import { type State } from '@/typedefs/State'

type Props = PropsWithChildren

export const DashboardCatalogNewGameContext = createContext<
	Partial<GameRecord> & {
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

	const params = useParams<{
		did: DID
		rkey: string
	}>()

	const did = decodeURIComponent(params.did)
	const rkey = decodeURIComponent(params.rkey)
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

	const providerValue = useMemo(
		() => ({
			applicationType,
			genres,
			modes,
			name,
			playerPerspectives,
			releaseDates,
			state,
			summary,
			themes,
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
