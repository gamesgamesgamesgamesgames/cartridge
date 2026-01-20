// Module imports
import { Box, Card, Flex, Text } from '@radix-ui/themes'

// Local imports
import { Link } from '@/components/Link/Link'

export function DashboardNavigation() {
	return (
		<Flex
			asChild
			direction={'column'}
			justify={'start'}
			style={
				{
					// position: 'sticky',
					// top: 0,
				}
			}>
			<Box
				asChild
				flexShrink={'0'}>
				<Card>
					<Link href={'/dashboard'}>
						<Flex>
							<Text>{'Overview'}</Text>
						</Flex>
					</Link>

					<Link href={'/dashboard/catalog'}>
						<Flex>
							<Text>{'Games'}</Text>
						</Flex>
					</Link>
				</Card>
			</Box>
		</Flex>
	)
}
