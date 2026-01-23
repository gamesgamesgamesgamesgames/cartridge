// Module imports
import { Box, Flex, Select, Text } from '@radix-ui/themes'
import { useMemo, type ReactNode } from 'react'

// Local imports
import { type ApplicationType } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { GAME_APPLICATION_TYPES } from '@/constants/GAME_APPLICATION_TYPES'
import { GAME_APPLICATION_TYPES_CATEGORIES } from '@/constants/GAME_APPLICATION_TYPES_CATEGORIES'

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
						<Select.Group key={typeGroup.label}>
							<Select.Label>{typeGroup.label}</Select.Label>
							{typeGroup.items.map((id) => (
								<Select.Item
									key={id}
									value={id}>
									{GAME_APPLICATION_TYPES[id].name}
								</Select.Item>
							))}
						</Select.Group>,
					)

					if (index < array.length - 1) {
						accumulator.push(<Select.Separator key={index} />)
					}

					return accumulator
				},
				[] as Array<ReactNode>,
			),
		[],
	)

	return (
		<Flex
			asChild
			direction={'column'}>
			<Box mb={'5'}>
				<Text>{'Type'}</Text>
				<Select.Root
					disabled={disabled}
					onValueChange={onChange}
					value={value}>
					<Select.Trigger />
					<Select.Content>{options}</Select.Content>
				</Select.Root>
			</Box>
		</Flex>
	)
}
