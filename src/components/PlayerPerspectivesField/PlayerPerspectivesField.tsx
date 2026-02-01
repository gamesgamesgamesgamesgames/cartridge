// Local imports
import { CheckboxCardsField } from '@/components/CheckboxCardsField/CheckboxCardsField'
import { GAME_PLAYER_PERSPECTIVES } from '@/constants/GAME_PLAYER_PERSPECTIVES'
import { type PlayerPerspective } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

// Types
type Props = Readonly<{
	disabled: boolean
	onChange: (id: PlayerPerspective) => (isChecked: boolean) => void
	value: Set<PlayerPerspective>
}>

export function PlayerPerspectivesField(props: Props) {
	const { disabled, onChange, value } = props

	return (
		<CheckboxCardsField
			data={GAME_PLAYER_PERSPECTIVES}
			disabled={disabled}
			fieldPrefix={'playerPerspective'}
			label={'Player Perspectives'}
			onChange={onChange}
			value={value}
		/>
	)
}
