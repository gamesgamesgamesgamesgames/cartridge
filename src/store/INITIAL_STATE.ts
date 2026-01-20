// Local imports
import { GlobalState } from '@/typedefs/GlobalState'

export const INITIAL_STATE: GlobalState = {
	gamesCatalog: null,
	gamesCatalogCursor: null,
	gamesCatalogHasNextPage: true,
	quicksliceClient: null,
	user: null,
}
