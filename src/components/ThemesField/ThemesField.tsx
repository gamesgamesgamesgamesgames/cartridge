// Local imports
import { CheckboxCardsField } from '@/components/CheckboxCardsField/CheckboxCardsField'
import { GAME_THEMES } from '@/constants/GAME_THEMES'
import { type Theme } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

// Types
type Props = Readonly<{
	disabled: boolean
	onChange: (value: Theme[]) => void
	value: Theme[]
}>

export function ThemesField(props: Props) {
	const { disabled, onChange, value } = props

	return (
		<CheckboxCardsField
			data={GAME_THEMES}
			disabled={disabled}
			fieldName={'themes'}
			label={'Themes'}
			onChange={onChange}
			value={value}
		/>
	)
}
