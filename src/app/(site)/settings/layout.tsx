'use client'

// Module imports
import { useRouter } from 'next/navigation'
import { type PropsWithChildren, useEffect, useState } from 'react'

// Local imports
import { Container } from '@/components/Container/Container'
import { Header } from '@/components/Header/Header'
import { SettingsNav } from '@/components/SettingsPage/SettingsNav'
import { getMe, isAuthenticated } from '@/helpers/oauth'

type Props = Readonly<PropsWithChildren>

export default function SettingsLayout(props: Props) {
	const { children } = props
	const router = useRouter()
	const [isAuthed, setIsAuthed] = useState(false)

	useEffect(() => {
		// Check synchronous store first (fast path for in-app navigation)
		if (isAuthenticated()) {
			setIsAuthed(true)
			return
		}

		// Fall back to async check (handles cold page loads like OAuth redirects
		// where the store hasn't been initialized yet)
		getMe().then((me) => {
			if (me) {
				setIsAuthed(true)
			} else {
				router.replace('/login?returnUrl=/settings/profile')
			}
		})
	}, [router])

	if (!isAuthed) return null

	return (
		<Container>
			<Header
				className={'mb-4'}
				level={2}>
				{'Settings'}
			</Header>

			<SettingsNav />

			<div className={'py-8'}>
				{children}
			</div>
		</Container>
	)
}
