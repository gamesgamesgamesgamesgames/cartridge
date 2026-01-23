// Module imports
import { Box, Flex, Text, TextField } from '@radix-ui/themes'

// Local imports
import { type ChangeEventHandler } from 'react'

// Types
type Props = Readonly<{
	disabled: boolean
	onChange: ChangeEventHandler<HTMLInputElement>
	value: string
}>

export function NameField(props: Props) {
	const { disabled, onChange, value } = props

	return (
		<Flex
			asChild
			direction={'column'}>
			<Box mb={'5'}>
				<Text>{'Name'}</Text>
				<TextField.Root
					autoComplete={'off'}
					disabled={disabled}
					onChange={onChange}
					required
					value={value}
				/>
			</Box>
		</Flex>
	)
}
