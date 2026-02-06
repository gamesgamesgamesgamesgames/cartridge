'use client'

// Module imports
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// Local imports
import { Button } from '@/components/ui/button'
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from '@/components/ui/combobox'
import { Field, FieldLabel } from '@/components/ui/field'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { RELEASE_REGIONS } from '@/constants/RELEASE_REGIONS'
import { type ReleaseRegion } from '@/typedefs/ReleaseRegion'
import { RELEASE_STATUSES } from '@/constants/RELEASE_STATUSES'
import { type ReleaseDate } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { ReleaseDatePicker } from '@/components/DashboardCatalogEditGamePage/ReleaseDatePicker'
import { type ReleaseDateWithID } from '@/typedefs/ReleaseDateWithID'

// Types
type Props = Readonly<{
	canRemove: boolean
	isDisabled: boolean
	onRemove: () => void
	onUpdate: (updates: Partial<ReleaseDate>) => void
	releaseDate: ReleaseDateWithID
	releaseId: string
}>

export function ReleaseDateRow(props: Props) {
	const { canRemove, isDisabled, onRemove, onUpdate, releaseDate, releaseId } =
		props

	const keyPrefix = `release-${releaseId}-date-${releaseDate.id}`

	return (
		<div className={'border rounded-lg p-4 flex flex-col gap-3'}>
			<div className={'grid grid-cols-2 gap-4'}>
				<Field>
					<FieldLabel>{'Region'}</FieldLabel>
					<Combobox
						disabled={isDisabled}
						items={RELEASE_REGIONS}
						itemToStringLabel={(item) => item.label}
						onValueChange={(value) => onUpdate({ region: value?.id ?? '' })}
						value={
							RELEASE_REGIONS.find((r) => r.id === releaseDate.region) ?? null
						}>
						<ComboboxInput placeholder={'Select a region'} />

						<ComboboxContent>
							<ComboboxEmpty>{'No region found'}</ComboboxEmpty>

							<ComboboxList>
								{(region: ReleaseRegion) => (
									<ComboboxItem
										key={region.id}
										value={region}>
										<div className={'flex justify-between w-full'}>
											<span>{region.label}</span>
											<span className={'text-muted-foreground'}>
												{region.code}
											</span>
										</div>
									</ComboboxItem>
								)}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
				</Field>

				<Field>
					<FieldLabel>{'Release Date'}</FieldLabel>
					<ReleaseDatePicker
						isDisabled={isDisabled}
						onUpdate={onUpdate}
						region={releaseDate.region}
						releaseDate={releaseDate}
					/>
				</Field>
			</div>

			<div className={'flex items-end gap-4'}>
				<Field className={'flex-1'}>
					<FieldLabel htmlFor={`${keyPrefix}-status`}>{'Status'}</FieldLabel>
					<Select
						disabled={isDisabled}
						onValueChange={(value) => onUpdate({ status: value })}
						value={releaseDate.status ?? 'release'}>
						<SelectTrigger id={`${keyPrefix}-status`}>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{RELEASE_STATUSES.map((status) => (
								<SelectItem
									key={status.id}
									value={status.id}>
									{status.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Field>

				{canRemove && (
					<Button
						disabled={isDisabled}
						onClick={onRemove}
						size={'sm'}
						variant={'ghost'}>
						<FontAwesomeIcon icon={faTimes} />
						{'Remove'}
					</Button>
				)}
			</div>
		</div>
	)
}
