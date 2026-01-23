'use client'

// Module imports
import { DataList, Flex, Text } from '@radix-ui/themes'
import { ReactNode, useMemo } from 'react'

// Local imports
import { GAME_MODES } from '@/constants/GAME_MODES'
import { GAME_APPLICATION_TYPES } from '@/constants/GAME_APPLICATION_TYPES'
import { Link } from '@/components/Link/Link'
import { useDashboardCatalogGameContext } from '@/context/DashboardCatalogGameContext/DashboardCatalogGameContext'

export function DashboardCatalogGameOverview() {
	const { game } = useDashboardCatalogGameContext()

	const gameRecord = game?.record!

	const typeValue = useMemo(() => {
		if (gameRecord.applicationType) {
			return (
				<Link
					href={`/dashboard/catalog?applicationType=${gameRecord.applicationType}`}>
					<Text>{GAME_APPLICATION_TYPES[gameRecord.applicationType].name}</Text>
				</Link>
			)
		}

		return <Text>{'No type provided'}</Text>
	}, [gameRecord])

	const modesValue = useMemo(() => {
		if (gameRecord.modes) {
			return gameRecord.modes.reduce((accumulator, mode, index, array) => {
				accumulator.push(
					<Link
						key={mode}
						href={`/dashboard/catalog?mode=${mode}`}>
						<Text>{GAME_MODES[mode].name}</Text>
					</Link>,
				)

				if (index < array.length - 1) {
					accumulator.push(', ')
				}

				return accumulator
			}, [] as ReactNode[])
		}

		return <Text>{'No modes provided'}</Text>
	}, [gameRecord])

	return (
		<Flex direction={'column'}>
			<Text>{gameRecord.name}</Text>

			<Text>{gameRecord.summary}</Text>

			<DataList.Root>
				<DataList.Item>
					<DataList.Label>{'Type'}</DataList.Label>
					<DataList.Value>{typeValue}</DataList.Value>
				</DataList.Item>

				<DataList.Item>
					<DataList.Label>{'Modes'}</DataList.Label>
					<DataList.Value>
						<Text>{modesValue}</Text>
					</DataList.Value>
				</DataList.Item>
			</DataList.Root>
		</Flex>
	)
}
