'use client'

// Module imports
import { useCallback } from 'react'
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// Local imports
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { type Website } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

// Constants
const WEBSITE_TYPES = [
	{ label: 'Official', value: 'official' },
	{ label: 'Wiki', value: 'wiki' },
	{ label: 'Steam', value: 'steam' },
	{ label: 'GOG', value: 'gog' },
	{ label: 'Epic Games', value: 'epicGames' },
	{ label: 'Itch.io', value: 'itch' },
	{ label: 'PlayStation', value: 'playStation' },
	{ label: 'Xbox', value: 'xbox' },
	{ label: 'Nintendo', value: 'nintendo' },
	{ label: 'Apple App Store', value: 'appleAppStore' },
	{ label: 'Google Play', value: 'googlePlay' },
	{ label: 'Humble Bundle', value: 'humbleBundle' },
	{ label: 'Discord', value: 'discord' },
	{ label: 'Reddit', value: 'reddit' },
	{ label: 'YouTube', value: 'youtube' },
	{ label: 'Twitch', value: 'twitch' },
	{ label: 'Twitter', value: 'twitter' },
	{ label: 'Facebook', value: 'facebook' },
	{ label: 'Instagram', value: 'instagram' },
	{ label: 'Meta', value: 'meta' },
	{ label: 'Other', value: 'other' },
] as const

// Types
type Props = Readonly<{
	websites: Website[]
	onChange: (websites: Website[]) => void
}>

export function WebsitesEditor(props: Props) {
	const { websites, onChange } = props

	const handleAdd = useCallback(() => {
		onChange([...websites, { url: '' as Website['url'] }])
	}, [websites, onChange])

	const handleRemove = useCallback(
		(index: number) => {
			onChange(websites.filter((_, i) => i !== index))
		},
		[websites, onChange],
	)

	const handleUrlChange = useCallback(
		(index: number, value: string) => {
			const updated = websites.map((w, i) => {
				if (i !== index) return w
				return { ...w, url: (value || '') as Website['url'] }
			})
			onChange(updated)
		},
		[websites, onChange],
	)

	const handleTypeChange = useCallback(
		(index: number, value: string) => {
			const updated = websites.map((w, i) => {
				if (i !== index) return w
				return { ...w, type: value || undefined } as Website
			})
			onChange(updated)
		},
		[websites, onChange],
	)

	return (
		<div className={'flex flex-col gap-3'}>
			{websites.map((website, index) => (
				<div
					key={index}
					className={'flex gap-2 items-start'}>
					<div className={'flex flex-1 flex-col gap-2'}>
						<Input
							placeholder={'https://example.com'}
							value={website.url ?? ''}
							onChange={(e) => handleUrlChange(index, e.target.value)}
						/>
						<Select
							value={website.type ?? ''}
							onValueChange={(value) => handleTypeChange(index, value)}>
							<SelectTrigger>
								<SelectValue placeholder={'Type (optional)'} />
							</SelectTrigger>
							<SelectContent>
								{WEBSITE_TYPES.map((wt) => (
									<SelectItem
										key={wt.value}
										value={wt.value}>
										{wt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<Button
						variant={'ghost'}
						size={'icon'}
						onClick={() => handleRemove(index)}>
						<FontAwesomeIcon icon={faTrash} />
					</Button>
				</div>
			))}

			<Button
				variant={'outline'}
				size={'sm'}
				className={'w-fit'}
				onClick={handleAdd}>
				<FontAwesomeIcon icon={faPlus} />
				{'Add Website'}
			</Button>
		</div>
	)
}
