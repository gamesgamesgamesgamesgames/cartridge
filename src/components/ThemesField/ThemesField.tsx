// Local imports
import { CheckboxCardsField } from '@/components/CheckboxCardsField/CheckboxCardsField'
import { GAME_THEMES } from '@/constants/GAME_THEMES'
import { type Theme } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

// Types
type Props = Readonly<{
	disabled: boolean
	onChange: (id: Theme) => (isChecked: boolean) => void
	value: Set<Theme>
}>

export function ThemesField(props: Props) {
	const { disabled, onChange, value } = props

	return (
		<CheckboxCardsField
			data={GAME_THEMES}
			disabled={disabled}
			fieldPrefix={'themes'}
			label={'Themes'}
			onChange={onChange}
			value={value}
		/>
	)
}
