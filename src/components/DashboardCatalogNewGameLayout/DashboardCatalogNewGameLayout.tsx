'use client'

// Module imports
import { Flex, Heading, TabNav } from '@radix-ui/themes'
import { usePathname } from 'next/navigation'

// Local imports
import { Link } from '@/components/Link/Link'
import { DashboardCatalogNewGameContextProvider } from '@/context/DashboardCatalogNewGameContext/DashboardCatalogNewGameContext'

type Props = Readonly<LayoutProps<'/dashboard/catalog/new-game'>>

export function DashboardCatalogNewGameLayoutWrapper(props: Props) {
	return (
		<DashboardCatalogNewGameContextProvider>
			<DashboardCatalogNewGameContextLayout {...props} />
		</DashboardCatalogNewGameContextProvider>
	)
}

export function DashboardCatalogNewGameContextLayout(props: Props) {
	const { children } = props

	const pathname = usePathname()

	return (
		<>
			<Flex
				justify={'between'}
				mb={'4'}>
				<Heading as={'h2'}>{'New Game'}</Heading>
			</Flex>

			<TabNav.Root mb={'4'}>
				<TabNav.Link
					active={pathname.endsWith('/general')}
					asChild>
					<Link href={`/dashboard/catalog/new-game/general`}>{'General'}</Link>
				</TabNav.Link>
				<TabNav.Link
					active={pathname.endsWith('/categorization')}
					asChild>
					<Link href={`/dashboard/catalog/new-game/categorization`}>
						{'Categorization'}
					</Link>
				</TabNav.Link>
				<TabNav.Link
					active={pathname.endsWith('/releases')}
					asChild>
					<Link href={`/dashboard/catalog/new-game/releases`}>
						{'Releases'}
					</Link>
				</TabNav.Link>
				<TabNav.Link
					active={pathname.endsWith('/review')}
					asChild>
					<Link href={`/dashboard/catalog/new-game/review`}>{'Review'}</Link>
				</TabNav.Link>
			</TabNav.Root>

			{children}
		</>
	)
}
