'use client'

// Module imports
import { type ChangeEventHandler, useCallback } from 'react'

// Local imports
import { type ApplicationType } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { ApplicationTypeField } from '@/components/ApplicationTypeField/ApplicationTypeField'
import { Card, CardContent } from '@/components/ui/card'
import { NameField } from '@/components/NameField/NameField'
import { Scroller } from '@/components/ui/scroller'
import { SummaryField } from '@/components/SummaryField/SummaryField'
import { useDashboardCatalogEditGameContext } from '@/context/DashboardCatalogEditGameContext/DashboardCatalogEditGameContext'

export function GeneralContent() {
	const {
		applicationType,
		name,
		summary,
		setApplicationType,
		setName,
		setSummary,
		state,
	} = useDashboardCatalogEditGameContext()

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
		<Scroller className={'h-full'}>
			<div className={'flex flex-col gap-4'}>
				<Card>
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
								'game'
							}
						/>

						{/* parent */}
					</CardContent>
				</Card>
			</div>
		</Scroller>
	)
}
