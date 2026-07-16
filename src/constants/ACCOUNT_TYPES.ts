import {
	Building2,
	Code2,
	Gamepad2,
	Megaphone,
	type LucideIcon,
} from 'lucide-react'

export type AccountType = 'studio' | 'developer' | 'publisher' | 'game'

export const ACCOUNT_TYPES: ReadonlyArray<{
	value: AccountType
	label: string
	description: string
	icon: LucideIcon
}> = [
	{
		value: 'studio',
		label: 'Studio',
		description: 'A team that develops or publishes games.',
		icon: Building2,
	},
	{
		value: 'developer',
		label: 'Developer',
		description: 'An individual who develops games.',
		icon: Code2,
	},
	{
		value: 'publisher',
		label: 'Publisher',
		description: 'A company that publishes games from other developers.',
		icon: Megaphone,
	},
	{
		value: 'game',
		label: 'Game',
		description: 'An official account for a game or franchise.',
		icon: Gamepad2,
	},
]

// Short labels — admin lists and detail views.
export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
	studio: 'Studio',
	developer: 'Developer',
	publisher: 'Publisher',
	game: 'Game',
}

// Badge labels — profile and game pages.
export const VERIFIED_ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
	studio: 'Verified Studio',
	developer: 'Verified Developer',
	publisher: 'Verified Publisher',
	game: 'Verified Game',
}
