// Local imports
import { MediaType } from '@/typedefs/MediaType'

export type MediaItem = {
	description: string
	dimensions: null | {
		height: number
		width: number
	}
	file: File
	title: string
	mediaType: null | MediaType
}
