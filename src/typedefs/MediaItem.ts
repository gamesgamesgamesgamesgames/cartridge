// Local imports
import { type BCP47LanguageCode } from '@/typedefs/BCP47LanguageCode'
import { type MediaType } from '@/typedefs/MediaType'

export type MediaItem = {
	description: string
	dimensions: null | {
		height: number
		width: number
	}
	file: File
	locale: null | BCP47LanguageCode
	title: string
	mediaType: null | MediaType
}
