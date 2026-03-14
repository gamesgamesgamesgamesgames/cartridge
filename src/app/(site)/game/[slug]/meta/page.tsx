import { redirect } from 'next/navigation'

type Props = { params: Promise<{ slug: string }> }

export default async function GameMetaRedirect(props: Props) {
	const { slug } = await props.params
	redirect(`/game/${slug}#meta`)
}
