// Local imports
import { CheckboxCardsField } from '@/components/CheckboxCardsField/CheckboxCardsField'
import { GAME_PLAYER_PERSPECTIVES } from '@/constants/GAME_PLAYER_PERSPECTIVES'
import { type Theme } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

// Types
type Props = Readonly<{
	disabled: boolean
	onChange: (value: Theme[]) => void
	value: Theme[]
}>

export function PlayerPerspectivesField(props: Props) {
	const { disabled, onChange, value } = props

	return (
		<CheckboxCardsField
			data={GAME_PLAYER_PERSPECTIVES}
			disabled={disabled}
			fieldName={'playerPerspectives'}
			label={'Player Perspectives'}
			onChange={onChange}
			value={value}
		/>
	)
}
