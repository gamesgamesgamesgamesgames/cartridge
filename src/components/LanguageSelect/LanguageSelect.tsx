'use client'

// Module imports
import { tags } from 'bcp47-language-tags/en'
import { type Combobox as ComboboxPrimitive } from '@base-ui/react'

// Local imports
import { type BCP47LanguageCode } from '@/typedefs/BCP47LanguageCode'
import {
	Combobox,
	ComboboxCollection,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxGroup,
	ComboboxInput,
	ComboboxItem,
	ComboboxLabel,
	ComboboxList,
} from '@/components/ui/combobox'
import { LANGUAGE_GROUPS } from '@/constants/LANGUAGE_GROUPS'
import { type LanguageGroup } from '@/typedefs/LanguageGroup'

// Types
type Props = Readonly<
	ComboboxPrimitive.Root.Props<BCP47LanguageCode> & {
		value: BCP47LanguageCode | null
	}
>

export function LanguageSelect(props: Props) {
	return (
		<Combobox
			items={LANGUAGE_GROUPS}
			itemToStringLabel={(item) => tags[item].name}
			{...props}>
			<ComboboxInput placeholder={'Select a language'} />

			<ComboboxContent>
				<ComboboxEmpty>{'No language found'}</ComboboxEmpty>

				<ComboboxList>
					{(group: LanguageGroup) => (
						<ComboboxGroup
							key={group.code}
							items={group.items}>
							<ComboboxLabel>{group.name}</ComboboxLabel>
							<ComboboxCollection>
								{(item: BCP47LanguageCode) => (
									<ComboboxItem
										key={item}
										value={item}>
										<div className={'flex gap-4 justify-between w-full'}>
											<span>{tags[item].name}</span>

											{tags[item].name !== tags[item].nativeName && (
												<span className={'text-muted-foreground'}>
													{tags[item].nativeName}
												</span>
											)}
										</div>
									</ComboboxItem>
								)}
							</ComboboxCollection>
						</ComboboxGroup>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	)
}
