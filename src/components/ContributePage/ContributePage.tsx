'use client'

// Module imports
import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from 'statery'

// Local imports
import * as API from '@/helpers/API'
import { type ApplicationType } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { ApplicationTypeField } from '@/components/ApplicationTypeField/ApplicationTypeField'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/Container/Container'
import { DashboardHeader } from '@/components/DashboardHeader/DashboardHeader'
import { Field, FieldLabel } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { NameField } from '@/components/NameField/NameField'
import { Spinner } from '@/components/ui/spinner'
import { SummaryField } from '@/components/SummaryField/SummaryField'
import { Textarea } from '@/components/ui/textarea'
import { store } from '@/store/store'
import { type GameRecord } from '@/typedefs/GameRecord'

export function ContributePage() {
	const { user } = useStore(store)
	const router = useRouter()
	const params = useParams<{ slug: string }>()

	const [game, setGame] = useState<GameRecord | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [submitError, setSubmitError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)

	// Form state — tracks proposed values
	const [name, setName] = useState('')
	const [summary, setSummary] = useState('')
	const [applicationType, setApplicationType] = useState<ApplicationType>('game')
	const [message, setMessage] = useState('')

	// Track which fields the user actually changed
	const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set())

	const breadcrumbs = [
		{ label: 'Dashboard', url: '/dashboard' },
		{ label: 'Suggest Edit', url: `/dashboard/contribute/${params.slug}` },
	]

	useEffect(() => {
		let cancelled = false

		async function load() {
			setIsLoading(true)
			const result = await API.getGame({ slug: params.slug })
			if (cancelled) return

			if (result) {
				setGame(result)
				setName(result.name ?? '')
				setSummary(result.summary ?? '')
				setApplicationType((result.applicationType as ApplicationType) ?? 'main_game')
			}

			setIsLoading(false)
		}

		load()

		return () => {
			cancelled = true
		}
	}, [params.slug])

	const markDirty = useCallback((field: string) => {
		setDirtyFields((prev) => new Set(prev).add(field))
	}, [])

	const handleNameChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setName(e.target.value)
			markDirty('name')
		},
		[markDirty],
	)

	const handleSummaryChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setSummary(e.target.value)
			markDirty('summary')
		},
		[markDirty],
	)

	const handleApplicationTypeChange = useCallback(
		(value: ApplicationType) => {
			setApplicationType(value)
			markDirty('applicationType')
		},
		[markDirty],
	)

	const handleSubmit = useCallback(async () => {
		if (!game || dirtyFields.size === 0) return
		setIsSubmitting(true)
		setSubmitError(null)

		const changes: Record<string, unknown> = {}
		if (dirtyFields.has('name')) changes.name = name
		if (dirtyFields.has('summary')) changes.summary = summary
		if (dirtyFields.has('applicationType')) changes.applicationType = applicationType

		try {
			await API.createContribution({
				subject: game.uri,
				contributionType: 'correction',
				changes,
				...(message.trim() ? { message: message.trim() } : {}),
			})
			setSuccess(true)
		} catch (error) {
			setSubmitError(
				error instanceof Error ? error.message : 'An unexpected error occurred.',
			)
		} finally {
			setIsSubmitting(false)
		}
	}, [applicationType, dirtyFields, game, message, name, summary])

	if (!user) {
		return null
	}

	if (isLoading) {
		return (
			<>
				<DashboardHeader breadcrumbs={breadcrumbs} />
				<Container>
					<div className={'flex items-center justify-center py-16'}>
						<Spinner className={'size-6'} />
					</div>
				</Container>
			</>
		)
	}

	if (!game) {
		return (
			<>
				<DashboardHeader breadcrumbs={breadcrumbs} />
				<Container>
					<div className={'flex items-center justify-center py-16'}>
						<p className={'text-muted-foreground text-sm'}>{'Game not found.'}</p>
					</div>
				</Container>
			</>
		)
	}

	if (success) {
		return (
			<>
				<DashboardHeader breadcrumbs={breadcrumbs} />
				<Container>
					<div className={'flex flex-col items-center justify-center gap-4 py-16'}>
						<p className={'text-lg font-medium'}>{'Suggestion submitted!'}</p>
						<p className={'text-muted-foreground text-sm'}>
							{'Your suggested edit has been submitted for review. You can track its status from your contributions page.'}
						</p>
						<div className={'flex gap-3'}>
							<Button
								onClick={() => router.push('/dashboard/contributions')}
								variant={'outline'}>
								{'View My Contributions'}
							</Button>
							<Button onClick={() => router.push(`/game/${params.slug}`)}>
								{'Back to Game'}
							</Button>
						</div>
					</div>
				</Container>
			</>
		)
	}

	return (
		<>
			<DashboardHeader breadcrumbs={breadcrumbs} />

			<Container>
				<div className={'flex flex-col gap-8 max-w-2xl'}>
					<div className={'flex flex-col gap-2'}>
						<h1 className={'text-2xl font-bold'}>{'Suggest Edit'}</h1>
						<p className={'text-muted-foreground text-sm'}>
							{'Suggest changes to '}
							<span className={'font-medium text-foreground'}>{game.name}</span>
							{'. Only modified fields will be submitted.'}
						</p>
					</div>

					<div className={'flex flex-col gap-6'}>
						<NameField
							disabled={isSubmitting}
							onChange={handleNameChange}
							value={name}
						/>

						<SummaryField
							disabled={isSubmitting}
							onChange={handleSummaryChange}
							value={summary}
						/>

						<ApplicationTypeField
							disabled={isSubmitting}
							onChange={handleApplicationTypeChange}
							value={applicationType}
						/>

						<Field>
							<FieldLabel htmlFor={'contribution-message'}>
								{'Reason for changes'}
								<span className={'text-muted-foreground ml-1 text-xs'}>{'(optional)'}</span>
							</FieldLabel>
							<Textarea
								disabled={isSubmitting}
								id={'contribution-message'}
								onChange={(e) => setMessage(e.target.value)}
								placeholder={'Explain what you changed and why...'}
								value={message}
							/>
						</Field>
					</div>

					{submitError && (
						<div className={'rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3'}>
							<p className={'text-sm text-destructive'}>{submitError}</p>
						</div>
					)}

					<div className={'flex gap-3 justify-end'}>
						<Button
							disabled={isSubmitting}
							onClick={() => router.push(`/game/${params.slug}`)}
							variant={'outline'}>
							{'Cancel'}
						</Button>

						<Button
							disabled={isSubmitting || dirtyFields.size === 0}
							onClick={handleSubmit}>
							{isSubmitting ? (
								<>
									<Spinner className={'size-4'} />
									{'Submitting...'}
								</>
							) : (
								'Submit Suggestion'
							)}
						</Button>
					</div>
				</div>
			</Container>
		</>
	)
}
