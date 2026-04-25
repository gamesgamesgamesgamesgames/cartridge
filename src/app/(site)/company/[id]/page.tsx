import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CompanyPageContent } from '@/components/CompanyPage/CompanyPageContent'
import { getOrgByRkey } from '@/helpers/getOrgByUri'

type Props = Readonly<{
	params: Promise<{ id: string }>
}>

const HAPPYVIEW_URL = process.env.NEXT_PUBLIC_HAPPYVIEW_URL!
const SERVICE_DID = `did:web:${new URL(HAPPYVIEW_URL).hostname}`

export async function generateMetadata(props: Props): Promise<Metadata> {
	const { id } = await props.params
	const org = await getOrgByRkey(SERVICE_DID, id)

	if (!org) return {}

	return {
		title: org.displayName ?? 'Company',
		description: org.description
			? org.description.length > 160
				? org.description.slice(0, 157) + '...'
				: org.description
			: undefined,
	}
}

export default async function CompanyPage(props: Props) {
	const { id } = await props.params
	const org = await getOrgByRkey(SERVICE_DID, id)

	if (!org) notFound()

	return (
		<CompanyPageContent org={org} />
	)
}
