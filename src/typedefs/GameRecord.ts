// Local imports
import { type ATURI } from '@/typedefs/ATURI'
import { type DID } from '@/typedefs/DID'

export interface GameRecord {
	did: DID
	uri: ATURI
	name: string
	summary?: string
	type?: string
	modes?: string[]
}
