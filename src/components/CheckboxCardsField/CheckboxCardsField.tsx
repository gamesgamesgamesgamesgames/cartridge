// Module imports
import { Box, CheckboxCards, Flex, Text } from '@radix-ui/themes'
import { useMemo } from 'react'

// Types
type Props = Readonly<{
	data: Record<string, { name: string }>
	disabled: boolean
	fieldName?: string
	label?: string
	onChange: (value: string[]) => void
	value: string[]
}>

export function CheckboxCardsField(props: Props) {
	const { data, disabled, fieldName, label, onChange, value } = props

	const options = useMemo(
		() =>
			Object.entries(data).map(([id, datum]) => {
				return (
					<CheckboxCards.Item
						key={id}
						value={id}>
						<Flex
							direction={'column'}
							width={'100%'}>
							<Text weight={'bold'}>{datum.name}</Text>
						</Flex>
					</CheckboxCards.Item>
				)
			}),
		[],
	)

	return (
		<Flex
			asChild
			direction={'column'}>
			<Box mb={'5'}>
				<Text>{label}</Text>
				<CheckboxCards.Root
					disabled={disabled}
					onValueChange={onChange}
					name={fieldName}
					value={value}>
					{options}
				</CheckboxCards.Root>
			</Box>
		</Flex>
	)
}
