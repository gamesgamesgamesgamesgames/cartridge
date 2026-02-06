'use client'

// Module imports
import { faCopy, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// Local imports
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { type ReleaseDate } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { ReleaseDateRow } from '@/components/DashboardCatalogEditGamePage/ReleaseDateRow'
import { type ReleaseDateWithID } from '@/typedefs/ReleaseDateWithID'
import { type ReleaseWithID } from '@/typedefs/ReleaseWithID'

// Types
type Props = Readonly<{
	isDisabled: boolean
	onAddReleaseDate: () => void
	onDuplicate: () => void
	onRemove: () => void
	onRemoveReleaseDate: (releaseDateId: string) => void
	onUpdatePlatform: (platform: string) => void
	onUpdateReleaseDate: (
		releaseDateId: string,
		updates: Partial<ReleaseDate>,
	) => void
	release: ReleaseWithID
}>

export function ReleaseCard(props: Props) {
	const {
		isDisabled,
		onAddReleaseDate,
		onDuplicate,
		onRemove,
		onRemoveReleaseDate,
		onUpdatePlatform,
		onUpdateReleaseDate,
		release,
	} = props

	const keyPrefix = `release-${release.id}`

	return (
		<Card>
			<CardHeader>
				<CardTitle>{'Platform Release'}</CardTitle>
			</CardHeader>

			<CardContent className={'flex flex-col gap-4'}>
				<Field>
					<FieldLabel htmlFor={`${keyPrefix}-platform`}>
						{'Platform'}
					</FieldLabel>
					<Input
						autoComplete={'off'}
						disabled={isDisabled}
						id={`${keyPrefix}-platform`}
						onChange={(e) => onUpdatePlatform(e.target.value)}
						placeholder={'PlayStation 5, Xbox Series X, PC, etc.'}
						type={'text'}
						value={release.platform ?? ''}
					/>
				</Field>

				<div className={'flex flex-col gap-4'}>
					<div className={'flex items-center justify-between'}>
						<span className={'text-sm font-medium'}>{'Release Dates'}</span>
						<Button
							disabled={isDisabled}
							onClick={onAddReleaseDate}
							size={'sm'}
							variant={'outline'}>
							<FontAwesomeIcon icon={faPlus} />
							{'Add Date'}
						</Button>
					</div>

					{(release.releaseDates ?? []).length === 0 && (
						<p className={'text-muted-foreground text-sm text-center py-4'}>
							{'No release dates added yet'}
						</p>
					)}

					{(release.releaseDates ?? []).map((releaseDate) => {
						const rdWithId = releaseDate as ReleaseDateWithID
						const canRemove = (release.releaseDates ?? []).length > 1
						return (
							<ReleaseDateRow
								key={rdWithId.id}
								canRemove={canRemove}
								isDisabled={isDisabled}
								onRemove={() => onRemoveReleaseDate(rdWithId.id)}
								onUpdate={(updates) =>
									onUpdateReleaseDate(rdWithId.id, updates)
								}
								releaseDate={rdWithId}
								releaseId={release.id}
							/>
						)
					})}
				</div>
			</CardContent>

			<CardFooter className={'gap-2 justify-end'}>
				<Button
					disabled={isDisabled}
					onClick={onDuplicate}
					size={'sm'}
					variant={'outline'}>
					<FontAwesomeIcon icon={faCopy} />
					{'Duplicate'}
				</Button>

				<Button
					disabled={isDisabled}
					onClick={onRemove}
					size={'sm'}
					variant={'destructive'}>
					<FontAwesomeIcon icon={faTimes} />
					{'Remove'}
				</Button>
			</CardFooter>
		</Card>
	)
}
