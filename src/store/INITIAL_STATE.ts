// Local imports
import { GlobalState } from '@/typedefs/GlobalState'

export const INITIAL_STATE: GlobalState = {
	authDid: null,
	authScopes: [],
	gamesCatalog: null,
	gamesCatalogCursor: null,
	gamesCatalogHasNextPage: true,
	needsReauth: false,
	profileType: null,
	user: null,
}
