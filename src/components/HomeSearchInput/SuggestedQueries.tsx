'use client'

import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

import { useSearchContext } from '@/context/SearchContext/SearchContext'

const SUGGESTIONS = [
	'high fantasy RPGs',
	'cozy farming sims',
	'pixel art souls-likes',
	'open world survival crafting',
	'narrative detective games',
	'retro platformers',
	'tactical turn-based strategy',
	'roguelike deckbuilders',
	'atmospheric horror',
	'wholesome life sims',
	'metroidvanias with pixel art',
	'sci-fi colony builders',
	'co-op dungeon crawlers',
	'relaxing puzzle games',
	'anime JRPGs',
	'city builders with management',
	'hand-drawn adventure games',
	'stealth action games',
	'space exploration sims',
	'dark fantasy action RPGs',
	'cute animal games',
	'post-apocalyptic survival',
	'isometric CRPGs',
	'rhythm games',
	'underwater exploration',
	'vampire themed games',
	'cyberpunk RPGs',
	'medieval strategy games',
	'parkour platformers',
	'fishing games',
	'cooking sim games',
	'mech combat games',
	'tower defense roguelikes',
	'pirate adventure games',
	'cozy mystery games',
	'base building strategy',
	'bullet hell shooters',
	'card game RPGs',
	'dinosaur games',
	'fantasy city builders',
	'hack and slash ARPGs',
	'indie horror games',
	'Japanese visual novels',
	'kung fu action games',
	'low poly adventure games',
	'magic school RPGs',
	'noir detective games',
	'ocean survival games',
	'physics puzzle games',
	'retro FPS games',
	'sandbox crafting games',
	'time loop games',
	'underwater horror',
	'village management sims',
	'witch themed games',
	'zombie survival co-op',
	'2D fighting games',
	'alien invasion strategy',
	'bounty hunter RPGs',
	'cartoon racing games',
	'dragon themed RPGs',
	'extraction shooters',
	'first person puzzle games',
	'gothic horror RPGs',
	'heist strategy games',
	'immersive sims',
	'jigsaw puzzle games',
	'kingdom management games',
	'Lovecraftian horror',
	'martial arts fighting games',
	'nature exploration games',
	'old school dungeon crawlers',
	'pet simulation games',
	'quest-driven RPGs',
	'robot building games',
	'steampunk adventure games',
	'top-down shooters',
	'turn-based tactics games',
	'voxel building games',
	'Western themed games',
	'yokai themed games',
	'alchemy crafting games',
	'board game adaptations',
	'cat themed games',
	'deck building roguelites',
	'eldritch horror games',
	'fairy tale adventure games',
	'grimdark strategy games',
	'historical war games',
	'idle management games',
	'japenese folklore RPGs',
	'lighthearted party games',
	'music creation games',
	'ninja action games',
	'painterly art style games',
	'racing simulation games',
	'sports management sims',
	'text-based adventure games',
	'Viking themed games',
	'whimsical indie games',
	'graveyard keeper style games',
]

function shuffle<T>(array: T[]): T[] {
	const result = [...array]
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[result[i], result[j]] = [result[j], result[i]]
	}
	return result
}

const DISPLAY_COUNT = 5

export function SuggestedQueries() {
	const router = useRouter()
	const { setQuery } = useSearchContext()

	const suggestions = useMemo(() => shuffle(SUGGESTIONS).slice(0, DISPLAY_COUNT), [])

	const handleClick = (suggestion: string) => {
		setQuery(suggestion)
		router.push(`/search?q=${encodeURIComponent(suggestion)}`)
	}

	return (
		<div className={'flex flex-wrap justify-center gap-2 max-w-sm md:max-w-xl'}>
			{suggestions.map((suggestion) => (
				<button
					key={suggestion}
					type={'button'}
					onClick={() => handleClick(suggestion)}
					className={
						'rounded-full border border-input bg-background px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
					}>
					{suggestion}
				</button>
			))}
		</div>
	)
}
