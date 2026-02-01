// Module imports
import { type ChangeEventHandler } from 'react'

// Local imports
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

// Types
type Props = Readonly<{
	disabled: boolean
	onChange: ChangeEventHandler<HTMLInputElement>
	value: string
}>

export function NameField(props: Props) {
	const { disabled, onChange, value } = props

	return (
		<Field>
			<FieldLabel htmlFor={'game-name'}>{'Name'}</FieldLabel>
			<Input
				autoComplete={'off'}
				disabled={disabled}
				id={'game-name'}
				onChange={onChange}
				placeholder={'The Ultimate RPG: A Role in Time'}
				required
				type={'text'}
				value={value}
			/>
		</Field>
	)
}
