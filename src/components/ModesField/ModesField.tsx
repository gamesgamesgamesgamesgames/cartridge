// Local imports
import { GAME_MODES } from '@/constants/GAME_MODES'
import { CheckboxCardsField } from '@/components/CheckboxCardsField/CheckboxCardsField'
import { type Theme } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

// Types
type Props = Readonly<{
	disabled: boolean
	onChange: (value: Theme[]) => void
	value: Theme[]
}>

export function ModesField(props: Props) {
	const { disabled, onChange, value } = props

	return (
		<CheckboxCardsField
			data={GAME_MODES}
			disabled={disabled}
			fieldName={'modes'}
			label={'Modes'}
			onChange={onChange}
			value={value}
		/>
	)
}
