'use client'

// Module imports
import { useCallback } from 'react'
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// Local imports
import { Button } from '@/components/ui/button'
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from '@/components/ui/input-group'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	buildFullUrl,
	detectFromUrl,
	extractDisplayValue,
	WEBSITE_TYPE_MAP,
	WEBSITE_TYPES,
} from '@/constants/WEBSITE_TYPES'
import { type Website } from '@/helpers/lexicons/games/gamesgamesgamesgames/defs.defs'

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

	const handleInputChange = useCallback(
		(index: number, value: string) => {
			const website = websites[index]
			const typeConfig = WEBSITE_TYPE_MAP.get(website.type ?? '')
			const looksLikeUrl = /^https?:\/\//.test(value)

			// Try to detect type from a pasted URL
			if (looksLikeUrl) {
				const detected = detectFromUrl(value)
				if (detected) {
					const updated = websites.map((w, i) => {
						if (i !== index) return w
						return {
							...w,
							url: buildFullUrl(detected.username, detected.type) as Website['url'],
							type: detected.type.value,
						} as Website
					})
					onChange(updated)
					return
				}

				// Unrecognized URL — store it raw, don't template-wrap
				const updated = websites.map((w, i) => {
					if (i !== index) return w
					return { ...w, url: value as Website['url'] }
				})
				onChange(updated)
				return
			}

			// For types with templates, store the full URL built from the input
			if (typeConfig?.urlTemplate && value) {
				const updated = websites.map((w, i) => {
					if (i !== index) return w
					return { ...w, url: buildFullUrl(value, typeConfig) as Website['url'] }
				})
				onChange(updated)
			} else {
				// Personal/Other/no type — store raw value
				const updated = websites.map((w, i) => {
					if (i !== index) return w
					return { ...w, url: (value || '') as Website['url'] }
				})
				onChange(updated)
			}
		},
		[websites, onChange],
	)

	const handleTypeChange = useCallback(
		(index: number, value: string) => {
			const website = websites[index]
			const oldConfig = WEBSITE_TYPE_MAP.get(website.type ?? '')
			const newConfig = WEBSITE_TYPE_MAP.get(value)

			// Extract the display value from the old URL, then rebuild with new template
			const displayValue = extractDisplayValue(website.url ?? '', oldConfig)
			const newUrl = newConfig?.urlTemplate
				? buildFullUrl(displayValue, newConfig)
				: displayValue

			const updated = websites.map((w, i) => {
				if (i !== index) return w
				return { ...w, type: value || undefined, url: newUrl as Website['url'] } as Website
			})
			onChange(updated)
		},
		[websites, onChange],
	)

	return (
		<div className={'flex flex-col gap-3'}>
			{websites.map((website, index) => {
				const typeConfig = WEBSITE_TYPE_MAP.get(website.type ?? '')
				const displayValue = extractDisplayValue(website.url ?? '', typeConfig)

				return (
					<div
						key={index}
						className={'flex gap-2 items-center'}>
						<InputGroup className={'flex-1'}>
							<InputGroupAddon>
								<Select
									value={website.type ?? ''}
									onValueChange={(value) => handleTypeChange(index, value)}>
									<SelectTrigger className={'border-0 bg-transparent shadow-none rounded-r-none w-[140px]'}>
										<SelectValue placeholder={'Type'} />
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
							</InputGroupAddon>

							<InputGroupInput
								className={'h-auto !pl-2'}
								placeholder={typeConfig?.placeholder ?? 'https://example.com'}
								value={displayValue}
								onChange={(e) => handleInputChange(index, e.target.value)}
							/>
						</InputGroup>

						<Button
							variant={'ghost'}
							size={'icon'}
							onClick={() => handleRemove(index)}>
							<FontAwesomeIcon icon={faTrash} />
						</Button>
					</div>
				)
			})}

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
