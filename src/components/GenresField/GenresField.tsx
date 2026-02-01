// Local imports
import { CheckboxCardsField } from '@/components/CheckboxCardsField/CheckboxCardsField'
import { GAME_GENRES } from '@/constants/GAME_GENRES'
import { type Genre } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

// Types
type Props = Readonly<{
	disabled: boolean
	onChange: (id: Genre) => (isChecked: boolean) => void
	value: Set<Genre>
}>

export function GenresField(props: Props) {
	const { disabled, onChange, value } = props

	return (
		<CheckboxCardsField
			data={GAME_GENRES}
			disabled={disabled}
			fieldPrefix={'genre'}
			label={'Genres'}
			onChange={onChange}
			value={value}
		/>
	)
}
