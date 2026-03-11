import { type MediaType } from '@/typedefs/MediaType'

export const SCREENSHOT_TYPES: MediaType[] = ['screenshot', 'gameplayImage']
export const ARTWORK_TYPES: MediaType[] = [
	'artwork',
	'conceptArt',
	'keyArt',
	'keyArtLogo',
	'infographic',
]
export const COVER_TYPES: MediaType[] = [
	'cover',
	'coverAlt',
	'coverHistorical',
	'coverSquare',
]
export const LOGO_TYPES: MediaType[] = ['logoBlack', 'logoColor', 'logoWhite', 'icon']

export const ALL_CATEGORIZED_TYPES = new Set<MediaType>([
	...SCREENSHOT_TYPES,
	...ARTWORK_TYPES,
	...COVER_TYPES,
	...LOGO_TYPES,
])
