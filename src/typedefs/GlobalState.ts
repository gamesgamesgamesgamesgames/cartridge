// Local imports
import { type Game } from '@/typedefs/Game'
import { type User } from '@/typedefs/User'

export type ProfileType = 'actor' | 'org'

export type GlobalState = {
	authDid: null | string
	gamesCatalog: null | Game[]
	gamesCatalogCursor: null | string
	gamesCatalogHasNextPage: boolean
	profileType: null | ProfileType
	user: null | User
}
