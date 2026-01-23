// Local imports
import { type GameRecord } from '@/typedefs/GameRecord'

// Types
export type UnpublishedGame = Partial<GameRecord> & { name: string }