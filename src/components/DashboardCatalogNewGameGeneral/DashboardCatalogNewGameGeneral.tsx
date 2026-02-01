'use client'

// Module imports
import { type ChangeEventHandler, useCallback } from 'react'

// Local imports
import { type ApplicationType } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { ApplicationTypeField } from '@/components/ApplicationTypeField/ApplicationTypeField'
import { Card, CardContent } from '@/components/ui/card'
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
		<div className={'flex flex-col gap-4'}>
			<Card>
				{/* <CardHeader>
				<CardTitle>{label}</CardTitle>
			</CardHeader> */}

				<CardContent className={'flex flex-col gap-4'}>
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
				</CardContent>
			</Card>
			<Card>
				<CardContent>
					<ApplicationTypeField
						disabled={isDisabled}
						onChange={handleApplicationTypeChange}
						value={
							applicationType ??
							'games.gamesgamesgamesgames.applicationType#game'
						}
					/>

					{/* parent */}
				</CardContent>
			</Card>
		</div>
	)
}
