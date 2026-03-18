'use client'

// Module imports
import { type ChangeEventHandler, useCallback, useState } from 'react'

// Local imports
import * as API from '@/helpers/API'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from '@/components/ui/combobox'
import {
	FileUpload,
	FileUploadTrigger,
} from '@/components/ui/file-upload'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextComposer } from '@/components/ui/rich-text-composer'
import { Skeleton } from '@/components/ui/skeleton'
import { type Main as Facet } from '@/helpers/lexicons/app/bsky/richtext/facet.defs'
import { useProfileEditContext } from '@/context/ProfileEditContext/ProfileEditContext'
import { Button } from '@/components/ui/button'
import { WebsitesEditor } from '@/components/SettingsPage/WebsitesEditor'

type PronounOption = {
	label: string
	value: string
}

const PRONOUN_OPTIONS: PronounOption[] = [
	{ label: 'he/him', value: 'he/him' },
	{ label: 'she/her', value: 'she/her' },
	{ label: 'they/them', value: 'they/them' },
	{ label: 'he/they', value: 'he/they' },
	{ label: 'she/they', value: 'she/they' },
	{ label: 'xe/xem', value: 'xe/xem' },
	{ label: 'ze/hir', value: 'ze/hir' },
	{ label: 'it/its', value: 'it/its' },
	{ label: 'any pronouns', value: 'any pronouns' },
]

function FormSkeleton() {
	return (
		<div className={'grid grid-cols-1 gap-10 md:grid-cols-[280px_1fr]'}>
			<div className={'flex flex-col items-center gap-4'}>
				<Skeleton className={'h-32 w-32 rounded-full'} />
				<Skeleton className={'h-8 w-28'} />
				<Skeleton className={'h-10 w-full'} />
				<Skeleton className={'h-10 w-full'} />
			</div>
			<div className={'flex flex-col gap-4'}>
				<Skeleton className={'h-32 w-full'} />
				<Skeleton className={'h-10 w-full'} />
			</div>
		</div>
	)
}

export function ProfileEditForm() {
	const {
		avatarURL,
		description,
		displayName,
		isLoading,
		pronouns,
		websites,
		setAvatarBlob,
		setDescription,
		setDescriptionFacets,
		setDisplayName,
		setPronouns,
		setWebsites,
	} = useProfileEditContext()

	const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

	const handleDisplayNameChange = useCallback<
		ChangeEventHandler<HTMLInputElement>
	>((event) => setDisplayName(event.target.value), [setDisplayName])

	const handleDescriptionChange = useCallback(
		(text: string, facets: Facet[]) => {
			setDescription(text)
			setDescriptionFacets(facets)
		},
		[setDescription, setDescriptionFacets],
	)

	const handleAvatarChange = useCallback(
		async (files: File[]) => {
			const file = files[0]
			if (!file) return

			setAvatarPreview(URL.createObjectURL(file))

			try {
				const result = await API.uploadBlob(file)
				setAvatarBlob(result)
			} catch (error) {
				console.error('[pentaract] Avatar upload failed:', error)
			}
		},
		[setAvatarBlob],
	)

	if (isLoading) return <FormSkeleton />

	return (
		<div className={'grid grid-cols-1 gap-10 md:grid-cols-[280px_1fr]'}>
			<div className={'flex flex-col gap-6'}>
				<div className={'flex flex-col items-center gap-3'}>
					<Avatar className={'size-32'}>
						<AvatarImage src={avatarPreview ?? avatarURL} />
						<AvatarFallback className={'text-4xl'}>
							{displayName?.charAt(0)?.toUpperCase() ?? '?'}
						</AvatarFallback>
					</Avatar>

					<FileUpload
						accept={'image/png, image/jpeg'}
						maxFiles={1}
						maxSize={10 * 1024 * 1024}
						onValueChange={handleAvatarChange}>
						<FileUploadTrigger asChild>
							<Button
								variant={'outline'}
								size={'sm'}>
								{'Upload Avatar'}
							</Button>
						</FileUploadTrigger>
					</FileUpload>
				</div>

				<div className={'flex flex-col gap-2'}>
					<Label htmlFor={'displayName'}>{'Display Name'}</Label>
					<Input
						id={'displayName'}
						onChange={handleDisplayNameChange}
						placeholder={'Your display name'}
						value={displayName}
					/>
				</div>

				<div className={'flex flex-col gap-2'}>
					<Label>{'Pronouns'}</Label>
					<Combobox
						items={PRONOUN_OPTIONS}
						itemToStringLabel={(item) => item.label}
						onValueChange={(value) => setPronouns(value?.value ?? '')}
						value={
							PRONOUN_OPTIONS.find((p) => p.value === pronouns) ?? null
						}>
						<ComboboxInput placeholder={'Select or type your pronouns'} />

						<ComboboxContent>
							<ComboboxEmpty>{'No match found'}</ComboboxEmpty>

							<ComboboxList>
								{(item: PronounOption) => (
									<ComboboxItem
										key={item.value}
										value={item}>
										{item.label}
									</ComboboxItem>
								)}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
				</div>
			</div>

			<div className={'flex flex-col gap-6'}>
				<div className={'flex flex-col gap-2'}>
					<Label>{'Bio'}</Label>
					<RichTextComposer
						className={'min-h-[160px]'}
						onChange={handleDescriptionChange}
						placeholder={'Tell us about yourself'}
						value={description}
					/>
				</div>

				<div className={'flex flex-col gap-2'}>
					<Label>{'Websites'}</Label>
					<WebsitesEditor
						websites={websites}
						onChange={setWebsites}
					/>
				</div>
			</div>
		</div>
	)
}
