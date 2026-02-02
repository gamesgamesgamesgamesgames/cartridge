// Module imports
import { getPrimaryTags, getTags } from 'bcp47-language-tags/en'

// Local imports
import { LanguageGroup } from '@/typedefs/LanguageGroup'

export const LANGUAGE_GROUPS: LanguageGroup[] = getPrimaryTags().map(
	(primaryTag) => {
		const languageCode = primaryTag.tag.split('-')[0]
		const languageName = primaryTag.name.split('(')[0].trim()

		const tags = getTags(languageCode)

		return {
			name: languageName,
			code: languageCode,
			items: tags.map((tagData) => tagData.tag),
		}
	},
)
