// Module imports
import { type ChangeEventHandler } from 'react'

// Local imports
import { Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'

// Types
type Props = Readonly<{
	disabled: boolean
	onChange: ChangeEventHandler<HTMLTextAreaElement>
	value: string
}>

export function SummaryField(props: Props) {
	const { disabled, onChange, value } = props

	return (
		<Field>
			<FieldLabel htmlFor={'game-summary'}>{'Summary'}</FieldLabel>
			<Textarea
				autoComplete={'off'}
				disabled={disabled}
				id={'game-summary'}
				onChange={onChange}
				placeholder={'The Ultimate Showdown'}
				value={value}
			/>
		</Field>
	)
}
