// Module imports
import { Box, Button, Flex } from '@radix-ui/themes'

// Local imports
import { Link } from '@/components/Link/Link'
import { useDashboardCatalogNewGameContext } from '@/context/DashboardCatalogNewGameContext/DashboardCatalogNewGameContext'

type Props = Readonly<{
	next?: string
	previous?: string
}>

export function DashboardCatalogNewGameFooter(props: Props) {
	const { next, previous } = props

	const { state } = useDashboardCatalogNewGameContext()

	return (
		<Flex
			gap={'3'}
			justify={'between'}
			mt={'4'}>
			<Box mr={'4'}>
				<Button
					loading={state === 'active'}
					variant={'outline'}>
					{'Save Draft'}
				</Button>
			</Box>

			<Flex
				gap={'3'}
				justify={'end'}>
				{Boolean(previous) && (
					<Link
						asChild
						href={`/dashboard/catalog/new-game/${previous}`}>
						<Button loading={state === 'active'}>{'Back'}</Button>
					</Link>
				)}

				{Boolean(next) && (
					<Link
						asChild
						href={`/dashboard/catalog/new-game/${next}`}>
						<Button loading={state === 'active'}>{'Continue'}</Button>
					</Link>
				)}

				{!next && <Button color={'green'}>{'Create Game'}</Button>}
			</Flex>
		</Flex>
	)
}
