// Module imports
import { Box, Flex, Text, TextArea } from '@radix-ui/themes'

// Local imports
import { type ChangeEventHandler } from 'react'

// Types
type Props = Readonly<{
	disabled: boolean
	onChange: ChangeEventHandler<HTMLTextAreaElement>
	value: string
}>

export function SummaryField(props: Props) {
	const { disabled, onChange, value } = props

	return (
		<Flex
			asChild
			direction={'column'}>
			<Box mb={'5'}>
				<Text>{'Summary'}</Text>
				<TextArea
					disabled={disabled}
					onChange={onChange}
					required
					value={value}
				/>
			</Box>
		</Flex>
	)
}
