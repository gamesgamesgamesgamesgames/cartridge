import { redirect } from 'next/navigation'

import { encodeGameParam } from '@/helpers/gameRoute'

type Props = { params: Promise<{ slug: string }> }

export default async function GameMetaRedirect(props: Props) {
	const { slug } = await props.params
	redirect(`/game/${encodeGameParam(slug)}#meta`)
}
