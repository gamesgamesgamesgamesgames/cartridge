import { redirect } from 'next/navigation'

export default function Page({
	searchParams,
}: {
	searchParams: Promise<Record<string, string>>
}) {
	// Redirect old callback URL to new OAuth callback path
	return searchParams.then((params) => {
		const query = new URLSearchParams(params).toString()
		redirect(`/oauth/callback${query ? `?${query}` : ''}`)
	})
}
