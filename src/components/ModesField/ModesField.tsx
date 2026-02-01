// Local imports
import { CheckboxCardsField } from '@/components/CheckboxCardsField/CheckboxCardsField'
import { GAME_MODES } from '@/constants/GAME_MODES'
import { type Mode } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

// Types
type Props = Readonly<{
	disabled: boolean
	onChange: (id: Mode) => (isChecked: boolean) => void
	value: Set<Mode>
}>

export function ModesField(props: Props) {
	const { disabled, onChange, value } = props

	return (
		<CheckboxCardsField
			data={GAME_MODES}
			disabled={disabled}
			fieldPrefix={'mode'}
			label={'Modes'}
			onChange={onChange}
			value={value}
		/>
	)
}
