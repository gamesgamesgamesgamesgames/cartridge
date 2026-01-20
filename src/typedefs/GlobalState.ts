// Module imports
import { type QuicksliceClient, type User } from 'quickslice-client-js'
import { type Game } from '@/typedefs/Game'

// Module imports
export type GlobalState = {
	gamesCatalog: null | Game[]
	gamesCatalogCursor: null | string
	gamesCatalogHasNextPage: boolean
	quicksliceClient: null | QuicksliceClient
	user: null | User
}
