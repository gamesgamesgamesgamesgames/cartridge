'use client'

// Module imports
import { Flex } from '@radix-ui/themes'
import { type ChangeEventHandler, useCallback } from 'react'

// Local imports
import { type ApplicationType } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { ApplicationTypeField } from '@/components/ApplicationTypeField/ApplicationTypeField'
import { DashboardCatalogNewGameFooter } from '@/components/DashboardCatalogNewGameFooter/DashboardCatalogNewGameFooter'
import { NameField } from '@/components/NameField/NameField'
import { SummaryField } from '@/components/SummaryField/SummaryField'
import { useDashboardCatalogNewGameContext } from '@/context/DashboardCatalogNewGameContext/DashboardCatalogNewGameContext'

export function DashboardCatalogNewGameGeneral() {
	const {
		applicationType,
		name,
		summary,
		setApplicationType,
		setName,
		setSummary,
		state,
	} = useDashboardCatalogNewGameContext()

	const handleApplicationTypeChange = useCallback((value: ApplicationType) => {
		setApplicationType(value)
	}, [])

	const handleNameChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
		(event) => {
			setName(event.target.value)
		},
		[],
	)

	const handleSummaryChange = useCallback<
		ChangeEventHandler<HTMLTextAreaElement>
	>((event) => {
		setSummary(event.target.value)
	}, [])

	const isDisabled = state === 'active'

	return (
		<>
			<Flex direction={'column'}>
				<NameField
					disabled={isDisabled}
					onChange={handleNameChange}
					value={name ?? ''}
				/>

				<SummaryField
					disabled={isDisabled}
					onChange={handleSummaryChange}
					value={summary ?? ''}
				/>

				<ApplicationTypeField
					disabled={isDisabled}
					onChange={handleApplicationTypeChange}
					value={
						applicationType ?? 'games.gamesgamesgamesgames.applicationType#game'
					}
				/>

				{/* parent */}
			</Flex>

			<DashboardCatalogNewGameFooter next={'categorization'} />
		</>
	)
}
