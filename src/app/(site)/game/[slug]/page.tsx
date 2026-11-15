import { permanentRedirect } from 'next/navigation'

import { loadGameForRoute } from '@/helpers/loadGameForRoute'

type Props = Readonly<{
	params: Promise<{ slug: string }>
}>

// The layout renders the game. This only sends a game reached by its record
// key (or URI) to its slug URL when it has a slug; a game without one is shown
// at the record URL. Sub-routes such as /meta redirect here with a fragment,
// which the browser keeps across this redirect.
export default async function GamePage(props: Props) {
	const { slug } = await props.params
	const { game, viaRecord } = await loadGameForRoute(slug)
	if (viaRecord && game?.slug) {
		permanentRedirect(`/game/${encodeURIComponent(game.slug)}`)
	}
	return null
}
