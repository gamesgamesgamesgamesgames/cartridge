'use client'

// Module imports
import { faCalendar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { TZDate } from '@date-fns/tz'
import { format } from 'date-fns'
import { useCallback, useMemo, useState } from 'react'

// Local imports
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { getReleaseDateString } from '@/helpers/getReleaseDateString'
import { getReleaseDateDisplayOptions } from '@/helpers/getReleaseDateDisplayOptions'
import { Input } from '@/components/ui/input'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { RELEASE_REGIONS } from '@/constants/RELEASE_REGIONS'
import { type ReleaseDate } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'
import { ReleaseDateWithID } from '@/typedefs/ReleaseDateWithID'

// Types
type Props = Readonly<{
	isDisabled: boolean
	onUpdate: (updates: Partial<ReleaseDate>) => void
	region?: string
	releaseDate: ReleaseDateWithID
}>

export function ReleaseDatePicker(props: Props) {
	const { isDisabled, onUpdate, region, releaseDate } = props

	const [isOpen, setIsOpen] = useState(false)
	const [localDate, setLocalDate] = useState<Date | undefined>(() => {
		if (releaseDate.releasedAt) {
			const d = new Date(releaseDate.releasedAt)
			return isNaN(d.getTime()) ? undefined : d
		}
		return undefined
	})
	const [localTime, setLocalTime] = useState(() => {
		if (releaseDate.releasedAt) {
			const d = new Date(releaseDate.releasedAt)
			if (!isNaN(d.getTime())) {
				return format(d, 'HH:mm')
			}
		}
		return '12:00'
	})

	// Combine date and time into a full datetime
	const combinedDateTime = useMemo(() => {
		if (!localDate) return null
		const [hours, minutes] = localTime.split(':').map(Number)
		const combined = new Date(localDate)
		combined.setHours(hours || 12, minutes || 0, 0, 0)
		return combined
	}, [localDate, localTime])

	// Get display options based on selected date
	const displayOptions = useMemo(
		() => getReleaseDateDisplayOptions(combinedDateTime),
		[combinedDateTime],
	)

	// Get timezone displays based on selected region
	const timezoneDisplays = useMemo(() => {
		if (!combinedDateTime) return null

		const localDisplay = format(combinedDateTime, 'MMM d, yyyy h:mm a')

		// Find the selected region's timezone info
		const selectedRegion = RELEASE_REGIONS.find((r) => r.id === region)

		// If a specific region is selected (not worldwide or empty), show only that timezone
		if (selectedRegion?.timezone) {
			const regionDate = new TZDate(combinedDateTime, selectedRegion.timezone)
			return [
				{ label: 'Local', time: localDisplay },
				{
					label: selectedRegion.tzLabel!,
					time: format(regionDate, 'MMM d, yyyy h:mm a'),
				},
			]
		}

		// Default: show all major timezones (San Francisco, London, Tokyo)
		const sfDate = new TZDate(combinedDateTime, 'America/Los_Angeles')
		const londonDate = new TZDate(combinedDateTime, 'Europe/London')
		const tokyoDate = new TZDate(combinedDateTime, 'Asia/Tokyo')

		return [
			{ label: 'Local', time: localDisplay },
			{ label: 'San Francisco', time: format(sfDate, 'MMM d, yyyy h:mm a') },
			{ label: 'London', time: format(londonDate, 'MMM d, yyyy h:mm a') },
			{ label: 'Tokyo', time: format(tokyoDate, 'MMM d, yyyy h:mm a') },
		]
	}, [combinedDateTime, region])

	// Handle date selection from calendar
	const handleDateSelect = useCallback((date: Date | undefined) => {
		setLocalDate(date)
	}, [])

	// Handle time change
	const handleTimeChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setLocalTime(e.target.value)
		},
		[],
	)

	// Handle display format change
	const handleDisplayFormatChange = useCallback(
		(displayFormat: string) => {
			const isoString = combinedDateTime?.toISOString() ?? ''
			onUpdate({
				releasedAt: isoString,
				releasedAtFormat: displayFormat as ReleaseDate['releasedAtFormat'],
			})
			setIsOpen(false)
		},
		[combinedDateTime, onUpdate],
	)

	// Handle TBD selection
	const handleTbdSelect = useCallback(() => {
		onUpdate({
			releasedAt: '',
			releasedAtFormat: 'TBD',
		})
		setIsOpen(false)
	}, [onUpdate])

	// Display value for the button
	const displayValue = getReleaseDateString(
		releaseDate.releasedAt,
		releaseDate.releasedAtFormat,
	)

	return (
		<Popover
			open={isOpen}
			onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					className={'w-full justify-start text-left font-normal'}
					data-empty={
						!releaseDate.releasedAt && releaseDate.releasedAtFormat === 'TBD'
					}
					disabled={isDisabled}
					variant={'outline'}>
					<FontAwesomeIcon
						className={'mr-2'}
						icon={faCalendar}
					/>
					{displayValue}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className={'w-auto p-0'}
				align={'start'}>
				<div className={'flex'}>
					{/* Left side - Date/Time picker */}
					<div className={'p-4 border-r'}>
						<div className={'text-sm font-medium mb-2'}>
							{'Select Date & Time'}
						</div>

						{/* Date and Time inputs */}
						<div className={'flex gap-2 mb-4'}>
							<Input
								className={'w-28'}
								disabled={isDisabled}
								onChange={(e) => {
									const d = new Date(e.target.value)
									if (!isNaN(d.getTime())) {
										setLocalDate(d)
									}
								}}
								type={'date'}
								value={localDate ? format(localDate, 'yyyy-MM-dd') : ''}
							/>
							<Input
								className={'w-24'}
								disabled={isDisabled}
								onChange={handleTimeChange}
								type={'time'}
								value={localTime}
							/>
						</div>

						{/* Calendar */}
						<Calendar
							captionLayout={'dropdown'}
							disabled={isDisabled}
							mode={'single'}
							onSelect={handleDateSelect}
							selected={localDate}
						/>

						{/* Timezone displays */}
						{timezoneDisplays && (
							<div
								className={
									'mt-4 pt-4 border-t text-xs text-muted-foreground space-y-1'
								}>
								{timezoneDisplays.map((tz) => (
									<div
										key={tz.label}
										className={'flex justify-between'}>
										<span>{`${tz.label}:`}</span>
										<span>{tz.time}</span>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Right side - Display format */}
					<div className={'p-4 min-w-[200px]'}>
						<div className={'text-sm font-medium mb-2'}>
							{'Public Date Display'}
						</div>
						<p className={'text-xs text-muted-foreground mb-4'}>
							{'Choose how the date appears publicly.'}
						</p>

						<div className={'flex flex-col gap-1'}>
							{displayOptions.map((option) => (
								<Button
									key={option.id}
									className={'justify-start'}
									disabled={
										isDisabled || (!combinedDateTime && option.id !== 'TBD')
									}
									onClick={() =>
										option.id === 'TBD'
											? handleTbdSelect()
											: handleDisplayFormatChange(option.id!)
									}
									size={'sm'}
									variant={
										releaseDate.releasedAtFormat === option.id
											? 'secondary'
											: 'ghost'
									}>
									{option.label}
								</Button>
							))}
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	)
}
