// Module imports
import { type ReactNode, useMemo } from 'react'

// Local imports
import { type ApplicationType } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { Field, FieldLabel } from '@/components/ui/field'
import { GAME_APPLICATION_TYPES } from '@/constants/GAME_APPLICATION_TYPES'
import { GAME_APPLICATION_TYPES_CATEGORIES } from '@/constants/GAME_APPLICATION_TYPES_CATEGORIES'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

// Types
type Props = Readonly<{
	disabled: boolean
	onChange: (value: ApplicationType) => void
	value: ApplicationType
}>

export function ApplicationTypeField(props: Props) {
	const { disabled, onChange, value } = props

	const options = useMemo(
		() =>
			GAME_APPLICATION_TYPES_CATEGORIES.reduce(
				(accumulator, typeGroup, index, array) => {
					accumulator.push(
						<SelectGroup key={typeGroup.label}>
							<SelectLabel>{typeGroup.label}</SelectLabel>
							{typeGroup.items.map((id) => (
								<SelectItem
									key={id}
									value={id}>
									{GAME_APPLICATION_TYPES[id].name}
								</SelectItem>
							))}
						</SelectGroup>,
					)

					if (index < array.length - 1) {
						accumulator.push(<SelectSeparator key={index} />)
					}

					return accumulator
				},
				[] as Array<ReactNode>,
			),
		[],
	)

	return (
		<Field>
			<FieldLabel htmlFor={'type'}>{'Type'}</FieldLabel>
			<Select
				disabled={disabled}
				onValueChange={onChange}
				value={value}>
				<SelectTrigger>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>{options}</SelectContent>
			</Select>
		</Field>
	)
}
