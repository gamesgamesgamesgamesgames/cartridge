'use client'

// Module imports
import Link from 'next/link'
import { type ChangeEventHandler, useCallback, useEffect, useRef, useState } from 'react'

// Local imports
import * as API from '@/helpers/API'
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

	const [titleMatches, setTitleMatches] = useState<Array<{ name: string; slug?: string; uri: string }>>([])
	const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const searchAbortRef = useRef<AbortController | null>(null)

	useEffect(() => {
		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current)
		}
		if (searchAbortRef.current) {
			searchAbortRef.current.abort()
		}

		const title = name?.trim()
		if (!title || title.length < 3) {
			setTitleMatches([])
			return
		}

		searchTimeoutRef.current = setTimeout(async () => {
			const controller = new AbortController()
			searchAbortRef.current = controller

			try {
				const result = await API.search(title, {
					limit: 5,
					signal: controller.signal,
				})
				if (!controller.signal.aborted) {
					setTitleMatches(
						(result.results ?? []).map((r: any) => ({
							name: r.record?.name ?? r.name ?? '',
							slug: r.record?.slug ?? r.slug,
							uri: r.record?.uri ?? r.uri ?? '',
						})),
					)
				}
			} catch {
				if (!controller.signal.aborted) {
					setTitleMatches([])
				}
			}
		}, 300)

		return () => {
			if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
			if (searchAbortRef.current) searchAbortRef.current.abort()
		}
	}, [name])

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

						{titleMatches.length > 0 && (
							<div className={'rounded-md border border-border bg-muted/50 p-3'}>
								<p className={'text-xs text-muted-foreground mb-2'}>
									{'Similar games already exist. Consider claiming one instead of creating a duplicate:'}
								</p>
								<div className={'flex flex-col gap-1'}>
									{titleMatches.map((match) => (
										<Link
											key={match.uri}
											href={match.slug ? `/game/${match.slug}` : '#'}
											className={'text-sm text-primary hover:underline truncate'}>
											{match.name}
										</Link>
									))}
								</div>
							</div>
						)}

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
