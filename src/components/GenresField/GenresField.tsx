// Module imports
import { Box, CheckboxCards, Flex, Text } from '@radix-ui/themes'
import { useMemo } from 'react'

// Local imports
import { GAME_GENRES } from '@/constants/GAME_GENRES'
import { type Genre } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

// Types
type Props = Readonly<{
	disabled: boolean
	onChange: (value: Genre[]) => void
	value: Genre[]
}>

export function GenresField(props: Props) {
	const { disabled, onChange, value } = props

	const options = useMemo(
		() =>
			Object.entries(GAME_GENRES).map(([id, mode]) => {
				return (
					<CheckboxCards.Item
						key={id}
						value={id}>
						<Flex
							direction={'column'}
							width={'100%'}>
							<Text weight={'bold'}>{mode.name}</Text>
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
				<Text>{'Genres'}</Text>
				<CheckboxCards.Root
					disabled={disabled}
					onValueChange={onChange}
					name={'genres'}
					value={value}>
					{options}
				</CheckboxCards.Root>
			</Box>
		</Flex>
	)
}
