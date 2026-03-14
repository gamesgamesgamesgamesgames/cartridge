import { redirect } from 'next/navigation'

type Props = { params: Promise<{ slug: string }> }

export default async function GameMediaRedirect(props: Props) {
	const { slug } = await props.params
	redirect(`/game/${slug}#media`)
}
